const CampInventory = require('../models/CampInventory');
const ReliefCamp = require('../models/ReliefCamp');
const ResourceTransfer = require('../models/ResourceTransfer');
const { generateTransferId } = require('../utils/generateId');
const { RESOURCE_TRANSFER_STATUS } = require('../utils/constants');
const { applyInventoryChange } = require('./inventoryTransactionService');
const { writeAudit } = require('./auditService');
const { AppError } = require('../middleware/errorMiddleware');

async function recommendTransfers() {
  const items = await CampInventory.find().populate('camp', 'name campId municipality');
  const byItem = {};
  items.forEach((row) => {
    if (!byItem[row.itemName]) byItem[row.itemName] = [];
    const surplus = Math.max(0, (row.current || 0) - (row.required || 0));
    const shortage = Math.max(0, (row.required || 0) - ((row.current || 0) + (row.incoming || 0)));
    byItem[row.itemName].push({ inventory: row, surplus, shortage });
  });
  const recommendations = [];
  Object.entries(byItem).forEach(([itemName, rows]) => {
    const short = rows.filter((r) => r.shortage > 0).sort((a, b) => b.shortage - a.shortage);
    const extra = rows.filter((r) => r.surplus > 0).sort((a, b) => b.surplus - a.surplus);
    extra.forEach((source) => {
      short.forEach((dest) => {
        if (String(source.inventory.camp._id) === String(dest.inventory.camp._id)) return;
        const quantity = Math.min(source.surplus, dest.shortage);
        if (quantity <= 0) return;
        recommendations.push({
          itemName,
          quantity,
          sourceCamp: source.inventory.camp,
          destinationCamp: dest.inventory.camp,
          reason: `${dest.inventory.camp.name} has an active shortage. ${source.inventory.camp.name} has available surplus.`,
        });
      });
    });
  });
  return recommendations;
}

async function createTransfer(payload, user, ip) {
  if (!payload.sourceCamp || !payload.destinationCamp || !payload.itemName || !payload.quantity) {
    throw new AppError('Source camp, destination camp, item and quantity are required', 400);
  }
  if (String(payload.sourceCamp) === String(payload.destinationCamp)) {
    throw new AppError('Source and destination camps must be different', 400);
  }
  const transfer = await ResourceTransfer.create({
    transferId: await generateTransferId(),
    itemName: payload.itemName,
    quantity: Number(payload.quantity),
    sourceCamp: payload.sourceCamp,
    destinationCamp: payload.destinationCamp,
    reason: payload.reason || 'Surplus-to-shortage match',
    status: RESOURCE_TRANSFER_STATUS.PROPOSED,
    recommended: Boolean(payload.recommended),
    createdBy: user._id,
    notes: payload.notes || '',
  });
  await writeAudit({
    user,
    action: 'Resource transfer approved',
    entityType: 'ResourceTransfer',
    entityId: transfer.transferId,
    metadata: { status: transfer.status },
    ip,
  });
  return transfer;
}

async function updateTransfer(id, status, user, ip) {
  const transfer = await ResourceTransfer.findById(id);
  if (!transfer) throw new AppError('Resource transfer not found', 404);
  const allowed = {
    Proposed: ['Approved', 'Cancelled'],
    Approved: ['In Transit', 'Cancelled'],
    'In Transit': ['Received', 'Cancelled'],
    Received: [],
    Cancelled: [],
  };
  if (!allowed[transfer.status]?.includes(status)) {
    throw new AppError(`Cannot change a ${transfer.status} transfer to ${status}`, 409);
  }
  transfer.status = status;
  if (status === RESOURCE_TRANSFER_STATUS.APPROVED) transfer.approvedBy = user._id;
  if (status === RESOURCE_TRANSFER_STATUS.RECEIVED) {
    transfer.receivedBy = user._id;
    await applyInventoryChange({
      campId: transfer.sourceCamp,
      itemName: transfer.itemName,
      quantity: transfer.quantity,
      type: 'Transferred Out',
      source: transfer.transferId,
      transfer: transfer._id,
      user,
    });
    await applyInventoryChange({
      campId: transfer.destinationCamp,
      itemName: transfer.itemName,
      quantity: transfer.quantity,
      type: 'Transferred In',
      source: transfer.transferId,
      transfer: transfer._id,
      user,
    });
  }
  await transfer.save();
  await writeAudit({
    user,
    action: status === RESOURCE_TRANSFER_STATUS.RECEIVED ? 'Resource transfer received' : 'Resource transfer approved',
    entityType: 'ResourceTransfer',
    entityId: transfer.transferId,
    metadata: { status },
    ip,
  });
  return ReliefCamp.populate(transfer, [{ path: 'sourceCamp', select: 'name campId' }, { path: 'destinationCamp', select: 'name campId' }]);
}

async function listTransfers(filter = {}) {
  return ResourceTransfer.find(filter)
    .populate('sourceCamp', 'name campId municipality')
    .populate('destinationCamp', 'name campId municipality')
    .sort({ createdAt: -1 });
}

module.exports = { recommendTransfers, createTransfer, updateTransfer, listTransfers };

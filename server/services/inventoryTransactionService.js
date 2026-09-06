const CampInventory = require('../models/CampInventory');
const InventoryTransaction = require('../models/InventoryTransaction');
const { syncReliefNeeds } = require('./reliefEngine');
const { AppError } = require('../middleware/errorMiddleware');

async function applyInventoryChange({
  campId,
  itemName,
  quantity,
  type,
  source = '',
  donation,
  transfer,
  user,
  notes = '',
  incomingDelta = 0,
}) {
  const qty = Number(quantity);
  if (!Number.isFinite(qty) || qty === 0) throw new AppError('Quantity must be a non-zero number', 400);
  const item = await CampInventory.findOne({ camp: campId, itemName });
  if (!item) throw new AppError('Inventory item not found', 404);

  if (type === 'Received' || type === 'Transferred In') {
    item.current = Math.max(0, item.current + Math.abs(qty));
    item.incoming = Math.max(0, item.incoming + incomingDelta);
  } else if (type === 'Distributed' || type === 'Transferred Out') {
    if (item.current < Math.abs(qty)) throw new AppError('Inventory cannot become negative', 400);
    item.current -= Math.abs(qty);
    if (type === 'Distributed') item.distributed += Math.abs(qty);
  } else {
    const next = item.current + qty;
    if (next < 0) throw new AppError('Inventory cannot become negative', 400);
    item.current = next;
  }
  if (user) item.lastUpdatedBy = user._id;
  await item.save();
  await syncReliefNeeds(campId);
  const txn = await InventoryTransaction.create({
    camp: campId,
    itemName,
    quantity: Math.abs(qty),
    type,
    source,
    donation,
    transfer,
    performedBy: user?._id,
    notes,
  });
  return { item, transaction: txn };
}

module.exports = { applyInventoryChange };

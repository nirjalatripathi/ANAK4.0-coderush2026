const {
  recommendTransfers,
  createTransfer,
  updateTransfer,
  listTransfers,
} = require('../../services/resourceTransferService');

async function recommend(req, res, next) {
  try {
    const recommendations = await recommendTransfers();
    res.json({ success: true, recommendations });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const transfers = await listTransfers(req.query.status ? { status: req.query.status } : {});
    res.json({ success: true, transfers });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const transfer = await createTransfer(req.body, req.user, req.ip);
    res.status(201).json({ success: true, transfer });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const transfer = await updateTransfer(req.params.id, req.body.status, req.user, req.ip);
    res.json({ success: true, transfer });
  } catch (error) {
    next(error);
  }
}

module.exports = { recommend, list, create, update };

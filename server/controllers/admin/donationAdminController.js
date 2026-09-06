const { listDonations, updateStatus } = require('../donation/donationController');
const { listInventory, updateItem } = require('../camp/inventoryController');

module.exports = { listDonations, updateStatus, listInventory, updateItem };

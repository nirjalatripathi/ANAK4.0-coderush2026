const { create, update, listCamps, campDetails, population } = require('../camp/campController');
const { listOfficials, createOfficial, updateOfficial } = require('../camp/campOfficialController');

module.exports = { create, update, listCamps, campDetails, population, listOfficials, createOfficial, updateOfficial };

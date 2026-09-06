const express = require('express');
const { publicList } = require('../controllers/missingFound/missingFoundController');

const router = express.Router();

router.get('/', publicList);

module.exports = router;

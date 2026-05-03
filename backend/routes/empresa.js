const express = require('express');

const router = express.Router();

const { getEnterprise } = require('../controllers/enterpriseController');

router.get('/getEmpresa', getEnterprise);

module.exports = router;
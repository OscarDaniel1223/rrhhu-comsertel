const express = require('express');

const router = express.Router();

const { login } = require('../controllers/authController');
const { changePassword } = require('../controllers/authController');

router.post('/login', login);
router.post('/change-password', changePassword);
module.exports = router;
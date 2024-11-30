const express = require('express');
const { register, login, getUserInfo } = require('../controllers/userController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/infor', getUserInfo);
// Thêm các route khác cho user

module.exports = router;
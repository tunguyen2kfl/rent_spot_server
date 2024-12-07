const express = require('express');
const { register, login, getUserInfo, getAllInBuilding } = require('../controllers/userController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/infor', getUserInfo);
router.get('/allSelect', getAllInBuilding);
// Thêm các route khác cho user

module.exports = router;
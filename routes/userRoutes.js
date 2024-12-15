const express = require('express');
const { register, login, getUserInfo, getAllInBuilding, updateProfile } = require('../controllers/userController');
const router = express.Router();
const upload = require("../config/multerConfig");

router.post('/register', register);
router.put('/profile', upload.single("image"), updateProfile);
router.post('/login', login);
router.get('/infor', getUserInfo);
router.get('/allSelect', getAllInBuilding);
// Thêm các route khác cho user

module.exports = router;
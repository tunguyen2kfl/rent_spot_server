"use strict";
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { verifyToken } = require('../middlewares/verifyToken');

// Định nghĩa các route cho Schedule
router.post('/', scheduleController.create);
router.get('/', scheduleController.findAll);
router.get('/:id', scheduleController.findOne);
router.put('/:id', scheduleController.update);
router.delete('/:id', scheduleController.delete);

module.exports = router;
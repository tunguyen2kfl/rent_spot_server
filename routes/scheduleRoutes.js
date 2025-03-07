"use strict";
const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Định nghĩa các route cho Schedule
router.post('/', scheduleController.create);
router.get('/', scheduleController.findAll);
router.get('/my', scheduleController.findMySchedules);
router.get('/waitting', scheduleController.getWaitingSchedules);
router.get('/:id', scheduleController.findOne);
router.put('/:id', scheduleController.update);
router.put('/check/:id', scheduleController.passWaitingSchedules);
router.put('/cancel/:id', scheduleController.cancelWaitingSchedules);
router.delete('/:id', scheduleController.delete);

module.exports = router;
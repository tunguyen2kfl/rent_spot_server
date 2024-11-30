"use strict";
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Định nghĩa các route cho Room
router.post('/', roomController.create);
router.get('/', roomController.findAll);
router.get('/:id', roomController.findOne);
router.put('/:id', roomController.update);
router.delete('/:id', roomController.delete);

module.exports = router;
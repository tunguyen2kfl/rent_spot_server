"use strict";
const express = require('express');
const router = express.Router();
const buildingController = require('../controllers/buildingController');

// Định nghĩa các route cho Building
router.post('/', buildingController.create);
router.get('/', buildingController.findAll);
router.get('/:id', buildingController.findOne);
router.put('/:id', buildingController.update);
router.delete('/:id', buildingController.delete);
router.post('/join', buildingController.joinBuilding);

module.exports = router;
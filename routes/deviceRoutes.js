// routes/device.js
const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");
const upload = require("../config/multerConfig");

// Routes
router.post("/", upload.single("image"), deviceController.create);
router.get("/", deviceController.getAll);
router.get("/:id", deviceController.getById);
router.put("/:id", upload.single("image"), deviceController.update);
router.delete("/:id", deviceController.delete);

module.exports = router;
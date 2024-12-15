"use strict";
const db = require('../models');
const Device = db.device;
const path = require("path");
const fs = require("fs");

exports.create = async (req, res) => {
    try {
        const { name, description } = req.body;
        let image = null;

        if (req.file) {
            image = `/uploads/${req.file.filename}`; 
        }

        const device = await Device.create({
            name,
            description,
            image,
            createdBy: req.user.id,
        });

        res.status(201).json({ device });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Lấy tất cả thiết bị
exports.getAll = async (req, res) => {
    try {
        const devices = await Device.findAll({ where: { isDeleted: false } });
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Lấy thông tin một thiết bị
exports.getById = async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id, {
            where: { isDeleted: false },
        });

        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        res.status(200).json({ device });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Cập nhật thông tin một thiết bị
exports.update = async (req, res) => {
    try {
        const { name, description } = req.body;
        const device = await Device.findByPk(req.params.id);

        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        let image = device.image; // Giữ nguyên hình ảnh cũ nếu không có tệp mới

        // Kiểm tra xem có tệp hình ảnh mới hay không
        if (req.file) {
            // Nếu có hình ảnh mới, xóa hình ảnh cũ
            if (device.image) {
                const oldImagePath = path.join(__dirname, "..", device.image);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Error deleting old image:", err);
                });
            }
            image = `/uploads/${req.file.filename}`; // Cập nhật với đường dẫn mới
        }

        device.name = name;
        device.description = description;
        device.image = image;
        device.updatedBy = req.user.id;

        await device.save();

        res.status(200).json({ device });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Xóa một thiết bị
exports.delete = async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);

        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        device.isDeleted = true; // Đánh dấu là đã xóa
        await device.save();

        res.status(204).send(); // Trả về 204 No Content
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

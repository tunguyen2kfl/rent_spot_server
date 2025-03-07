"use strict";
const db = require('../models');
const Room = db.room;

exports.create = async (req, res) => {
    const { buildingId } = req.query;
    const { name, createdBy } = req.body;

    // Kiểm tra thông tin đầu vào
    if (!name || !buildingId) {
        return res.status(400).json({ error: 'Name and buildingId are required' });
    }

    try {
        // Tạo room mới
        const newRoom = await Room.create({
            ...req.body,
            name,
            buildingId,
            createdBy,
            updatedBy: createdBy,
            isDeleted: false,
        });

        console.log("🚀 ~ exports.create= ~ Room created successfully")
        res.status(201).json({ message: 'Room created successfully', room: newRoom });
    } catch (error) {
        console.log("🚀 ~ exports.create= ~ error:", error)
        res.status(500).json({ error: 'Server error' });
    }
};

exports.findAll = async (req, res) => {
    const { buildingId } = req.query; // Lấy buildingId từ query

    if (!buildingId) {
        return res.status(400).json({ error: 'buildingId is required' });
    }

    try {
        const rooms = await Room.findAll({
            where: {
                buildingId,
                isDeleted: false,
            }
        });
        res.json(rooms);
    } catch (error) {
        console.log("🚀 ~ exports.findAll= ~ error:", error)
        res.status(500).json({ error: 'Server error' });
    }
};
exports.findOne = async (req, res) => {
    const { id } = req.params;

    try {
        const room = await Room.findByPk(id, { where: { isDeleted: false } });

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { name, isOpen, status, description,devices, updatedBy } = req.body;

    try {
        const room = await Room.findByPk(id);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        await room.update({
            devices,
            name,
            isOpen,
            status,
            description,
            updatedBy,
        });

        res.json({ message: 'Room updated successfully', room });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;

    try {
        const room = await Room.findByPk(id);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Đánh dấu là đã xóa thay vì xóa thực tế
        await room.update({ isDeleted: true });

        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
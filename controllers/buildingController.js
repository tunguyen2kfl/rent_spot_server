"use strict";
const db = require('../models');
const { Op } = require('sequelize');
const User = db.user;
const Building = db.building;

exports.create = async (req, res) => {
    const { name, email, phone, website, inviteCode, createdBy } = req.body;

    // Kiểm tra thông tin đầu vào
    if (!name || !email || !phone) {
        console.log('Name, email, and phone are required')
        return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    try {
        // Tạo building mới
        const newBuilding = await Building.create({
            name,
            email,
            phone,
            website,
            inviteCode,
            createdBy,
            updatedBy: createdBy,
        });

        // Cập nhật thông tin User
        await User.update(
            { role: 'building-admin', buildingId: newBuilding.id },
            { where: { id: createdBy } }
        );

        console.log('Building created successfully')
        res.status(201).json({ message: 'Building created successfully', building: newBuilding });
    } catch (error) {
        console.log('Server error', error.message)
        res.status(500).json({ error: 'Server error' });
    }
};

exports.findAll = async (req, res) => {
    try {
        const buildings = await Building.findAll({ where: { isDeleted: false } });
        res.json(buildings);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.findOne = async (req, res) => {
    const { id } = req.params;

    try {
        const building = await Building.findByPk(id, { where: { isDeleted: false } });

        if (!building) {
            return res.status(404).json({ error: 'Building not found' });
        }

        res.json(building);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, website, inviteCode, updatedBy } = req.body;

    try {
        const building = await Building.findByPk(id);

        if (!building) {
            return res.status(404).json({ error: 'Building not found' });
        }

        // Cập nhật thông tin building
        await building.update({
            name,
            email,
            phone,
            website,
            inviteCode,
            updatedBy,
        });

        res.json({ message: 'Building updated successfully', building });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;

    try {
        const building = await Building.findByPk(id);

        if (!building) {
            return res.status(404).json({ error: 'Building not found' });
        }

        // Đánh dấu là đã xóa thay vì xóa thực tế
        await building.update({ isDeleted: true });

        res.json({ message: 'Building deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.joinBuilding = async (req, res) => {
    const { inviteCode, updatedBy } = req.body;
    console.log("🚀 ~ exports.joinBuilding= ~ updatedBy:", updatedBy)
    console.log("🚀 ~ exports.joinBuilding= ~ inviteCode:", inviteCode)

    try {
        // Tìm building theo inviteCode
        const building = await Building.findOne({ where: { inviteCode, isDeleted: false } });

        if (!building) {
            return res.status(404).json({ error: 'Invalid invite code' });
        }

        // Cập nhật thông tin User
        await User.update(
            { role: 'user', buildingId: building.id },
            { where: { id: updatedBy } }
        );

        res.json({ message: 'User joined the building successfully', building });
    } catch (error) {
        console.log("🚀 ~ exports.joinBuilding= ~ error:", error.message)
        res.status(500).json({ error: 'Server error' });
    }
};
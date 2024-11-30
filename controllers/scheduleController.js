"use strict";
const db = require('../models');
const Schedule = db.schedule;

exports.create = async (req, res) => {
    const { summary, date, startTime, endTime, buildingId, resourceId, createdBy } = req.body;

    // Kiểm tra thông tin đầu vào
    if (!summary || !date || !startTime || !endTime || !buildingId) {
        return res.status(400).json({ error: 'Summary, date, buildingId, startTime, and endTime are required' });
    }

    try {
        // Tạo schedule mới
        const newSchedule = await Schedule.create({
            summary,
            date,
            startTime,
            endTime,
            buildingId,
            resourceId,
            createdBy,
            updatedBy: createdBy,
        });

        res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.findAll = async (req, res) => {
    try {
        const schedules = await Schedule.findAll({ where: { isDeleted: false } });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.findOne = async (req, res) => {
    const { id } = req.params;

    try {
        const schedule = await Schedule.findByPk(id, { where: { isDeleted: false } });

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { summary, date, startTime, endTime, status, color, updatedBy } = req.body;

    try {
        const schedule = await Schedule.findByPk(id);

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        // Chỉ cho phép cập nhật các trường khác, không cho phép thay đổi buildingId
        await schedule.update({
            summary,
            date,
            startTime,
            endTime,
            status,
            color,
            updatedBy,
        });

        res.json({ message: 'Schedule updated successfully', schedule });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;

    try {
        const schedule = await Schedule.findByPk(id);

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        // Đánh dấu là đã xóa thay vì xóa thực tế
        await schedule.update({ isDeleted: true });

        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
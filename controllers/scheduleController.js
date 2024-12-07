"use strict";
const db = require('../models');
const Schedule = db.schedule;

exports.create = async (req, res) => {
    const { summary, date, startTime, endTime, buildingId, roomId, createdBy, color, organizer } = req.body;

    // Check required fields
    if (!summary || !date || !startTime || !endTime || !buildingId || !roomId || !color || !organizer) {
        return res.status(400).json({ error: 'Summary, date, roomId, buildingId, startTime, endTime, and color are required' });
    }

    try {
        // Create new schedule with default status
        const newSchedule = await Schedule.create({
            summary,
            date,
            startTime,
            organizer,
            endTime,
            buildingId,
            roomId,
            color,
            createdBy,
            updatedBy: createdBy,
            status: 'waiting',  // Default status
        });

        res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.findAll = async (req, res) => {
    const { buildingId } = req.query;
    try {
        const schedules = await Schedule.findAll({ where: { isDeleted: false, buildingId: buildingId } });
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
    const { summary, date, startTime, endTime, color, updatedBy } = req.body;

    try {
        const schedule = await Schedule.findByPk(id);

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        // Only allow updating fields other than buildingId
        await schedule.update({
            summary,
            date,
            startTime,
            endTime,
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

        // Mark as deleted instead of actual deletion
        await schedule.update({ isDeleted: true });

        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// New method to get all schedules with status 'waiting'
exports.getWaitingSchedules = async (req, res) => {
    const { buildingId } = req.query;
    try {
        const waitingSchedules = await Schedule.findAll({
            where: {
                isDeleted: false,
                status: 'waiting',
                buildingId: buildingId,
            },
        });
        res.json(waitingSchedules);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.passWaitingSchedules = async (req, res) => {
    const { id } = req.params;

    try {
        const schedule = await Schedule.findByPk(id);

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        await schedule.update({
            status: "live",
        });

        res.json({ message: 'Schedule updated successfully', schedule });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
"use strict";
const db = require('../models');
const Schedule = db.schedule;
const { Op } = require('sequelize');
const { sendNewReservationEmail, sendCancelReservationEmail, sendDeleteReservationEmail } = require('../lib/smtpEmail');
const { icalGenerate, cancelIcalGenerate } = require('../lib/iCal')

exports.create = async (req, res) => {
    const { summary, date, startTime, endTime, buildingId, roomId, createdBy, color, organizer, attendees, description } = req.body;

    // Check required fields
    if (!summary || !date || !startTime || !endTime || !buildingId || !color || !organizer) {
        return res.status(400).json({ error: 'Summary, date, buildingId, startTime, endTime, color, and organizer are required' });
    }

    try {
        // Extract the date part for comparison
        const scheduleDate = new Date(date).toISOString().split('T')[0];
        console.log("🚀 ~ exports.create= ~ scheduleDate:", scheduleDate)

        // Check for existing confirmed schedules in the time range
        const existingSchedules = await Schedule.findAll({
            where: {
                isDeleted: false,
                buildingId: buildingId,
                status: 'confirmed',
                date: {
                    [Op.gte]: new Date(scheduleDate + 'T00:00:00Z'),
                    [Op.lt]: new Date(scheduleDate + 'T23:59:59Z')
                },
                [Op.or]: [
                    {
                        startTime: {
                            [Op.lt]: endTime,
                        },
                        endTime: {
                            [Op.gt]: startTime,
                        },
                    },
                    {
                        startTime: {
                            [Op.gte]: startTime,
                        },
                        endTime: {
                            [Op.lte]: endTime,
                        },
                    },
                ],
            },
        });

        if (existingSchedules.length > 0) {
            return res.status(400).json({ error: 'A confirmed schedule already exists during the specified time.' });
        }

        // Create new schedule with default status
        const newSchedule = await Schedule.create({
            summary,
            date,
            startTime,
            endTime,
            buildingId,
            roomId,
            attendees,
            color,
            createdBy,
            updatedBy: createdBy,
            organizer,
            description,
            status: 'pending',  // Default status
        });

        res.status(201).json({ message: 'Schedule created successfully', schedule: newSchedule });
    } catch (error) {
        console.log("🚀 ~ exports.create= ~ error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.findAll = async (req, res) => {
    const { buildingId } = req.query;
    if (!buildingId) {
        return res.status(400).json({ error: 'buildingId is required' });
    }

    try {
        const schedules = await Schedule.findAll({
            where: {
                isDeleted: false,
                buildingId: buildingId,
            },
        });
        res.json(schedules);
    } catch (error) {
        console.log("🚀 ~ exports.findAll= ~ error:", error)
        res.status(500).json({ error: 'Server error' });
    }
};

exports.findMySchedules = async (req, res) => {
    const { buildingId } = req.query;
    const { updatedBy } = req.body;
    if (!buildingId) {
        return res.status(400).json({ error: 'buildingId is required' });
    }

    try {
        const schedules = await Schedule.findAll({
            where: {
                isDeleted: false,
                buildingId: buildingId,
                organizer: updatedBy
            },
            order: [['date', 'DESC']]
        });
        res.json(schedules);
    } catch (error) {
        console.log("🚀 ~ exports.findAll= ~ error:", error)
        res.status(500).json({ error: 'Server error' });
    }
};

exports.findOne = async (req, res) => {
    const { id } = req.params;

    try {
        const schedule = await Schedule.findOne({
            where: {
                id: id,
                isDeleted: false,
            },
        });

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        res.json(schedule);
    } catch (error) {
        console.log("🚀 ~ exports.findOne= ~ error:", error)
        res.status(500).json({ error: 'Server error' });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { summary, date, startTime, endTime, color, description, buildingId, attendees, roomId, updatedBy } = req.body;

    try {
        const schedule = await Schedule.findOne({
            where: {
                id: id,
                isDeleted: false,
            },
        });

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        // Compare old and new attendees
        const oldAttendees = schedule.attendees.split(',');
        const newAttendees = attendees.split(',');
        const addedAttendees = newAttendees.filter(email => !oldAttendees.includes(email));
        const removedAttendees = oldAttendees.filter(email => !newAttendees.includes(email));

        // Update the schedule
        await schedule.update({
            summary,
            date,
            startTime,
            endTime,
            color,
            description,
            attendees,
            roomId,
            updatedBy,
        });

        if (schedule.status !== "pending") {
            // Generate iCal content for new attendees
            if (addedAttendees.length > 0) {
                const contentNew = await icalGenerate(addedAttendees, 'create', schedule);
                // Send new reservation email to added attendees
                sendNewReservationEmail(addedAttendees, contentNew, schedule, 'create');
                // await sendMail(mailOptions);
            }

            // Generate iCal content for removed attendees
            if (removedAttendees.length > 0) {
                const contentCancel = await icalGenerate(removedAttendees, 'delete', schedule);
                // Send cancel reservation email to removed attendees
                sendCancelReservationEmail(removedAttendees, contentCancel);
                // await sendMail(mailOptions);
            }

            // Generate iCal content for existing attendees
            if (oldAttendees.length > 0) {
                const contentUpdate = await icalGenerate(oldAttendees, 'update', schedule);
                // Send update email to existing attendees
                sendNewReservationEmail(oldAttendees, contentUpdate, schedule, 'update');
                // await sendMail(mailOptions);
            }

        }


        res.json({ message: 'Schedule updated successfully', schedule });
    } catch (error) {
        console.log("🚀 ~ exports.update= ~ error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;

    try {
        const schedule = await Schedule.findOne({
            where: {
                id: id,
                isDeleted: false,
            },
        });

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        // Mark as deleted instead of actual deletion
        await schedule.update({ isDeleted: true });

        // Send cancellation email if attendees are not an empty string
        if (schedule.attendees && schedule.attendees.length > 0) {
            const attendeesList = schedule.attendees.split(',');
            const content = await icalGenerate(attendeesList, 'delete', schedule);
            sendDeleteReservationEmail(attendeesList, content);
        }

        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        console.log("🚀 ~ exports.delete ~ error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};


// New method to get all schedules with status 'waiting'
exports.getWaitingSchedules = async (req, res) => {
    const { buildingId } = req.query;

    if (!buildingId) {
        return res.status(400).json({ error: 'buildingId is required' });
    }

    try {
        const waitingSchedules = await Schedule.findAll({
            where: {
                isDeleted: false,
                status: 'pending',
                buildingId: buildingId,
            },
        });
        res.json(waitingSchedules);
    } catch (error) {
        console.log("🚀 ~ exports.getWaitingSchedules= ~ error:", error)
        res.status(500).json({ error: 'Server error' });
    }
};

exports.passWaitingSchedules = async (req, res) => {
    const { id } = req.params;

    try {
        const schedule = await Schedule.findOne({
            where: {
                id: id,
                isDeleted: false,
            },
        });

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        // Update status to "confirmed"
        await schedule.update({ status: "confirmed" });

        if (schedule.attendees && schedule.attendees.length > 0) {
            // Generate iCal content
            const content = await icalGenerate(schedule.attendees.split(','), 'create', schedule);

            // Send email for new reservation
            sendNewReservationEmail(schedule.attendees.split(','), content, schedule, 'create');
        }
        res.json({ message: 'Schedule updated successfully', schedule });
    } catch (error) {
        console.log("🚀 ~ exports.passWaitingSchedules= ~ error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.cancelWaitingSchedules = async (req, res) => {
    const { id } = req.params;

    try {
        const schedule = await Schedule.findOne({
            where: {
                id: id,
                isDeleted: false,
            },
        });

        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        // Update status to "cancel"
        await schedule.update({ status: "cancel" });

        // Send cancellation email if attendees are not an empty string
        if (schedule.attendees && schedule.attendees.length > 0) {
            const attendeesList = schedule.attendees.split(',');
            const content = await icalGenerate(attendeesList, 'delete', schedule);
            sendDeleteReservationEmail(attendeesList, content);
        }

        res.json({ message: 'Schedule canceled successfully', schedule });
    } catch (error) {
        console.log("🚀 ~ exports.cancelWaitingSchedules= ~ error:", error);
        res.status(500).json({ error: 'Server error' });
    }
};
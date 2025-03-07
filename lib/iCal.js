const ical = require("ical-generator").default;
const { ICalCalendarMethod } = require("ical-generator");
const db = require("../models");
const Room = db.room;
const User = db.user; // Import the User model

const formatDateTime = (date, time) => {
    const dateTime = new Date(date);
    const [hours, minutes] = time.split(':');
    dateTime.setHours(hours, minutes);
    return dateTime;
};

const isValidEmail = (email) => {
    // Simple regex for validating email format
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const getOrganizerEmail = async (organizerId) => {
    if (!organizerId) return "renspot@gmail.com"; // Default if no organizer ID

    const user = await User.findOne({ where: { id: organizerId } });
    return user && isValidEmail(user.email) ? user.email : "renspot@gmail.com";
};

const icalGenerate = async (attendee, type, sched) => {
    const calendar = ical({ name: "Reservation Event" });
    let newSequence = sched.sequence;

    // Set the calendar method and sequence based on the type
    if (type === "create") {
        calendar.method(ICalCalendarMethod.REQUEST);
        newSequence = sched.sequence + 1; // Increment sequence for new events
    } else if (type === "update") {
        calendar.method(ICalCalendarMethod.REQUEST);
        // Use existing sequence
    } else if (type === "delete") {
        calendar.method(ICalCalendarMethod.CANCEL);
        newSequence = sched.sequence + 1; // Increment sequence for cancellations
    }

    const room = await Room.findOne({ where: { id: sched.roomId } });

    // Combine date with startTime and endTime
    const start = formatDateTime(sched.date, sched.startTime);
    const end = formatDateTime(sched.date, sched.endTime);

    // Get organizer email
    const organizerEmail = await getOrganizerEmail(sched.organizer);

    // Create event
    calendar.createEvent({
        id: sched.id + 50,
        sequence: newSequence,
        start,
        end,
        summary: sched.summary || "Reservation",
        description: sched.description,
        location: room ? room.name : "No location",
        organizer: organizerEmail,
        attendees: attendee || [],
    });

    return calendar.toString();
};

const cancelIcalGenerate = async (sched, attendee) => {
    const calendar = ical({ name: "Reservation Event" });
    calendar.method(ICalCalendarMethod.CANCEL);
    const newSequence = sched.sequence + 1; // Increment sequence for cancellations

    const room = await Room.findOne({ where: { id: sched.roomId } });

    // Combine date with startTime and endTime
    const start = formatDateTime(sched.date, sched.startTime);
    const end = formatDateTime(sched.date, sched.endTime);

    // Get organizer email
    const organizerEmail = await getOrganizerEmail(sched.organizer);

    // Create cancellation event
    calendar.createEvent({
        id: sched.id,
        sequence: newSequence,
        start,
        end,
        summary: sched.summary || "Cancel reservation",
        description: sched.description,
        location: room ? room.name : "No location",
        organizer: organizerEmail,
        attendees: attendee || [],
    });

    return calendar.toString();
};

module.exports = { icalGenerate, cancelIcalGenerate };
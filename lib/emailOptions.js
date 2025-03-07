const PORT = process.env.PORT ? process.env.PORT : 8080;
const LOGO_LINK = `${process.env.CLIENT_URL}/image/Logo.jpg`;
const EMAIL_ADDRESS = `${process.env.SENDER_EMAIL_ADDRESS}`;
const SMTP_EMAIL_ADDRESS = `${process.env.SMTP_USER}`;

const newReservation = (attendees, content, sched, type) => {
    let subject;
    switch (type) {
        case "create":
            subject = "New reservation";
            break;
        case "update":
            subject = "Update reservation";
            break;
        case "delete":
            subject = "Cancel reservation";
            break;
        default:
            break;
    }
    return {
        from: SMTP_EMAIL_ADDRESS,
        to: (attendees.length > 0 ? attendees.join(", ") : "none@gmail.com"),
        subject: sched?.summary ? sched?.summary : subject,
        icalEvent: {
            filename: "invite.ics",
            method: type == "delete" ? "cancel" : "request",
            content: content,
        },
    };
};

const cancelReservation = (deletedAttendees, content) => {
    return {
        from: SMTP_EMAIL_ADDRESS,
        to: deletedAttendees.length > 0 ? deletedAttendees.join(", ") : "none@gmail.com",
        subject: "Cancel reservation",
        icalEvent: {
            filename: "invite.ics",
            method: "cancel",
            content: content,
        },
    };
};


const deleteReservation = (attendees, content) => {
    return {
        from: SMTP_EMAIL_ADDRESS,
        to: attendees.length > 0 ? attendees.join(", ") : "none@gmail.com",
        subject: "Cancel reservation",
        icalEvent: {
            filename: "invite.ics",
            method: "cancel",
            content: content,
        },
    };
};

module.exports = {
    newReservation,
    cancelReservation,
    deleteReservation,
};

const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const {
  newReservation,
  cancelReservation,
  deleteReservation,
} = require("./emailOptions");


const sendSMTPEmail = {
  sendNewReservationEmail: async (attendees, content, sched, type) => {
    console.log(process.env.SMTP_HOST);
    
    return new Promise(async (resolve, reject) => {
      try {
        const result = await transporter.sendMail(
          newReservation(attendees, content, sched, type)
        );
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },
  sendCancelReservationEmail: async (deletedAttendees, content) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await transporter.sendMail(
          cancelReservation(deletedAttendees, content)
        );
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },
  sendDeleteReservationEmail: async (attendees, content) => {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await transporter.sendMail(
          deleteReservation(attendees, content)
        );
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },
};
module.exports = sendSMTPEmail;

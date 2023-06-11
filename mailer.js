// Basic Lib Imports
require("dotenv").config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
},);

// Function to send an email
const sendEmail = async (to, subject, text) => {
    try {
      const info = await transporter.sendMail({
        from: 'quotecraft@gmail.com',
        to,
        subject,
        text,
      });
      console.log('Email sent:', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };
  

module.exports = sendEmail;

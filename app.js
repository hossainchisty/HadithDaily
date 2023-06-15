// Basic Lib Imports
require("dotenv").config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const schedule = require('node-schedule');
const generateRandomHadith = require('./services/getRandomHadith');
const sendEmail = require('./services/mailer');
const User = require('./schema/userModels');


const app = express();

// Set up body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Set up cookie parser middleware
app.use(cookieParser());


// MongoDB connection setup
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Schedule the task to run at 7am daily
// * * * * *  0 7 * * *
// const job = schedule.scheduleJob('* * * * * ', async () => {
//   try {
//       // Retrieve all user email addresses from the user database
//       const users = await User.find({}, 'email');

//       for (const user of users) {
//           const userEmailAddress = user.email;

//           const hadith = await generateRandomHadith();
//           const subject = 'Hadith Daily';
//           const text = `${hadith.quote}\n(Reference: ${hadith.reference})`;

//           await sendEmail(userEmailAddress, subject, text);
//       }
//   } catch (error) {
//       console.error(error);
//   }
// });



// async function sendDailyEmail() {
//   const currentDate = new Date();
//   const desiredTime = new Date(currentDate);
//   desiredTime.setUTCHours(1, 0, 0); // Set the desired time to 1:00 AM UTC time (equivalent to 7:00 AM in Bangladesh time zone)

//   const timeDiff = desiredTime - currentDate;

//   // If the desired time has passed for today, add 24 hours to the time difference to schedule for the next day
//   const timeToWait = timeDiff < 0 ? timeDiff + 24 * 60 * 60 * 1000 : timeDiff;

//   setTimeout(async () => {
//     // Retrieve all user email addresses from the user database
//     const users = await User.find({}, 'email');

//     for (const user of users) {
//       const userEmailAddress = user.email;

//       const hadith = await generateRandomHadith();
//       const subject = 'Hadith Daily';
//       const text = `${hadith.quote}\n(Reference: ${hadith.reference})`;

//       await sendEmail(userEmailAddress, subject, text);
//     }

//     // After sending the email, recursively call the function to schedule for the next day
//     sendDailyEmail();
//   }, timeToWait);
// }

// // Start the process
// sendDailyEmail();


async function sendEmailEveryMinute() {
  const users = await User.find({}, 'email');

  for (const user of users) {
    const userEmailAddress = user.email;

    const hadith = await generateRandomHadith();
    const subject = 'Hadith Daily';
    const text = `${hadith.quote}\n(Reference: ${hadith.reference})`;

    await sendEmail(userEmailAddress, subject, text);
  }

  setTimeout(sendEmailEveryMinute, 60000); // Send email every minute
}

// Start the process
sendEmailEveryMinute();

// Set the routes
app.use('/', require('./routers/index'));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});


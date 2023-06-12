// Basic Lib Imports
require("dotenv").config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cron = require('node-cron');
const sendEmail = require('./mailer');
const cookieParser = require('cookie-parser');
const User = require('./schema/userModels');
const generateRandomHadith = require('./services/getRandomHadith');


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
cron.schedule('0 7 * * *', async () => {
  try {
    // Retrieve all user email addresses from the user database
    const users = await User.find({}, 'email');

    users.forEach(async (user) => {
      const userEmailAddress = user.email;

      const hadith = await generateRandomHadith();
      const subject = 'Hadith Daily';
      const text = `${hadith.quote}\n(Reference: ${hadith.reference})`;

      sendEmail(userEmailAddress, subject, text);
    });
  } catch (error) {
    console.error(error);
  }
});

// Set the routes
app.use('/', require('./routers/index'));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});


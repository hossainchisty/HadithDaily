// Basic Lib Imports
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Hadith = require('../schema/hadithModels');
const User = require('../schema/userModels');

const generateRandomHadith = require('../services/getRandomHadith');

// Register route
router.post('/', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.render('register/register.ejs', { message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        user = new User({
            name,
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await user.save();
        res.redirect('/registration-success');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            errorMessage = 'User not found';
            return res.render('login', { errorMessage });
        }

        // Check the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            errorMessage = 'Invalid credentials';
            return res.render('login', { errorMessage });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, 'secretkey');

        // Set the token as a cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});




// Protected route - render the dashboard
router.get('/dashboard', async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, 'secretkey');
        const userId = decoded.userId;


        const hadith = await generateRandomHadith();
        const quote = hadith.quote;
        const reference = hadith.reference;

        res.render('dashboard', { quote, reference });
    } catch (error) {
        console.error(error);
        res.redirect('/login');
    }
});

// Render the registration form
router.get('/', (req, res) => {
    // Check if the user has a valid session or token
    if (req.cookies.token) {
        return res.redirect('/dashboard');

    }
    res.render('register/register.ejs', { message: '' });
});

// Render the login form
router.get('/login', (req, res) => {
    // Check if the user has a valid session or token
    if (req.cookies.token) {
        return res.redirect('/dashboard');
    }
    res.render('login', { errorMessage: '' });
});

// Render the registration success page
router.get('/registration-success', (req, res) => {
    res.render('register/registration-success.ejs');
});

// API endpoint to insert hadiths into the database
router.post('/hadiths', async (req, res) => {
    try {
        const hadiths = require('../hadiths.json'); // Load the hadiths from the JSON file

        // Insert hadiths into the database using insertMany
        const result = await Hadith.insertMany(hadiths);
        res.status(200).json({ message: 'Hadiths inserted successfully!', count: result.length });
    } catch (error) {
        console.error('Error inserting hadiths:', error);
        res.status(500).json({ message: 'Failed to insert hadiths', error: error.message });
    }
});

module.exports = router;

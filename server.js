const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = "mongodb+srv://Mitraadmin:Its%40%408989@cluster0.rbq11om.mongodb.net/MitraVibeDB?retryWrites=true&w=majority";
mongoose.connect(mongoURI).then(() => console.log("✅ Database Connected!"));

// User Model (Schema)
const User = mongoose.model('User', {
    name: String,
    email: { type: String, unique: true },
    password: String
});

// Default Route
app.get('/', (req, res) => {
    res.send('Mitra Vibe Backend is Live and Testing Signup! 🚀');
});

// Signup Route (POST Request)
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: "User Registered Successfully! 🎉" });
    } catch (err) {
        res.status(400).json({ error: "Email already exists or Invalid data!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

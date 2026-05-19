const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const mongoURI = "mongodb+srv://Mitraadmin:Its%40%408989@cluster0.rbq11om.mongodb.net/MitraVibeDB?retryWrites=true&w=majority&tls=true";
mongoose.connect(mongoURI).then(() => console.log("✅ Database Connected!"));

const User = mongoose.model('User', {
    name: String,
    email: { type: String, unique: true },
    password: String
});

app.get('/', (req, res) => {
    res.send('Mitra Vibe Backend is Live! 🚀');
});

// Signup Route
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: "User Registered Successfully! 🎉" });
    } catch (err) {
        res.status(400).json({ error: "Email already exists!" });
    }
});

// Login Route (Naya Feature!)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email, password: password });
        
        if (user) {
            res.status(200).json({ message: `Welcome back, ${user.name}! 👋`, userId: user._id });
        } else {
            res.status(401).json({ error: "Ghalat Email ya Password! ❌" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server Error!" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

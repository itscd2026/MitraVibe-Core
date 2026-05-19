const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

const mongoURI = "mongodb+srv://Mitraadmin:Its%40%408989@cluster0.rbq11om.mongodb.net/MitraVibeDB?retryWrites=true&w=majority&tls=true";
mongoose.connect(mongoURI).then(() => console.log("✅ Database Connected!"));

// Users Model
const User = mongoose.model('User', {
    name: String,
    email: { type: String, unique: true },
    password: String
});

// Posts Model (Naya!)
const Post = mongoose.model('Post', {
    username: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
});

app.get('/', (req, res) => {
    res.send('Mitra Vibe Backend is Live! 🚀');
});

// Signup API
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

// Login API
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (user) {
            res.status(200).json({ message: `Welcome, ${user.name}!`, user });
        } else {
            res.status(401).json({ error: "Invalid Credentials!" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server Error!" });
    }
});

// Create Post API (Naya Feature!)
app.post('/create-post', async (req, res) => {
    try {
        const { username, content } = req.body;
        const newPost = new Post({ username, content });
        await newPost.save();
        res.status(201).json({ message: "Post Shared! 📱", post: newPost });
    } catch (err) {
        res.status(500).json({ error: "Could not post!" });
    }
});

// Get All Posts API (Feeds dekhne ke liye)
app.get('/posts', async (req, res) => {
    const allPosts = await Post.find().sort({ createdAt: -1 });
    res.json(allPosts);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

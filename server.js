const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors'); // Naya!
const app = express();

app.use(cors()); // Sabko allow karega
app.use(bodyParser.json());

const mongoURI = "mongodb+srv://Mitraadmin:Its%40%408989@cluster0.rbq11om.mongodb.net/MitraVibeDB?retryWrites=true&w=majority&tls=true";
mongoose.connect(mongoURI).then(() => console.log("✅ Database Connected!"));

const User = mongoose.model('User', { name: String, email: { type: String, unique: true }, password: String });
const Post = mongoose.model('Post', { username: String, content: String, createdAt: { type: Date, default: Date.now } });

app.get('/', (req, res) => res.send('Mitra Vibe API is Running!'));

app.post('/signup', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "User Registered! 🎉" });
    } catch (err) { res.status(400).json({ error: "Error!" }); }
});

app.post('/create-post', async (req, res) => {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(201).json({ message: "Posted!" });
});

app.get('/posts', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Live!"));

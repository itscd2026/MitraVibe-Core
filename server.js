const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const mongoURI = "mongodb+srv://Mitraadmin:Its%40%408989@cluster0.rbq11om.mongodb.net/MitraVibeDB?retryWrites=true&w=majority&tls=true";
mongoose.connect(mongoURI).then(() => console.log("✅ DB Connected!"));

const User = mongoose.model('User', { name: String, email: { type: String, unique: true }, password: String });

// Yahan maine 'imageUrl' add kar diya hai
const Post = mongoose.model('Post', { 
    username: String, 
    content: String, 
    imageUrl: String, 
    likes: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now } 
});

app.get('/', (req, res) => res.send('Mitra Vibe API Running!'));

app.post('/signup', async (req, res) => {
    try { const newUser = new User(req.body); await newUser.save(); res.status(201).json({ message: "Welcome to the Tribe! 🎉" }); }
    catch (err) { res.status(400).json({ error: "Email exists!" }); }
});

app.post('/login', async (req, res) => {
    const user = await User.findOne(req.body);
    user ? res.json({ user }) : res.status(401).json({ error: "Ghalat details!" });
});

app.post('/create-post', async (req, res) => {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(201).json(newPost);
});

app.get('/posts', async (req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
});

app.post('/like/:id', async (req, res) => {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    res.json(post);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Live!"));

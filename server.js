const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const mongoURI = "mongodb+srv://Mitraadmin:Its%40%408989@cluster0.rbq11om.mongodb.net/MitraVibeDB?retryWrites=true&w=majority&tls=true";
mongoose.connect(mongoURI).then(() => console.log("✅ DB Connected!"));

// FEATURE 1 & 2: User schema mein DP aur Bio add kiya
const User = mongoose.model('User', { 
    name: String, email: { type: String, unique: true }, password: String,
    profilePic: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
    bio: { type: String, default: 'Hey there! I am using Mitra Vibe.' }
});

const Post = mongoose.model('Post', { 
    username: String, userDp: String, content: String, imageUrl: String, 
    privacy: { type: String, default: 'Public' }, likes: { type: Number, default: 0 },
    comments: [{ username: String, text: String, createdAt: { type: Date, default: Date.now } }],
    createdAt: { type: Date, default: Date.now } 
});

app.get('/', (req, res) => res.send('Mitra Vibe API Running!'));

app.post('/signup', async (req, res) => {
    try { const newUser = new User(req.body); await newUser.save(); res.status(201).json({ message: "Welcome to Mitra Vibe! 🎉" }); }
    catch (err) { res.status(400).json({ error: "Email exists!" }); }
});

app.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email, password: req.body.password });
    user ? res.json({ user }) : res.status(401).json({ error: "Ghalat details!" });
});

// Update Profile API
app.put('/update-profile/:id', async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { profilePic: req.body.profilePic, bio: req.body.bio }, { new: true });
    res.json({ message: "Profile Updated!", user });
});

app.post('/create-post', async (req, res) => {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(201).json(newPost);
});

// Search functionality API
app.get('/posts', async (req, res) => {
    const search = req.query.search || '';
    const posts = await Post.find({ 
        $or: [{ content: new RegExp(search, 'i') }, { username: new RegExp(search, 'i') }] 
    }).sort({ createdAt: -1 });
    res.json(posts);
});

app.post('/like/:id', async (req, res) => {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
    res.json({ message: "Liked!" });
});

app.delete('/delete-post/:id', async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted!" });
});

app.put('/edit-post/:id', async (req, res) => {
    await Post.findByIdAndUpdate(req.params.id, { content: req.body.content });
    res.json({ message: "Edited!" });
});

app.put('/privacy-post/:id', async (req, res) => {
    const post = await Post.findById(req.params.id);
    await Post.findByIdAndUpdate(req.params.id, { privacy: post.privacy === 'Public' ? 'Private' : 'Public' });
    res.json({ message: "Privacy Changed!" });
});

app.post('/comment/:id', async (req, res) => {
    await Post.findByIdAndUpdate(req.params.id, { $push: { comments: { username: req.body.username, text: req.body.text } } });
    res.json({ message: "Commented!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Live!"));

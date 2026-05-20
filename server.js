const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json({limit: '50mb'})); 
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const mongoURI = "mongodb+srv://Mitraadmin:Its%40%408989@cluster0.rbq11om.mongodb.net/MitraVibeDB?retryWrites=true&w=majority&tls=true";

// Crash-Protection: Added .catch() to prevent server from exiting on DB timeout
mongoose.connect(mongoURI)
    .then(() => console.log("✅ Mitra Vibe DB Connected!"))
    .catch(err => console.log("❌ DB Connection Error:", err));

const User = mongoose.model('User', { 
    name: String, email: { type: String, unique: true }, password: String,
    profilePic: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
    coverPic: { type: String, default: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800' },
    bio: { type: String, default: 'Mitra Vibe User 🚀' }, website: { type: String, default: '' }, 
    followers: { type: Number, default: 0 }
});

const Post = mongoose.model('Post', { 
    username: String, userDp: String, content: String, imageUrl: String, 
    privacy: { type: String, default: 'Public' },
    linkPreview: { url: String, title: String, image: String },
    reactions: { like: {type: Number, default: 0}, love: {type: Number, default: 0}, haha: {type: Number, default: 0} },
    comments: [{ username: String, text: String, createdAt: { type: Date, default: Date.now } }],
    createdAt: { type: Date, default: Date.now } 
});

app.get('/', (req, res) => res.send('Mitra Vibe API Running!'));

app.post('/signup', async (req, res) => {
    try { const newUser = new User(req.body); await newUser.save(); res.status(201).json({ message: "Welcome!", user: newUser }); }
    catch (err) { res.status(400).json({ error: "Email exists!" }); }
});

app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email, password: req.body.password });
        user ? res.json({ user }) : res.status(401).json({ error: "Invalid credentials!" });
    } catch(e) { res.status(500).json({ error: "Server error" }); }
});

app.put('/update-profile/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { profilePic: req.body.profilePic, coverPic: req.body.coverPic, bio: req.body.bio, website: req.body.website }, { new: true });
        res.json({ message: "Profile Updated!", user });
    } catch(e) { res.status(500).send(); }
});

app.post('/create-post', async (req, res) => {
    try { const newPost = new Post(req.body); await newPost.save(); res.status(201).json(newPost); }
    catch(e) { res.status(500).send(); }
});

app.get('/posts', async (req, res) => {
    try { const posts = await Post.find().sort({ createdAt: -1 }); res.json(posts); }
    catch(e) { res.status(500).send(); }
});

app.post('/fetch-preview', async (req, res) => {
    try {
        const response = await fetch(req.body.url); 
        const html = await response.text();
        const titleMatch = html.match(/<title>(.*?)<\/title>/i); 
        const imgMatch = html.match(/<meta.*?property="og:image".*?content="(.*?)".*?>/i);
        res.json({ title: titleMatch ? titleMatch[1] : req.body.url, image: imgMatch ? imgMatch[1] : 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=600', url: req.body.url });
    } catch(err) { res.json(null); }
});

app.put('/edit-post/:id', async (req, res) => {
    try { await Post.findByIdAndUpdate(req.params.id, { content: req.body.content }); res.json({ message: "Edited!" }); } 
    catch(e) { res.status(500).send(); }
});

app.put('/privacy-post/:id', async (req, res) => {
    try { const post = await Post.findById(req.params.id); await Post.findByIdAndUpdate(req.params.id, { privacy: post.privacy === 'Public' ? 'Private' : 'Public' }); res.json({ message: "Privacy Changed!" }); } 
    catch(e) { res.status(500).send(); }
});

app.delete('/delete-post/:id', async (req, res) => {
    try { await Post.findByIdAndDelete(req.params.id); res.json({ message: "Deleted!" }); } 
    catch(e) { res.status(500).send(); }
});

app.post('/react/:id/:type', async (req, res) => {
    try { let update = {}; update[`reactions.${req.params.type}`] = 1; await Post.findByIdAndUpdate(req.params.id, { $inc: update }); res.json({ message: "Reacted!" }); } 
    catch(e) { res.status(500).send(); }
});

app.post('/comment/:id', async (req, res) => {
    try { await Post.findByIdAndUpdate(req.params.id, { $push: { comments: { username: req.body.username, text: req.body.text } } }); res.json({ message: "Commented!" }); } 
    catch(e) { res.status(500).send(); }
});

app.delete('/delete-comment/:postId/:commentId', async (req, res) => {
    try { await Post.findByIdAndUpdate(req.params.postId, { $pull: { comments: { _id: req.params.commentId } } }); res.json({ message: "Comment Deleted!" }); } 
    catch(e) { res.status(500).send(); }
});

app.listen(process.env.PORT || 3000, () => console.log("🚀 Server Live!"));

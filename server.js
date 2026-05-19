const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json({limit: '20mb'})); 
app.use(bodyParser.urlencoded({limit: '20mb', extended: true}));

const mongoURI = "mongodb+srv://Mitraadmin:Its%40%408989@cluster0.rbq11om.mongodb.net/MitraVibeDB?retryWrites=true&w=majority&tls=true";
mongoose.connect(mongoURI).then(() => console.log("✅ DB Connected!"));

const User = mongoose.model('User', { 
    name: String, email: { type: String, unique: true }, password: String,
    profilePic: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
    coverPic: { type: String, default: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800' },
    bio: { type: String, default: 'Mitra Vibe User 🚀' }, website: { type: String, default: '' }, 
    savedPosts: [String], followers: { type: Number, default: 0 }, following: { type: Number, default: 0 }
});

const Post = mongoose.model('Post', { 
    username: String, userDp: String, content: String, imageUrl: String, location: String,
    privacy: { type: String, default: 'Public' }, isPinned: { type: Boolean, default: false },
    linkPreview: { url: String, title: String, image: String }, // NAYA: Link Preview Data
    reactions: { like: {type: Number, default: 0}, love: {type: Number, default: 0}, haha: {type: Number, default: 0} },
    views: { type: Number, default: 0 }, 
    comments: [{ username: String, text: String, createdAt: { type: Date, default: Date.now } }],
    createdAt: { type: Date, default: Date.now } 
});

app.get('/', (req, res) => res.send('Mitra Vibe API Running!'));

app.post('/signup', async (req, res) => {
    try { const newUser = new User(req.body); await newUser.save(); res.status(201).json({ message: "Welcome! 🎉" }); }
    catch (err) { res.status(400).json({ error: "Email exists!" }); }
});

app.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email, password: req.body.password });
    user ? res.json({ user }) : res.status(401).json({ error: "Ghalat details!" });
});

app.put('/update-profile/:id', async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { profilePic: req.body.profilePic, coverPic: req.body.coverPic, bio: req.body.bio, website: req.body.website }, { new: true });
    res.json({ message: "Profile Updated!", user });
});

app.post('/create-post', async (req, res) => {
    const newPost = new Post(req.body); await newPost.save(); res.status(201).json(newPost);
});

app.get('/posts', async (req, res) => {
    const search = req.query.search || '';
    const posts = await Post.find({ $or: [{ content: new RegExp(search, 'i') }, { username: new RegExp(search, 'i') }, { location: new RegExp(search, 'i') }] }).sort({ isPinned: -1, createdAt: -1 });
    res.json(posts);
});

// NAYA: Link scraping API
app.post('/fetch-preview', async (req, res) => {
    try {
        const response = await fetch(req.body.url);
        const html = await response.text();
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        const imgMatch = html.match(/<meta.*?property="og:image".*?content="(.*?)".*?>/i);
        res.json({
            title: titleMatch ? titleMatch[1] : req.body.url,
            image: imgMatch ? imgMatch[1] : 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=600',
            url: req.body.url
        });
    } catch(err) { res.json(null); }
});

app.post('/react/:id/:type', async (req, res) => {
    let update = {}; update[`reactions.${req.params.type}`] = 1;
    await Post.findByIdAndUpdate(req.params.id, { $inc: update }); res.json({ message: "Reacted!" });
});
app.post('/follow/:username', async (req, res) => { await User.findOneAndUpdate({name: req.params.username}, { $inc: { followers: 1 } }); res.json({ message: "Followed!" }); });
app.post('/pin/:id', async (req, res) => { const post = await Post.findById(req.params.id); await Post.findByIdAndUpdate(req.params.id, { isPinned: !post.isPinned }); res.json({ message: "Pin toggled!" }); });
app.post('/view/:id', async (req, res) => { await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }); res.json({ message: "Viewed!" }); });
app.delete('/delete-post/:id', async (req, res) => { await Post.findByIdAndDelete(req.params.id); res.json({ message: "Deleted!" }); });

app.listen(process.env.PORT || 3000, () => console.log("Live with Link Previews!"));

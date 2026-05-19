const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json({limit: '30mb'})); 
app.use(bodyParser.urlencoded({limit: '30mb', extended: true}));

const mongoURI = "mongodb+srv://Mitraadmin:Its%40%408989@cluster0.rbq11om.mongodb.net/MitraVibeDB?retryWrites=true&w=majority&tls=true";
mongoose.connect(mongoURI).then(() => console.log("✅ Final DB Connected!"));

const User = mongoose.model('User', { 
    name: String, email: { type: String, unique: true }, password: String, 
    profilePic: String, bio: String 
});

const Post = mongoose.model('Post', { 
    username: String, content: String, imageUrl: String, 
    privacy: { type: String, default: 'Public' },
    reactions: { like: {type: Number, default: 0}, love: {type: Number, default: 0} },
    comments: [{ username: String, text: String, createdAt: { type: Date, default: Date.now } }],
    createdAt: { type: Date, default: Date.now } 
});

app.post('/login', async (req, res) => { const user = await User.findOne(req.body); user ? res.json(user) : res.status(401).send(); });
app.post('/create-post', async (req, res) => { await new Post(req.body).save(); res.json({msg: "Done"}); });
app.get('/posts', async (req, res) => { res.json(await Post.find().sort({createdAt: -1})); });

// CRITICAL: Edit, Privacy, Delete
app.put('/edit-post/:id', async (req, res) => { await Post.findByIdAndUpdate(req.params.id, {content: req.body.content}); res.json({msg: "Edited"}); });
app.put('/privacy-post/:id', async (req, res) => { 
    const p = await Post.findById(req.params.id); 
    await Post.findByIdAndUpdate(req.params.id, {privacy: p.privacy === 'Public' ? 'Private' : 'Public'}); 
    res.json({msg: "Changed"}); 
});
app.delete('/delete-post/:id', async (req, res) => { await Post.findByIdAndDelete(req.params.id); res.json({msg: "Deleted"}); });

app.listen(process.env.PORT || 3000);

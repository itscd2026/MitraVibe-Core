const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json({limit: '30mb'})); 

const mongoURI = "mongodb+srv://Mitraadmin:Its%40%408989@cluster0.rbq11om.mongodb.net/MitraVibeDB?retryWrites=true&w=majority&tls=true";
mongoose.connect(mongoURI).then(() => console.log("✅ Final DB Connected"));

const User = mongoose.model('User', { name: String, email: { type: String, unique: true }, password: String, profilePic: String, coverPic: String, bio: String, website: String, followers: { type: Number, default: 0 } });
const Post = mongoose.model('Post', { 
    username: String, userDp: String, content: String, imageUrl: String, location: String, privacy: { type: String, default: 'Public' },
    linkPreview: { url: String, title: String, image: String },
    reactions: { like: {type: Number, default: 0}, love: {type: Number, default: 0}, haha: {type: Number, default: 0} },
    comments: [{ username: String, text: String, createdAt: { type: Date, default: Date.now } }],
    createdAt: { type: Date, default: Date.now } 
});

// Routes
app.post('/login', async (req, res) => { const user = await User.findOne(req.body); user ? res.json(user) : res.status(401).send(); });
app.put('/update-profile/:id', async (req, res) => { const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true}); res.json(user); });
app.post('/create-post', async (req, res) => { await new Post(req.body).save(); res.json({msg: "Done"}); });
app.get('/posts', async (req, res) => { res.json(await Post.find().sort({createdAt: -1})); });
app.put('/edit-post/:id', async (req, res) => { await Post.findByIdAndUpdate(req.params.id, {content: req.body.content}); res.json({msg: "Edited"}); });
app.put('/privacy-post/:id', async (req, res) => { const p = await Post.findById(req.params.id); await Post.findByIdAndUpdate(req.params.id, {privacy: p.privacy === 'Public' ? 'Private' : 'Public'}); res.json({msg: "Changed"}); });
app.delete('/delete-post/:id', async (req, res) => { await Post.findByIdAndDelete(req.params.id); res.json({msg: "Deleted"}); });
app.post('/react/:id/:type', async (req, res) => { let u = {}; u[`reactions.${req.params.type}`] = 1; await Post.findByIdAndUpdate(req.params.id, {$inc: u}); res.json({msg: "Done"}); });
app.post('/comment/:id', async (req, res) => { await Post.findByIdAndUpdate(req.params.id, {$push: {comments: req.body}}); res.json({msg: "Done"}); });
app.delete('/delete-comment/:postId/:commentId', async (req, res) => { await Post.findByIdAndUpdate(req.params.postId, {$pull: {comments: {_id: req.params.commentId}}}); res.json({msg: "Deleted"}); });

app.listen(process.env.PORT || 3000);

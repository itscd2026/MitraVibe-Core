const express = require('express');
const mongoose = require('mongoose');
const app = express();
const mongoURI = "mongodb+srv://Mitraadmin:Its%40%408989@cluster0.rbq11om.mongodb.net/?appName=Cluster0";
mongoose.connect(mongoURI).then(() => console.log("✅ Connected!"));
app.get('/', (req, res) => { res.send('Mitra Vibe Live! 🚀'); });
app.listen(process.env.PORT || 3000);

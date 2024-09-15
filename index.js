const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const corsOptions = {
    origin: ['http://bayudanputriwedding.vercel.app/', 'http://127.0.0.1:5500/'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Create Express app
const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// RSVP Schema
const rsvpSchema = new mongoose.Schema({
    evendId: { type: String, required: true },
    name: { type: String, required: true },
    message: { type: String, required: true },
    confirmation: { type: String, enum: ['hadir', 'tidak_hadir', 'masih_ragu'], required: true }
});

const RSVP = mongoose.model('RSVP', rsvpSchema);

// API Routes
app.post('/api/rsvp', async (req, res) => {
    try {
      const { eventId, name, message, confirmation } = req.body;
      const newRSVP = new RSVP({ eventId, name, message, confirmation });
      await newRSVP.save();
      res.status(201).json({ message: 'RSVP submitted successfully' });
    } catch (err) {
      res.status(400).json({ error: 'Error submitting RSVP', details: err.message });
    }
});
  
app.get('/api/rsvp', async (req, res) => {
  try {
    const rsvps = await RSVP.find();
    res.status(200).json(rsvps);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching RSVPs' });
  }
});

app.get('/api/rsvp/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const rsvps = await RSVP.find({ eventId });
      res.status(200).json(rsvps);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching RSVPs' });
    }
});

app.get('/api/rsvp/:eventId/count', async (req, res) => {
    try {
      const { eventId } = req.params;
      const total = await RSVP.countDocuments({ eventId });
  
      const hadirCount = await RSVP.countDocuments({ eventId, confirmation: 'hadir' });
      const tidakHadirCount = await RSVP.countDocuments({ eventId, confirmation: 'tidak_hadir' });
      const masihRaguCount = await RSVP.countDocuments({ eventId, confirmation: 'masih_ragu' });
  
      res.status(200).json({
        totalRSVP: total,
        counts: {
          hadir: hadirCount,
          tidakHadir: tidakHadirCount,
          masihRagu: masihRaguCount
        }
      });
    } catch (err) {
      res.status(500).json({ error: 'Error counting RSVPs' });
    }
});  
  

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

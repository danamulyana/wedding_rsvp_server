const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

//cors
const allowedOrigins = process.env.CORS_ORIGIN.split(',');

const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    optionsSuccessStatus: 200
  };

  
// Create Express app
const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// RSVP Schema
const rsvpSchema = new mongoose.Schema({
    eventId: { type: String, required: true },
    name: { type: String, required: true },
    message: { type: String, required: true },
    confirmation: { 
        type: String, 
        enum: ['hadir', 'tidak_hadir', 'masih_ragu'], 
        required: true 
    },
    createdAt: { type: Date, default: Date.now }
});

const RSVP = mongoose.model('RSVP', rsvpSchema);

// API Routes
app.post('/api/rsvp', async (req, res) => {
    try {
        const { eventId, name, message, confirmation } = req.body;

        if (!eventId || !name || !confirmation) {
            return res.status(400).json({ error: 'Required fields are missing' });
        }

        const newRSVP = new RSVP({ eventId, name, message, confirmation });
        await newRSVP.save();
        res.status(201).json({ 
            payload: newRSVP.toJSON(),
            message: 'RSVP submitted successfully' 
        });
    } catch (err) {
      res.status(400).json({ error: 'Error submitting RSVP', details: err.message });
    }
});
  
app.get('/api/rsvp', async (req, res) => {
  try {
    const total = await RSVP.countDocuments({ eventId });
  
    const hadirCount = await RSVP.countDocuments({ eventId, confirmation: 'hadir' });
    const tidakHadirCount = await RSVP.countDocuments({ eventId, confirmation: 'tidak_hadir' });
    const masihRaguCount = await RSVP.countDocuments({ eventId, confirmation: 'masih_ragu' });
  
    const rsvps = await RSVP.find().sort({ createdAt: -1 });
    res.status(200).json({
      totalRSVP: total,
      counts: {
        hadir: hadirCount,
        tidakHadir: tidakHadirCount,
        masihRagu: masihRaguCount
      },
      data: rsvps
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching RSVPs' });
  }
});

app.get('/api/rsvp/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const total = await RSVP.countDocuments({ eventId });
  
      const hadirCount = await RSVP.countDocuments({ eventId, confirmation: 'hadir' });
      const tidakHadirCount = await RSVP.countDocuments({ eventId, confirmation: 'tidak_hadir' });
      const masihRaguCount = await RSVP.countDocuments({ eventId, confirmation: 'masih_ragu' });
  
      const rsvps = await RSVP.find({ eventId }).sort({ createdAt: -1 });
      res.status(200).json({
        totalRSVP: total,
        counts: {
          hadir: hadirCount,
          tidakHadir: tidakHadirCount,
          masihRagu: masihRaguCount
        },
        data: rsvps
      });
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

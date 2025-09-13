const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Contact = require('./models/Contact'); // Import the schema

const app = express();


app.use(cors());
app.use(express.json());

// POST METHOD: Create a new contact message
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Create new contact message using the schema
    const newContact = new Contact({
      name,
      email,
      subject,
      message
    });

    // Save to database
    await newContact.save();
    
    console.log('📧 New message from:', name, '- Email:', email);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!'
    });

  } catch (error) {
    console.error('❌ Error saving contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.'
    });
  }
});

// Get all contact messages
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('❌ Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting messages'
    });
  }
});

// Mark message as read
app.patch('/api/contacts/:id/read', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating message' });
  }
});

// Test
app.get('/api/test', (req, res) => {
  res.json({ message: '🚀 Backend working!' });
});


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
}).then(() => {
  console.log("✅ Connected to MongoDB");

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});
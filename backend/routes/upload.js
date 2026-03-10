const express = require('express');
const Lead = require('../models/Lead');

const router = express.Router();

// POST /api/leads/upload
router.post('/upload', async (req, res) => {
  try {
    const leadData = req.body;

    // Basic validation
    if (!leadData.fullName || !leadData.email || !leadData.company) {
      return res.status(400).json({
        error: 'Missing required fields. Please provide fullName, email, and company.'
      });
    }

    // Process products (comma‑separated string → array)
    if (leadData.products && typeof leadData.products === 'string') {
      leadData.products = leadData.products.split(',').map(p => p.trim());
    }
    if (!leadData.products) leadData.products = [];

    // Convert consent to boolean
    if (leadData.consent !== undefined) {
      if (typeof leadData.consent === 'string') {
        const lower = leadData.consent.toLowerCase().trim();
        leadData.consent = lower === 'yes' || lower === 'true' || lower === '1' || lower === 'on';
      } else {
        leadData.consent = Boolean(leadData.consent);
      }
    }

    // Normalize preferredContact
    if (leadData.preferredContact) {
      leadData.preferredContact = leadData.preferredContact === 'phone' ? 'phone' : 'email';
    } else {
      leadData.preferredContact = 'email';
    }

    // Clean optional fields (empty string → null)
    const optionalFields = ['phone', 'jobTitle', 'annualRevenue', 'currentSolution',
      'timeline', 'budget', 'message', 'source', 'teamMembers'];
    optionalFields.forEach(field => {
      if (leadData[field] === '') leadData[field] = null;
    });

    // Save to database
    const savedLead = await Lead.create(leadData);
    const leadResponse = savedLead.toObject();
    delete leadResponse.__v;

    res.status(201).json({
      message: 'Lead created successfully',
      lead: leadResponse
    });

  } catch (error) {
    console.error('Lead creation error:', error);

    // Handle duplicate key errors (e.g., unique constraint on phone)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        error: `A lead with this ${field} already exists. Please use a different value.`
      });
    }

    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => ({
        field: e.path,
        message: e.message
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Generic server error
    res.status(500).json({
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

router.get('/details', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const leads = await Lead.find()
      .skip(skip)
      .limit(limit)
      .lean() // return plain JavaScript objects
      .select('-__v'); // exclude version field

    const total = await Lead.countDocuments();

    res.json({
      page,
      limit,
      total,
      leads
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// GET /:id - Get a single lead by ID
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).lean().select('-__v');
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid lead ID format' });
    }
    console.error('Error fetching lead:', error);
    res.status(500).json({
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

module.exports = router;
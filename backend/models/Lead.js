const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, sparse: true },
  company: { type: String, required: true },
  jobTitle: String,
  industry: String,
  companySize: String,
  annualRevenue: String,
  products: [String],
  currentSolution: String,
  timeline: String,
  budget: String,
  message: String,
  source: String,
  preferredContact: { type: String, enum: ['email', 'phone'], default: 'email' },
  country: String,
  teamMembers: String,
  consent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('LeadDetails', leadSchema);
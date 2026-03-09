// models/Lead.js

const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // ========== BASIC INFORMATION ==========
  personalInfo: {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true
      // ✅ Validation completely removed
    },
    alternatePhone: {
      type: String,
      trim: true
      // ✅ Validation removed
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please provide a valid email'
      }
    },
    whatsapp: {
      type: String,
      trim: true
      // ✅ Validation removed
    }
  },

  // ========== LEAD STATUS & TRACKING ==========
  status: {
    type: String,
    enum: [
      'new',
      'contacted',
      'qualified',
      'negotiating',
      'converted',
      'lost',
      'not_interested',
      'blocked'
    ],
    default: 'new',
    index: true
  },

  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    remarks: String
  }],

  // ========== SOURCE INFORMATION ==========
  source: {
    type: {
      type: String,
      enum: [
        'excel_upload',
        'manual_entry',
        'website',
        'referral',
        'social_media',
        'calling_campaign',
        'walk_in',
        'partner_portal',
        'linkedin',
        'facebook',
        'google_ads',
        'instagram',
        'twitter',
        'whatsapp',
        'email_campaign',
        'sms_campaign',
        'seminar',
        'workshop',
        'trade_show',
        'newspaper',
        'tv_ad',
        'radio_ad',
        'friend_referral',
        'colleague_referral',
        'family_referral',
        'existing_customer',
        'other'
      ],
      default: 'excel_upload'
    },
    details: {
      fileName: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadDate: Date,
      campaign: String,
      referralName: String,
      partnerName: String,
      websiteUrl: String,
      adName: String,
      platform: String,
      eventName: String,
      sourceName: String
    }
  },

  // ========== TIMESTAMPS ==========
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastContactedAt: Date,
  convertedAt: Date,
  deletedAt: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ========== INDEXES ==========
leadSchema.index({ 'personalInfo.name': 'text', 'personalInfo.phone': 'text', 'personalInfo.email': 'text' });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ 'source.type': 1 });

// ========== VIRTUAL PROPERTIES ==========
leadSchema.virtual('fullName').get(function() {
  return this.personalInfo.name;
});

leadSchema.virtual('daysSinceLastContact').get(function() {
  if (!this.lastContactedAt) return null;
  return Math.floor((Date.now() - this.lastContactedAt) / (1000 * 60 * 60 * 24));
});

// ========== MIDDLEWARE ==========
leadSchema.pre('save', async function() {
  console.log('🔄 Lead pre-save hook running...');
  
  // Update timestamp
  this.updatedAt = Date.now();
  
  // Track status changes
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date(),
      remarks: `Status changed to ${this.status}`
    });

    // If status is 'converted', set convertedAt
    if (this.status === 'converted') {
      this.convertedAt = new Date();
    }
  }
  
  console.log('✅ Lead pre-save completed');
});

// ========== INSTANCE METHODS ==========
leadSchema.methods.logActivity = function(action, userId, details = {}, req = null) {
  return this.save();
};

// ========== STATIC METHODS ==========
leadSchema.statics.getLeadsByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

leadSchema.statics.searchLeads = function(query) {
  return this.find({
    $or: [
      { 'personalInfo.name': { $regex: query, $options: 'i' } },
      { 'personalInfo.phone': { $regex: query, $options: 'i' } },
      { 'personalInfo.email': { $regex: query, $options: 'i' } }
    ]
  });
};

// ========== EXPORT MODEL ==========
module.exports = mongoose.model('Lead', leadSchema);
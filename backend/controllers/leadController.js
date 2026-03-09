const Lead = require('../models/Lead');

// controllers/leadController.js - Add these console.logs

exports.createLead = async (req, res) => {
  try {
    console.log("📥 Received request body:", JSON.stringify(req.body, null, 2)); // ← Add
    
    const lead = new Lead(req.body);
    console.log("📝 Lead object created:", lead); // ← Add
    
    await lead.save();
    console.log("✅ Lead saved successfully"); // ← Add
    
    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error("❌ Error creating lead:", error); // ← Add
    console.error("❌ Error details:", error.message); // ← Add
    console.error("❌ Error stack:", error.stack); // ← Add
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }
    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }
    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


exports.bulkUpload = async (req, res) => {
  try {
    const { leads } = req.body;
    
    if (!leads || !Array.isArray(leads)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide leads array'
      });
    }

    const savedLeads = await Lead.insertMany(leads);
    
    res.status(201).json({
      success: true,
      message: `${savedLeads.length} leads uploaded successfully`,
      data: savedLeads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
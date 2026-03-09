// src/api/leadAPI.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const leadApi = axios.create({
  baseURL: `${API_URL}/leads`,
});


const leadAPI = {
  // =============================================
  // CREATE LEAD
  // =============================================
  createLead: async (leadData) => {
    try {
      const response = await leadApi.post('/', leadData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating lead:', error);
      throw error;
    }
  },

  // =============================================
  // GET ALL LEADS
  // =============================================
  getAllLeads: async () => {
    try {
      const response = await leadApi.get('/');
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching leads:', error);
      throw error;
    }
  },

  // =============================================
  // GET LEAD BY ID
  // =============================================
  getLeadById: async (id) => {
    try {
      const response = await leadApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching lead:', error);
      throw error;
    }
  },

  // =============================================
  // UPDATE LEAD
  // =============================================
  updateLead: async (id, leadData) => {
    try {
      const response = await leadApi.put(`/${id}`, leadData);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating lead:', error);
      throw error;
    }
  },

  // =============================================
  // DELETE LEAD
  // =============================================
  deleteLead: async (id) => {
    try {
      const response = await leadApi.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting lead:', error);
      throw error;
    }
  },

  // =============================================
  // BULK UPLOAD LEADS
  // =============================================
  bulkUploadLeads: async (leadsData) => {
    try {
      const response = await leadApi.post('/bulk-upload', { leads: leadsData });
      return response.data;
    } catch (error) {
      console.error('❌ Error bulk uploading leads:', error);
      throw error;
    }
  },

  // =============================================
  // HELPER FUNCTIONS
  // =============================================

  // Format phone number for display
  formatPhone: (phone) => {
    if (!phone) return '-';
    return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
  },

  // Get status color for badge
  getStatusColor: (status) => {
    const colors = {
      'new': 'blue',
      'contacted': 'yellow',
      'qualified': 'green',
      'negotiating': 'orange',
      'converted': 'purple',
      'lost': 'red',
      'not_interested': 'gray',
      'blocked': 'black'
    };
    return colors[status] || 'gray';
  },

  // Get status icon
  getStatusIcon: (status) => {
    const icons = {
      'new': '🆕',
      'contacted': '📞',
      'qualified': '✅',
      'negotiating': '🤝',
      'converted': '🎉',
      'lost': '❌',
      'not_interested': '👎',
      'blocked': '🚫'
    };
    return icons[status] || '📌';
  },

  // Get source icon
  getSourceIcon: (sourceType) => {
    const icons = {
      'excel_upload': '📊',
      'manual_entry': '✍️',
      'website': '🌐',
      'referral': '🤝',
      'social_media': '📱',
      'calling_campaign': '📞',
      'walk_in': '🚶',
      'partner_portal': '🤝'
    };
    return icons[sourceType] || '📌';
  },

  // Calculate days since last contact
  getDaysSinceLastContact: (lastContactedAt) => {
    if (!lastContactedAt) return null;
    const days = Math.floor((Date.now() - new Date(lastContactedAt)) / (1000 * 60 * 60 * 24));
    return days;
  },

  // Format date for display
  formatDate: (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  // Format datetime for display
  formatDateTime: (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export default leadAPI;
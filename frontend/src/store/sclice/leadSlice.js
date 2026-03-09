// src/store/slices/leadSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import leadAPI from '../api/leadAPI';

// Create lead
export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData, { rejectWithValue }) => {
    try {
      const response = await leadAPI.createLead(leadData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to create lead'
      );
    }
  }
);

// Get all leads
export const getAllLeads = createAsyncThunk(
  'leads/getAllLeads',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leadAPI.getAllLeads();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to fetch leads'
      );
    }
  }
);

// Get lead by ID
export const getLeadById = createAsyncThunk(
  'leads/getLeadById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await leadAPI.getLeadById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to fetch lead'
      );
    }
  }
);

// Update lead
export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, leadData }, { rejectWithValue }) => {
    try {
      const response = await leadAPI.updateLead(id, leadData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to update lead'
      );
    }
  }
);

// Delete lead
export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id, { rejectWithValue }) => {
    try {
      const response = await leadAPI.deleteLead(id);
      return { id, message: response.data.message };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to delete lead'
      );
    }
  }
);

// Bulk upload leads
export const bulkUploadLeads = createAsyncThunk(
  'leads/bulkUploadLeads',
  async (leadsData, { rejectWithValue }) => {
    try {
      const response = await leadAPI.bulkUploadLeads(leadsData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.message || 'Failed to bulk upload leads'
      );
    }
  }
);

// =============================================
// INITIAL STATE
// =============================================

const initialState = {
  // Data
  leads: [],
  currentLead: null,
  
  // UI States
  loading: false,
  submitting: false,
  error: null,
  submitError: null,
  success: null,
  
  // Bulk upload status
  bulkUploadStatus: {
    loading: false,
    success: false,
    error: null,
    uploadedCount: 0
  },
  
  // Statistics
  stats: {
    total: 0,
    byStatus: {
      new: 0,
      contacted: 0,
      qualified: 0,
      negotiating: 0,
      converted: 0,
      lost: 0,
      not_interested: 0,
      blocked: 0
    }
  }
};

// =============================================
// SLICE
// =============================================

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.submitError = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearCurrentLead: (state) => {
      state.currentLead = null;
    },
    clearBulkUploadStatus: (state) => {
      state.bulkUploadStatus = {
        loading: false,
        success: false,
        error: null,
        uploadedCount: 0
      };
    },
    resetLeadState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // ===== CREATE LEAD =====
      .addCase(createLead.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
        state.success = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.submitting = false;
        state.leads.unshift(action.payload);
        state.currentLead = action.payload;
        state.success = 'Lead created successfully';
        state.stats.total += 1;
        if (action.payload.status) {
          state.stats.byStatus[action.payload.status] += 1;
        }
      })
      .addCase(createLead.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
        state.success = null;
      })

      // ===== GET ALL LEADS =====
      .addCase(getAllLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload || [];
        state.error = null;
        
        // Update stats
        state.stats.total = action.payload?.length || 0;
        
        // Calculate status counts
        const statusCounts = {
          new: 0, contacted: 0, qualified: 0, negotiating: 0,
          converted: 0, lost: 0, not_interested: 0, blocked: 0
        };
        
        action.payload?.forEach(lead => {
          if (lead.status && statusCounts.hasOwnProperty(lead.status)) {
            statusCounts[lead.status] += 1;
          }
        });
        
        state.stats.byStatus = statusCounts;
      })
      .addCase(getAllLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.leads = [];
      })

      // ===== GET LEAD BY ID =====
      .addCase(getLeadById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeadById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLead = action.payload;
        state.error = null;
      })
      .addCase(getLeadById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentLead = null;
      })

      // ===== UPDATE LEAD =====
      .addCase(updateLead.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
        state.success = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.submitting = false;
        const updatedLead = action.payload;
        
        // Update in leads array
        const index = state.leads.findIndex(lead => lead._id === updatedLead._id);
        if (index !== -1) {
          // Update status counts if status changed
          const oldLead = state.leads[index];
          if (oldLead.status !== updatedLead.status) {
            if (oldLead.status) state.stats.byStatus[oldLead.status] -= 1;
            if (updatedLead.status) state.stats.byStatus[updatedLead.status] += 1;
          }
          
          state.leads[index] = updatedLead;
        }
        
        // Update current lead if it's the same
        if (state.currentLead && state.currentLead._id === updatedLead._id) {
          state.currentLead = updatedLead;
        }
        
        state.success = 'Lead updated successfully';
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload;
        state.success = null;
      })

      // ===== DELETE LEAD =====
      .addCase(deleteLead.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.id;
        
        // Find lead before removing for stats
        const deletedLead = state.leads.find(lead => lead._id === deletedId);
        
        // Remove from leads array
        state.leads = state.leads.filter(lead => lead._id !== deletedId);
        
        // Update stats
        if (deletedLead?.status) {
          state.stats.byStatus[deletedLead.status] -= 1;
        }
        state.stats.total -= 1;
        
        // Clear current lead if it's the deleted one
        if (state.currentLead && state.currentLead._id === deletedId) {
          state.currentLead = null;
        }
        
        state.success = action.payload.message || 'Lead deleted successfully';
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = null;
      })

      // ===== BULK UPLOAD LEADS =====
      .addCase(bulkUploadLeads.pending, (state) => {
        state.bulkUploadStatus.loading = true;
        state.bulkUploadStatus.error = null;
        state.bulkUploadStatus.success = false;
        state.bulkUploadStatus.uploadedCount = 0;
      })
      .addCase(bulkUploadLeads.fulfilled, (state, action) => {
        state.bulkUploadStatus.loading = false;
        state.bulkUploadStatus.success = true;
        state.bulkUploadStatus.uploadedCount = action.payload?.length || 0;
        state.bulkUploadStatus.error = null;
        state.success = `${action.payload?.length || 0} leads uploaded successfully`;
      })
      .addCase(bulkUploadLeads.rejected, (state, action) => {
        state.bulkUploadStatus.loading = false;
        state.bulkUploadStatus.success = false;
        state.bulkUploadStatus.error = action.payload;
        state.bulkUploadStatus.uploadedCount = 0;
      });
  }
});

// =============================================
// ACTIONS
// =============================================

export const {
  clearError,
  clearSuccess,
  clearCurrentLead,
  clearBulkUploadStatus,
  resetLeadState
} = leadSlice.actions;

// =============================================
// SELECTORS
// =============================================

export const selectAllLeads = (state) => state.leads.leads;
export const selectCurrentLead = (state) => state.leads.currentLead;
export const selectLeadsLoading = (state) => state.leads.loading;
export const selectLeadsSubmitting = (state) => state.leads.submitting;
export const selectLeadsError = (state) => state.leads.error;
export const selectLeadsSubmitError = (state) => state.leads.submitError;
export const selectLeadsSuccess = (state) => state.leads.success;
export const selectBulkUploadStatus = (state) => state.leads.bulkUploadStatus;
export const selectLeadsStats = (state) => state.leads.stats;

// =============================================
// EXPORT REDUCER
// =============================================

export default leadSlice.reducer;
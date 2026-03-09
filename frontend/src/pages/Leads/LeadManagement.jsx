// // src/pages/Leads/LeadManagement.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllLeads, 
  deleteLead,
  bulkUploadLeads,
  selectAllLeads, 
  selectLeadsLoading,
  selectLeadsStats,
  selectBulkUploadStatus,
  clearBulkUploadStatus
} from '../../store/sclice/leadSlice';
import LeadTable from './LeadTable';
import LeadForm from './LeadForm';
import BulkUploadModal from './BulkUploadModal';
import { FiPlus, FiFilter, FiRefreshCw, FiUpload } from 'react-icons/fi';

const LeadManagement = () => {
  const dispatch = useDispatch();
  const leads = useSelector(selectAllLeads);
  const loading = useSelector(selectLeadsLoading);
  const stats = useSelector(selectLeadsStats);
  const bulkUploadStatus = useSelector(selectBulkUploadStatus);

  // Local state
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    dateFrom: '',
    dateTo: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState('');

  // ===== Load leads on mount =====
  useEffect(() => {
    dispatch(getAllLeads());
  }, [dispatch]);

  // ===== Show success message after bulk upload =====
  useEffect(() => {
    if (bulkUploadStatus.success) {
      setUploadSuccessMessage(`${bulkUploadStatus.uploadedCount} leads uploaded successfully!`);
      
      // Refresh leads list
      dispatch(getAllLeads());
      
      // Clear message after 3 seconds
      const timer = setTimeout(() => {
        setUploadSuccessMessage('');
        dispatch(clearBulkUploadStatus());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [bulkUploadStatus, dispatch]);

  // ===== Filter leads when leads or filters change =====
  useEffect(() => {
    if (!leads) return;

    let filtered = [...leads];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead => 
        lead.personalInfo?.name?.toLowerCase().includes(term) ||
        lead.personalInfo?.phone?.includes(term) ||
        lead.personalInfo?.email?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(lead => lead.status === filters.status);
    }

    // Apply source filter
    if (filters.source) {
      filtered = filtered.filter(lead => lead.source?.type === filters.source);
    }

    // Apply date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(lead => new Date(lead.createdAt) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(lead => new Date(lead.createdAt) <= toDate);
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, filters]);

  // ===== Handle edit lead =====
  const handleEdit = (lead) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  // ===== Handle delete lead =====
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await dispatch(deleteLead(id)).unwrap();
        dispatch(getAllLeads()); // Refresh list
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  // ===== Handle form close =====
  const handleFormClose = () => {
    setShowForm(false);
    setEditingLead(null);
    dispatch(getAllLeads()); // Refresh list
  };

  // ===== Handle bulk upload modal close =====
  const handleBulkUploadClose = () => {
    setShowBulkUpload(false);
  };

  // ===== Reset filters =====
  const resetFilters = () => {
    setFilters({
      status: '',
      source: '',
      dateFrom: '',
      dateTo: ''
    });
    setSearchTerm('');
  };

  // ===== Status options =====
  const statusOptions = [
    'new', 'contacted', 'qualified', 'negotiating', 
    'converted', 'lost', 'not_interested', 'blocked'
  ];

  // ===== Source options =====
  const sourceOptions = [
    'excel_upload', 'manual_entry', 'website', 'referral',
    'social_media', 'calling_campaign', 'walk_in', 'partner_portal'
  ];


  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">

        {/* ===== Success Message ===== */}
        {uploadSuccessMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            ✅ {uploadSuccessMessage}
          </div>
        )}

        {/* ===== Bulk Upload Error Message ===== */}
        {bulkUploadStatus.error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ❌ {bulkUploadStatus.error}
          </div>
        )}

        {/* ===== Header ===== */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Lead Management</h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage and track all your sales leads
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiFilter size={18} />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Upload Excel"
            >
              <FiUpload size={18} />
              <span className="hidden sm:inline">Upload Excel</span>
            </button>
            <button
              onClick={() => dispatch(getAllLeads())}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus size={18} />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* ===== Statistics Cards ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-xs text-gray-500 uppercase">Total Leads</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-xs text-gray-500 uppercase">Qualified</p>
            <p className="text-2xl font-bold text-gray-800">{stats.byStatus?.qualified || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <p className="text-xs text-gray-500 uppercase">Converted</p>
            <p className="text-2xl font-bold text-gray-800">{stats.byStatus?.converted || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <p className="text-xs text-gray-500 uppercase">New Leads</p>
            <p className="text-2xl font-bold text-gray-800">{stats.byStatus?.new || 0}</p>
          </div>
        </div>

        {/* ===== Filters Bar ===== */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Source</label>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Sources</option>
                  {sourceOptions.map(source => (
                    <option key={source} value={source}>
                      {source.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end mt-3">
              <button
                onClick={resetFilters}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* ===== Search Bar ===== */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, or email..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* ===== Lead Table ===== */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <LeadTable
            leads={filteredLeads}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* ===== Lead Form Modal ===== */}
        {showForm && (
          <LeadForm
            lead={editingLead}
            onClose={handleFormClose}
          />
        )}

        {/* ===== Bulk Upload Modal ===== */}
        {showBulkUpload && (
          <BulkUploadModal
            onClose={handleBulkUploadClose}
          />
        )}
      </div>
    </div>
  );
};

export default LeadManagement;
// src/components/leads/LeadForm.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createLead, updateLead, clearError, clearSuccess } from '../../store/sclice/leadSlice';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

const LeadForm = ({ lead, onClose }) => {
  const dispatch = useDispatch();
  const { submitting, submitError, success } = useSelector(state => state.leads);

  // ===== Form State =====
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      phone: '',
      alternatePhone: '',
      email: '',
      whatsapp: ''
    },
    status: 'new',
    source: {
      type: 'manual_entry',
      details: {}
    }
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ===== Load lead data if editing =====
  useEffect(() => {
    if (lead) {
      setFormData({
        personalInfo: {
          name: lead.personalInfo?.name || '',
          phone: lead.personalInfo?.phone || '',
          alternatePhone: lead.personalInfo?.alternatePhone || '',
          email: lead.personalInfo?.email || '',
          whatsapp: lead.personalInfo?.whatsapp || ''
        },
        status: lead.status || 'new',
        source: {
          type: lead.source?.type || 'manual_entry',
          details: lead.source?.details || {}
        }
      });
    }
  }, [lead]);

  // ===== Close on success =====
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  // ===== Cleanup =====
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  // ===== Validation Rules =====
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    // Name validation
    if (name === 'name' && !value.trim()) {
      newErrors.name = 'Name is required';
    } else if (name === 'name') {
      delete newErrors.name;
    }

    // Phone validation
    if (name === 'phone') {
      if (!value) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(value)) {
        newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
      } else {
        delete newErrors.phone;
      }
    }

    // Alternate phone validation
    if (name === 'alternatePhone' && value) {
      if (!/^[6-9]\d{9}$/.test(value)) {
        newErrors.alternatePhone = 'Enter a valid 10-digit Indian mobile number';
      } else {
        delete newErrors.alternatePhone;
      }
    }

    // WhatsApp validation
    if (name === 'whatsapp' && value) {
      if (!/^[6-9]\d{9}$/.test(value)) {
        newErrors.whatsapp = 'Enter a valid 10-digit Indian mobile number';
      } else {
        delete newErrors.whatsapp;
      }
    }

    // Email validation
    if (name === 'email' && value) {
      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        newErrors.email = 'Enter a valid email address';
      } else {
        delete newErrors.email;
      }
    }

    setErrors(newErrors);
    return !newErrors[name];
  };

  // ===== Handle Change =====
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('personalInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: value
        }
      }));
      if (touched[field]) {
        validateField(field, value);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // ===== Handle Blur =====
  const handleBlur = (e) => {
    const { name } = e.target;
    if (name.startsWith('personalInfo.')) {
      const field = name.split('.')[1];
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field, formData.personalInfo[field]);
    }
  };

  // ===== Validate Form =====
  const validateForm = () => {
    const newErrors = {};

    // Validate name
    if (!formData.personalInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate phone
    if (!formData.personalInfo.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.personalInfo.phone)) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    }

    // Validate alternate phone if provided
    if (formData.personalInfo.alternatePhone && 
        !/^[6-9]\d{9}$/.test(formData.personalInfo.alternatePhone)) {
      newErrors.alternatePhone = 'Enter a valid 10-digit Indian mobile number';
    }

    // Validate whatsapp if provided
    if (formData.personalInfo.whatsapp && 
        !/^[6-9]\d{9}$/.test(formData.personalInfo.whatsapp)) {
      newErrors.whatsapp = 'Enter a valid 10-digit Indian mobile number';
    }

    // Validate email if provided
    if (formData.personalInfo.email && 
        !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.personalInfo.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== Handle Submit =====
  const handleSubmit = async (e) => {
    console.log("button clicked");
    e.preventDefault();

    // if (!validateForm()) {
    //   console.log("validation failed");
    //   return;
    // }

    try {
      if (lead) {
        console.log("updatde lead called");
        await dispatch(updateLead({ id: lead._id, leadData: formData })).unwrap();
      } else {
        console.log("ccrete lead called");
        await dispatch(createLead(formData)).unwrap();
      }
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  // ===== Status Options =====
  const statusOptions = [
    'new', 'contacted', 'qualified', 'negotiating', 
    'converted', 'lost', 'not_interested', 'blocked'
  ];

  // ===== Source Options =====
  const sourceOptions = [
    'excel_upload', 'manual_entry', 'website', 'referral',
    'social_media', 'calling_campaign', 'walk_in', 'partner_portal'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* ===== Header ===== */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">
              {lead ? 'Edit Lead' : 'Add New Lead'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* ===== Success Message ===== */}
        {success && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            ✅ {success}
          </div>
        )}

        {/* ===== Error Message ===== */}
        {submitError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ❌ {submitError}
          </div>
        )}

        {/* ===== Form ===== */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {/* ===== Personal Information ===== */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Personal Information</h3>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="personalInfo.name"
                  value={formData.personalInfo.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name && touched.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-xs text-red-600">⚠️ {errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="personalInfo.phone"
                  value={formData.personalInfo.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength="10"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone && touched.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="10-digit mobile number"
                />
                {errors.phone && touched.phone && (
                  <p className="mt-1 text-xs text-red-600">⚠️ {errors.phone}</p>
                )}
              </div>

              {/* Alternate Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Number
                </label>
                <input
                  type="tel"
                  name="personalInfo.alternatePhone"
                  value={formData.personalInfo.alternatePhone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength="10"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.alternatePhone && touched.alternatePhone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Alternate mobile number"
                />
                {errors.alternatePhone && touched.alternatePhone && (
                  <p className="mt-1 text-xs text-red-600">⚠️ {errors.alternatePhone}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  name="personalInfo.whatsapp"
                  value={formData.personalInfo.whatsapp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength="10"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.whatsapp && touched.whatsapp ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="WhatsApp number"
                />
                {errors.whatsapp && touched.whatsapp && (
                  <p className="mt-1 text-xs text-red-600">⚠️ {errors.whatsapp}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="personalInfo.email"
                  value={formData.personalInfo.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email && touched.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="email@example.com"
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs text-red-600">⚠️ {errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* ===== Lead Details ===== */}
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-4">Lead Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  name="source.type"
                  value={formData.source.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sourceOptions.map(source => (
                    <option key={source} value={source}>
                      {source.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ===== Form Actions ===== */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FiLoader className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave />
                  {lead ? 'Update Lead' : 'Save Lead'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
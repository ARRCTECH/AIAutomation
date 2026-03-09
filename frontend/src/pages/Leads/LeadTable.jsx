// src/components/leads/LeadTable.jsx

import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import leadAPI from '../../store/api/leadAPI';

const LeadTable = ({ leads, loading, onEdit, onDelete }) => {
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [expandedRow, setExpandedRow] = useState(null);

  // ===== Handle sorting =====
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ===== Get sorted leads =====
  const getSortedLeads = () => {
    if (!leads || leads.length === 0) return [];

    const sortedLeads = [...leads].sort((a, b) => {
      let aValue, bValue;

      // Handle nested objects
      if (sortConfig.key.includes('.')) {
        const [parent, child] = sortConfig.key.split('.');
        aValue = a[parent]?.[child];
        bValue = b[parent]?.[child];
      } else {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      }

      // Handle dates
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt' || sortConfig.key === 'lastContactedAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Handle strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedLeads;
  };

  // ===== Get status badge =====
  const getStatusBadge = (status) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'qualified': 'bg-green-100 text-green-800',
      'negotiating': 'bg-orange-100 text-orange-800',
      'converted': 'bg-purple-100 text-purple-800',
      'lost': 'bg-red-100 text-red-800',
      'not_interested': 'bg-gray-100 text-gray-800',
      'blocked': 'bg-black text-white'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.replace('_', ' ').toUpperCase() || 'NEW'}
      </span>
    );
  };

  // ===== Get source badge =====
  const getSourceBadge = (source) => {
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

    return (
      <span className="flex items-center gap-1 text-xs text-gray-600">
        <span>{icons[source] || '📌'}</span>
        <span>{source?.replace('_', ' ') || 'N/A'}</span>
      </span>
    );
  };

  // ===== Format date =====
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // ===== Sort icon =====
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp className="inline" /> : <FiChevronDown className="inline" />;
  };

  // ===== Table columns =====
  const columns = [
    { key: 'personalInfo.name', label: 'Name', sortable: true },
    { key: 'personalInfo.phone', label: 'Phone', sortable: true },
    { key: 'personalInfo.email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'source.type', label: 'Source', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-5xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Leads Found</h3>
        <p className="text-gray-500">Get started by adding your first lead</p>
      </div>
    );
  }

  const sortedLeads = getSortedLeads();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                onClick={() => column.sortable && handleSort(column.key)}
                className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
              >
                <span className="flex items-center gap-1">
                  {column.label}
                  {getSortIcon(column.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedLeads.map((lead, index) => (
            <React.Fragment key={lead._id}>
              <tr
                className={`hover:bg-blue-50 transition-colors duration-150 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {/* Name */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedRow(expandedRow === lead._id ? null : lead._id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedRow === lead._id ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    <span className="font-medium text-gray-900">
                      {lead.personalInfo?.name || 'N/A'}
                    </span>
                  </div>
                </td>

                {/* Phone */}
                <td className="px-4 py-3">
                  <span className="font-mono text-sm">
                    {lead.personalInfo?.phone ? leadAPI.formatPhone(lead.personalInfo.phone) : '-'}
                  </span>
                  {lead.personalInfo?.whatsapp && (
                    <span className="ml-2 text-xs text-green-600" title="WhatsApp">📱</span>
                  )}
                </td>

                {/* Email */}
                <td className="px-4 py-3">
                  <a
                    href={`mailto:${lead.personalInfo?.email}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                  >
                    {lead.personalInfo?.email || '-'}
                  </a>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {getStatusBadge(lead.status)}
                </td>

                {/* Source */}
                <td className="px-4 py-3">
                  {getSourceBadge(lead.source?.type)}
                </td>

                {/* Created Date */}
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(lead.createdAt)}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(lead)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                      title="Edit Lead"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(lead._id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                      title="Delete Lead"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Expanded Row for Additional Details */}
              {expandedRow === lead._id && (
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td colSpan={7} className="px-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Contact Details */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Contact Details</h4>
                        <div className="space-y-1 text-sm">
                          {lead.personalInfo?.alternatePhone && (
                            <p><span className="text-gray-500">Alt Phone:</span> {leadAPI.formatPhone(lead.personalInfo.alternatePhone)}</p>
                          )}
                          {lead.personalInfo?.whatsapp && (
                            <p><span className="text-gray-500">WhatsApp:</span> {leadAPI.formatPhone(lead.personalInfo.whatsapp)}</p>
                          )}
                        </div>
                      </div>

                      {/* Source Details */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Source Details</h4>
                        <div className="space-y-1 text-sm">
                          {lead.source?.details?.fileName && (
                            <p><span className="text-gray-500">File:</span> {lead.source.details.fileName}</p>
                          )}
                          {lead.source?.details?.campaign && (
                            <p><span className="text-gray-500">Campaign:</span> {lead.source.details.campaign}</p>
                          )}
                          {lead.source?.details?.referralName && (
                            <p><span className="text-gray-500">Referral:</span> {lead.source.details.referralName}</p>
                          )}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Timeline</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-500">Created:</span> {formatDate(lead.createdAt)}</p>
                          <p><span className="text-gray-500">Updated:</span> {formatDate(lead.updatedAt)}</p>
                          {lead.lastContactedAt && (
                            <p><span className="text-gray-500">Last Contact:</span> {formatDate(lead.lastContactedAt)}</p>
                          )}
                          {lead.convertedAt && (
                            <p><span className="text-gray-500">Converted:</span> {formatDate(lead.convertedAt)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
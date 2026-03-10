import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx'; // Excel generation library

const CompanyProfileDetails = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });

  // Determine base URL based on environment (works with Vite or Create React App)
  const getApiBaseUrl = () => {
    // Fallback for development (adjust as needed)
    return 'http://localhost:5000';
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/companyProfile/details`); // adjust endpoint if needed
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data.leads || []);
      setPagination({
        page: data.page || 1,
        limit: data.limit || 50,
        total: data.total || 0,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format products (array → string)
  const formatProducts = (products) => {
    if (!products) return '';
    if (Array.isArray(products)) return products.join(', ');
    return products;
  };

  // Helper to format consent (boolean → Yes/No)
  const formatConsent = (consent) => (consent ? 'Yes' : 'No');

  // Export all leads to Excel
  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      // Fetch all leads by setting a high limit (adjust endpoint if needed)
      const response = await fetch(`${baseUrl}/api/leads/details?limit=10000`);
      if (!response.ok) throw new Error('Failed to fetch leads for export');
      const data = await response.json();
      const allLeads = data.leads || [];

      // Prepare data for Excel: flatten and format each lead
      const exportData = allLeads.map((lead) => ({
        'Full Name': lead.fullName || '',
        Email: lead.email || '',
        Phone: lead.phone || '',
        Company: lead.company || '',
        'Job Title': lead.jobTitle || '',
        Industry: lead.industry || '',
        'Company Size': lead.companySize || '',
        'Annual Revenue': lead.annualRevenue || '',
        Products: formatProducts(lead.products),
        'Current Solution': lead.currentSolution || '',
        Timeline: lead.timeline || '',
        Budget: lead.budget || '',
        Message: lead.message || '',
        Source: lead.source || '',
        'Preferred Contact': lead.preferredContact || 'email',
        Country: lead.country || '',
        'Team Members': lead.teamMembers || '',
        Consent: formatConsent(lead.consent),
      }));

      // Create worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

      // Trigger download
      XLSX.writeFile(workbook, `leads_export_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto mt-8">
        <p>Error: {error}</p>
        <button
          onClick={fetchLeads}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <button
          onClick={exportToExcel}
          disabled={exportLoading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center"
        >
          {exportLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            'Download Excel'
          )}
        </button>
      </div>

      <p className="text-gray-600 mb-4">
        Showing {leads.length} of {pagination.total} leads
      </p>

      {leads.length === 0 ? (
        <p className="text-gray-500">No leads found.</p>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annual Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Solution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Members</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.jobTitle || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.industry || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.companySize || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.annualRevenue || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatProducts(lead.products)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.currentSolution || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.timeline || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.budget || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{lead.message || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.source || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{lead.preferredContact}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.country || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.teamMembers || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatConsent(lead.consent)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <a
                      href={`/lead-form.html?id=${lead._id}`} // Replace with your actual edit route
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default CompanyProfileDetails;
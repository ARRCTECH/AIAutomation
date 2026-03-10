import React, { useState } from "react";
import * as XLSX from "xlsx";

const SalesLeadForm = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        company: "",
        jobTitle: "",
        industry: "",
        companySize: "",
        annualRevenue: "",
        products: [],
        currentSolution: "",
        timeline: "",
        budget: "",
        message: "",
        source: "",
        preferredContact: "email",
        country: "",
        teamMembers: "",
        consent: false,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [, setSubmitSuccess] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [apiError, setApiError] = useState("");
    const [submittedData, setSubmittedData] = useState(null);

    // Options arrays
    const industries = [
        "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
        "Retail", "Real Estate", "Transportation", "Energy", "Other",
    ];

    const companySizes = [
        "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+",
    ];

    const revenueRanges = [
        "Less than $1M", "$1M - $10M", "$10M - $50M", "$50M - $100M", "Over $100M",
    ];

    const productOptions = [
        { id: "voice", label: "Voice Agent" },
        { id: "mail", label: "Mail Agent" },
        { id: "chat", label: "Chat Agent" },
        { id: "analytics", label: "Analytics Dashboard" },
        { id: "other", label: "Other" },
    ];

    const currentSolutions = [
        "None", "In-house solution", "Competitor product", "Manual process", "Other",
    ];

    const timelines = [
        "Immediate (within 1 month)", "Short-term (1-3 months)",
        "Medium-term (3-6 months)", "Long-term (6+ months)", "Just exploring",
    ];

    const budgetRanges = [
        "Less than $5,000", "$5,000 - $10,000", "$10,000 - $25,000",
        "$25,000 - $50,000", "Over $50,000", "Not sure / To be determined",
    ];

    const sources = [
        "Social Media", "Referral", "Search Engine", "Advertisement", "Event", "Other",
    ];

    // ========== Helper to get template row (current data or example) ==========
    const getTemplateRow = () => {
        // Check if any field in formData is filled
        const hasData = Object.keys(formData).some(key => {
            if (key === 'products') return formData.products.length > 0;
            if (key === 'consent') return formData.consent === true;
            return formData[key] && formData[key].toString().trim() !== '';
        });

        if (hasData) {
            return {
                fullName: formData.fullName || '',
                email: formData.email || '',
                phone: formData.phone || '',
                company: formData.company || '',
                jobTitle: formData.jobTitle || '',
                industry: formData.industry || '',
                companySize: formData.companySize || '',
                annualRevenue: formData.annualRevenue || '',
                products: formData.products.join(', '),
                currentSolution: formData.currentSolution || '',
                timeline: formData.timeline || '',
                budget: formData.budget || '',
                message: formData.message || '',
                source: formData.source || '',
                preferredContact: formData.preferredContact || 'email',
                country: formData.country || '',
                teamMembers: formData.teamMembers || '',
                consent: formData.consent ? 'Yes' : 'No'
            };
        } else {
            // Default example row
            return {
                fullName: "John Doe",
                email: "john@example.com",
                phone: "+1-555-123-4567",
                company: "Acme Inc.",
                jobTitle: "Sales Manager",
                industry: "Technology",
                companySize: "51-200",
                annualRevenue: "$10M - $50M",
                products: "Voice Agent, Mail Agent",
                currentSolution: "In-house solution",
                timeline: "Short-term (1-3 months)",
                budget: "$10,000 - $25,000",
                message: "Interested in demo",
                source: "Referral",
                preferredContact: "email",
                country: "United States",
                teamMembers: "jane@acme.com, bob@acme.com",
                consent: "Yes"
            };
        }
    };

    // ========== Excel Template Download ==========
    const downloadTemplate = () => {
        const headers = [
            "fullName", "email", "phone", "company", "jobTitle", "industry",
            "companySize", "annualRevenue", "products", "currentSolution",
            "timeline", "budget", "message", "source", "preferredContact",
            "country", "teamMembers", "consent"
        ];

        const templateRow = getTemplateRow();

        // First row: headers (as keys), second row: data
        const ws = XLSX.utils.json_to_sheet([
            headers.reduce((acc, h) => ({ ...acc, [h]: h }), {}),
            templateRow
        ], { skipHeader: true });

        const wscols = headers.map(() => ({ wch: 20 }));
        ws['!cols'] = wscols;
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "SalesLeadTemplate.xlsx");
    };

    // ========== Form Handlers ==========
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (apiError) setApiError("");
        if (type === "checkbox") {
            if (name === "products") {
                const updatedProducts = checked
                    ? [...formData.products, value]
                    : formData.products.filter((p) => p !== value);
                setFormData({ ...formData, products: updatedProducts });
            } else {
                setFormData({ ...formData, [name]: checked });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }
        if (!formData.company.trim()) newErrors.company = "Company name is required";
        if (!formData.industry) newErrors.industry = "Please select an industry";
        if (!formData.companySize) newErrors.companySize = "Please select company size";
        if (formData.products.length === 0) newErrors.products = "Select at least one product";
        if (!formData.country.trim()) newErrors.country = "Country is required";
        if (!formData.consent) newErrors.consent = "You must agree to be contacted";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const apiUrl = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';
            const submitData = {
                ...formData,
                products: formData.products.join(', '),
                consent: Boolean(formData.consent)
            };

            const response = await fetch(`${apiUrl}/api/leads/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server error: ${response.status} - ${text || 'No response body'}`);
            }

            const text = await response.text();
            let result;
            try {
                result = text ? JSON.parse(text) : { message: 'Success' };
            } catch {
                result = { message: 'Lead created successfully' };
                console.log(result);
            }

            setSubmittedData({
                name: formData.fullName,
                email: formData.email,
                company: formData.company,
                products: formData.products,
                timestamp: new Date().toLocaleString()
            });

            setSubmitSuccess(true);
            setShowSuccessModal(true);

            // Reset form
            setFormData({
                fullName: "",
                email: "",
                phone: "",
                company: "",
                jobTitle: "",
                industry: "",
                companySize: "",
                annualRevenue: "",
                products: [],
                currentSolution: "",
                timeline: "",
                budget: "",
                message: "",
                source: "",
                preferredContact: "email",
                country: "",
                teamMembers: "",
                consent: false,
            });

        } catch (error) {
            console.error('Submission error:', error);
            setApiError(error.message || 'Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setShowSuccessModal(false);
        setSubmitSuccess(false);
        setSubmittedData(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 sm:text-5xl">
                        Let's Grow Together
                    </h2>
                    <p className="mt-4 text-xl text-gray-600">
                        Tell us about your needs and our sales team will reach out within 24 hours.
                    </p>
                </div>

                {/* Success Modal - with solid dark overlay (no blur) */}
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        {/* Background overlay - solid semi-transparent black */}
                        <div 
                            className="fixed inset-0 transition-opacity" 
                            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                            aria-hidden="true" 
                            onClick={closeModal}
                        ></div>

                        {/* Modal panel */}
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full animate-fade-in-up">
                                {/* Success header */}
                                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-2xl font-bold text-white">Request Submitted Successfully!</h3>
                                            <p className="text-green-100 mt-1">Thank you for reaching out to us</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal body */}
                                <div className="bg-white px-6 py-6">
                                    <div className="space-y-6">
                                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-green-700">
                                                        Our sales team has been notified and will contact you within <span className="font-bold">24 hours</span>.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {submittedData && (
                                            <div className="bg-gray-50 rounded-xl p-6">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Submission Summary
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <p className="text-sm text-gray-500">Name</p>
                                                        <p className="text-base font-semibold text-gray-900">{submittedData.name}</p>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <p className="text-sm text-gray-500">Email</p>
                                                        <p className="text-base font-semibold text-gray-900">{submittedData.email}</p>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <p className="text-sm text-gray-500">Company</p>
                                                        <p className="text-base font-semibold text-gray-900">{submittedData.company}</p>
                                                    </div>
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <p className="text-sm text-gray-500">Products of Interest</p>
                                                        <p className="text-base font-semibold text-gray-900">
                                                            {submittedData.products.length > 0 ? submittedData.products.join(', ') : 'Not specified'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 text-xs text-gray-400 flex items-center justify-end">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Submitted on: {submittedData.timestamp}
                                                </div>
                                            </div>
                                        )}

                                        {/* Next steps */}
                                        <div className="border-t border-gray-200 pt-4">
                                            <h4 className="text-md font-semibold text-gray-900 mb-3">What happens next?</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 text-sm font-bold">1</span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-gray-600">A sales representative will review your requirements</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 text-sm font-bold">2</span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-gray-600">You'll receive a confirmation email with more details</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 text-sm font-bold">3</span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-gray-600">We'll schedule a personalized demo based on your interests</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal footer */}
                                <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={downloadTemplate}
                                        className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                    >
                                        <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download Template
                                    </button>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-6 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Download Template Button */}
                <div className="mb-6 flex justify-end">
                    <button
                        type="button"
                        onClick={downloadTemplate}
                        className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                        📥 Download Excel Template
                    </button>
                </div>

                {/* API Error Message */}
                {apiError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{apiError}</p>
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-10 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Row 1: Full Name & Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
                                    placeholder="John Doe"
                                />
                                {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
                                    placeholder="you@company.com"
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Row 2: Phone & Job Title */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                    placeholder="+1 (555) 000-9999"
                                />
                            </div>

                            <div>
                                <label htmlFor="jobTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    id="jobTitle"
                                    name="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                    placeholder="e.g., Sales Manager"
                                />
                            </div>
                        </div>

                        {/* Row 3: Company & Industry */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="company"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.company ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
                                    placeholder="Acme Inc."
                                />
                                {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
                            </div>

                            <div>
                                <label htmlFor="industry" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Industry <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="industry"
                                    name="industry"
                                    value={formData.industry}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.industry ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 bg-white`}
                                >
                                    <option value="">Select industry</option>
                                    {industries.map((ind) => (
                                        <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                </select>
                                {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
                            </div>
                        </div>

                        {/* Row 4: Company Size & Annual Revenue */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="companySize" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Company Size (employees) <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="companySize"
                                    name="companySize"
                                    value={formData.companySize}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.companySize ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 bg-white`}
                                >
                                    <option value="">Select range</option>
                                    {companySizes.map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                                {errors.companySize && <p className="mt-1 text-sm text-red-600">{errors.companySize}</p>}
                            </div>

                            <div>
                                <label htmlFor="annualRevenue" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Annual Revenue
                                </label>
                                <select
                                    id="annualRevenue"
                                    name="annualRevenue"
                                    value={formData.annualRevenue}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 bg-white"
                                >
                                    <option value="">Select range</option>
                                    {revenueRanges.map((rev) => (
                                        <option key={rev} value={rev}>{rev}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Products of Interest (Checkboxes) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Products of Interest <span className="text-red-500">*</span>
                            </label>
                            <div className="flex flex-wrap gap-4">
                                {productOptions.map((product) => (
                                    <label key={product.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            name="products"
                                            value={product.label}
                                            checked={formData.products.includes(product.label)}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700">{product.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.products && <p className="mt-1 text-sm text-red-600">{errors.products}</p>}
                        </div>

                        {/* Row 5: Current Solution & Timeline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="currentSolution" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Current Solution
                                </label>
                                <select
                                    id="currentSolution"
                                    name="currentSolution"
                                    value={formData.currentSolution}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 bg-white"
                                >
                                    <option value="">Select</option>
                                    {currentSolutions.map((sol) => (
                                        <option key={sol} value={sol}>{sol}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="timeline" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Project Timeline
                                </label>
                                <select
                                    id="timeline"
                                    name="timeline"
                                    value={formData.timeline}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 bg-white"
                                >
                                    <option value="">Select</option>
                                    {timelines.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 6: Budget & Source */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Estimated Budget
                                </label>
                                <select
                                    id="budget"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 bg-white"
                                >
                                    <option value="">Select</option>
                                    {budgetRanges.map((b) => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="source" className="block text-sm font-semibold text-gray-700 mb-2">
                                    How did you hear about us?
                                </label>
                                <select
                                    id="source"
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 bg-white"
                                >
                                    <option value="">Select</option>
                                    {sources.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 7: Preferred Contact & Country */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Preferred Contact Method
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="preferredContact"
                                            value="email"
                                            checked={formData.preferredContact === "email"}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span>Email</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="preferredContact"
                                            value="phone"
                                            checked={formData.preferredContact === "phone"}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span>Phone</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Country / Region <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.country ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
                                    placeholder="e.g., United States"
                                />
                                {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
                            </div>
                        </div>

                        {/* Additional team members */}
                        <div>
                            <label htmlFor="teamMembers" className="block text-sm font-semibold text-gray-700 mb-2">
                                Other decision makers (names/emails)
                            </label>
                            <input
                                type="text"
                                id="teamMembers"
                                name="teamMembers"
                                value={formData.teamMembers}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                placeholder="e.g., jane@company.com, bob@company.com"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                Additional Information
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows="3"
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                                placeholder="Tell us more about your requirements..."
                            />
                        </div>

                        {/* Consent checkbox */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="consent"
                                    name="consent"
                                    type="checkbox"
                                    checked={formData.consent}
                                    onChange={handleChange}
                                    className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${errors.consent ? "border-red-500" : ""}`}
                                />
                            </div>
                            <label htmlFor="consent" className="ml-3 text-sm text-gray-600">
                                I agree to be contacted by a sales representative about my inquiry. <span className="text-red-500">*</span>
                            </label>
                        </div>
                        {errors.consent && <p className="mt-1 text-sm text-red-600">{errors.consent}</p>}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 transform hover:scale-105 ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : (
                                    "Submit Request"
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Trust Badge */}
                <p className="text-center text-gray-500 text-sm mt-8">
                    🔒 Your information is secure and will never be shared.
                </p>
            </div>

            {/* Animation keyframes */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default SalesLeadForm;
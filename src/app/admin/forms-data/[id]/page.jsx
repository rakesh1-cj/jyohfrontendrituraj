"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminFetch } from "@/lib/services/admin";

export default function FormDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form data for editing
  const [formData, setFormData] = useState({
    status: "",
    adminNotes: "",
    fields: {},
    rawFormData: {},
    data: {}
  });

  // Load form details
  const loadForm = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await adminFetch(`/api/forms/${formId}`);
      
      if (response.success) {
        const formDataResponse = response.data.formData;
        setForm(formDataResponse);
        setFormData({
          status: formDataResponse.status,
          adminNotes: formDataResponse.adminNotes || "",
          fields: formDataResponse.fields || {},
          rawFormData: formDataResponse.rawFormData || {},
          data: formDataResponse.data || {}
        });
      } else {
        setError(response.message || "Failed to load form");
      }
    } catch (err) {
      setError(err.message || "Error loading form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  // Handle form update
  const handleUpdateForm = async () => {
    try {
      setSaving(true);
      
      const response = await adminFetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.success) {
        setForm(response.data.formData);
        setEditMode(false);
        alert("Form updated successfully!");
      } else {
        alert(response.message || "Failed to update form");
      }
    } catch (err) {
      alert(err.message || "Error updating form");
    } finally {
      setSaving(false);
    }
  };

  // Handle field change
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: value
      }
    }));
  };

  // Handle form deletion
  const handleDeleteForm = async () => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      
      const response = await adminFetch(`/api/forms/${formId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        alert("Form deleted successfully!");
        router.push('/admin/forms-data');
      } else {
        alert(response.message || "Failed to delete form");
      }
    } catch (err) {
      alert(err.message || "Error deleting form");
    } finally {
      setSaving(false);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-indigo-100 text-indigo-800';
      case 'under_review': return 'bg-orange-100 text-orange-800';
      case 'cross_verified': return 'bg-cyan-100 text-cyan-800';
      case 'needs_correction': return 'bg-amber-100 text-amber-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get service type display name and icon
  const getServiceTypeInfo = (serviceType) => {
    const types = {
      'sale-deed': { name: 'Sale Deed', icon: '🏠', color: 'bg-blue-50 border-blue-200' },
      'will-deed': { name: 'Will Deed', icon: '📜', color: 'bg-green-50 border-green-200' },
      'trust-deed': { name: 'Trust Deed', icon: '🤝', color: 'bg-purple-50 border-purple-200' },
      'property-registration': { name: 'Property Registration', icon: '📋', color: 'bg-orange-50 border-orange-200' },
      'power-of-attorney': { name: 'Power of Attorney', icon: '⚖️', color: 'bg-red-50 border-red-200' },
      'adoption-deed': { name: 'Adoption Deed', icon: '👶', color: 'bg-pink-50 border-pink-200' },
      'contact-form': { name: 'Contact Form', icon: '📞', color: 'bg-gray-50 border-gray-200' }
    };
    return types[serviceType] || { name: serviceType, icon: '📄', color: 'bg-gray-50 border-gray-200' };
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if a string is an image URL
  const isImageUrl = (str) => {
    if (typeof str !== 'string') return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const urlPattern = /^https?:\/\/.+/i;
    return urlPattern.test(str) && imageExtensions.some(ext => str.toLowerCase().includes(ext)) || 
           str.startsWith('data:image/') || 
           str.startsWith('/') && imageExtensions.some(ext => str.toLowerCase().includes(ext));
  };

  // Render nested object/array value
  const renderValue = (value, fieldName = '', depth = 0) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">Not provided</span>;
    }
    
    // Check if it's an image URL
    if (typeof value === 'string' && isImageUrl(value)) {
      return (
        <div className="mt-2">
          <img 
            src={value} 
            alt={fieldName || 'Form image'} 
            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
            style={{ display: 'none' }}
          >
            View Image
          </a>
        </div>
      );
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic">No items</span>;
      }
      
      // If array contains objects, display as cards
      if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0])) {
        return (
          <div className="mt-2 space-y-3">
            {value.map((item, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(item).map(([key, val]) => (
                    <div key={key} className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <div className="text-sm text-gray-900">
                        {renderValue(val, key, depth + 1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      }
      
      // If array contains images
      if (value.every(item => typeof item === 'string' && isImageUrl(item))) {
        return (
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {value.map((imgUrl, index) => (
              <div key={index} className="relative">
                <img 
                  src={imgUrl} 
                  alt={`${fieldName} ${index + 1}`} 
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        );
      }
      
      // Simple array of strings/numbers
      return (
        <div className="mt-2 space-y-1">
          {value.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-sm text-gray-900">{renderValue(item, '', depth + 1)}</span>
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      return (
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <div className="text-sm text-gray-900">
                  {renderValue(val, key, depth + 1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (typeof value === 'boolean') {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }
    
    return <span className="text-sm text-gray-900 break-words">{String(value)}</span>;
  };

  // Render form field
  const renderFormField = (fieldName, fieldValue, fieldType = 'text') => {
    const displayName = fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    
    if (editMode) {
      // For edit mode, only allow editing simple fields
      if (Array.isArray(fieldValue) || (typeof fieldValue === 'object' && fieldValue !== null)) {
        return (
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Complex data structure (view-only in edit mode)</p>
            {renderValue(fieldValue, fieldName)}
          </div>
        );
      }
      
      switch (fieldType) {
        case 'textarea':
          return (
            <textarea
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          );
        case 'select':
          return (
            <select
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an option</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          );
        case 'checkbox':
          return (
            <input
              type="checkbox"
              checked={fieldValue === true || fieldValue === 'true'}
              onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          );
        default:
          return (
            <input
              type={fieldType}
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          );
      }
    } else {
      return renderValue(fieldValue, fieldName);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading form details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Form</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={loadForm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
            <Link
              href="/admin/forms-data"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Forms
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-4">The requested form could not be found.</p>
          <Link
            href="/admin/forms-data"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Forms
          </Link>
        </div>
      </div>
    );
  }

  const serviceInfo = getServiceTypeInfo(form.serviceType);
  const progress = form.progressPercentage || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin/forms-data"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{serviceInfo.icon}</span>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {serviceInfo.name}
                    </h1>
                    <p className="text-sm text-gray-500 font-mono">
                      Form ID: {form._id}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(form.status)}`}>
                  {form.status}
                </span>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    editMode 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {editMode ? 'View Mode' : 'Edit Mode'}
                </button>
                <button
                  onClick={handleDeleteForm}
                  disabled={saving}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  {saving ? 'Deleting...' : 'Delete Form'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Information */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Form Title
                  </label>
                  <p className="text-sm text-gray-900">{form.formTitle || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Type
                  </label>
                  <p className="text-sm text-gray-900">{serviceInfo.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  {editMode ? (
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="in-progress">In Progress</option>
                      <option value="under_review">Under Review</option>
                      <option value="cross_verified">Cross Verified</option>
                      <option value="needs_correction">Needs Correction</option>
                      <option value="verified">Verified</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(form.status)}`}>
                      {form.status}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress
                  </label>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{progress}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">Form Details</h2>
              <div className="space-y-6">
                {/* Display fields from form.fields */}
                {form && form.fields && Object.keys(form.fields).length > 0 && (
                  <div>
                    <div className="space-y-5">
                      {Object.entries(form.fields).map(([fieldName, fieldValue]) => {
                        // Skip empty or null values unless they're explicitly set
                        if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
                          return null;
                        }
                        
                        return (
                          <div key={fieldName} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
                              {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </label>
                            <div className="text-sm">
                              {renderFormField(fieldName, fieldValue, 
                                fieldName.toLowerCase().includes('message') || fieldName.toLowerCase().includes('description') ? 'textarea' :
                                fieldName.toLowerCase().includes('email') ? 'email' :
                                fieldName.toLowerCase().includes('phone') || fieldName.toLowerCase().includes('number') ? 'tel' :
                                fieldName.toLowerCase().includes('date') ? 'date' :
                                fieldName.toLowerCase().includes('newsletter') || fieldName.toLowerCase().includes('agree') ? 'checkbox' :
                                'text'
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Display data from form.data */}
                {form && form.data && Object.keys(form.data).length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-4 uppercase tracking-wide border-b border-gray-200 pb-2">Additional Information</h3>
                    <div className="space-y-5">
                      {Object.entries(form.data).map(([fieldName, fieldValue]) => {
                        // Skip internal fields
                        if (fieldName === '_id' || fieldName === '__v' || fieldName === 'createdAt' || fieldName === 'updatedAt' || 
                            fieldName === 'userId' || fieldName === 'serviceType' || fieldName === 'status') return null;
                        if (fieldValue === null || fieldValue === undefined || fieldValue === '') return null;
                        
                        return (
                          <div key={fieldName} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
                              {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </label>
                            <div className="text-sm">
                              {renderFormField(fieldName, fieldValue, 
                                fieldName.toLowerCase().includes('message') || fieldName.toLowerCase().includes('description') ? 'textarea' :
                                fieldName.toLowerCase().includes('email') ? 'email' :
                                fieldName.toLowerCase().includes('phone') || fieldName.toLowerCase().includes('number') ? 'tel' :
                                fieldName.toLowerCase().includes('date') ? 'date' :
                                fieldName.toLowerCase().includes('newsletter') || fieldName.toLowerCase().includes('agree') ? 'checkbox' :
                                'text'
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Display rawFormData if fields and data are empty */}
                {form && form.rawFormData && Object.keys(form.rawFormData).length > 0 && 
                 (!form.fields || Object.keys(form.fields).length === 0) && 
                 (!form.data || Object.keys(form.data).length === 0) && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-4 uppercase tracking-wide border-b border-gray-200 pb-2">Form Data</h3>
                    <div className="space-y-5">
                      {Object.entries(form.rawFormData).map(([fieldName, fieldValue]) => {
                        // Skip internal fields
                        if (fieldName === '_id' || fieldName === '__v' || fieldName === 'createdAt' || fieldName === 'updatedAt' ||
                            fieldName === 'userId' || fieldName === 'serviceType' || fieldName === 'status') return null;
                        if (fieldValue === null || fieldValue === undefined || fieldValue === '') return null;
                        
                        return (
                          <div key={fieldName} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <label className="block text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">
                              {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </label>
                            <div className="text-sm">
                              {renderFormField(fieldName, fieldValue, 
                                fieldName.toLowerCase().includes('message') || fieldName.toLowerCase().includes('description') ? 'textarea' :
                                fieldName.toLowerCase().includes('email') ? 'email' :
                                fieldName.toLowerCase().includes('phone') || fieldName.toLowerCase().includes('number') ? 'tel' :
                                fieldName.toLowerCase().includes('date') ? 'date' :
                                fieldName.toLowerCase().includes('newsletter') || fieldName.toLowerCase().includes('agree') ? 'checkbox' :
                                'text'
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Payment Information */}
                {form && form.paymentInfo && (
                  <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                    <h3 className="text-base font-semibold text-gray-800 mb-4 uppercase tracking-wide border-b border-blue-200 pb-2">Payment Information</h3>
                    <div className="space-y-4">
                      {form.paymentInfo.paymentStatus && (
                        <div className="border-b border-gray-200 pb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            form.paymentInfo.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                            form.paymentInfo.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {form.paymentInfo.paymentStatus}
                          </span>
                        </div>
                      )}
                      {form.paymentInfo.calculations && (
                        <div className="space-y-2">
                          {form.paymentInfo.calculations.stampDuty !== undefined && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Stamp Duty:</span>
                              <span className="font-medium text-gray-900">₹{form.paymentInfo.calculations.stampDuty.toLocaleString()}</span>
                            </div>
                          )}
                          {form.paymentInfo.calculations.registrationCharge !== undefined && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Registration Charge:</span>
                              <span className="font-medium text-gray-900">₹{form.paymentInfo.calculations.registrationCharge.toLocaleString()}</span>
                            </div>
                          )}
                          {form.paymentInfo.calculations.totalPayable !== undefined && (
                            <div className="flex justify-between text-sm font-semibold border-t pt-2">
                              <span className="text-gray-900">Total Payable:</span>
                              <span className="text-gray-900">₹{form.paymentInfo.calculations.totalPayable.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                      {form.paymentInfo.paymentTransactionId && (
                        <div className="border-b border-gray-200 pb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID</label>
                          <p className="text-sm text-gray-900 font-mono">{form.paymentInfo.paymentTransactionId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Uploaded Files */}
                {form && form.uploadedFiles && form.uploadedFiles.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-5 border border-green-100">
                    <h3 className="text-base font-semibold text-gray-800 mb-4 uppercase tracking-wide border-b border-green-200 pb-2">Uploaded Files & Images</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {form.uploadedFiles.map((file, index) => {
                        const isImage = file.filePath && isImageUrl(file.filePath);
                        return (
                          <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <p className="text-sm font-semibold text-gray-900 mb-2">{file.fileName || file.fieldName || `File ${index + 1}`}</p>
                            {isImage && file.filePath ? (
                              <div className="mt-2">
                                <img 
                                  src={file.filePath} 
                                  alt={file.fileName || `Uploaded image ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                                <a 
                                  href={file.filePath} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
                                  style={{ display: 'none' }}
                                >
                                  View Image
                                </a>
                              </div>
                            ) : file.filePath ? (
                              <a 
                                href={file.filePath} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center mt-2"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                View File
                              </a>
                            ) : null}
                            {file.fileSize && (
                              <p className="text-xs text-gray-500 mt-2">
                                Size: {(file.fileSize / 1024).toFixed(2)} KB
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Show message if no data at all */}
                {(!form || ((!form.fields || Object.keys(form.fields).length === 0) && 
                            (!form.data || Object.keys(form.data).length === 0) && 
                            (!form.rawFormData || Object.keys(form.rawFormData).length === 0))) && (
                  <p className="text-sm text-gray-500 text-center py-4">No form data available</p>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h2>
              {editMode ? (
                <textarea
                  value={formData.adminNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, adminNotes: e.target.value }))}
                  placeholder="Add notes about this form..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              ) : (
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {formData.adminNotes || 'No notes added yet.'}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Information */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {form.userId?.name ? form.userId.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {form.userId?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {form.userId?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <p className="text-xs text-gray-500 font-mono">
                    {form.userId?._id || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <p className="text-xs text-gray-500">
                    {form.userId?.role || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Timeline */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Timeline</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Created
                  </label>
                  <p className="text-xs text-gray-500">
                    {formatDate(form.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <p className="text-xs text-gray-500">
                    {formatDate(form.lastActivityAt || form.updatedAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Last Activity By
                  </label>
                  <p className="text-xs text-gray-500">
                    {form.lastActivityBy ? 'User' : 'System'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {editMode && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleUpdateForm}
                    disabled={saving}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

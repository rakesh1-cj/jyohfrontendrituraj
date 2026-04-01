"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/services/admin";

export default function AdminFormsDataPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    serviceType: "",
    status: "",
    search: ""
  });

  // View mode (grid or list)
  const [viewMode, setViewMode] = useState("grid");

  // Load forms data
  const loadForms = async () => {
    try {
      setLoading(true);
      setError("");
      
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await adminFetch(`/api/forms/admin/forms?${queryParams}`);
      
      if (response.success) {
        setForms(response.data.forms);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || "Failed to load forms");
      }
    } catch (err) {
      setError(err.message || "Error loading forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, [pagination.page, pagination.limit, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
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
      'property-sale-certificate': { name: 'Property Sale Certificate', icon: '📄', color: 'bg-yellow-50 border-yellow-200' },
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get progress percentage
  const getProgressPercentage = (form) => {
    if (form.progressPercentage) return form.progressPercentage;
    
    // Calculate based on status
    switch (form.status) {
      case 'draft': return 25;
      case 'submitted': return 50;
      case 'in-progress': return 75;
      case 'under_review': return 85;
      case 'completed': return 100;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Forms Data Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and monitor all submitted forms across all services
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Total: {pagination.total} forms
            </div>
            <button
              onClick={loadForms}
              disabled={loading}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              value={filters.serviceType}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Services</option>
              <option value="sale-deed">Sale Deed</option>
              <option value="will-deed">Will Deed</option>
              <option value="trust-deed">Trust Deed</option>
              <option value="property-registration">Property Registration</option>
              <option value="property-sale-certificate">Property Sale Certificate</option>
              <option value="power-of-attorney">Power of Attorney</option>
              <option value="adoption-deed">Adoption Deed</option>
              <option value="contact-form">Contact Form</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by user email or form ID..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ serviceType: "", status: "", search: "" })}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Forms Display */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Forms</h2>
            <div className="flex items-center space-x-2">
              <select
                value={pagination.limit}
                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
              </select>
              <button
                onClick={loadForms}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading forms...</p>
          </div>
        )}

        {error && (
          <div className="p-6 text-center">
            <div className="text-red-600 text-sm">{error}</div>
            <button
              onClick={loadForms}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {viewMode === "grid" ? (
              // Grid View
              <div className="p-6">
                {forms.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
                    <p className="text-gray-500">Try adjusting your filters or check back later.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {forms.map((form) => {
                      const serviceInfo = getServiceTypeInfo(form.serviceType);
                      const progress = getProgressPercentage(form);
                      
                      return (
                        <Link
                          key={form._id}
                          href={`/admin/forms-data/${form._id}`}
                          className="block"
                        >
                          <div className={`border-2 rounded-lg p-6 hover:shadow-lg transition-all duration-200 ${serviceInfo.color} hover:scale-105`}>
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">{serviceInfo.icon}</span>
                                <div>
                                  <h3 className="font-semibold text-gray-900 text-sm">
                                    {serviceInfo.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 font-mono">
                                    {form._id.substring(0, 8)}...
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(form.status)}`}>
                                {form.status}
                              </span>
                            </div>

                            {/* User Info */}
                            <div className="mb-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
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
                            </div>

                            {/* Progress */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-600">Progress</span>
                                <span className="text-xs text-gray-600">{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Updated</span>
                              <span>{formatDate(form.lastActivityAt || form.updatedAt)}</span>
                            </div>

                            {/* Admin Notes Indicator */}
                            {form.adminNotes && form.adminNotes.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center space-x-1">
                                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-yellow-600 font-medium text-xs">
                                    {form.adminNotes.length} note{form.adminNotes.length > 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // List View
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Form Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {forms.map((form) => {
                      const serviceInfo = getServiceTypeInfo(form.serviceType);
                      const progress = getProgressPercentage(form);
                      
                      return (
                        <tr key={form._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{serviceInfo.icon}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {serviceInfo.name}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">
                                  {form._id.substring(0, 12)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {form.userId?.name ? form.userId.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {form.userId?.name || 'Unknown User'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {form.userId?.email || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(form.status)}`}>
                              {form.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(form.lastActivityAt || form.updatedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/admin/forms-data/${form._id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
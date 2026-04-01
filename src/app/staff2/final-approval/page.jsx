"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function FinalApprovalPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed'
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    fetchForms();
  }, [filter, statusFilter]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      let url = `${API_BASE}/api/staff/2/pending-final-approval?limit=50&includeCompleted=true`;
      if (filter !== 'all') {
        url += `&serviceType=${filter}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        let allForms = data.data?.forms || [];
        
        // Apply status filter on frontend
        if (statusFilter === 'pending') {
          allForms = allForms.filter(form => form.status !== 'completed');
        } else if (statusFilter === 'completed') {
          allForms = allForms.filter(form => form.status === 'completed');
        }
        
        setForms(allForms);
      } else {
        throw new Error('Failed to fetch forms');
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsComplete = async (formId) => {
    if (!confirm('Mark this form as completed and finalized?')) {
      return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/2/forms/${formId}/mark-final-done`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: 'Finalized by Staff 2'
        })
      });

      if (response.ok) {
        alert('Form marked as completed successfully!');
        fetchForms(); // Refresh the list
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to finalize form');
      }
    } catch (error) {
      console.error('Error finalizing form:', error);
      alert('Failed to finalize form: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Final Approval - E-Stamp & Map Module
              </h1>
              <p className="text-gray-600">Forms verified by Staff 3, ready for final approval</p>
            </div>
            <Link
              href="/staff2/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  filter === 'all'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All ({forms.length})
              </button>
              <button
                onClick={() => setFilter('e-stamp')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  filter === 'e-stamp'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                E-Stamp Applications
              </button>
              <button
                onClick={() => setFilter('map-module')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  filter === 'map-module'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Map Modules
              </button>
            </nav>
          </div>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 text-sm rounded-lg ${
                statusFilter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 text-sm rounded-lg ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending Approval
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 text-sm rounded-lg ${
                statusFilter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Forms List */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {forms.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-4xl mb-4">✓</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms pending final approval</h3>
            <p className="text-gray-500 text-sm">
              Forms verified by Staff 3 will appear here for final approval.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-200">
              {forms.map((form) => (
                <div
                  key={form._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {form.serviceType === 'e-stamp' ? '📋 E-Stamp Application' : '🗺️ Map Module'}
                        </h3>
                        {form.status === 'completed' ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            ✓ Completed
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Pending Final Approval
                          </span>
                        )}
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Verified by Staff 3
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Form ID:</span> {form._id?.substring(0, 12)}...
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span>{' '}
                          {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Verified by Staff 3:</span>{' '}
                          {form.approvals?.staff3?.verifiedAt 
                            ? new Date(form.approvals.staff3.verifiedAt).toLocaleDateString() 
                            : 'N/A'}
                        </div>
                        {form.userId?.name && (
                          <div>
                            <span className="font-medium">User:</span> {form.userId.name}
                          </div>
                        )}
                      </div>

                      {/* E-Stamp Details */}
                      {form.serviceType === 'e-stamp' && form.data && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-blue-900 mb-2">E-Stamp Details</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {form.data.article && (
                              <div>
                                <span className="text-blue-700 font-medium">Article:</span>{' '}
                                <span className="text-blue-900">{form.data.article}</span>
                              </div>
                            )}
                            {form.data.amount && (
                              <div>
                                <span className="text-blue-700 font-medium">Amount:</span>{' '}
                                <span className="text-blue-900">₹{form.data.amount}</span>
                              </div>
                            )}
                            {form.data.firstParty?.name && (
                              <div>
                                <span className="text-blue-700 font-medium">First Party:</span>{' '}
                                <span className="text-blue-900">{form.data.firstParty.name}</span>
                              </div>
                            )}
                            {form.data.secondParty?.name && (
                              <div>
                                <span className="text-blue-700 font-medium">Second Party:</span>{' '}
                                <span className="text-blue-900">{form.data.secondParty.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Map Module Details */}
                      {form.serviceType === 'map-module' && form.data && (
                        <div className="bg-green-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-green-900 mb-2">Map Module Details</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {form.data.propertyType && (
                              <div>
                                <span className="text-green-700 font-medium">Property Type:</span>{' '}
                                <span className="text-green-900">{form.data.propertyType}</span>
                              </div>
                            )}
                            {form.data.propertyAddress && (
                              <div>
                                <span className="text-green-700 font-medium">Address:</span>{' '}
                                <span className="text-green-900">{form.data.propertyAddress}</span>
                              </div>
                            )}
                            {form.data.calculatedData?.areaSqFeet && (
                              <div>
                                <span className="text-green-700 font-medium">Plot Area:</span>{' '}
                                <span className="text-green-900">
                                  {form.data.calculatedData.areaSqFeet.toFixed(2)} sq. ft.
                                </span>
                              </div>
                            )}
                            {form.data.calculatedData?.builtUpResult?.totalSqFeet && (
                              <div>
                                <span className="text-green-700 font-medium">Built-up Area:</span>{' '}
                                <span className="text-green-900">
                                  {form.data.calculatedData.builtUpResult.totalSqFeet.toFixed(2)} sq. ft.
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Staff 3 Verification Notes */}
                      {form.approvals?.staff3?.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-yellow-900 mb-1">Staff 3 Notes:</p>
                          <p className="text-sm text-yellow-800">{form.approvals.staff3.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <Link
                        href={`/staff2/forms/${form._id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                      >
                        View Details
                      </Link>
                      {form.status !== 'completed' && (
                        <button
                          onClick={() => handleMarkAsComplete(form._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          ✓ Mark Complete
                        </button>
                      )}
                      {form.status === 'completed' && (
                        <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-center">
                          Completed on {form.completedAt ? new Date(form.completedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

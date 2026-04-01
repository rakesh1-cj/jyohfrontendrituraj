"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function EStampMapVerificationPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'e-stamp', 'map-module'
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    fetchForms();
  }, [filter]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      let serviceTypeParam = '';
      if (filter === 'e-stamp') {
        serviceTypeParam = '&serviceType=e-stamp';
      } else if (filter === 'map-module') {
        serviceTypeParam = '&serviceType=map-module';
      } else {
        // Fetch both
        serviceTypeParam = '&serviceType=e-stamp,map-module';
      }

      // Fetch both pending and completed forms
      const response = await fetch(
        `${API_BASE}/api/staff/3/forms?limit=50${serviceTypeParam}&includeCompleted=true`,
        {
          headers: getAuthHeaders()
        }
      );

      if (response.ok) {
        const data = await response.json();
        setForms(data.data?.forms || []);
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

  const getStatusBadge = (form) => {
    if (form.approvals?.staff3?.approved) {
      if (form.status === 'completed') {
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Completed</span>;
      }
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Verified by Staff 3</span>;
    }
    if (form.approvals?.staff2?.approved) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending Verification</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Submitted</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
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
                E-Stamp & Map Module Verification
              </h1>
              <p className="text-gray-600">Verify E-Stamp applications and Map Module submissions</p>
            </div>
            <Link
              href="/staff3/dashboard"
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
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All ({forms.length})
              </button>
              <button
                onClick={() => setFilter('e-stamp')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  filter === 'e-stamp'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                E-Stamp Applications
              </button>
              <button
                onClick={() => setFilter('map-module')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  filter === 'map-module'
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Map Modules
              </button>
            </nav>
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
            <div className="text-gray-400 text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No forms found</h3>
            <p className="text-gray-500 text-sm">
              No E-Stamp or Map Module forms are pending verification at this time.
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
                        {getStatusBadge(form)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Form ID:</span> {form._id?.substring(0, 12)}...
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span>{' '}
                          {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                        {form.userFormId && (
                          <div>
                            <span className="font-medium">Linked Form:</span> {form.userFormId}
                          </div>
                        )}
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
                    </div>

                    <div className="ml-6">
                      <Link
                        href={`/staff3/forms/${form._id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
                      >
                        Verify →
                      </Link>
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

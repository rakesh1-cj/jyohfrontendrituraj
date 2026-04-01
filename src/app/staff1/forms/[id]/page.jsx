"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import FormFieldRenderer from '@/components/FormFieldRenderer';
import { flattenFormFields } from '@/utils/flattenFormFields';
import { getFieldLabel, detectFormLanguage } from '@/utils/fieldLabelTranslations';

export default function Staff1FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [manualPaymentApproval, setManualPaymentApproval] = useState(false);
  const [formLanguage, setFormLanguage] = useState('en');

  useEffect(() => {
    if (params.id) {
      fetchFormDetails();
    }
  }, [params.id]);

  const fetchFormDetails = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/1/forms/${params.id}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setForm(data.data.form);
        
        // Detect language from form data or use stored language
        const detectedLanguage = data.data.form.language || detectFormLanguage(data.data.form.fields || data.data.form.data || {});
        setFormLanguage(detectedLanguage);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch form details');
      }
    } catch (error) {
      console.error('Error fetching form details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (approved) => {
    try {
      setVerificationLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/1/forms/${params.id}/verify`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          approved,
          verificationNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setForm(data.data.form);
        setVerificationNotes('');
        
        // Show success message
        alert(`Form ${approved ? 'verified' : 'rejected'} successfully!`);
        
        // Redirect back to forms list
        router.push('/staff1/forms');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify form');
      }
    } catch (error) {
      console.error('Error verifying form:', error);
      alert('Error: ' + error.message);
    } finally {
      setVerificationLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'submitted': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'verified': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'completed': 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const renderFieldValue = (key, value) => {
    // Special handling: if the field name contains propertyPhotos or livePhotos and it's an object,
    // make sure it's recognized as an image
    if ((key.toLowerCase().includes('propertyphoto') || key.toLowerCase().includes('livephoto')) && 
        typeof value === 'object' && value !== null) {
      return <FormFieldRenderer fieldName={key} value={value} isEditMode={false} />;
    }
    return <FormFieldRenderer fieldName={key} value={value} isEditMode={false} />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="bg-white rounded-lg border p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Form</h3>
        <p className="text-red-600">{error}</p>
        <div className="mt-4 space-x-4">
          <button 
            onClick={fetchFormDetails}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
          <Link 
            href="/staff1/forms"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Forms
          </Link>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-yellow-800 font-semibold mb-2">Form Not Found</h3>
        <p className="text-yellow-600">The requested form could not be found.</p>
        <Link 
          href="/staff1/forms"
          className="mt-4 inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Back to Forms
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {form.formTitle || form.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h1>
            <p className="text-gray-600">Form ID: {form._id}</p>
            {/* Language Indicator */}
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                formLanguage === 'hi' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {formLanguage === 'hi' ? '🇮🇳 हिंदी (Hindi)' : '🇬🇧 English'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {getStatusBadge(form.status)}
            <Link
              href="/staff1/forms"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Forms
            </Link>
          </div>
        </div>

        {/* Form Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Submitted By</h3>
            {form.filledByStaff1 ? (
              <>
                <p className="text-sm font-semibold text-gray-900">Staff 1 (Filled on behalf)</p>
                <p className="text-xs text-gray-600">{form.userId?.name || 'Offline User'}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  Filled by Staff 1
                </span>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-900">{form.userId?.name || 'N/A'}</p>
                <p className="text-xs text-gray-600">{form.userId?.email || 'N/A'}</p>
              </>
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Service Type</h3>
            <p className="text-sm font-semibold text-gray-900">
              {form.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Last Activity</h3>
            <p className="text-sm font-semibold text-gray-900">
              {new Date(form.lastActivityAt).toLocaleString()}
            </p>
            {form.lastActivityBy && (
              <p className="text-xs text-gray-600">by {form.lastActivityBy.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Status Section - Staff1 can only see status, not amounts */}
      {form.paymentInfo && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
          </div>
          <div className="p-6">
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Payment Status</label>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    form.paymentInfo.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                    form.paymentInfo.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    form.paymentInfo.paymentStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                    form.paymentInfo.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {(form.paymentInfo.paymentStatus || 'PENDING').toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Payment Verified</label>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    form.paymentInfo.paymentVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {form.paymentInfo.paymentVerified ? 'VERIFIED' : 'NOT VERIFIED'}
                  </span>
                </div>
                {form.paymentInfo.paymentTransactionId && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Transaction ID</label>
                    <p className="text-sm text-gray-900 font-mono">{form.paymentInfo.paymentTransactionId}</p>
                  </div>
                )}
                {form.paymentInfo.paymentDate && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Payment Date</label>
                    <p className="text-sm text-gray-900">{new Date(form.paymentInfo.paymentDate).toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Staff 1 can only view payment status. Payment amounts are not visible for security purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Form Details</h2>
        </div>
        <div className="p-6">
          {(() => {
            const allFields = form.allFields || form.fields || form.data || {};
            const flattenedFields = flattenFormFields(allFields);
            const fieldEntries = Object.entries(flattenedFields);
            
            // Group propertyPhotos and livePhotos for gallery display
            const groupedFields = {};
            const propertyPhotos = [];
            const livePhotos = [];
            const otherFields = [];
            
            fieldEntries.forEach(([key, value]) => {
              const lowerKey = key.toLowerCase();
              if (lowerKey.includes('propertyphoto') && typeof value === 'object' && value !== null && (value.cloudinaryUrl || value.path)) {
                const match = key.match(/propertyPhotos\[(\d+)\]/i) || key.match(/property_photos\[(\d+)\]/i);
                const index = match ? parseInt(match[1], 10) : propertyPhotos.length;
                propertyPhotos[index] = value;
              } else if (lowerKey.includes('livephoto') && typeof value === 'object' && value !== null && (value.cloudinaryUrl || value.path)) {
                const match = key.match(/livePhotos\[(\d+)\]/i) || key.match(/live_photos\[(\d+)\]/i);
                const index = match ? parseInt(match[1], 10) : livePhotos.length;
                livePhotos[index] = value;
              } else {
                otherFields.push([key, value]);
              }
            });
            
            return (
              <div className="space-y-6">
                {/* Property Photos Gallery */}
                {propertyPhotos.filter(p => p).length > 0 && (
                  <div className="col-span-full border-b border-gray-200 pb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Property Photos</h3>
                    <FormFieldRenderer 
                      fieldName="propertyPhotos" 
                      value={propertyPhotos.filter(p => p)} 
                      isEditMode={false} 
                    />
                  </div>
                )}
                
                {/* Live Photos Gallery */}
                {livePhotos.filter(p => p).length > 0 && (
                  <div className="col-span-full border-b border-gray-200 pb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Live Photos</h3>
                    <FormFieldRenderer 
                      fieldName="livePhotos" 
                      value={livePhotos.filter(p => p)} 
                      isEditMode={false} 
                    />
                  </div>
                )}
                
                {/* Other Fields in Two Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {otherFields.map(([key, value]) => {
                    // Get translated field name based on form language
                    const displayName = getFieldLabel(key, formLanguage);
                    
                    return (
                      <div key={key} className="border-b border-gray-100 pb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          {displayName}
                        </h3>
                        <div className="text-sm text-gray-900">
                          {renderFieldValue(key, value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Admin Notes */}
      {form.adminNotes && form.adminNotes.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Notes & Comments</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {form.adminNotes.map((note, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {note.addedBy?.name || 'System'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(note.addedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{note.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <Link
            href={`/staff1/forms/${form._id}/correct`}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit/Correct</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print</span>
          </button>

          <button
            onClick={fetchFormDetails}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Verification Section */}
        {form.status !== 'verified' && form.status !== 'rejected' && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Form Verification</h3>
            
            {/* Payment Status Check */}
            {form.paymentInfo && (
              <div className={`mb-4 p-4 rounded-lg border ${
                form.paymentInfo.paymentStatus === 'completed' && form.paymentInfo.paymentVerified
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {form.paymentInfo.paymentStatus === 'completed' && form.paymentInfo.paymentVerified ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <span className={`text-sm font-medium ${
                    form.paymentInfo.paymentStatus === 'completed' && form.paymentInfo.paymentVerified
                      ? 'text-green-800'
                      : 'text-yellow-800'
                  }`}>
                    Payment Status: {form.paymentInfo.paymentStatus === 'completed' && form.paymentInfo.paymentVerified
                      ? 'Payment Completed - Form can be approved'
                      : 'Payment Not Completed - Approval disabled until payment is made'}
                  </span>
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Notes (Optional)
              </label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any notes about the verification..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => handleVerification(true)}
                disabled={
                  verificationLoading || 
                  (!manualPaymentApproval && (
                    !form.paymentInfo || 
                    form.paymentInfo.paymentStatus !== 'completed' || 
                    !form.paymentInfo.paymentVerified
                  ))
                }
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={
                  !manualPaymentApproval && (!form.paymentInfo || form.paymentInfo.paymentStatus !== 'completed' || !form.paymentInfo.paymentVerified)
                    ? 'Payment must be completed before approval'
                    : 'Verify & Approve Form'
                }
              >
                {verificationLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span>Verify & Approve</span>
              </button>

              <button
                onClick={() => handleVerification(false)}
                disabled={verificationLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {verificationLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span>Reject</span>
              </button>
            </div>

            {/* Temporary Manual Approval Alert */}
            <div className="mt-4 p-4 border border-dashed border-red-300 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="manualPaymentApproval"
                  checked={manualPaymentApproval}
                  onChange={(e) => setManualPaymentApproval(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-500"
                />
                <label htmlFor="manualPaymentApproval" className="text-sm font-medium text-red-800">
                  TEMPORARY: Enable manual approval without payment (Testing Mode)
                </label>
              </div>
              <p className="mt-1 text-xs text-red-600 ml-6">
                * Note: This option is available temporarily for testing. It allows bypassing the payment verification requirement.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

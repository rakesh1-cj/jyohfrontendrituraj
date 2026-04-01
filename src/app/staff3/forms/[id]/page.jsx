"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EStampApplication from '@/components/EStampApplication';
import PropertyMapModule from '@/components/PropertyMapModule';
import { getFieldLabel, detectFormLanguage } from '@/utils/fieldLabelTranslations';
import { LanguageBadge } from '@/components/LanguageAwareFormDisplay';

export default function Staff3FormVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id;
  const { getAuthHeaders } = useAuth();
  
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [formLanguage, setFormLanguage] = useState('en');

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/3/forms/${formId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setForm(data.data?.form);
        
        // Detect language from form data
        const detectedLanguage = data.data?.form?.language || detectFormLanguage(data.data?.form?.fields || data.data?.form?.data || {});
        setFormLanguage(detectedLanguage);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch form');
      }
    } catch (error) {
      console.error('Error fetching form:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (approved) => {
    try {
      setVerifying(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/3/forms/${formId}/verify`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved,
          verificationNotes,
          verificationType: form.serviceType === 'e-stamp' ? 'e-stamp' : 'map-module'
        })
      });

      if (response.ok) {
        alert(approved ? 'Form verified successfully!' : 'Form rejected');
        router.push('/staff3/e-stamp-map-verification');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying form:', error);
      alert('Verification failed: ' + error.message);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-medium mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/staff3/e-stamp-map-verification')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            ← Back to List
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Form not found</p>
          <button
            onClick={() => router.push('/staff3/e-stamp-map-verification')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {form.serviceType === 'e-stamp' ? 'E-Stamp Application' : 'Map Module'} Verification
              </h1>
              <p className="text-sm text-gray-600">
                Form ID: {form._id?.substring(0, 12)}... | Submitted: {new Date(form.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-1">
                <LanguageBadge language={formLanguage} size="sm" />
              </div>
            </div>
            <button
              onClick={() => router.push('/staff3/e-stamp-map-verification')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to List
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Status Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-yellow-600 text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-medium text-yellow-900">Pending Verification</h3>
              <p className="text-sm text-yellow-700">
                Please review the form details below and verify or reject the submission.
              </p>
            </div>
          </div>
        </div>

        {/* Form Display - Read-only */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Form Details (Read-Only)</h2>
          
          {form.serviceType === 'e-stamp' && form.data && (
            <div className="space-y-6">
              {/* E-Stamp Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Article/Type</label>
                  <p className="mt-1 text-gray-900">{form.data.article || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="mt-1 text-gray-900">₹{form.data.amount || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Property Description</label>
                  <p className="mt-1 text-gray-900">{form.data.property || 'N/A'}</p>
                </div>
                {form.data.consideredPrice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Considered Price</label>
                    <p className="mt-1 text-gray-900">₹{form.data.consideredPrice}</p>
                  </div>
                )}
              </div>

              {/* First Party */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">First Party Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-gray-900">{form.data.firstParty?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <p className="mt-1 text-gray-900">{form.data.firstParty?.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{form.data.firstParty?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PAN</label>
                    <p className="mt-1 text-gray-900">{form.data.firstParty?.pan || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-gray-900">{form.data.firstParty?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Second Party */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Second Party Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-gray-900">{form.data.secondParty?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <p className="mt-1 text-gray-900">{form.data.secondParty?.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{form.data.secondParty?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">PAN</label>
                    <p className="mt-1 text-gray-900">{form.data.secondParty?.pan || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-gray-900">{form.data.secondParty?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Paid By</label>
                    <p className="mt-1 text-gray-900">{form.data.paidBy || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Purchased By</label>
                    <p className="mt-1 text-gray-900">{form.data.purchasedBy || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {form.serviceType === 'map-module' && form.data && (
            <div className="space-y-6">
              {/* Map Module Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Type</label>
                  <p className="mt-1 text-gray-900">{form.data.propertyType || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property Sub-Type</label>
                  <p className="mt-1 text-gray-900">{form.data.propertySubType || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Property Address</label>
                  <p className="mt-1 text-gray-900">{form.data.propertyAddress || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plot Length</label>
                  <p className="mt-1 text-gray-900">{form.data.plotLength} {form.data.unitLength}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plot Width</label>
                  <p className="mt-1 text-gray-900">{form.data.plotWidth} {form.data.unitWidth}</p>
                </div>
                {form.data.calculatedData && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Plot Area (Sq. Ft.)</label>
                      <p className="mt-1 text-gray-900">{form.data.calculatedData.areaSqFeet?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Plot Area (Sq. Meters)</label>
                      <p className="mt-1 text-gray-900">{form.data.calculatedData.areaSqMeters?.toFixed(2) || 'N/A'}</p>
                    </div>
                    {form.data.calculatedData.builtUpResult?.totalSqFeet > 0 && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Built-up Area (Sq. Ft.)</label>
                          <p className="mt-1 text-gray-900">{form.data.calculatedData.builtUpResult.totalSqFeet.toFixed(2)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Built-up Area (Sq. Meters)</label>
                          <p className="mt-1 text-gray-900">{form.data.calculatedData.builtUpResult.totalSqMeters.toFixed(2)}</p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Neighbors */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Neighboring Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">North</label>
                    <p className="mt-1 text-gray-900">{form.data.neighbourNorthType} {form.data.neighbourNorthOther || ''}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">South</label>
                    <p className="mt-1 text-gray-900">{form.data.neighbourSouthType} {form.data.neighbourSouthOther || ''}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">East</label>
                    <p className="mt-1 text-gray-900">{form.data.neighbourEastType} {form.data.neighbourEastOther || ''}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">West</label>
                    <p className="mt-1 text-gray-900">{form.data.neighbourWestType} {form.data.neighbourWestOther || ''}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Verification Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Decision</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Notes (Optional)
            </label>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Add any notes or comments about this verification..."
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => handleVerify(true)}
              disabled={verifying}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {verifying ? 'Verifying...' : '✓ Approve & Verify'}
            </button>
            <button
              onClick={() => handleVerify(false)}
              disabled={verifying}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {verifying ? 'Processing...' : '✗ Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

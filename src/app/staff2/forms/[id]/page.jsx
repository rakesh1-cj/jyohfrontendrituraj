"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getFieldLabel, detectFormLanguage } from '@/utils/fieldLabelTranslations';

export default function Staff2FormDetailPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id;
  const { user } = useAuth();
  
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState(false);
  const [formLanguage, setFormLanguage] = useState('en');

  // Helper to get auth headers safely
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('authToken') || localStorage.getItem('access_token') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      const response = await fetch(`${API_BASE}/api/staff/2/forms/${formId}`, {
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

  const handleMarkAsComplete = async () => {
    if (!confirm('Mark this form as completed and finalized?')) {
      return;
    }

    try {
      setMarking(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      console.log('Marking form as complete:', formId);
      console.log('API endpoint:', `${API_BASE}/api/staff/2/forms/${formId}/mark-final-done`);
      
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

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        alert('Form marked as completed successfully!');
        fetchForm(); // Refresh to show updated status
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to finalize form');
      }
    } catch (error) {
      console.error('Error finalizing form:', error);
      alert('Failed to finalize form: ' + error.message);
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
            onClick={() => router.push('/staff2/final-approval')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            ← Back to Final Approval
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
            onClick={() => router.push('/staff2/final-approval')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back to Final Approval
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = form.status === 'completed';
  const isVerifiedByStaff3 = form.approvals?.staff3?.approved;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {form.serviceType === 'e-stamp' ? 'E-Stamp Application' : 'Map Module'} Details
              </h1>
              <p className="text-sm text-gray-600">
                Form ID: {form._id?.substring(0, 12)}... | Submitted: {new Date(form.createdAt).toLocaleDateString()}
              </p>
              {/* Language Indicator */}
              <div className="mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  formLanguage === 'hi' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {formLanguage === 'hi' ? '🇮🇳 हिंदी' : '🇬🇧 English'}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/staff2/final-approval')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to Final Approval
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        <div className={`rounded-lg border p-4 mb-6 ${
          isCompleted 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{isCompleted ? '✓' : '⏳'}</span>
              <div>
                <h3 className={`font-medium ${isCompleted ? 'text-blue-900' : 'text-yellow-900'}`}>
                  {isCompleted ? 'Completed' : 'Pending Final Approval'}
                </h3>
                <p className={`text-sm ${isCompleted ? 'text-blue-700' : 'text-yellow-700'}`}>
                  {isCompleted 
                    ? `Completed on ${form.completedAt ? new Date(form.completedAt).toLocaleDateString() : 'N/A'}`
                    : 'This form has been verified by Staff 3 and is ready for final approval'
                  }
                </p>
              </div>
            </div>
            {!isCompleted && isVerifiedByStaff3 && (
              <button
                onClick={handleMarkAsComplete}
                disabled={marking}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {marking ? 'Processing...' : '✓ Mark as Complete'}
              </button>
            )}
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
                  <label className="block text-sm font-medium text-gray-700">{getFieldLabel('article', formLanguage)}</label>
                  <p className="mt-1 text-gray-900">{form.data.article || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{getFieldLabel('totalAmount', formLanguage)}</label>
                  <p className="mt-1 text-gray-900">₹{form.data.amount || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">{getFieldLabel('propertyAddress', formLanguage)}</label>
                  <p className="mt-1 text-gray-900">{form.data.property || 'N/A'}</p>
                </div>
                {form.data.consideredPrice && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('salePrice', formLanguage)}</label>
                    <p className="mt-1 text-gray-900">₹{form.data.consideredPrice}</p>
                  </div>
                )}
              </div>

              {/* First Party */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">{getFieldLabel('firstParty', formLanguage)}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('name', formLanguage)}</label>
                    <p className="mt-1 text-gray-900">{form.data.firstParty?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('mobile', formLanguage)}</label>
                    <p className="mt-1 text-gray-900">{form.data.firstParty?.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('email', formLanguage)}</label>
                    <p className="mt-1 text-gray-900">{form.data.firstParty?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('panCard', formLanguage)}</label>
                    <p className="mt-1 text-gray-900">{form.data.firstParty?.pan || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('address', formLanguage)}</label>
                    <p className="mt-1 text-gray-900">{form.data.firstParty?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Second Party */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">{getFieldLabel('secondParty', formLanguage)}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('name', formLanguage)}</label>
                    <p className="mt-1 text-gray-900">{form.data.secondParty?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('mobile', formLanguage)}</label>
                    <p className="mt-1 text-gray-900">{form.data.secondParty?.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('email', formLanguage)}</label>
                    <p className="mt-1 text-gray-900">{form.data.secondParty?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('panCard', formLanguage)}</label>
                    <p className="mt-1 text-gray-900">{form.data.secondParty?.pan || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">{getFieldLabel('address', formLanguage)}</label>
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

        {/* Staff 3 Verification Notes */}
        {form.approvals?.staff3?.notes && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Staff 3 Verification Notes</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">{form.approvals.staff3.notes}</p>
              <p className="text-xs text-green-600 mt-2">
                Verified by Staff 3 on {form.approvals.staff3.verifiedAt ? new Date(form.approvals.staff3.verifiedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

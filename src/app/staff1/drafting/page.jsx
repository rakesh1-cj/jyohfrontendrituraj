"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AVAILABLE_FORMS } from '@/lib/constants/forms';

export default function Staff1DraftingPage() {
  const router = useRouter();
  const { getAuthHeaders, user } = useAuth();
  const [step, setStep] = useState(1); // 1: Select form type, 2: Draft created
  const [selectedFormType, setSelectedFormType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draftCreated, setDraftCreated] = useState(false);
  const [createdDraftId, setCreatedDraftId] = useState(null);

  const handleFormTypeSelect = (form) => {
    setSelectedFormType(form);
    setError(null);
    // Directly create draft without template selection
    createDraft(form);
  };

  const createDraft = async (form) => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';

      // Create a new draft form with empty fields
      const response = await fetch(`${API_BASE}/api/forms/save`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceType: form.serviceType,
          fields: {},
          formTitle: `${form.name} - Draft`,
          formDescription: 'New draft form'
        })
      });

      if (response.ok) {
        const data = await response.json();
        // The formData._id is the FormsData document ID
        const draftId = data.data?.formData?._id || data.data?.formData?.id;
        if (!draftId) {
          throw new Error('Draft created but no ID returned');
        }
        setCreatedDraftId(draftId);
        setDraftCreated(true);
        
        // For sale deed, directly open the draft form
        if (form.serviceType === 'sale-deed') {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('staff1_filling_form', 'true');
            sessionStorage.setItem('staff1_form_serviceType', form.serviceType);
            sessionStorage.setItem('staff1_formId', draftId);
            sessionStorage.setItem('staff1_onBehalfOfUserId', '');
            sessionStorage.setItem('staff1_use_draft4', 'true');
            router.push('/sale-deed-draft4');
          }
        } else {
          // For other forms, show success screen
          setStep(2);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to create draft');
      }
    } catch (error) {
      console.error('Error creating draft:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleContinueToForm = () => {
    if (createdDraftId && selectedFormType) {
      // Store form info in sessionStorage for the form page to use
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('staff1_filling_form', 'true');
        sessionStorage.setItem('staff1_form_serviceType', selectedFormType.serviceType);
        sessionStorage.setItem('staff1_formId', createdDraftId);
        sessionStorage.setItem('staff1_onBehalfOfUserId', '');
        
        // For sale deed, use Draft 4 format by default
        if (selectedFormType.serviceType === 'sale-deed') {
          sessionStorage.setItem('staff1_use_draft4', 'true');
          router.push(`${selectedFormType.path}?draft4=true`);
        } else {
          router.push(selectedFormType.path);
        }
      }
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setSelectedFormType(null);
    setDraftCreated(false);
    setCreatedDraftId(null);
    setError(null);
  };

  const getServiceTypeIcon = (serviceType) => {
    const form = AVAILABLE_FORMS.find(f => f.serviceType === serviceType);
    return form?.icon || '📄';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Form Drafting</h1>
            <p className="text-green-100">Create draft forms for offline users.</p>
          </div>
          <Link
            href="/staff1/dashboard"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Select Form Type</span>
          </div>
          <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Draft Created</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Step 1: Select Form Type */}
      {step === 1 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Form Type</h2>
          <p className="text-sm text-gray-600 mb-6">
            Choose the type of form you want to create a draft for. {loading && <span className="text-green-600">Creating draft...</span>}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AVAILABLE_FORMS.map((form, index) => (
              <button
                key={index}
                onClick={() => handleFormTypeSelect(form)}
                disabled={loading}
                className="text-left p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{form.icon}</span>
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-900">
                    {form.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {form.description}
                </p>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  {loading ? 'Creating Draft...' : 'Create Draft'}
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Draft Created */}
      {step === 2 && draftCreated && (
        <div className="bg-white rounded-lg border p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Draft Created Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your draft form has been created.
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleContinueToForm}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue to Form
              </button>
              <Link
                href="/staff1/forms"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                View All Forms
              </Link>
              <button
                onClick={handleStartOver}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Another Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


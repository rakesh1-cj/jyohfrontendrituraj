"use client";

import React, { useEffect } from 'react';
import MultilingualForm from '@/components/MultilingualForm/MultilingualForm';
import '@/i18n/config';

/**
 * Multilingual Form Demo Page
 * Demonstrates the complete multilingual form with Hindi typing support
 */
export default function MultilingualFormDemoPage() {
  useEffect(() => {
    // Initialize i18n on mount
    console.log('Multilingual Form Demo loaded');
  }, []);

  const handleFormSubmit = (formData) => {
    console.log('Form submitted with data:', formData);
    
    // Here you can send data to your backend
    // Example:
    // fetch('/api/submit-form', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });
    
    alert('Form submitted successfully!\n\nCheck console for data.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Multilingual Form Demo
          </h1>
          <p className="text-lg text-gray-600">
            Complete React form with English & Hindi support
          </p>
        </div>

        {/* Features Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-semibold text-gray-800 mb-1">Controlled Components</h3>
            <p className="text-sm text-gray-600">useState for all inputs</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">🔤</div>
            <h3 className="font-semibold text-gray-800 mb-1">Hindi Typing</h3>
            <p className="text-sm text-gray-600">Phonetic transliteration</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-3xl mb-2">🌐</div>
            <h3 className="font-semibold text-gray-800 mb-1">i18n Support</h3>
            <p className="text-sm text-gray-600">Dynamic UI language</p>
          </div>
        </div>

        {/* Main Form */}
        <MultilingualForm onSubmit={handleFormSubmit} />

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            How to Use / उपयोग कैसे करें
          </h2>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </span>
              <div>
                <h3 className="font-semibold text-gray-800">Toggle Hindi Typing Mode</h3>
                <p className="text-sm text-gray-600">
                  Enable the Hindi typing toggle to start typing in Hindi using English keyboard
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </span>
              <div>
                <h3 className="font-semibold text-gray-800">Type Phonetically</h3>
                <p className="text-sm text-gray-600">
                  Type English words and they'll convert to Hindi automatically (e.g., "kamal" → "कमल")
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </span>
              <div>
                <h3 className="font-semibold text-gray-800">Switch UI Language</h3>
                <p className="text-sm text-gray-600">
                  Click "Switch to Hindi" button to change all labels and text to Hindi
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </span>
              <div>
                <h3 className="font-semibold text-gray-800">Submit Form</h3>
                <p className="text-sm text-gray-600">
                  Fill all required fields and click Submit to see the data in console
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Example Conversions / उदाहरण रूपांतरण
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { en: 'Rituraj', hi: 'रितुराज' },
              { en: 'Priya', hi: 'प्रिया' },
              { en: 'Delhi', hi: 'देलही' },
              { en: 'Mumbai', hi: 'मुमबई' },
              { en: 'Bharat', hi: 'भारत' },
              { en: 'ghar', hi: 'घर' },
              { en: 'shahar', hi: 'शहर' },
              { en: 'naam', hi: 'नाम' },
              { en: 'pita', hi: 'पिता' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">{item.en}</div>
                <div className="text-lg font-semibold text-blue-600">{item.hi}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

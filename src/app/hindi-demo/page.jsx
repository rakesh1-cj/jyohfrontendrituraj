"use client";

import React, { useState } from 'react';
import { FormWorkflowProvider, useFormWorkflow } from '@/components/FormWorkflow/FormWorkflowProvider';
import HindiInput from '@/components/ui/HindiInput';
import HindiTextarea from '@/components/ui/HindiTextarea';
import LanguageToggle from '@/components/ui/LanguageToggle';

/**
 * Hindi Typing Demo Page
 * Demonstrates the Hindi transliteration functionality
 */

function HindiDemoContent() {
  const { hindiInputEnabled, toggleHindiInput } = useFormWorkflow();
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClear = () => {
    setFormData({
      name: '',
      fatherName: '',
      motherName: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      notes: ''
    });
  };

  const exampleTransliterations = [
    { english: 'Rituraj', hindi: 'रितुराज' },
    { english: 'mera naam', hindi: 'मेरा नाम' },
    { english: 'Delhi', hindi: 'देलही' },
    { english: 'Bharat', hindi: 'भारत' },
    { english: 'ksha', hindi: 'क्ष' },
    { english: 'gyan', hindi: 'ज्ञान' },
    { english: 'Maharashtra', hindi: 'महाराष्ट्र' },
    { english: 'Rajasthan', hindi: 'राजस्थान' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Hindi Typing Demo
              </h1>
              <p className="text-gray-600">
                Type in English and see it convert to Hindi (Devanagari script) in real-time
              </p>
            </div>
            <LanguageToggle 
              isHindi={hindiInputEnabled} 
              onToggle={toggleHindiInput}
            />
          </div>


        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Try It Out / इसे आज़माएं
              </h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name / नाम
                  </label>
                  <HindiInput
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    enableHindi={hindiInputEnabled}
                    placeholder={hindiInputEnabled ? "अपना नाम दर्ज करें" : "Enter your name"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {hindiInputEnabled && (
                    <p className="mt-1 text-xs text-blue-600">
                      Try typing: Rituraj, Priya, Amit
                    </p>
                  )}
                </div>

                {/* Father's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Father's Name / पिता का नाम
                  </label>
                  <HindiInput
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    enableHindi={hindiInputEnabled}
                    placeholder={hindiInputEnabled ? "पिता का नाम दर्ज करें" : "Enter father's name"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Mother's Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mother's Name / माता का नाम
                  </label>
                  <HindiInput
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    enableHindi={hindiInputEnabled}
                    placeholder={hindiInputEnabled ? "माता का नाम दर्ज करें" : "Enter mother's name"}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address / पता
                  </label>
                  <HindiTextarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    enableHindi={hindiInputEnabled}
                    placeholder={hindiInputEnabled ? "अपना पूरा पता दर्ज करें" : "Enter your complete address"}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {hindiInputEnabled && (
                    <p className="mt-1 text-xs text-blue-600">
                      Try typing: ghar number 123, Delhi
                    </p>
                  )}
                </div>

                {/* City and State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City / शहर
                    </label>
                    <HindiInput
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      enableHindi={hindiInputEnabled}
                      placeholder={hindiInputEnabled ? "शहर" : "City"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State / राज्य
                    </label>
                    <HindiInput
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      enableHindi={hindiInputEnabled}
                      placeholder={hindiInputEnabled ? "राज्य" : "State"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Pincode (No Hindi) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode / पिनकोड
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Numeric fields don't use Hindi transliteration
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes / अतिरिक्त नोट्स
                  </label>
                  <HindiTextarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    enableHindi={hindiInputEnabled}
                    placeholder={hindiInputEnabled ? "कोई अतिरिक्त जानकारी" : "Any additional information"}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Clear / साफ़ करें
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6">
            {/* Examples */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Example Conversions
              </h3>
              <div className="space-y-2">
                {exampleTransliterations.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{item.english}</span>
                    <span className="text-sm font-medium text-blue-600">→</span>
                    <span className="text-sm font-semibold text-gray-800">{item.hindi}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Use */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                How to Use
              </h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600">1.</span>
                  <span>Toggle the language switch to enable Hindi mode</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600">2.</span>
                  <span>Type in English (Roman script) in any field</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600">3.</span>
                  <span>Watch it automatically convert to Hindi</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-blue-600">4.</span>
                  <span>Numbers and special characters remain unchanged</span>
                </li>
              </ol>
            </div>

            {/* Current Data Preview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Data Preview
              </h3>
              <div className="bg-gray-50 rounded p-3 max-h-64 overflow-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(formData, null, 2)}
                </pre>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                This is how your data will be stored (UTF-8 encoded)
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Technical Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded">
              <p className="font-semibold text-green-800 mb-1">✓ Real-time Conversion</p>
              <p className="text-gray-600">Converts as you type, no delay</p>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <p className="font-semibold text-blue-800 mb-1">✓ UTF-8 Encoding</p>
              <p className="text-gray-600">Properly stores Hindi characters</p>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <p className="font-semibold text-purple-800 mb-1">✓ Mobile Compatible</p>
              <p className="text-gray-600">Works on all devices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HindiDemoPage() {
  return (
    <FormWorkflowProvider formType="demo">
      <HindiDemoContent />
    </FormWorkflowProvider>
  );
}

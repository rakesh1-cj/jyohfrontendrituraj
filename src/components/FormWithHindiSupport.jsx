"use client";

import React from 'react';
import { useFormWorkflow } from './FormWorkflow/FormWorkflowProvider';
import HindiInput from './ui/HindiInput';
import HindiTextarea from './ui/HindiTextarea';
import LanguageToggle from './ui/LanguageToggle';

/**
 * Example Form Component with Hindi Support
 * This demonstrates how to integrate Hindi transliteration into your forms
 */
const FormWithHindiSupport = () => {
  const { hindiInputEnabled, toggleHindiInput } = useFormWorkflow();
  const [formData, setFormData] = React.useState({
    name: '',
    fatherName: '',
    address: '',
    city: '',
    email: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    // Submit form data - Hindi text will be stored as UTF-8
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Language Toggle */}
        <div className="mb-6 flex justify-end">
          <LanguageToggle 
            isHindi={hindiInputEnabled} 
            onToggle={toggleHindiInput}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field with Hindi Support */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <p className="mt-1 text-xs text-gray-500">
              {hindiInputEnabled 
                ? "Type in English, it will convert to Hindi (e.g., 'Rituraj' → 'रितुराज')" 
                : "Type normally in English"}
            </p>
          </div>

          {/* Father's Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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

          {/* Address Field with Hindi Support */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address / पता
            </label>
            <HindiTextarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              enableHindi={hindiInputEnabled}
              placeholder={hindiInputEnabled ? "अपना पता दर्ज करें" : "Enter your address"}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City / शहर
            </label>
            <HindiInput
              name="city"
              value={formData.city}
              onChange={handleChange}
              enableHindi={hindiInputEnabled}
              placeholder={hindiInputEnabled ? "शहर का नाम दर्ज करें" : "Enter city name"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email (No Hindi) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Email fields don't use Hindi transliteration
            </p>
          </div>

          {/* Phone (No Hindi) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Submit / जमा करें
            </button>
            <button
              type="button"
              onClick={() => setFormData({
                name: '',
                fatherName: '',
                address: '',
                city: '',
                email: '',
                phone: ''
              })}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Reset / रीसेट
            </button>
          </div>
        </form>

        {/* Preview Section */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Form Data Preview:</h3>
          <pre className="text-sm bg-white p-4 rounded border overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FormWithHindiSupport;

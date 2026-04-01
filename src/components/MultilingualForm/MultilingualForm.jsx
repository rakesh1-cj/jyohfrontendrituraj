"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HindiInput from '@/components/ui/HindiInput';
import HindiTextarea from '@/components/ui/HindiTextarea';

/**
 * MultilingualForm Component
 * A complete form with English/Hindi support and i18n integration
 * 
 * Features:
 * - Controlled components with useState
 * - Hindi transliteration (phonetic typing)
 * - Dynamic UI language switching
 * - Proper matra support
 * - Clean and reusable
 */
const MultilingualForm = ({ onSubmit, className = '' }) => {
  const { t, i18n } = useTranslation();
  
  // Form state
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

  // Hindi typing toggle
  const [hindiEnabled, setHindiEnabled] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    
    if (onSubmit) {
      onSubmit(formData);
    } else {
      alert('Form submitted successfully!\n\n' + JSON.stringify(formData, null, 2));
    }
  };

  // Clear form
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

  // Toggle UI language
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Toggle Hindi typing
  const toggleHindiTyping = () => {
    setHindiEnabled(prev => !prev);
  };

  return (
    <div className={`max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {t('formTitle')}
          </h2>
          
          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            {t('switchLanguage')}
          </button>
        </div>
        
        <p className="text-gray-600 text-sm">
          {t('formDescription')}
        </p>
      </div>

      {/* Hindi Typing Toggle - ENHANCED WITH CLEAR VISUAL INDICATORS */}
      <div className={`mb-6 p-4 rounded-lg border-2 transition-all ${
        hindiEnabled 
          ? 'bg-green-50 border-green-400' 
          : 'bg-yellow-50 border-yellow-400'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-800">
                Hindi Typing Mode / हिंदी टाइपिंग मोड
              </p>
              {hindiEnabled ? (
                <span className="px-2 py-1 bg-green-600 text-white text-xs font-bold rounded">
                  ON ✓
                </span>
              ) : (
                <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-bold rounded">
                  OFF
                </span>
              )}
            </div>
            <p className={`text-xs mt-1 font-medium ${
              hindiEnabled ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {hindiEnabled 
                ? '✓ Hindi typing is ENABLED - Type English to get Hindi (e.g., "kamal" → "कमल")'
                : '⚠️ Click the toggle to ENABLE Hindi typing'
              }
            </p>
          </div>
          
          <button
            type="button"
            onClick={toggleHindiTyping}
            className={`relative inline-flex items-center h-10 rounded-full w-20 transition-all focus:outline-none focus:ring-4 ${
              hindiEnabled 
                ? 'bg-green-600 focus:ring-green-300' 
                : 'bg-gray-400 focus:ring-gray-300'
            }`}
            aria-label="Toggle Hindi typing"
          >
            <span
              className={`inline-block w-8 h-8 transform rounded-full bg-white shadow-lg transition-transform flex items-center justify-center text-xs font-bold ${
                hindiEnabled ? 'translate-x-11' : 'translate-x-1'
              }`}
            >
              {hindiEnabled ? '✓' : '○'}
            </span>
          </button>
        </div>
        
        {!hindiEnabled && (
          <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
            <strong>👆 Click the toggle above to enable Hindi typing!</strong>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('name')} *
          </label>
          <HindiInput
            name="name"
            value={formData.name}
            onChange={handleChange}
            enableHindi={hindiEnabled}
            placeholder={t('enterName')}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Father's Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('fatherName')} *
          </label>
          <HindiInput
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            enableHindi={hindiEnabled}
            placeholder={t('enterFatherName')}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Mother's Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('motherName')} *
          </label>
          <HindiInput
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            enableHindi={hindiEnabled}
            placeholder={t('enterMotherName')}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('address')} *
          </label>
          <HindiTextarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            enableHindi={hindiEnabled}
            placeholder={t('enterAddress')}
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* City and State */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('city')} *
            </label>
            <HindiInput
              name="city"
              value={formData.city}
              onChange={handleChange}
              enableHindi={hindiEnabled}
              placeholder={t('enterCity')}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('state')} *
            </label>
            <HindiInput
              name="state"
              value={formData.state}
              onChange={handleChange}
              enableHindi={hindiEnabled}
              placeholder={t('enterState')}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('pincode')} *
          </label>
          <input
            type="text"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            placeholder={t('enterPincode')}
            required
            maxLength={6}
            pattern="[0-9]{6}"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('numericFieldNote')}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('notes')}
          </label>
          <HindiTextarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            enableHindi={hindiEnabled}
            placeholder={t('enterNotes')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            {t('submit')}
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
          >
            {t('clear')}
          </button>
        </div>
      </form>

      {/* Data Preview (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Form Data (Dev Mode):
          </p>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MultilingualForm;

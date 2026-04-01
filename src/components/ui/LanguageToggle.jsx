"use client";

import React from 'react';

/**
 * LanguageToggle Component
 * Toggle button for switching between English and Hindi input modes
 */
const LanguageToggle = ({ isHindi, onToggle, className = '' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">Input Language:</span>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex items-center h-8 rounded-full w-16 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isHindi ? 'bg-blue-600' : 'bg-gray-300'
        }`}
        aria-label="Toggle Hindi input"
      >
        <span
          className={`inline-block w-6 h-6 transform rounded-full bg-white shadow-lg transition-transform ${
            isHindi ? 'translate-x-9' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm font-semibold ${isHindi ? 'text-blue-600' : 'text-gray-500'}`}>
        {isHindi ? 'हिंदी' : 'English'}
      </span>
    </div>
  );
};

export default LanguageToggle;

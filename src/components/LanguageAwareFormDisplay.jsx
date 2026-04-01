"use client";
import React from 'react';
import { getFieldLabel } from '@/utils/fieldLabelTranslations';
import FormFieldRenderer from '@/components/FormFieldRenderer';

/**
 * Language-aware form display component
 * Displays form fields with translated labels based on form language
 */
export default function LanguageAwareFormDisplay({ 
  formData, 
  language = 'en',
  className = '',
  columns = 2 
}) {
  if (!formData || typeof formData !== 'object') {
    return <p className="text-gray-400 italic">No data available</p>;
  }

  const entries = Object.entries(formData).filter(([key]) => !key.startsWith('_'));

  if (entries.length === 0) {
    return <p className="text-gray-400 italic">No fields to display</p>;
  }

  const gridClass = columns === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className={`grid ${gridClass} gap-4 ${className}`}>
      {entries.map(([key, value]) => {
        const label = getFieldLabel(key, language);
        
        return (
          <div key={key} className="border-b border-gray-100 pb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <div className="text-sm text-gray-900">
              <FormFieldRenderer 
                fieldName={key} 
                value={value} 
                isEditMode={false} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Language indicator badge component
 */
export function LanguageBadge({ language = 'en', size = 'sm' }) {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${
      language === 'hi' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
    }`}>
      {language === 'hi' ? '🇮🇳 हिंदी (Hindi)' : '🇬🇧 English'}
    </span>
  );
}

/**
 * Section header with language-aware title
 */
export function SectionHeader({ titleKey, language = 'en', className = '' }) {
  const title = getFieldLabel(titleKey, language);
  
  return (
    <h3 className={`font-medium text-gray-900 ${className}`}>
      {title}
    </h3>
  );
}

/**
 * Field display with language-aware label
 */
export function FieldDisplay({ 
  fieldKey, 
  value, 
  language = 'en', 
  className = '',
  fullWidth = false 
}) {
  const label = getFieldLabel(fieldKey, language);
  const widthClass = fullWidth ? 'col-span-full' : '';
  
  return (
    <div className={`${widthClass} ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <p className="mt-1 text-gray-900">
        <FormFieldRenderer 
          fieldName={fieldKey} 
          value={value} 
          isEditMode={false} 
        />
      </p>
    </div>
  );
}

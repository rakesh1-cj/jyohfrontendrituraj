"use client";

/**
 * STANDALONE MULTILINGUAL FORM EXAMPLE
 * 
 * This is a complete, self-contained example that you can copy and use directly.
 * It includes everything needed for a multilingual form with Hindi typing support.
 * 
 * Features:
 * - Controlled components with useState
 * - Hindi transliteration (type English, get Hindi)
 * - Proper matra support
 * - Language switching for UI labels
 * - Clean and reusable code
 * 
 * Usage:
 * 1. Copy this entire file
 * 2. Import in your page: import StandaloneExample from '@/components/MultilingualForm/StandaloneExample'
 * 3. Use: <StandaloneExample />
 */

import React, { useState } from 'react';

// ============================================================================
// TRANSLITERATION UTILITY (Inline for standalone use)
// ============================================================================

const consonants = {
  'ksh': 'क्ष', 'gya': 'ज्ञ', 'tra': 'त्र', 'shr': 'श्र',
  'kh': 'ख', 'gh': 'घ', 'ch': 'च', 'chh': 'छ', 'jh': 'झ',
  'th': 'थ', 'thh': 'ठ', 'dh': 'ध', 'dhh': 'ढ',
  'ph': 'फ', 'bh': 'भ', 'sh': 'श', 'shh': 'ष',
  'ng': 'ङ', 'ny': 'ञ',
  'k': 'क', 'g': 'ग', 'c': 'च', 'j': 'ज',
  't': 'त', 'd': 'द', 'n': 'न', 'p': 'प',
  'b': 'ब', 'm': 'म', 'y': 'य', 'r': 'र',
  'l': 'ल', 'v': 'व', 'w': 'व', 's': 'स', 'h': 'ह',
  'q': 'क़', 'x': 'क्ष', 'f': 'फ़', 'z': 'ज़'
};

const vowels = {
  'aa': 'आ', 'ai': 'ऐ', 'au': 'औ', 'ee': 'ई', 'oo': 'ऊ',
  'a': 'अ', 'e': 'ए', 'i': 'इ', 'o': 'ओ', 'u': 'उ'
};

const matras = {
  'aa': 'ा', 'ai': 'ै', 'au': 'ौ', 'ee': 'ी', 'oo': 'ू',
  'a': '', 'e': 'े', 'i': 'ि', 'o': 'ो', 'u': 'ु'
};

function transliterateToHindi(text) {
  if (!text || typeof text !== 'string') return '';
  
  let result = '';
  let i = 0;
  const lowerText = text.toLowerCase();
  
  while (i < text.length) {
    let matched = false;
    
    if (/[\s0-9\.,\-\/\(\)\[\]\{\}]/.test(text[i])) {
      result += text[i];
      i++;
      continue;
    }
    
    for (let len = 3; len >= 1; len--) {
      if (i + len > text.length) continue;
      const chunk = lowerText.substring(i, i + len);
      
      if (consonants[chunk]) {
        let vowelMatched = false;
        
        for (let vLen = 2; vLen >= 1; vLen--) {
          if (i + len + vLen > text.length) continue;
          const vowelChunk = lowerText.substring(i + len, i + len + vLen);
          
          if (matras[vowelChunk] !== undefined) {
            result += consonants[chunk] + matras[vowelChunk];
            i += len + vLen;
            vowelMatched = true;
            matched = true;
            break;
          }
        }
        
        if (!vowelMatched) {
          const nextChar = i + len < text.length ? lowerText[i + len] : '';
          if (nextChar && !/[\s0-9\.,\-\/\(\)\[\]\{\}]/.test(nextChar) && !vowels[nextChar]) {
            result += consonants[chunk] + '्';
          } else {
            result += consonants[chunk];
          }
          i += len;
          matched = true;
        }
        break;
      }
    }
    
    if (!matched) {
      for (let len = 2; len >= 1; len--) {
        if (i + len > text.length) continue;
        const chunk = lowerText.substring(i, i + len);
        
        if (vowels[chunk]) {
          result += vowels[chunk];
          i += len;
          matched = true;
          break;
        }
      }
    }
    
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  
  return result;
}

// ============================================================================
// HINDI INPUT COMPONENT (Inline for standalone use)
// ============================================================================

function HindiInputField({ value, onChange, name, placeholder, enableHindi, className, ...props }) {
  const [localValue, setLocalValue] = React.useState(value || '');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    if (enableHindi) {
      const isTyping = newValue.length >= localValue.length;
      
      if (isTyping) {
        const beforeCursor = newValue.substring(0, cursorPosition);
        const afterCursor = newValue.substring(cursorPosition);
        const words = beforeCursor.split(' ');
        const currentWord = words[words.length - 1];
        
        if (/[a-zA-Z]/.test(currentWord)) {
          const transliteratedWord = transliterateToHindi(currentWord);
          words[words.length - 1] = transliteratedWord;
          const transliteratedBefore = words.join(' ');
          const finalValue = transliteratedBefore + afterCursor;
          
          setLocalValue(finalValue);
          onChange({ target: { name, value: finalValue } });

          setTimeout(() => {
            if (inputRef.current) {
              const newCursorPos = transliteratedBefore.length;
              inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
          }, 0);
        } else {
          setLocalValue(newValue);
          onChange(e);
        }
      } else {
        setLocalValue(newValue);
        onChange(e);
      }
    } else {
      setLocalValue(newValue);
      onChange(e);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      name={name}
      value={localValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
}

// ============================================================================
// HINDI TEXTAREA COMPONENT (Inline for standalone use)
// ============================================================================

function HindiTextareaField({ value, onChange, name, placeholder, enableHindi, className, rows = 3, ...props }) {
  const [localValue, setLocalValue] = React.useState(value || '');
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    if (enableHindi) {
      const isTyping = newValue.length >= localValue.length;
      
      if (isTyping) {
        const beforeCursor = newValue.substring(0, cursorPosition);
        const afterCursor = newValue.substring(cursorPosition);
        const words = beforeCursor.split(/(\s+)/);
        const currentWord = words[words.length - 1];
        
        if (/[a-zA-Z]/.test(currentWord)) {
          const transliteratedWord = transliterateToHindi(currentWord);
          words[words.length - 1] = transliteratedWord;
          const transliteratedBefore = words.join('');
          const finalValue = transliteratedBefore + afterCursor;
          
          setLocalValue(finalValue);
          onChange({ target: { name, value: finalValue } });

          setTimeout(() => {
            if (textareaRef.current) {
              const newCursorPos = transliteratedBefore.length;
              textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
          }, 0);
        } else {
          setLocalValue(newValue);
          onChange(e);
        }
      } else {
        setLocalValue(newValue);
        onChange(e);
      }
    } else {
      setLocalValue(newValue);
      onChange(e);
    }
  };

  return (
    <textarea
      ref={textareaRef}
      name={name}
      value={localValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={className}
      rows={rows}
      {...props}
    />
  );
}

// ============================================================================
// TRANSLATIONS (Inline for standalone use)
// ============================================================================

const translations = {
  en: {
    formTitle: 'Multilingual Form',
    name: 'Name',
    fatherName: "Father's Name",
    motherName: "Mother's Name",
    address: 'Address',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
    notes: 'Additional Notes',
    enterName: 'Enter your name',
    enterFatherName: "Enter father's name",
    enterMotherName: "Enter mother's name",
    enterAddress: 'Enter your complete address',
    submit: 'Submit',
    clear: 'Clear',
    switchLanguage: 'Switch to Hindi',
    hindiTypingMode: 'Hindi Typing Mode',
    enableHindiTyping: 'Enable to type Hindi using English keyboard',
  },
  hi: {
    formTitle: 'बहुभाषी फॉर्म',
    name: 'नाम',
    fatherName: 'पिता का नाम',
    motherName: 'माता का नाम',
    address: 'पता',
    city: 'शहर',
    state: 'राज्य',
    pincode: 'पिनकोड',
    notes: 'अतिरिक्त नोट्स',
    enterName: 'अपना नाम दर्ज करें',
    enterFatherName: 'पिता का नाम दर्ज करें',
    enterMotherName: 'माता का नाम दर्ज करें',
    enterAddress: 'अपना पूरा पता दर्ज करें',
    submit: 'जमा करें',
    clear: 'साफ़ करें',
    switchLanguage: 'अंग्रेजी में बदलें',
    hindiTypingMode: 'हिंदी टाइपिंग मोड',
    enableHindiTyping: 'अंग्रेजी कीबोर्ड का उपयोग करके हिंदी टाइप करने के लिए सक्षम करें',
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StandaloneExample() {
  // Language state
  const [language, setLanguage] = useState('en');
  const t = (key) => translations[language][key] || key;

  // Hindi typing state
  const [hindiEnabled, setHindiEnabled] = useState(false);

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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    alert('Form submitted! Check console for data.');
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

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800">{t('formTitle')}</h2>
          <button
            type="button"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
          >
            {t('switchLanguage')}
          </button>
        </div>
      </div>

      {/* Hindi Toggle */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">{t('hindiTypingMode')}</p>
            <p className="text-xs text-gray-600 mt-1">{t('enableHindiTyping')}</p>
          </div>
          <button
            type="button"
            onClick={() => setHindiEnabled(!hindiEnabled)}
            className={`relative inline-flex items-center h-8 rounded-full w-16 transition-colors ${
              hindiEnabled ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block w-6 h-6 transform rounded-full bg-white shadow-lg transition-transform ${
                hindiEnabled ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')} *</label>
          <HindiInputField
            name="name"
            value={formData.name}
            onChange={handleChange}
            enableHindi={hindiEnabled}
            placeholder={t('enterName')}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('fatherName')} *</label>
          <HindiInputField
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            enableHindi={hindiEnabled}
            placeholder={t('enterFatherName')}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('motherName')} *</label>
          <HindiInputField
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            enableHindi={hindiEnabled}
            placeholder={t('enterMotherName')}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')} *</label>
          <HindiTextareaField
            name="address"
            value={formData.address}
            onChange={handleChange}
            enableHindi={hindiEnabled}
            placeholder={t('enterAddress')}
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('city')} *</label>
            <HindiInputField
              name="city"
              value={formData.city}
              onChange={handleChange}
              enableHindi={hindiEnabled}
              placeholder={t('city')}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('state')} *</label>
            <HindiInputField
              name="state"
              value={formData.state}
              onChange={handleChange}
              enableHindi={hindiEnabled}
              placeholder={t('state')}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {t('submit')}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            {t('clear')}
          </button>
        </div>
      </form>
    </div>
  );
}

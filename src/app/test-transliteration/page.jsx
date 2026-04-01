"use client";

import React, { useState } from 'react';
import { transliterateToHindi } from '@/utils/hindiTransliteration';

export default function TestTransliterationPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    const hindi = transliterateToHindi(value);
    setOutput(hindi);
  };

  const testCases = [
    { input: 'kamal', expected: 'कमल' },
    { input: 'Rituraj', expected: 'रितुराज' },
    { input: 'Delhi', expected: 'देलही' },
    { input: 'pita', expected: 'पिता' },
    { input: 'mata', expected: 'माता' },
    { input: 'ghar', expected: 'घर' },
    { input: 'naam', expected: 'नाम' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Transliteration Test
          </h1>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type English:
            </label>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type 'kamal' or 'Rituraj'"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hindi Output:
            </label>
            <div className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-lg font-semibold text-blue-900 min-h-[50px]">
              {output || '(Hindi will appear here)'}
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Test Cases:
            </h2>
            <div className="space-y-2">
              {testCases.map((test, idx) => {
                const result = transliterateToHindi(test.input);
                const passed = result === test.expected;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-700">{test.input}</span>
                        <span className="mx-2">→</span>
                        <span className="font-bold text-lg">{result}</span>
                      </div>
                      <div>
                        {passed ? (
                          <span className="text-green-600 font-bold">✓ PASS</span>
                        ) : (
                          <span className="text-red-600 font-bold">
                            ✗ FAIL (expected: {test.expected})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> If all tests pass but Hindi typing doesn't work in the form,
              the issue is with the HindiInput component integration, not the transliteration function.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

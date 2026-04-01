"use client";

import React from 'react';
import { useFormWorkflow } from '../FormWorkflow/FormWorkflowProvider';
import HindiInput from '../ui/HindiInput';
import HindiTextarea from '../ui/HindiTextarea';
import LanguageToggle from '../ui/LanguageToggle';

/**
 * Example: How to integrate Hindi support into SaleDeedForm
 * 
 * This shows the key changes needed to add Hindi transliteration
 * to your existing forms.
 */

const SaleDeedFormWithHindi = () => {
  const { hindiInputEnabled, toggleHindiInput } = useFormWorkflow();
  
  // Your existing state
  const [sellers, setSellers] = React.useState([{
    name: '',
    fatherName: '',
    address: '',
    age: '',
    // ... other fields
  }]);

  const updateSeller = (index, field, value) => {
    const updated = [...sellers];
    updated[index][field] = value;
    setSellers(updated);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Add Language Toggle at the top of your form */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sale Deed Form</h1>
        <LanguageToggle 
          isHindi={hindiInputEnabled} 
          onToggle={toggleHindiInput}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Seller Information</h2>
        
        {sellers.map((seller, index) => (
          <div key={index} className="mb-6 p-4 border rounded-lg">
            <h3 className="font-medium mb-3">Seller {index + 1}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Replace regular input with HindiInput */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name / नाम *
                </label>
                <HindiInput
                  name={`seller_${index}_name`}
                  value={seller.name}
                  onChange={(e) => updateSeller(index, 'name', e.target.value)}
                  enableHindi={hindiInputEnabled}
                  placeholder="Enter seller name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Father's Name with Hindi support */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Father's Name / पिता का नाम *
                </label>
                <HindiInput
                  name={`seller_${index}_fatherName`}
                  value={seller.fatherName}
                  onChange={(e) => updateSeller(index, 'fatherName', e.target.value)}
                  enableHindi={hindiInputEnabled}
                  placeholder="Enter father's name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Age - No Hindi needed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age / आयु *
                </label>
                <input
                  type="number"
                  name={`seller_${index}_age`}
                  value={seller.age}
                  onChange={(e) => updateSeller(index, 'age', e.target.value)}
                  placeholder="Enter age"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Address with Hindi support - use HindiTextarea */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address / पता *
                </label>
                <HindiTextarea
                  name={`seller_${index}_address`}
                  value={seller.address}
                  onChange={(e) => updateSeller(index, 'address', e.target.value)}
                  enableHindi={hindiInputEnabled}
                  placeholder="Enter complete address"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        ))}

        {/* Helper text */}
        {hindiInputEnabled && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Hindi Mode Active:</strong> Type in English and it will automatically 
              convert to Hindi. For example: "Rituraj" → "रितुराज"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleDeedFormWithHindi;

/**
 * Flattens form fields, expanding arrays into individual fields
 * This ensures arrays are not displayed as JSON but as individual editable fields
 */

export const flattenFormFields = (fields) => {
  const flattened = {};
  
  const processValue = (key, value, prefix = '') => {
    const fieldKey = prefix ? `${prefix}.${key}` : key;
    
    if (value === null || value === undefined) {
      flattened[fieldKey] = value;
      return;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        flattened[fieldKey] = [];
        return;
      }
      
      // Check if array contains objects (like sellers, buyers, witnesses)
      if (typeof value[0] === 'object' && value[0] !== null) {
        // Expand array of objects into individual fields
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            Object.entries(item).forEach(([subKey, subValue]) => {
              processValue(subKey, subValue, `${fieldKey}[${index}]`);
            });
          } else {
            flattened[`${fieldKey}[${index}]`] = item;
          }
        });
      } else {
        // Simple array - expand into indexed fields
        value.forEach((item, index) => {
          flattened[`${fieldKey}[${index}]`] = item;
        });
      }
      return;
    }
    
    // Handle nested objects (but not image objects)
    if (typeof value === 'object' && value !== null) {
      // Check if it's an image object (has cloudinaryUrl or path)
      if (value.cloudinaryUrl || value.path || (value.url && typeof value.url === 'string')) {
        flattened[fieldKey] = value; // Keep image objects as-is
        return;
      }
      
      // Check if it's a calculations object or other nested structure
      // For calculations, we might want to keep it as-is or expand it
      if (key === 'calculations' || key === 'meta') {
        flattened[fieldKey] = value; // Keep as-is for calculations
        return;
      }
      
      // Expand nested object
      Object.entries(value).forEach(([subKey, subValue]) => {
        processValue(subKey, subValue, fieldKey);
      });
      return;
    }
    
    // Primitive value
    flattened[fieldKey] = value;
  };
  
  Object.entries(fields).forEach(([key, value]) => {
    // Skip internal fields
    if (key.startsWith('_') || 
        key === '__v' || 
        key === 'createdAt' || 
        key === 'updatedAt' || 
        key === 'userId' || 
        key === 'formId' || 
        key === 'serviceType' || 
        key === 'status' ||
        key === 'approvals' || 
        key === 'adminNotes' || 
        key === 'fields' || 
        key === 'data' ||
        key === 'rawFormData' || 
        key === 'originalFormData' || 
        key === 'allFields') {
      return;
    }
    
    processValue(key, value);
  });
  
  return flattened;
};

/**
 * Reconstructs flattened fields back into original structure
 */
export const unflattenFormFields = (flattenedFields) => {
  const unflattened = {};
  
  Object.entries(flattenedFields).forEach(([key, value]) => {
    // Handle array notation like sellers[0].name
    const arrayMatch = key.match(/^(.+)\[(\d+)\]\.(.+)$/);
    if (arrayMatch) {
      const [, arrayKey, index, property] = arrayMatch;
      const idx = parseInt(index, 10);
      
      if (!unflattened[arrayKey]) {
        unflattened[arrayKey] = [];
      }
      
      if (!unflattened[arrayKey][idx]) {
        unflattened[arrayKey][idx] = {};
      }
      
      unflattened[arrayKey][idx][property] = value;
      return;
    }
    
    // Handle simple array notation like shops[0]
    const simpleArrayMatch = key.match(/^(.+)\[(\d+)\]$/);
    if (simpleArrayMatch) {
      const [, arrayKey, index] = simpleArrayMatch;
      const idx = parseInt(index, 10);
      
      if (!unflattened[arrayKey]) {
        unflattened[arrayKey] = [];
      }
      
      unflattened[arrayKey][idx] = value;
      return;
    }
    
    // Handle nested object notation like calculations.salePrice
    const nestedMatch = key.match(/^(.+)\.(.+)$/);
    if (nestedMatch) {
      const [, parentKey, childKey] = nestedMatch;
      
      if (!unflattened[parentKey]) {
        unflattened[parentKey] = {};
      }
      
      unflattened[parentKey][childKey] = value;
      return;
    }
    
    // Simple field
    unflattened[key] = value;
  });
  
  return unflattened;
};


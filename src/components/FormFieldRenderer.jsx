"use client";
import React from 'react';

/**
 * Component to render form field values, including proper image display
 */
export const FormFieldRenderer = ({ fieldName, value, isEditMode = false, onImageChange }) => {
  // Check if value is an image object (has cloudinaryUrl or path)
  const isImageObject = (val) => {
    if (!val || typeof val !== 'object') return false;
    return !!(val.cloudinaryUrl || val.path || (val.url && val.url.startsWith('http')));
  };

  // Get image URL from various possible structures
  const getImageUrl = (val) => {
    if (typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:'))) {
      return val;
    }
    if (isImageObject(val)) {
      return val.cloudinaryUrl || val.path || val.url || '';
    }
    return null;
  };

  // Check if field contains images (for arrays like sellers, buyers, propertyPhotos)
  const isImageArray = (val) => {
    if (!Array.isArray(val)) return false;
    return val.length > 0 && (isImageObject(val[0]) || getImageUrl(val[0]));
  };

  // Check if field is an array of objects that might contain images (sellers, buyers, witnesses)
  const isObjectArrayWithImages = (val) => {
    if (!Array.isArray(val) || val.length === 0) return false;
    const firstItem = val[0];
    if (typeof firstItem !== 'object') return false;
    // Check if any property in the object is an image
    return Object.values(firstItem).some(v => isImageObject(v));
  };

  // Render single image
  const renderImage = (url, alt = 'Image', size = 'medium', imageFieldName = null) => {
    if (!url) return <span className="text-gray-400 italic">No image</span>;
    
    const sizeClasses = {
      small: 'w-24 h-24',
      medium: 'w-48 h-48',
      large: 'w-64 h-64',
      full: 'w-full'
    };

    const actualFieldName = imageFieldName || fieldName;

    return (
      <div className="relative inline-block">
        <img
          src={url}
          alt={alt}
          className={`${sizeClasses[size]} object-cover rounded-lg border border-gray-300 shadow-sm`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div style={{ display: 'none' }} className={`${sizeClasses[size]} flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300 text-gray-400 text-xs`}>
          Image not available
        </div>
        {isEditMode && onImageChange && (
          <button
            type="button"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) onImageChange(actualFieldName, file);
              };
              input.click();
            }}
            className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 shadow-lg"
            title="Replace image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  // Render image gallery (for propertyPhotos, livePhotos)
  const renderImageGallery = (images, title = 'Images') => {
    if (!Array.isArray(images) || images.length === 0) {
      return <span className="text-gray-400 italic">No {title.toLowerCase()}</span>;
    }

    return (
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">{title} ({images.length})</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => {
            const url = getImageUrl(img);
            return (
              <div key={index} className="relative">
                {renderImage(url, `${title} ${index + 1}`, 'medium')}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render object array with images (sellers, buyers, witnesses)
  const renderObjectArrayWithImages = (items, itemType = 'Item') => {
    if (!Array.isArray(items) || items.length === 0) {
      return <span className="text-gray-400 italic">No {itemType.toLowerCase()}s</span>;
    }

    return (
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-gray-900 mb-3">
              {itemType} {index + 1}: {item.name || `Unnamed ${itemType}`}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Text fields */}
              <div className="space-y-2">
                {Object.entries(item).map(([key, val]) => {
                  if (isImageObject(val)) return null; // Skip image fields here
                  if (key.startsWith('_')) return null;
                  return (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-gray-600">{key}:</span>{' '}
                      <span className="text-gray-900">{val || 'N/A'}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Image fields */}
              <div className="space-y-3">
                {item.photo && renderImage(getImageUrl(item.photo), `${itemType} Photo`, 'small', `${fieldName}[${index}].photo`)}
                {item.panCard && renderImage(getImageUrl(item.panCard), 'PAN Card', 'small', `${fieldName}[${index}].panCard`)}
                {item.id && renderImage(getImageUrl(item.id), 'ID Document', 'small', `${fieldName}[${index}].id`)}
                {item.signature && renderImage(getImageUrl(item.signature), 'Signature', 'small', `${fieldName}[${index}].signature`)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Handle null/undefined
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400 italic">Not provided</span>;
  }

  // Handle boolean
  if (typeof value === 'boolean') {
    return <span className={value ? 'text-green-600' : 'text-red-600'}>{value ? 'Yes' : 'No'}</span>;
  }

  // Check if field name suggests it's a property photo or live photo (even if flattened)
  const isPropertyPhotoField = fieldName.toLowerCase().includes('propertyphoto') || 
                               fieldName.toLowerCase().includes('property_photo');
  const isLivePhotoField = fieldName.toLowerCase().includes('livephoto') || 
                           fieldName.toLowerCase().includes('live_photo');

  // Handle image array (propertyPhotos, livePhotos) - check before flattening
  if (isImageArray(value)) {
    const fieldTitle = fieldName.replace(/([A-Z])/g, ' $1').replace(/\[(\d+)\]/g, ' $1').replace(/^./, str => str.toUpperCase());
    return renderImageGallery(value, fieldTitle);
  }

  // Handle object array with images (sellers, buyers, witnesses)
  if (isObjectArrayWithImages(value)) {
    const itemType = fieldName.replace(/s$/, '').replace(/([A-Z])/g, ' $1').replace(/\[(\d+)\]/g, ' $1').replace(/^./, str => str.toUpperCase());
    return renderObjectArrayWithImages(value, itemType);
  }

  // Handle single image object (including flattened propertyPhotos[0], livePhotos[0], etc.)
  if (isImageObject(value)) {
    const url = getImageUrl(value);
    if (url) {
      // Determine size based on field type
      const size = (isPropertyPhotoField || isLivePhotoField) ? 'medium' : 'medium';
      return renderImage(url, fieldName, size);
    }
  }

  // Handle string that might be a URL (including Cloudinary URLs)
  if (typeof value === 'string') {
    // Check if it's a Cloudinary URL or any image URL
    if (value.startsWith('http') && (value.includes('cloudinary') || value.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i))) {
      return renderImage(value, fieldName, isPropertyPhotoField || isLivePhotoField ? 'medium' : 'medium');
    }
    if (value.startsWith('data:')) {
      return renderImage(value, fieldName, 'medium');
    }
  }

  // Handle arrays (non-image)
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-400 italic">Empty array</span>;
    }
    return (
      <div className="space-y-1">
        {value.map((item, index) => (
          <div key={index} className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded">
            {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
          </div>
        ))}
      </div>
    );
  }

  // Handle objects (non-image)
  if (typeof value === 'object') {
    return (
      <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto max-h-64">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  // Handle primitive values
  return <span className="text-gray-900">{String(value)}</span>;
};

export default FormFieldRenderer;


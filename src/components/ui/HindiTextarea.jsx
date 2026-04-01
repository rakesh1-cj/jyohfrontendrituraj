"use client";

import React, { useState, useRef, useEffect } from 'react';
import { transliterateToHindi } from '@/utils/hindiTransliteration';

/**
 * HindiTextarea Component
 * Textarea field with Hindi transliteration support
 */
const HindiTextarea = ({
  value = '',
  onChange,
  onBlur,
  name,
  placeholder = '',
  className = '',
  disabled = false,
  enableHindi = false,
  rows = 3,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const textareaRef = useRef(null);
  const [isComposing, setIsComposing] = useState(false);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    if (enableHindi && !isComposing) {
      // Check if user is typing (adding characters) or deleting
      const isTyping = newValue.length >= localValue.length;
      
      if (isTyping) {
        // Get the text before and after cursor
        const beforeCursor = newValue.substring(0, cursorPosition);
        const afterCursor = newValue.substring(cursorPosition);
        
        // Split by spaces and newlines to get words
        const words = beforeCursor.split(/(\s+)/);
        const currentWord = words[words.length - 1];
        
        // Only transliterate the current word being typed
        if (/[a-zA-Z]/.test(currentWord)) {
          const transliteratedWord = transliterateToHindi(currentWord);
          
          // Rebuild the text with transliterated current word
          words[words.length - 1] = transliteratedWord;
          const transliteratedBefore = words.join('');
          const finalValue = transliteratedBefore + afterCursor;
          
          setLocalValue(finalValue);
          
          if (onChange) {
            onChange({
              target: {
                name,
                value: finalValue
              }
            });
          }

          // Restore cursor position
          setTimeout(() => {
            if (textareaRef.current) {
              const newCursorPos = transliteratedBefore.length;
              textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
          }, 0);
        } else {
          setLocalValue(newValue);
          if (onChange) {
            onChange(e);
          }
        }
      } else {
        // User is deleting, don't transliterate
        setLocalValue(newValue);
        if (onChange) {
          onChange(e);
        }
      }
    } else {
      setLocalValue(newValue);
      if (onChange) {
        onChange(e);
      }
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e) => {
    setIsComposing(false);
    if (enableHindi) {
      const transliterated = transliterateToHindi(e.target.value);
      setLocalValue(transliterated);
      if (onChange) {
        onChange({
          target: {
            name,
            value: transliterated
          }
        });
      }
    }
  };

  return (
    <textarea
      ref={textareaRef}
      name={name}
      value={localValue}
      onChange={handleInputChange}
      onBlur={onBlur}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      rows={rows}
      {...props}
    />
  );
};

export default HindiTextarea;

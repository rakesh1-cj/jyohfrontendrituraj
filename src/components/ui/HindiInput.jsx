"use client";

import React, { useState, useRef, useEffect } from 'react';
import { transliterateToHindi } from '@/utils/hindiTransliteration';

/**
 * HindiInput Component
 * Input field with Hindi transliteration support
 */
const HindiInput = ({
  value = '',
  onChange,
  onBlur,
  name,
  placeholder = '',
  className = '',
  disabled = false,
  enableHindi = false,
  type = 'text',
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef(null);
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
        
        // Split by spaces to get words
        const words = beforeCursor.split(' ');
        const currentWord = words[words.length - 1];
        
        // Only transliterate the current word being typed
        if (/[a-zA-Z]/.test(currentWord)) {
          const transliteratedWord = transliterateToHindi(currentWord);
          
          // Rebuild the text with transliterated current word
          words[words.length - 1] = transliteratedWord;
          const transliteratedBefore = words.join(' ');
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
            if (inputRef.current) {
              const newCursorPos = transliteratedBefore.length;
              inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
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
    <input
      ref={inputRef}
      type={type}
      name={name}
      value={localValue}
      onChange={handleInputChange}
      onBlur={onBlur}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      {...props}
    />
  );
};

export default HindiInput;

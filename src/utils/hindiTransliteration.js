/**
 * Hindi Transliteration Utility
 * Converts English text to Hindi (Devanagari script) using proper phonetic mapping with matras
 */

// Consonant mappings
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

// Vowel mappings (standalone)
const vowels = {
  'aa': 'आ', 'ai': 'ऐ', 'au': 'औ', 'ee': 'ई', 'oo': 'ऊ',
  'a': 'अ', 'e': 'ए', 'i': 'इ', 'o': 'ओ', 'u': 'उ'
};

// Matra mappings (vowel signs after consonants)
const matras = {
  'aa': 'ा', 'ai': 'ै', 'au': 'ौ', 'ee': 'ी', 'oo': 'ू',
  'a': '', 'e': 'े', 'i': 'ि', 'o': 'ो', 'u': 'ु'
};

/**
 * Transliterate English text to Hindi with proper matra usage
 * @param {string} text - English text to transliterate
 * @returns {string} - Hindi (Devanagari) text
 */
export function transliterateToHindi(text) {
  if (!text || typeof text !== 'string') return '';
  
  let result = '';
  let i = 0;
  const lowerText = text.toLowerCase();
  
  while (i < text.length) {
    let matched = false;
    
    // Skip spaces, numbers, and special characters
    if (/[\s0-9\.,\-\/\(\)\[\]\{\}]/.test(text[i])) {
      result += text[i];
      i++;
      continue;
    }
    
    // Try to match consonant clusters (3 chars, then 2 chars, then 1 char)
    for (let len = 3; len >= 1; len--) {
      if (i + len > text.length) continue;
      
      const chunk = lowerText.substring(i, i + len);
      
      if (consonants[chunk]) {
        // Found a consonant, now check for following vowel
        let vowelMatched = false;
        
        // Try to match vowel after consonant (2 chars, then 1 char)
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
        
        // If no vowel found after consonant, add halant (्) to make it half consonant
        // unless it's at the end or followed by space
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
    
    // If no consonant matched, try vowel
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
    
    // If nothing matched, keep the original character
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  
  return result;
}

/**
 * Check if text contains Hindi characters
 * @param {string} text - Text to check
 * @returns {boolean} - True if contains Hindi characters
 */
export function containsHindi(text) {
  if (!text) return false;
  // Devanagari Unicode range: U+0900 to U+097F
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Real-time transliteration handler for input events
 * @param {string} value - Current input value
 * @param {number} cursorPosition - Current cursor position
 * @returns {object} - { value: transliterated text, cursorPosition: new cursor position }
 */
export function handleTransliteration(value, cursorPosition) {
  if (!value) return { value: '', cursorPosition: 0 };
  
  // Get the text before and after cursor
  const beforeCursor = value.substring(0, cursorPosition);
  const afterCursor = value.substring(cursorPosition);
  
  // Transliterate the part before cursor
  const transliteratedBefore = transliterateToHindi(beforeCursor);
  const transliteratedAfter = transliterateToHindi(afterCursor);
  
  // Calculate new cursor position
  const newCursorPosition = transliteratedBefore.length;
  
  return {
    value: transliteratedBefore + transliteratedAfter,
    cursorPosition: newCursorPosition
  };
}

export default {
  transliterateToHindi,
  containsHindi,
  handleTransliteration
};

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Form labels
      name: 'Name',
      fatherName: "Father's Name",
      motherName: "Mother's Name",
      address: 'Address',
      city: 'City',
      state: 'State',
      pincode: 'Pincode',
      notes: 'Additional Notes',
      
      // Placeholders
      enterName: 'Enter your name',
      enterFatherName: "Enter father's name",
      enterMotherName: "Enter mother's name",
      enterAddress: 'Enter your complete address',
      enterCity: 'City',
      enterState: 'State',
      enterPincode: 'Enter pincode',
      enterNotes: 'Any additional information',
      
      // Buttons
      submit: 'Submit',
      clear: 'Clear',
      switchLanguage: 'Switch to Hindi',
      
      // Messages
      formTitle: 'Multilingual Form',
      formDescription: 'Fill out the form in English or Hindi',
      hindiModeActive: 'Hindi typing enabled - Type in English to get Hindi',
      numericFieldNote: 'Numeric fields don\'t use Hindi transliteration',
      
      // Validation
      required: 'This field is required',
      invalidPincode: 'Pincode must be 6 digits',
    }
  },
  hi: {
    translation: {
      // Form labels
      name: 'नाम',
      fatherName: 'पिता का नाम',
      motherName: 'माता का नाम',
      address: 'पता',
      city: 'शहर',
      state: 'राज्य',
      pincode: 'पिनकोड',
      notes: 'अतिरिक्त नोट्स',
      
      // Placeholders
      enterName: 'अपना नाम दर्ज करें',
      enterFatherName: 'पिता का नाम दर्ज करें',
      enterMotherName: 'माता का नाम दर्ज करें',
      enterAddress: 'अपना पूरा पता दर्ज करें',
      enterCity: 'शहर',
      enterState: 'राज्य',
      enterPincode: 'पिनकोड दर्ज करें',
      enterNotes: 'कोई अतिरिक्त जानकारी',
      
      // Buttons
      submit: 'जमा करें',
      clear: 'साफ़ करें',
      switchLanguage: 'अंग्रेजी में बदलें',
      
      // Messages
      formTitle: 'बहुभाषी फॉर्म',
      formDescription: 'फॉर्म को अंग्रेजी या हिंदी में भरें',
      hindiModeActive: 'हिंदी टाइपिंग सक्षम - अंग्रेजी में टाइप करें हिंदी पाने के लिए',
      numericFieldNote: 'संख्यात्मक फ़ील्ड हिंदी लिप्यंतरण का उपयोग नहीं करते',
      
      // Validation
      required: 'यह फ़ील्ड आवश्यक है',
      invalidPincode: 'पिनकोड 6 अंकों का होना चाहिए',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;

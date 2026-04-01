"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  // Check if current language starts with 'hi' or 'en' to handle variations like 'hi-IN' or 'en-US'
  const currentLang = i18n.language || 'en';
  const isHindi = currentLang.startsWith('hi');
  const isEnglish = currentLang.startsWith('en');

  // Show placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="language-selector flex items-center space-x-2">
        <span className="text-xs text-slate-300 font-medium hidden lg:inline">
          Language:
        </span>
        <div className="flex bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-lg overflow-hidden h-9">
          <button
            className="px-3 py-1 text-xs font-bold text-slate-300"
            disabled
          >
            हिंदी
          </button>
          <div className="w-[1px] bg-slate-600"></div>
          <button
            className="px-3 py-1 text-xs font-bold bg-amber-400 text-slate-900 shadow-inner"
            disabled
          >
            EN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="language-selector flex items-center space-x-2">
      <span className="text-xs text-slate-300 font-medium hidden lg:inline">
        {isHindi ? "भाषा:" : "Language:"}
      </span>
      <div className="flex bg-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-lg overflow-hidden h-9">
        <button
          onClick={() => handleLanguageChange("hi")}
          className={`px-3 py-1 text-xs font-bold transition-all duration-300 ${isHindi
              ? "bg-amber-400 text-slate-900 shadow-inner"
              : "text-slate-300 hover:bg-slate-600/50 hover:text-white"
            }`}
        >
          हिंदी
        </button>
        <div className="w-[1px] bg-slate-600"></div>
        <button
          onClick={() => handleLanguageChange("en")}
          className={`px-3 py-1 text-xs font-bold transition-all duration-300 ${isEnglish
              ? "bg-amber-400 text-slate-900 shadow-inner"
              : "text-slate-300 hover:bg-slate-600/50 hover:text-white"
            }`}
        >
          EN
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;

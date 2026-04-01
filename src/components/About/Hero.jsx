"use client"

import React from "react";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {t('about.hero.title')}
            <span className="block text-blue-600">{t('about.hero.subtitle')}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
            {t('about.hero.description')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;

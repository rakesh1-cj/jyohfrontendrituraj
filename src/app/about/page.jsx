"use client"

import React from "react";
import Navbar from "@/components/Navbar";
import FooterPage from "@/components/Footer";
import Hero from "@/components/About/Hero";
import Section from "@/components/About/Section";
import ReachUs from "@/components/About/ReachUs";
import { useTranslation } from "react-i18next";

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Who We Are Section */}
        <Section
          title={t('about.whoWeAre.title')}
          content={t('about.whoWeAre.content')}
          details={[
            t('about.whoWeAre.detail1'),
            t('about.whoWeAre.detail2')
          ]}
          icon="🏢"
          bgColor="bg-blue-50"
          iconColor="bg-blue-100"
          textColor="text-blue-600"
        />

        {/* Our Mission Section */}
        <Section
          title={t('about.mission.title')}
          content={t('about.mission.content')}
          details={[
            t('about.mission.detail1'),
            t('about.mission.detail2'),
            t('about.mission.detail3')
          ]}
          icon="🎯"
          bgColor="bg-green-50"
          iconColor="bg-green-100"
          textColor="text-green-600"
          reverse={true}
        />

        {/* What We Offer Section */}
        <Section
          title={t('about.offer.title')}
          subtitle={t('about.offer.subtitle')}
          content={t('about.offer.content')}
          features={[
            t('about.offer.feature1'),
            t('about.offer.feature2'),
            t('about.offer.feature3'),
            t('about.offer.feature4'),
            t('about.offer.feature5')
          ]}
          icon="⚡"
          bgColor="bg-purple-50"
          iconColor="bg-purple-100"
          textColor="text-purple-600"
        />

        {/* Why People Trust Us Section */}
        <Section
          title={t('about.trust.title')}
          features={[
            t('about.trust.feature1'),
            t('about.trust.feature2'),
            t('about.trust.feature3'),
            t('about.trust.feature4'),
            t('about.trust.feature5')
          ]}
          icon="🛡️"
          bgColor="bg-orange-50"
          iconColor="bg-orange-100"
          textColor="text-orange-600"
          reverse={true}
        />

        {/* Disclaimer Section */}
        <Section
          title={t('about.disclaimer.title')}
          content={t('about.disclaimer.content')}
          icon="⚠️"
          bgColor="bg-yellow-50"
          iconColor="bg-yellow-100"
          textColor="text-yellow-600"
          isDisclaimer={true}
        />
      </div>

      {/* Reach Us Section */}
      <ReachUs />

      {/* Footer */}
      <FooterPage />
    </div>
  );
};

export default AboutPage;

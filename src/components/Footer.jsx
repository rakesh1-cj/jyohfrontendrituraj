"use client";

import React from 'react'
import Link from 'next/link'
import { useTranslation } from "react-i18next";
import { AVAILABLE_FORMS } from "@/lib/constants/forms";

const FooterPage = () => {
  const { t } = useTranslation();

  // Helper to get localized form name
  const getLocalizedFormName = (form) => {
    const key = form.serviceType.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) + '.title';
    return t(key) !== key ? t(key) : form.displayName;
  };

  return (
    <>
      {/* Enhanced Professional Footer */}
      <footer className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F2A44 0%, #1E3A5F 30%, #2D4A6B 60%, #3C5A7D 100%)' }}>
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-400 rounded-full -translate-x-1/2 -translate-y-1/2 float-animation"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500 rounded-full translate-x-1/2 translate-y-1/2 float-reverse"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400 rounded-full -translate-x-1/2 -translate-y-1/2 morphing-shape" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='15' cy='15' r='1'/%3E%3Ccircle cx='45' cy='45' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'float 25s ease-in-out infinite'
          }}></div>
        </div>

        <div className="container mx-auto px-6 lg:px-16 py-20 relative z-10">
          {/* Enhanced Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Enhanced Company Section */}
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <img
                  className="w-16 h-16 object-contain hover:scale-110 transition-transform duration-300"
                  src="/jyoh_logo.png"
                  alt="Jyoh Logo"
                />
                <div>
                  <h3 className="text-white font-bold text-xl gradient-text">Legal Solutions</h3>
                  <p className="text-green-300 text-sm font-medium">Professional & Secure</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed text-base">
                {t('footer.tagline')} Streamlining legal documentation with cutting-edge technology and unmatched security.
              </p>
              
              {/* Enhanced Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-300 hover:text-green-400 transition-colors duration-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">support@legalsolutions.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300 hover:text-green-400 transition-colors duration-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-medium">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300 hover:text-green-400 transition-colors duration-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">New York, NY 10001</span>
                </div>
              </div>
            </div>

            {/* Enhanced Services Section */}
            <div className="space-y-6">
              <h6 className="text-white font-bold text-lg mb-6 flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {t('footer.services')}
              </h6>
              <div className="space-y-3">
                {AVAILABLE_FORMS.slice(0, 6).map((form, index) => (
                  <Link 
                    key={index} 
                    href={form.path} 
                    className="block text-gray-300 hover:text-green-400 transition-all duration-300 hover:translate-x-2 font-medium group"
                  >
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-green-400/60 group-hover:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {getLocalizedFormName(form)}
                    </span>
                  </Link>
                ))}
                {AVAILABLE_FORMS.length > 6 && (
                  <Link href="/services" className="block text-green-400 hover:text-green-300 transition-colors duration-300 font-semibold">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      View All Services
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Enhanced Company Section */}
            <div className="space-y-6">
              <h6 className="text-white font-bold text-lg mb-6 flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8h4M10 12h4m-4 4h4" />
                </svg>
                {t('footer.company')}
              </h6>
              <div className="space-y-3">
                <Link href="/about" className="block text-gray-300 hover:text-green-400 transition-all duration-300 hover:translate-x-2 font-medium group">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-400/60 group-hover:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {t('footer.about')}
                  </span>
                </Link>
                <Link href="/contact" className="block text-gray-300 hover:text-green-400 transition-all duration-300 hover:translate-x-2 font-medium group">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-400/60 group-hover:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {t('footer.contact')}
                  </span>
                </Link>
                <Link href="/user/login" className="block text-gray-300 hover:text-green-400 transition-all duration-300 hover:translate-x-2 font-medium group">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-400/60 group-hover:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {t('footer.userLogin')}
                  </span>
                </Link>
                <Link href="/agent/login" className="block text-gray-300 hover:text-green-400 transition-all duration-300 hover:translate-x-2 font-medium group">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-400/60 group-hover:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {t('footer.agentLogin')}
                  </span>
                </Link>
              </div>
            </div>

            {/* Enhanced Legal & Support Section */}
            <div className="space-y-6">
              <h6 className="text-white font-bold text-lg mb-6 flex items-center">
                <svg className="w-5 h-5 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {t('footer.legal')}
              </h6>
              <div className="space-y-3">
                <Link href="/terms-of-service" className="block text-gray-300 hover:text-green-400 transition-all duration-300 hover:translate-x-2 font-medium group">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-400/60 group-hover:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {t('footer.terms')}
                  </span>
                </Link>
                <Link href="/privacy-policy" className="block text-gray-300 hover:text-green-400 transition-all duration-300 hover:translate-x-2 font-medium group">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-400/60 group-hover:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {t('footer.privacy')}
                  </span>
                </Link>
                <Link href="/disclaimer" className="block text-gray-300 hover:text-green-400 transition-all duration-300 hover:translate-x-2 font-medium group">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-400/60 group-hover:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {t('footer.disclaimer')}
                  </span>
                </Link>
                <Link href="/contact" className="block text-gray-300 hover:text-green-400 transition-all duration-300 hover:translate-x-2 font-medium group">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-3 text-green-400/60 group-hover:text-green-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {t('footer.support')}
                  </span>
                </Link>
              </div>

              {/* Enhanced Security Badges */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <h6 className="text-white font-semibold text-sm">Security & Compliance</h6>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-green-300 text-xs font-semibold">SSL</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-blue-300 text-xs font-semibold">GDPR</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-purple-500/10 px-3 py-2 rounded-lg border border-purple-500/20">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-purple-300 text-xs font-semibold">ISO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Newsletter Section */}
          <div className="border-t border-white/10 pt-12 mb-12">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-white font-bold text-2xl mb-4">Stay Updated</h3>
              <p className="text-gray-300 mb-8">Get the latest updates on legal documentation and platform features.</p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-green-400 focus:bg-white/20 transition-all duration-300"
                />
                <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Footer */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-6 lg:px-16 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              {/* Enhanced Copyright */}
              <div className="flex items-center space-x-4">
                <img className="w-12 h-12 object-contain hover:scale-110 transition-transform duration-300" src="/jyoh_logo.png" alt="Jyoh Logo" />
                <div className="text-gray-300">
                  <p className="font-medium">
                    © 2024 {t('footer.copyright')}
                  </p>
                  <p className="text-sm text-gray-400">
                    All rights reserved. Made with ❤️ for legal professionals.
                  </p>
                </div>
              </div>

              {/* Enhanced Social Media Links */}
              <div className="flex items-center space-x-6">
                <span className="text-gray-400 text-sm font-medium">Follow us:</span>
                <div className="flex space-x-4">
                  <a href="#" className="group p-3 bg-white/10 rounded-xl hover:bg-green-500/20 transition-all duration-300 hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="fill-gray-300 group-hover:fill-green-400 transition-colors duration-300">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                    </svg>
                  </a>
                  <a href="#" className="group p-3 bg-white/10 rounded-xl hover:bg-red-500/20 transition-all duration-300 hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="fill-gray-300 group-hover:fill-red-400 transition-colors duration-300">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                    </svg>
                  </a>
                  <a href="#" className="group p-3 bg-white/10 rounded-xl hover:bg-blue-500/20 transition-all duration-300 hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="fill-gray-300 group-hover:fill-blue-400 transition-colors duration-300">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                    </svg>
                  </a>
                  <a href="#" className="group p-3 bg-white/10 rounded-xl hover:bg-blue-600/20 transition-all duration-300 hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="fill-gray-300 group-hover:fill-blue-500 transition-colors duration-300">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default FooterPage;
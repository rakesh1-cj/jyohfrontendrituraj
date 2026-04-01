"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AVAILABLE_FORMS } from "@/lib/constants/forms";

export default function HomePage() {
  const { t } = useTranslation();

  // Helper to get localized form name
  const getLocalizedFormName = (form) => {
    const key = form.serviceType.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) + '.title';
    return t(key) !== key ? t(key) : form.displayName;
  };

  return (
    <>
      <main className="min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
        {/* Hero Section - Ultra Enhanced */}
        <section className="relative overflow-hidden">
          <div
            className="min-h-screen flex items-center relative"
            style={{
              background: "linear-gradient(135deg, #0F2A44 0%, #1E3A5F 30%, #2D4A6B 60%, #3C5A7D 100%)",
            }}
          >
            {/* Enhanced Animated Background Pattern */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='15' cy='15' r='1'/%3E%3Ccircle cx='45' cy='45' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                animation: 'float 20s ease-in-out infinite'
              }}></div>
            </div>

            {/* Enhanced Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="particle absolute top-1/4 left-1/4 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-70 pulse-glow"></div>
              <div className="particle absolute top-1/3 right-1/4 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full opacity-50 heartbeat"></div>
              <div className="particle absolute bottom-1/4 left-1/3 w-2 h-2 bg-gradient-to-r from-emerald-300 to-green-400 rounded-full opacity-80 wiggle"></div>
              <div className="particle absolute bottom-1/3 right-1/3 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-60 bounce-in"></div>
              <div className="particle absolute top-1/2 left-1/5 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-50"></div>
            </div>

            {/* Geometric Shapes */}
            <div className="absolute inset-0">
              <div className="absolute top-20 right-20 w-16 h-16 border-2 border-green-400/30 rotate-45 float-animation"></div>
              <div className="absolute bottom-32 left-16 w-12 h-12 border-2 border-blue-400/30 rounded-full float-reverse"></div>
              <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-gradient-to-r from-emerald-400/20 to-green-500/20 rotate-12 morphing-shape"></div>
            </div>
            
            <div className="container mx-auto px-6 lg:px-16 py-20 relative z-10">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                {/* Left Content - Ultra Enhanced */}
                <div className="space-y-10 text-center lg:text-left">
                  <div className="space-y-8">
                    <div className="slide-in-left bounce-in inline-flex items-center px-8 py-4 glass-effect rounded-full text-white text-sm font-bold hover-glow hover-lift cursor-pointer">
                      <span className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mr-4 pulse-glow heartbeat"></span>
                      Trusted Financial & Legal Document Platform
                      <svg className="w-5 h-5 ml-3 wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    
                    <h1 className="slide-in-left stagger-2 text-5xl lg:text-8xl font-black text-white leading-tight glow-text">
                      <span className="block hover-rotate">Seamless Financial &</span>
                      <span className="block hover-lift" style={{ color: '#22C55E' }}>
                        Legal Solutions
                      </span>
                    </h1>
                    
                    <p className="slide-in-left stagger-3 text-xl lg:text-2xl text-gray-200 font-light leading-relaxed max-w-2xl">
                      Streamline your legal documentation process with our 
                      <span className="text-green-300 font-bold"> secure</span>, 
                      <span className="text-emerald-300 font-bold"> efficient</span>, and 
                      <span className="text-cyan-300 font-bold"> user-friendly</span> platform designed for modern financial and legal needs.
                    </p>
                  </div>
                  
                  <div className="slide-in-left stagger-4 flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                    <Link href="/user">
                      <button className="group relative px-12 py-6 bg-gradient-to-r from-green-500 via-emerald-600 to-green-700 text-white font-bold text-xl rounded-3xl shadow-2xl hover:shadow-green-500/30 transform hover:-translate-y-3 hover:scale-110 transition-all duration-700 overflow-hidden btn-ripple">
                        <span className="relative z-10 flex items-center">
                          Get Started Now
                          <svg className="w-6 h-6 ml-3 group-hover:translate-x-3 group-hover:rotate-12 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-700 to-green-800 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      </button>
                    </Link>
                    
                    <Link href="/about">
                      <button className="group px-12 py-6 glass-effect-dark text-white font-bold text-xl rounded-3xl border-2 border-white/40 hover:border-green-400/60 hover:bg-white/30 transition-all duration-500 backdrop-blur-custom hover-lift">
                        <span className="flex items-center">
                          Learn More
                          <svg className="w-6 h-6 ml-3 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </button>
                    </Link>
                  </div>
                  
                  {/* Ultra Enhanced Stats */}
                  <div className="slide-in-up stagger-5 grid grid-cols-3 gap-10 pt-10 border-t border-white/30">
                    <div className="text-center lg:text-left group hover-lift cursor-pointer">
                      <div className="text-5xl font-black text-white mb-2 gradient-text heartbeat">10K+</div>
                      <div className="text-gray-300 text-sm font-bold mb-3">Documents Created</div>
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1500 pulse-glow"></div>
                      </div>
                    </div>
                    <div className="text-center lg:text-left group hover-lift cursor-pointer">
                      <div className="text-5xl font-black text-white mb-2 gradient-text wiggle">99.9%</div>
                      <div className="text-gray-300 text-sm font-bold mb-3">Uptime</div>
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1500 delay-300 pulse-glow"></div>
                      </div>
                    </div>
                    <div className="text-center lg:text-left group hover-lift cursor-pointer">
                      <div className="text-5xl font-black text-white mb-2 gradient-text bounce-in">24/7</div>
                      <div className="text-gray-300 text-sm font-bold mb-3">Support</div>
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1500 delay-600 pulse-glow"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Content - Ultra Enhanced Hero Image */}
                <div className="slide-in-right relative">
                  <div className="relative z-10 group">
                    <div className="relative overflow-hidden rounded-3xl">
                      <img
                        src="/hero.jpg"
                        alt="Legal Documentation Platform"
                        className="w-full h-auto rounded-3xl shadow-2xl transform group-hover:scale-110 transition-transform duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-green-500/30 via-blue-500/20 to-purple-500/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                  
                  {/* Ultra Enhanced Floating Elements */}
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-3xl opacity-25 float-animation morphing-shape pulse-glow"></div>
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600 rounded-full opacity-25 float-reverse heartbeat"></div>
                  <div className="absolute top-1/4 -right-6 w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 rounded-2xl opacity-35 float-animation wiggle" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute bottom-1/4 -left-6 w-16 h-16 bg-gradient-to-br from-cyan-400 via-teal-500 to-cyan-600 rounded-full opacity-30 bounce-in" style={{ animationDelay: '1s' }}></div>
                  
                  {/* Enhanced Glowing Orbs */}
                  <div className="absolute top-16 left-16 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full pulse-glow heartbeat"></div>
                  <div className="absolute bottom-24 right-24 w-8 h-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full pulse-glow wiggle" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-8 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full pulse-glow bounce-in" style={{ animationDelay: '2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section - Ultra Enhanced */}
        <section className="py-32 relative overflow-hidden">
          {/* Ultra Enhanced Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-green-50"></div>
          <div className="absolute top-0 left-0 w-[30rem] h-[30rem] bg-gradient-to-br from-green-100/60 to-emerald-100/60 rounded-full -translate-x-1/2 -translate-y-1/2 float-animation morphing-shape"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-100/60 to-cyan-100/60 rounded-full translate-x-1/2 translate-y-1/2 float-reverse pulse-glow"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-100/40 to-pink-100/40 rounded-full float-animation heartbeat" style={{ animationDelay: '2s' }}></div>
          
          {/* Geometric Decorations */}
          <div className="absolute top-20 left-20 w-20 h-20 border-4 border-green-300/30 rotate-45 float-animation"></div>
          <div className="absolute bottom-32 right-32 w-16 h-16 border-4 border-blue-300/30 rounded-full wiggle"></div>
          
          <div className="container mx-auto px-6 lg:px-16 relative z-10">
            {/* Ultra Enhanced Section Header */}
            <div className="text-center mb-24">
              <div className="fade-in-scale bounce-in inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-100 via-emerald-100 to-green-200 text-green-800 rounded-full text-sm font-black mb-10 hover-glow hover-lift cursor-pointer">
                <svg className="w-6 h-6 mr-4 heartbeat" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Our Premium Services
                <div className="ml-4 w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full pulse-glow wiggle"></div>
              </div>
              
              <h2 className="slide-in-up text-5xl lg:text-7xl font-black mb-10 gradient-text glow-text" style={{ color: '#0F172A' }}>
                Complete Financial & Legal Solutions
              </h2>
              
              <p className="slide-in-up stagger-2 text-2xl text-gray-600 max-w-5xl mx-auto leading-relaxed">
                From property registration to business agreements, we provide 
                <span className="font-black text-green-600 glow-text"> comprehensive digital solutions</span> for all your financial and legal documentation needs with 
                <span className="font-black text-blue-600 glow-text"> enterprise-grade security</span>.
              </p>
              
              {/* Enhanced Decorative Line */}
              <div className="slide-in-up stagger-3 flex justify-center mt-10">
                <div className="w-32 h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-full pulse-glow"></div>
              </div>
            </div>

            {/* Ultra Enhanced Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {AVAILABLE_FORMS.map((form, index) => (
                <Link
                  key={index}
                  href={form.path}
                  className={`group relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-1000 border-2 border-gray-100 hover:border-green-300 transform hover:-translate-y-6 hover:rotate-2 hover:scale-105 fade-in-scale stagger-${(index % 6) + 1} btn-ripple`}
                >
                  {/* Ultra Enhanced Background Effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-cyan-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  {/* Enhanced Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 rounded-3xl"></div>
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-emerald-500/10 to-green-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                  
                  <div className="relative z-10">
                    {/* Ultra Enhanced Icon Container */}
                    <div className="relative w-24 h-24 bg-gradient-to-br from-green-100 via-emerald-200 to-green-300 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 shadow-xl pulse-glow">
                      {/* Custom SVG Icons based on form type */}
                      {form.serviceType === 'sale-deed' && (
                        <svg className="w-12 h-12 text-green-600 heartbeat" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      )}
                      {form.serviceType === 'will-deed' && (
                        <svg className="w-12 h-12 text-green-600 heartbeat" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {form.serviceType === 'trust-deed' && (
                        <svg className="w-12 h-12 text-green-600 heartbeat" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                      {form.serviceType === 'property-registration' && (
                        <svg className="w-12 h-12 text-green-600 heartbeat" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      )}
                      {form.serviceType === 'power-of-attorney' && (
                        <svg className="w-12 h-12 text-green-600 heartbeat" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                      {form.serviceType === 'adoption-deed' && (
                        <svg className="w-12 h-12 text-green-600 heartbeat" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      )}
                      {form.serviceType === 'property-sale-certificate' && (
                        <svg className="w-12 h-12 text-green-600 heartbeat" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      )}
                      {/* Default icon for any other form types */}
                      {!['sale-deed', 'will-deed', 'trust-deed', 'property-registration', 'power-of-attorney', 'adoption-deed', 'property-sale-certificate'].includes(form.serviceType) && (
                        <svg className="w-12 h-12 text-green-600 heartbeat" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500"></div>
                    </div>
                    
                    {/* Ultra Enhanced Content */}
                    <h3 className="text-2xl font-semibold mb-5 group-hover:text-green-600 transition-colors duration-500" style={{ color: '#0F172A' }}>
                      {getLocalizedFormName(form)}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-8 group-hover:text-gray-700 transition-colors duration-500">
                      {form.description}
                    </p>
                    
                    {/* Ultra Enhanced Action Area */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-600 font-black text-base group-hover:translate-x-3 group-hover:scale-110 transition-all duration-500">
                        <span>Get Started</span>
                        <svg className="w-5 h-5 ml-3 group-hover:translate-x-2 group-hover:rotate-12 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                      
                      {/* Enhanced Status Indicator */}
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full pulse-glow heartbeat"></div>
                        <span className="text-xs text-green-600 font-black">Available</span>
                      </div>
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="mt-6 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1200 pulse-glow"></div>
                    </div>
                  </div>
                  
                  {/* Enhanced Corner Accents */}
                  <div className="absolute top-6 right-6 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pulse-glow heartbeat"></div>
                  <div className="absolute bottom-6 left-6 w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pulse-glow wiggle"></div>
                </Link>
              ))}
            </div>
            
            {/* Enhanced Call to Action */}
            <div className="slide-in-up text-center mt-20">
              <p className="text-gray-600 mb-8 text-xl font-medium">Need a custom solution? We've got you covered.</p>
              <Link href="/contact">
                <button className="btn-primary px-12 py-6 rounded-3xl font-black text-xl shadow-2xl hover:shadow-green-500/30 btn-ripple">
                  Contact Our Experts
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
          {/* Enhanced Background Elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-60 float-animation morphing-shape"></div>
          <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full translate-x-1/2 translate-y-1/2 opacity-60 float-reverse"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-40 float-animation" style={{ animationDelay: '3s' }}></div>
          
          {/* Floating Particles */}
          <div className="absolute inset-0">
            <div className="particle absolute top-20 left-20 w-3 h-3 bg-green-300 rounded-full opacity-60"></div>
            <div className="particle absolute top-40 right-32 w-2 h-2 bg-blue-300 rounded-full opacity-50"></div>
            <div className="particle absolute bottom-32 left-40 w-4 h-4 bg-purple-300 rounded-full opacity-40"></div>
            <div className="particle absolute bottom-20 right-20 w-2 h-2 bg-emerald-300 rounded-full opacity-70"></div>
          </div>
          
          <div className="container mx-auto px-6 lg:px-16 relative z-10">
            {/* Enhanced Section Header */}
            <div className="text-center mb-24">
              <div className="fade-in-scale inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-bold mb-8 hover-glow">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Why Choose Us
                <div className="ml-3 w-2 h-2 bg-blue-500 rounded-full pulse-glow"></div>
              </div>
              
              <h2 className="slide-in-up text-4xl lg:text-6xl font-bold mb-8 gradient-text" style={{ color: '#0F172A' }}>
                Why Choose Our Platform?
              </h2>
              
              <p className="slide-in-up stagger-2 text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Experience the future of legal documentation with our 
                <span className="font-semibold text-green-600"> cutting-edge features</span> designed for 
                <span className="font-semibold text-blue-600"> efficiency</span>, 
                <span className="font-semibold text-purple-600"> security</span>, and 
                <span className="font-semibold text-emerald-600"> ease of use</span>.
              </p>
            </div>

            {/* Enhanced Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: "Lightning Fast Processing",
                  desc: "Generate legal documents in minutes, not hours. Our optimized system ensures rapid processing without compromising quality or accuracy.",
                  gradient: "from-yellow-400 to-orange-500",
                  bgGradient: "from-yellow-50 to-orange-50",
                  delay: "0s"
                },
                {
                  icon: (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: "Bank-Level Security",
                  desc: "Your sensitive legal documents are protected with enterprise-grade encryption and multi-layer security protocols trusted by financial institutions.",
                  gradient: "from-green-400 to-emerald-500",
                  bgGradient: "from-green-50 to-emerald-50",
                  delay: "0.2s"
                },
                {
                  icon: (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  ),
                  title: "Trusted by Thousands",
                  desc: "Join over 10,000+ satisfied users who trust our platform for their critical legal documentation needs with 99.9% satisfaction rate.",
                  gradient: "from-purple-400 to-pink-500",
                  bgGradient: "from-purple-50 to-pink-50",
                  delay: "0.4s"
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`group relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-700 border border-gray-100 hover:border-green-200 transform hover:-translate-y-6 hover:rotate-1 fade-in-scale`}
                  style={{ animationDelay: feature.delay }}
                >
                  {/* Enhanced Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-3xl"></div>
                  
                  <div className="relative z-10">
                    {/* Enhanced Icon Container */}
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl pulse-glow`}>
                      {feature.icon}
                      <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/* Enhanced Content */}
                    <h3 className="text-2xl font-bold mb-6 group-hover:text-green-600 transition-colors duration-300" style={{ color: '#0F172A' }}>
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg group-hover:text-gray-700 transition-colors duration-300">
                      {feature.desc}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mt-6 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${feature.gradient} rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000`} style={{ transitionDelay: '0.3s' }}></div>
                    </div>
                    
                    {/* Stats */}
                    <div className="mt-6 flex items-center justify-between text-sm">
                      <span className="text-gray-500 font-medium">Performance</span>
                      <span className="text-green-600 font-bold">99.9%</span>
                    </div>
                  </div>
                  
                  {/* Corner Accents */}
                  <div className="absolute top-6 right-6 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pulse-glow"></div>
                  <div className="absolute bottom-6 left-6 w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pulse-glow" style={{ animationDelay: '0.5s' }}></div>
                </div>
              ))}
            </div>
            
            {/* Trust Indicators */}
            <div className="slide-in-up mt-20 text-center">
              <p className="text-gray-600 mb-8 text-lg">Trusted by leading organizations worldwide</p>
              <div className="flex justify-center items-center space-x-12 opacity-60">
                <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 font-bold text-sm">LOGO</span>
                </div>
                <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 font-bold text-sm">LOGO</span>
                </div>
                <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 font-bold text-sm">LOGO</span>
                </div>
                <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 font-bold text-sm">LOGO</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-32 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F2A44 0%, #1E3A5F 50%, #2D4A6B 100%)' }}>
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute inset-0">
            <div className="particle absolute top-20 left-20 w-4 h-4 bg-green-400 rounded-full opacity-60"></div>
            <div className="particle absolute top-40 right-32 w-3 h-3 bg-blue-400 rounded-full opacity-50"></div>
            <div className="particle absolute bottom-32 left-40 w-5 h-5 bg-purple-400 rounded-full opacity-40"></div>
            <div className="particle absolute bottom-20 right-20 w-3 h-3 bg-emerald-400 rounded-full opacity-70"></div>
          </div>
          
          <div className="container mx-auto px-6 lg:px-16 text-center relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Enhanced Badge */}
              <div className="fade-in-scale inline-flex items-center px-6 py-3 glass-effect rounded-full text-white text-sm font-bold mb-8 hover-glow">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Start Your Legal Journey Today
                <div className="ml-3 w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
              </div>
              
              <h2 className="slide-in-up text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                Ready to Get 
                <span className="block gradient-text-hero">Started?</span>
              </h2>
              
              <p className="slide-in-up stagger-2 text-xl lg:text-2xl text-gray-200 mb-16 leading-relaxed max-w-4xl mx-auto">
                Join thousands of users who have streamlined their legal documentation process. 
                <span className="text-green-300 font-semibold"> Create your first document today</span> and experience the difference with our 
                <span className="text-emerald-300 font-semibold"> award-winning platform</span>.
              </p>
              
              {/* Enhanced Action Buttons */}
              <div className="slide-in-up stagger-3 flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Link href="/user/register">
                  <button className="group relative px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-3xl shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-3 hover:scale-105 transition-all duration-500 overflow-hidden">
                    <span className="relative z-10 flex items-center">
                      Create Free Account
                      <svg className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                  </button>
                </Link>
                
                <Link href="/contact">
                  <button className="group px-12 py-6 glass-effect text-white font-bold text-xl rounded-3xl border-2 border-white/30 hover:border-green-400/50 hover:bg-white/20 transition-all duration-500 backdrop-blur-custom">
                    <span className="flex items-center">
                      Contact Sales
                      <svg className="w-6 h-6 ml-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </span>
                  </button>
                </Link>
              </div>
              
              {/* Enhanced Trust Indicators */}
              <div className="slide-in-up stagger-4 space-y-6">
                <div className="flex flex-wrap justify-center items-center gap-8 text-gray-300 text-sm">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">No credit card required</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Free 14-day trial</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Cancel anytime</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">24/7 Support</span>
                  </div>
                </div>
                
                {/* Security Badges */}
                <div className="flex justify-center items-center space-x-8 pt-8 border-t border-white/10">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="font-semibold">SSL Secured</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="font-semibold">GDPR Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">ISO Certified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
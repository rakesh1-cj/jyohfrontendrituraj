"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "./Loading";
import Cookies from "js-cookie";
import Avatar from "./ui/Avatar";
import AgentAvatar from "./ui/AgentAvatar";
import { AVAILABLE_FORMS } from "@/lib/constants/forms";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const readAuth = () => {
      const authLS = typeof window !== 'undefined' ? localStorage.getItem("is_auth") : null;
      setIsAuth(!!authLS);
      const userRole = typeof window !== 'undefined' ? localStorage.getItem("role") : null;
      setRole(userRole);
    };
    readAuth();
    const onStorage = (e) => {
      if (e.key === 'is_auth' || e.key === 'role') readAuth();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
      localStorage.removeItem('is_auth');
    }
    setIsAuth(false);
    setRole(null);
    router.push('/');
  };

  // Helper to get localized form name
  const getLocalizedFormName = (form) => {
    const key = form.serviceType.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) + '.title';
    return t(key) !== key ? t(key) : form.displayName;
  };

  return (
    <>
      {isAuth === null && <Loading />}
      <div className="drawer sticky top-0" style={{ zIndex: 99998 }}>
        <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          {/* Enhanced Professional Navbar */}
          <nav className="glass-effect-dark shadow-2xl border-b border-green-500/20 backdrop-blur-sm relative navbar-container" style={{ background: 'linear-gradient(135deg, #0F2A44 0%, #1E3A5F 50%, #2D4A6B 100%)' }}>
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-32 h-32 bg-green-400 rounded-full -translate-x-1/2 -translate-y-1/2 float-animation"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-full translate-x-1/2 -translate-y-1/2 float-reverse"></div>
            </div>
            
            <div className="container mx-auto flex justify-between items-center py-6 px-6 relative z-10">
              {/* Enhanced Logo Section */}
              <div className="flex items-center space-x-6">
                <Link href={"/"} className="group">
                  <div className="flex items-center space-x-3">
                    <img
                      width="50"
                      height="50"
                      className="w-14 md:w-24 object-contain hover:scale-110 transition-all duration-500 group-hover:rotate-6"
                      src="/jyoh_logo.png"
                      alt="Jyoh Logo"
                    />
                    <div className="hidden lg:block">
                      <h1 className="text-white font-bold text-xl gradient-text">Legal Solutions</h1>
                      <p className="text-green-300 text-xs font-medium">Professional & Secure</p>
                    </div>
                  </div>
                </Link>
                <div className="hidden lg:block ml-6">
                  <LanguageSelector />
                </div>
              </div>

              {/* Enhanced Navbar Links for Desktop */}
              <div className="hidden md:flex space-x-10 items-center">
                <Link
                  href={"/"}
                  className="text-white hover:text-green-400 font-semibold transition-all duration-300 relative group hover-lift"
                >
                  <span className="relative flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>{t('navbar.home')}</span>
                    <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 group-hover:w-full transition-all duration-500 rounded-full"></span>
                  </span>
                </Link>
                
                <Link
                  href={"/about"}
                  className="text-white hover:text-green-400 font-semibold transition-all duration-300 relative group hover-lift"
                >
                  <span className="relative flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t('navbar.about')}</span>
                    <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 group-hover:w-full transition-all duration-500 rounded-full"></span>
                  </span>
                </Link>

                {/* Services Dropdown - JavaScript Controlled */}
                <div 
                  className="relative group"
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                >
                  <button className="text-white hover:text-green-400 font-semibold transition-all duration-300 relative hover-lift flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{t('navbar.services')}</span>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:w-full transition-all duration-500 rounded-full"></span>
                  </button>
                  
                  {/* Dropdown Menu - Always rendered, controlled by state */}
                  <div 
                    className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-slate-800 border border-green-500/20 rounded-2xl shadow-2xl transition-all duration-300 ${
                      isServicesOpen 
                        ? 'opacity-100 visible pointer-events-auto scale-100' 
                        : 'opacity-0 invisible pointer-events-none scale-95'
                    }`}
                    style={{ zIndex: 99999 }}
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    <div className="p-4 space-y-2">
                      {AVAILABLE_FORMS.map((form, index) => (
                        <Link
                          key={index}
                          href={form.path}
                          className="block text-white hover:text-green-400 hover:bg-green-500/10 rounded-xl px-4 py-3 transition-all duration-300"
                          onClick={() => setIsServicesOpen(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <span className="font-medium">{getLocalizedFormName(form)}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href={"/contact"}
                  className="text-white hover:text-green-400 font-semibold transition-all duration-300 relative group hover-lift"
                >
                  <span className="relative flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{t('navbar.contact')}</span>
                    <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 group-hover:w-full transition-all duration-500 rounded-full"></span>
                  </span>
                </Link>

                {/* Dashboard Links */}
                {isAuth && role === "user1" && (
                  <Link
                    href="/user/dashboard"
                    className="text-white hover:text-green-400 font-semibold transition-all duration-300 relative group hover-lift"
                  >
                    <span className="relative flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      <span>{t('navbar.userDashboard')}</span>
                      <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 group-hover:w-full transition-all duration-500 rounded-full"></span>
                    </span>
                  </Link>
                )}
                {isAuth && role === "user2" && (
                  <Link
                    href="/agent/dashboard"
                    className="text-white hover:text-green-400 font-semibold transition-all duration-300 relative group hover-lift"
                  >
                    <span className="relative flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      <span>{t('navbar.agentDashboard')}</span>
                      <span className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500 group-hover:w-full transition-all duration-500 rounded-full"></span>
                    </span>
                  </Link>
                )}
              </div>

              {/* Enhanced Right Section */}
              <div className="flex items-center space-x-6">
                <div className="md:hidden">
                  <LanguageSelector />
                </div>
                {isAuth ? (
                  <>
                    {/* Enhanced Profile Avatar with Dropdown */}
                    <div className="relative group">
                      <Link href={role === 'user1' ? "/user/profile" : role === 'user2' ? "/agent/profile" : role === 'admin' ? "/admin/dashboard" : `/${role}/dashboard`} className="text-white hover:text-green-400 transition-colors duration-300">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 pulse-glow">
                          {role === 'user1' ? <Avatar /> : <AgentAvatar />}
                        </div>
                      </Link>
                      {/* Enhanced Profile Dropdown */}
                      <div className="absolute right-0 top-full mt-4 w-56 glass-effect-dark border border-green-500/20 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="p-4">
                          <Link href={role === 'user1' ? "/user/profile" : role === 'user2' ? "/agent/profile" : "/"} className="flex items-center space-x-3 px-4 py-3 text-white hover:text-green-400 hover:bg-green-500/10 rounded-xl transition-all duration-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="font-medium">{t('navbar.viewProfile')}</span>
                          </Link>
                          <Link href={role === 'user1' ? "/user/dashboard" : role === 'user2' ? "/agent/dashboard" : role === 'admin' ? "/admin/dashboard" : `/${role}/dashboard`} className="flex items-center space-x-3 px-4 py-3 text-white hover:text-green-400 hover:bg-green-500/10 rounded-xl transition-all duration-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                            <span className="font-medium">{role === 'admin' ? t('navbar.adminPanel') : role.startsWith('staff') ? t('navbar.staffDashboard') : t('navbar.dashboard')}</span>
                          </Link>
                          <hr className="my-3 border-green-500/20" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 text-white hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 w-full"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="font-medium">{t('navbar.logout')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Enhanced Login Buttons */}
                    <div className="hidden sm:flex items-center space-x-4">
                      <div className="dropdown dropdown-hover">
                        <div tabIndex={0} role="button" className="glass-effect text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2 border-green-500/30 hover:border-green-400 hover:bg-green-500/10 text-sm md:text-base hover-lift">
                          {t('navbar.user')}
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu glass-effect-dark border border-green-500/20 rounded-xl z-[1] gap-2 p-4 shadow-2xl w-40 mt-2"
                        >
                          <Link href="/user/login">
                            <li>
                              <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold w-full hover-lift">
                                {t('navbar.login')}
                              </button>
                            </li>
                          </Link>
                          <Link href="/user/register">
                            <li>
                              <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold w-full hover-lift">
                                {t('navbar.signup')}
                              </button>
                            </li>
                          </Link>
                        </ul>
                      </div>
                      <div className="dropdown dropdown-hover">
                        <div tabIndex={0} role="button" className="glass-effect text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border-2 border-green-500/30 hover:border-green-400 hover:bg-green-500/10 text-sm md:text-base hover-lift">
                          {t('navbar.agent')}
                        </div>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu glass-effect-dark border border-green-500/20 rounded-xl z-[1] gap-2 p-4 shadow-2xl w-40 mt-2"
                        >
                          <Link href="/agent/login">
                            <li>
                              <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold w-full hover-lift">
                                {t('navbar.login')}
                              </button>
                            </li>
                          </Link>
                          <Link href="/agent/register">
                            <li>
                              <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold w-full hover-lift">
                                {t('navbar.signup')}
                              </button>
                            </li>
                          </Link>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
                {/* Enhanced Mobile Menu Toggle */}
                <div className="md:hidden">
                  <label
                    htmlFor="navbar-drawer"
                    className="cursor-pointer text-white hover:text-green-400 transition-colors duration-300 hover-lift"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16m-7 6h7"
                      />
                    </svg>
                  </label>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Enhanced Mobile Drawer */}
        <div className="drawer-side">
          <label htmlFor="navbar-drawer" className="drawer-overlay"></label>
          <ul className="menu p-8 w-full items-center space-y-4 min-h-full glass-effect-dark">
            <li>
              <Link
                href={"/"}
                onClick={() =>
                  (document.getElementById("navbar-drawer").checked = false)
                }
                className="text-white hover:text-green-400 hover:bg-green-500/10 rounded-xl px-6 py-4 transition-all duration-300 w-full text-center font-semibold"
              >
                {t('navbar.home')}
              </Link>
            </li>
            <li>
              <Link
                href={"/about"}
                onClick={() =>
                  (document.getElementById("navbar-drawer").checked = false)
                }
                className="text-white hover:text-green-400 hover:bg-green-500/10 rounded-xl px-6 py-4 transition-all duration-300 w-full text-center font-semibold"
              >
                {t('navbar.about')}
              </Link>
            </li>
            <li>
              <div className="dropdown relative w-full">
                <label
                  tabIndex={0}
                  className="cursor-pointer text-white hover:text-green-400 hover:bg-green-500/10 rounded-xl px-6 py-4 transition-all duration-300 w-full text-center block font-semibold"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {t('navbar.services')}
                </label>
                {isDropdownOpen && (
                  <ul
                    tabIndex={0}
                    className="menu p-4 shadow-2xl glass-effect-dark border border-green-500/20 rounded-xl w-full mt-2 space-y-2"
                  >
                    {AVAILABLE_FORMS.map((form, index) => (
                      <li key={index}>
                        <Link
                          href={form.path}
                          onClick={() =>
                          (document.getElementById(
                            "navbar-drawer"
                          ).checked = false)
                          }
                          className="text-white hover:text-green-400 hover:bg-green-500/10 rounded-lg px-4 py-3 transition-all duration-300 font-medium"
                        >
                          {getLocalizedFormName(form)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
            <li>
              <Link
                href={"/contact"}
                onClick={() =>
                  (document.getElementById("navbar-drawer").checked = false)
                }
                className="text-white hover:text-green-400 hover:bg-green-500/10 rounded-xl px-6 py-4 transition-all duration-300 w-full text-center font-semibold"
              >
                {t('navbar.contact')}
              </Link>
            </li>

            {/* Enhanced Login Links for Mobile */}
            {!isAuth && (
              <>
                <li className="w-full text-center text-green-300 text-sm font-bold uppercase mt-6">{t('navbar.user')}</li>
                <li><Link href="/user/login" className="w-full text-center text-white hover:text-green-400 font-semibold">{t('navbar.login')}</Link></li>
                <li><Link href="/user/register" className="w-full text-center text-white hover:text-green-400 font-semibold">{t('navbar.signup')}</Link></li>
                <li className="w-full text-center text-green-300 text-sm font-bold uppercase mt-4">{t('navbar.agent')}</li>
                <li><Link href="/agent/login" className="w-full text-center text-white hover:text-green-400 font-semibold">{t('navbar.login')}</Link></li>
                <li><Link href="/agent/register" className="w-full text-center text-white hover:text-green-400 font-semibold">{t('navbar.signup')}</Link></li>
              </>
            )}

            {/* Enhanced Dashboard Links for Mobile */}
            {isAuth && (
              <li>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:bg-red-500/10 rounded-xl px-6 py-4 transition-all duration-300 w-full text-center font-semibold"
                >
                  {t('navbar.logout')}
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Staff2Dashboard() {
  const [stats, setStats] = useState({
    pendingTrusteeVerification: 0,
    pendingAmountVerification: 0,
    completedVerifications: 0,
    formsCorrected: 0,
    workReportsSubmitted: 0,
    todayTasks: 0,
    weeklyProgress: 0
  });
  const [pendingForms, setPendingForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeaders, user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      // Fetch dashboard stats
      const statsResponse = await fetch(`${API_BASE}/api/staff/2/dashboard-stats`, {
        headers: getAuthHeaders()
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || stats);
      }

      // Fetch all pending forms (forms that need Staff2 verification - Staff2 has not worked on)
      // No limit specified to get all pending forms, or use a high limit
      const formsResponse = await fetch(`${API_BASE}/api/staff/2/forms?limit=100&page=1`, {
        headers: getAuthHeaders()
      });

      if (formsResponse.ok) {
        const formsData = await formsResponse.json();
        // Filter to ensure we only show forms where Staff2 has not approved
        const allPendingForms = (formsData.data?.forms || []).filter(form => 
          form.approvals?.staff2?.approved !== true
        );
        setPendingForms(allPendingForms);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: 'Forms Corrected',
      value: stats.formsCorrected,
      icon: '✏️',
      color: 'purple',
      href: '/staff2/forms'
    },
    {
      title: 'Work Reports',
      value: stats.workReportsSubmitted,
      icon: '📋',
      color: 'indigo',
      href: '/staff2/work-report'
    },
    {
      title: 'Today\'s Tasks',
      value: stats.todayTasks,
      icon: '📅',
      color: 'pink',
      href: '/staff2/forms'
    },
    {
      title: 'E-Stamp Application',
      value: 'New',
      icon: '📄',
      color: 'blue',
      href: '/staff2/e-stamp'
    },
    {
      title: 'Map Module',
      value: 'New',
      icon: '🗺️',
      color: 'blue',
      href: '/staff2/map-module'
    },
    {
      title: 'Final Approval',
      value: 'Pending',
      icon: '✅',
      color: 'green',
      href: '/staff2/final-approval'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      pink: 'bg-pink-50 text-pink-600 border-pink-200'
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Staff2 Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Staff2 Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {user?.name} - Trustee Details Validation</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Role</p>
                <p className="text-sm font-medium text-green-600">
                  STAFF2
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Description */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">👤</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Staff2 Responsibilities</h3>
              <p className="text-sm text-gray-600">
                Validate trustee information and details. Verify trustee identity, address, and other important details before proceeding.
                Also verify amount-related fields in forms for accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <Link
              key={index}
              href={card.href}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border-l-4 border-green-500"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(card.color)}`}>
                    <span className="text-2xl">{card.icon}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/staff2/work-report"
                className="flex items-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <span className="text-indigo-600 mr-3">📋</span>
                <span className="text-sm font-medium text-gray-900">Submit Work Report</span>
              </Link>
              <Link
                href="/staff2/e-stamp"
                className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="text-blue-600 mr-3">📄</span>
                <span className="text-sm font-medium text-gray-900">E-Stamp Application</span>
              </Link>
              <Link
                href="/staff2/map-module"
                className="flex items-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <span className="text-indigo-600 mr-3">🗺️</span>
                <span className="text-sm font-medium text-gray-900">Map Module</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Pending</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {pendingForms.length} {pendingForms.length === 1 ? 'form' : 'forms'} awaiting verification
                </p>
              </div>
              <Link
                href="/staff2/forms"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All →
              </Link>
            </div>
            {pendingForms.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingForms.map((form, index) => (
                  <Link
                    key={form._id || index}
                    href={`/staff2/forms/${form._id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {form.serviceType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || form.formType || 'Form'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {form.formattedFormId || form._id}
                        {form.userId?.name && ` • ${form.userId.name}`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ml-2 flex-shrink-0 ${
                      form.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                      form.status === 'verified' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {form.status === 'under_review' ? 'Pending' : form.status || 'Pending'}
                    </span>
                  </Link>
                ))}
                {pendingForms.length >= 100 && (
                  <div className="text-center pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Showing first 100 forms. <Link href="/staff2/forms" className="text-green-600 hover:text-green-700">View all pending forms →</Link>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No pending forms</p>
                <p className="text-xs text-gray-400 mt-1">All forms have been verified</p>
              </div>
            )}
          </div>
        </div>

        {/* Tools */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Staff2 Tools
            </h2>
            <p className="text-sm text-gray-500">
              Specialized tools for trustee validation and amount verification
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-sm">🔍</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Identity Verifier</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Verify trustee identity documents and cross-reference with official records.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📍</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Address Validator</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Validate trustee addresses and contact information for accuracy.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 text-sm">💰</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Amount Calculator</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Calculate and verify amount-related fields in forms.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-sm">📊</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Report Generator</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Generate detailed work reports for completed verifications.
                </p>
              </div>

              <Link href="/staff2/e-stamp" className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📄</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">E-Stamp Application</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Create and submit e-stamp applications with property and party details.
                </p>
              </Link>

              <Link href="/staff2/map-module" className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 text-sm">🗺️</span>
                  </div>
                  <h3 className="ml-3 text-sm font-medium text-gray-900">Map Module</h3>
                </div>
                <p className="text-xs text-gray-600">
                  Generate detailed property maps and built-up area reports with visual diagrams.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

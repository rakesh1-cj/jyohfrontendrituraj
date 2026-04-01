"use client";
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

export default function RegisterAppointmentPage() {
  const searchParams = useSearchParams();
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [modulePassword, setModulePassword] = useState('');
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const userFormId = searchParams?.get('userFormId') || null;
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(false);

  const [formData, setFormData] = useState({
    appointmentNumber: '',
    appointmentDate: '',
    appointmentTime: '',
    subRegistrarOfficeName: '',
    subRegistrarOfficeAddress: '',
    uploadedFile: null
  });
  const [filePreview, setFilePreview] = useState(null);

  React.useEffect(() => {
    const checkPermission = async () => {
      if (!userFormId) return;

      try {
        setCheckingPermission(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
        const response = await fetch(`${API_BASE}/api/staff/2/forms/${userFormId}`, {
          headers: getAuthHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          const form = data.data?.form;

          // Check Access Permissions
          if (form && form.staff2Access && form.staff2Access.registration === false) {
            setPermissionDenied(true);
          }
        }
      } catch (error) {
        console.error('Error checking permission:', error);
      } finally {
        setCheckingPermission(false);
      }
    };

    if (userFormId) {
      checkPermission();
    }
  }, [userFormId, getAuthHeaders]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifyError(null);
    if (!modulePassword.trim()) {
      setVerifyError('Please enter password');
      return;
    }

    try {
      setVerifying(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const res = await fetch(`${API_BASE}/api/staff/2/module-access/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ moduleKey: 'register-appointment', password: modulePassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid password');
      }
      setVerified(true);
    } catch (err) {
      setVerifyError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF or image file (JPEG, PNG)');
        return;
      }

      setFormData(prev => ({
        ...prev,
        uploadedFile: file
      }));

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.appointmentNumber.trim()) {
      toast.error('Appointment number is required');
      return;
    }
    if (!formData.appointmentDate) {
      toast.error('Appointment date is required');
      return;
    }
    if (!formData.appointmentTime) {
      toast.error('Appointment time is required');
      return;
    }
    if (!formData.subRegistrarOfficeName.trim()) {
      toast.error('Sub-Registrar Office name is required');
      return;
    }
    if (!formData.subRegistrarOfficeAddress.trim()) {
      toast.error('Sub-Registrar Office address is required');
      return;
    }
    if (!formData.uploadedFile) {
      toast.error('Please upload a file');
      return;
    }

    try {
      setLoading(true);

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('appointmentNumber', formData.appointmentNumber);
      submitData.append('appointmentDate', formData.appointmentDate);
      submitData.append('appointmentTime', formData.appointmentTime);
      submitData.append('subRegistrarOfficeName', formData.subRegistrarOfficeName);
      submitData.append('subRegistrarOfficeAddress', formData.subRegistrarOfficeAddress);
      submitData.append('file', formData.uploadedFile);
      submitData.append('modulePassword', modulePassword);
      // Add userFormId if available (from query params when accessed from form verification)
      if (userFormId) {
        submitData.append('userFormId', userFormId);
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const headers = getAuthHeaders();
      // Don't set Content-Type header - browser will set it with boundary for FormData
      delete headers['Content-Type'];

      const response = await fetch(`${API_BASE}/api/staff/2/appointments`, {
        method: 'POST',
        headers: headers,
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Appointment registered successfully!');
        // Reset form
        setFormData({
          appointmentNumber: '',
          appointmentDate: '',
          appointmentTime: '',
          subRegistrarOfficeName: '',
          subRegistrarOfficeAddress: '',
          uploadedFile: null
        });
        setFilePreview(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(data.message || 'Failed to register appointment');
      }
    } catch (error) {
      console.error('Error registering appointment:', error);
      toast.error(error.message || 'Failed to register appointment');
    } finally {
      setLoading(false);
    }
  };

  if (checkingPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-md border border-red-200 p-8 w-full max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-gray-700">
            You do not have permission to access the Registration Appointment module for this form (ID: {userFormId}).
            <br />
            Please contact Staff 1 for access.
          </p>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-md border p-6 w-full max-w-md">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Register Appointment Access</h1>
          <p className="text-sm text-gray-600 mb-4">
            Please enter the password provided by admin to access the Register Appointment module.
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Module Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                value={modulePassword}
                onChange={(e) => setModulePassword(e.target.value)}
              />
            </div>
            {verifyError && (
              <p className="text-sm text-red-600">{verifyError}</p>
            )}
            <button
              type="submit"
              disabled={verifying}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Register Appointment</h1>
          <p className="text-gray-600 mt-1">
            Register a new appointment with Sub-Registrar Office details
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Appointment Details</h2>
          <p className="text-sm text-gray-600 mt-1">
            Fill in all the required information to register the appointment
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Appointment Number */}
          <div>
            <label htmlFor="appointmentNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="appointmentNumber"
              name="appointmentNumber"
              value={formData.appointmentNumber}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter appointment number"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="appointmentTime"
                name="appointmentTime"
                value={formData.appointmentTime}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sub-Registrar Office Name */}
          <div>
            <label htmlFor="subRegistrarOfficeName" className="block text-sm font-medium text-gray-700 mb-2">
              Sub-Registrar Office Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subRegistrarOfficeName"
              name="subRegistrarOfficeName"
              value={formData.subRegistrarOfficeName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter Sub-Registrar Office name"
            />
          </div>

          {/* Sub-Registrar Office Address */}
          <div>
            <label htmlFor="subRegistrarOfficeAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Sub-Registrar Office Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="subRegistrarOfficeAddress"
              name="subRegistrarOfficeAddress"
              value={formData.subRegistrarOfficeAddress}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter Sub-Registrar Office address"
            />
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Upload File <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
              <div className="space-y-1 text-center w-full">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="sr-only"
                      required
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, PNG, JPG up to 10MB
                </p>
                {formData.uploadedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {formData.uploadedFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* File Preview */}
            {filePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Register Appointment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

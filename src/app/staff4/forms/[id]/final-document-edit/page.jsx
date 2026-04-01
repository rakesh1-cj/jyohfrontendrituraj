"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { translate, detectLanguage } from '@/utils/finalDocumentFieldTranslations';

export default function FinalDocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState(null);
  const [formInfo, setFormInfo] = useState(null);
  const [filePreviews, setFilePreviews] = useState({});
  const [filesToUpload, setFilesToUpload] = useState({});
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (params.id) {
      fetchFields();
    }
  }, [params.id]);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      // Fetch form info
      const formResponse = await fetch(`${API_BASE}/api/staff/4/forms/${params.id}`, {
        headers: getAuthHeaders()
      });
      
      if (formResponse.ok) {
        const formData = await formResponse.json();
        setFormInfo(formData.data.form);
      }

      // Fetch final document fields
      const fieldsResponse = await fetch(`${API_BASE}/api/staff/4/forms/${params.id}/final-document-fields`, {
        headers: getAuthHeaders()
      });

      if (fieldsResponse.ok) {
        const data = await fieldsResponse.json();
        setFields(data.data);
        // Detect language from fields
        const detectedLang = detectLanguage(data.data);
        setLanguage(detectedLang);
      } else {
        const errorData = await fieldsResponse.json();
        throw new Error(errorData.message || translate('failedToFetchFields', language));
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
      toast.error(error.message || translate('failedToLoadFinalDocumentFields', language));
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTransactionChange = (index, field, value) => {
    setFields(prev => {
      const transactions = [...(prev.paymentTransactions || [])];
      transactions[index] = {
        ...transactions[index],
        [field]: value
      };
      return {
        ...prev,
        paymentTransactions: transactions
      };
    });
  };

  const addTransaction = () => {
    setFields(prev => ({
      ...prev,
      paymentTransactions: [
        ...(prev.paymentTransactions || []),
        { amount: '', transactionType: 'IMPS', transactionNumber: '', date: '', bankName: '', accountNumber: '' }
      ]
    }));
  };

  const removeTransaction = (index) => {
    setFields(prev => ({
      ...prev,
      paymentTransactions: prev.paymentTransactions.filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (field, file) => {
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(translate('pleaseUploadJpegPng', language));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(translate('fileSizeLessThan5MB', language));
        return;
      }

      // Store file for upload
      setFilesToUpload(prev => ({
        ...prev,
        [field]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({
          ...prev,
          [field]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Append all field data as JSON
      const fieldsData = { ...fields };
      // Remove file objects from fieldsData (they'll be sent as files)
      delete fieldsData.vendorPhoto;
      delete fieldsData.vendorSignature;
      delete fieldsData.vendeePhoto;
      delete fieldsData.vendeeSignature;
      delete fieldsData.witness1Photo;
      delete fieldsData.witness1Signature;
      delete fieldsData.witness2Photo;
      delete fieldsData.witness2Signature;
      
      formData.append('data', JSON.stringify(fieldsData));
      
      // Append files if they exist
      if (filesToUpload.vendorPhoto) formData.append('vendorPhoto', filesToUpload.vendorPhoto);
      if (filesToUpload.vendorSignature) formData.append('vendorSignature', filesToUpload.vendorSignature);
      if (filesToUpload.vendeePhoto) formData.append('vendeePhoto', filesToUpload.vendeePhoto);
      if (filesToUpload.vendeeSignature) formData.append('vendeeSignature', filesToUpload.vendeeSignature);
      if (filesToUpload.witness1Photo) formData.append('witness1Photo', filesToUpload.witness1Photo);
      if (filesToUpload.witness1Signature) formData.append('witness1Signature', filesToUpload.witness1Signature);
      if (filesToUpload.witness2Photo) formData.append('witness2Photo', filesToUpload.witness2Photo);
      if (filesToUpload.witness2Signature) formData.append('witness2Signature', filesToUpload.witness2Signature);
      
      const headers = getAuthHeaders();
      // Don't set Content-Type - browser will set it with boundary for FormData
      delete headers['Content-Type'];
      
      const response = await fetch(`${API_BASE}/api/staff/4/forms/${params.id}/final-document-fields`, {
        method: 'PUT',
        headers: headers,
        body: formData
      });

      if (response.ok) {
        toast.success(translate('finalDocumentFieldsSavedSuccessfully', language));
        router.push(`/staff4/forms/${params.id}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || translate('failedToSaveFields', language));
      }
    } catch (error) {
      console.error('Error saving fields:', error);
      toast.error(error.message || translate('failedToSaveFinalDocumentFields', language));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{translate('loading', language)}</p>
        </div>
      </div>
    );
  }

  if (!fields) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{translate('failedToLoadFinalDocumentFieldsError', language)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{translate('pageTitle', language)}</h1>
          <p className="text-gray-600 mt-1">
            {formInfo?.formattedFormId && `${translate('formId', language)}: ${formInfo.formattedFormId}`}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/staff4/forms/${params.id}`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            {translate('cancel', language)}
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? translate('saving', language) : translate('saveChanges', language)}
          </button>
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-6">
        {/* Second Page Fields */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{translate('secondPageSummary', language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('valueAsPerCircleRate', language)}
              </label>
              <input
                type="text"
                value={fields.valueAsPerCircleRate || ''}
                onChange={(e) => handleFieldChange('valueAsPerCircleRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('totalSaleConsideration', language)}
              </label>
              <input
                type="text"
                value={fields.totalSaleConsideration || ''}
                onChange={(e) => handleFieldChange('totalSaleConsideration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('stampDutyPaid', language)}
              </label>
              <input
                type="text"
                value={fields.stampDutyPaid || ''}
                onChange={(e) => handleFieldChange('stampDutyPaid', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Brief Particular of Sale Deed */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{translate('briefParticular', language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('natureOfProperty', language)}
              </label>
              <input
                type="text"
                value={fields.natureOfProperty || ''}
                onChange={(e) => handleFieldChange('natureOfProperty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('landVCode', language)}
              </label>
              <input
                type="text"
                value={fields.landVCode || ''}
                onChange={(e) => handleFieldChange('landVCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('mohallaVillage', language)}
              </label>
              <input
                type="text"
                value={fields.mohallaVillage || ''}
                onChange={(e) => handleFieldChange('mohallaVillage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('propertyDescription', language)}
              </label>
              <textarea
                value={fields.propertyDescription || ''}
                onChange={(e) => handleFieldChange('propertyDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('detailOfProperty', language)}
              </label>
              <textarea
                value={fields.detailOfProperty || ''}
                onChange={(e) => handleFieldChange('detailOfProperty', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('superArea', language)}
              </label>
              <input
                type="text"
                value={fields.superArea || ''}
                onChange={(e) => handleFieldChange('superArea', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('reraCarpetArea', language)}
              </label>
              <input
                type="text"
                value={fields.reraCarpetArea || ''}
                onChange={(e) => handleFieldChange('reraCarpetArea', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('statusOfRoad', language)}
              </label>
              <input
                type="text"
                value={fields.statusOfRoad || ''}
                onChange={(e) => handleFieldChange('statusOfRoad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('parking', language)}
              </label>
              <input
                type="text"
                value={fields.parking || ''}
                onChange={(e) => handleFieldChange('parking', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('circleRate', language)}
              </label>
              <input
                type="text"
                value={fields.circleRate || ''}
                onChange={(e) => handleFieldChange('circleRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('loanFunding', language)}
              </label>
              <select
                value={fields.loanFunding || 'NO'}
                onChange={(e) => handleFieldChange('loanFunding', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('governmentOrder', language)}
              </label>
              <input
                type="text"
                value={fields.governmentOrder || ''}
                onChange={(e) => handleFieldChange('governmentOrder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Execution Details */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{translate('executionDetails', language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('executionDate', language)}
              </label>
              <input
                type="text"
                value={fields.executionDate || ''}
                onChange={(e) => handleFieldChange('executionDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder={translate('placeholderExecutionDate', language)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('executionPlace', language)}
              </label>
              <input
                type="text"
                value={fields.executionPlace || ''}
                onChange={(e) => handleFieldChange('executionPlace', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder={translate('placeholderExecutionPlace', language)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('executionYear', language)}
              </label>
              <input
                type="text"
                value={fields.executionYear || ''}
                onChange={(e) => handleFieldChange('executionYear', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder={translate('placeholderYear', language)}
              />
            </div>
          </div>
        </div>

        {/* Government Order and Execution Statement */}
        <div className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            {/* Government Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('governmentOrderNumber', language)}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">{translate('stampDutyPara', language)}</span>
                <input
                  type="text"
                  value={fields.governmentOrderNumber || ''}
                  onChange={(e) => handleFieldChange('governmentOrderNumber', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder={translate('placeholderGovOrderNo', language)}
                />
                <span className="text-sm text-gray-600 whitespace-nowrap">{translate('ofDated', language)}</span>
                <input
                  type="text"
                  value={fields.governmentOrderDate || ''}
                  onChange={(e) => handleFieldChange('governmentOrderDate', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder={translate('placeholderGovOrderDate', language)}
                />
              </div>
            </div>

            {/* Execution Statement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('executionStatement', language)}
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 whitespace-nowrap">{translate('saleDeedExecutionIntro', language)}</span>
                  <input
                    type="text"
                    value={fields.executionPlace || ''}
                    onChange={(e) => handleFieldChange('executionPlace', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder={translate('placeholderExecutionPlace', language)}
                  />
                  <span className="text-sm text-gray-600 whitespace-nowrap">{translate('onThis', language)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fields.executionDay || ''}
                    onChange={(e) => handleFieldChange('executionDay', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder={translate('placeholderDay', language)}
                  />
                  <span className="text-sm text-gray-600 whitespace-nowrap">{translate('dayOf', language)}</span>
                  <input
                    type="text"
                    value={fields.executionMonth || ''}
                    onChange={(e) => handleFieldChange('executionMonth', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder={translate('placeholderMonth', language)}
                  />
                  <span className="text-sm text-gray-600 whitespace-nowrap">{translate('ofYear', language)}</span>
                  <input
                    type="text"
                    value={fields.executionYearText || ''}
                    onChange={(e) => handleFieldChange('executionYearText', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder={translate('placeholderYear', language)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor/Seller Details */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{translate('sellerDetails', language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('name', language)}
              </label>
              <input
                type="text"
                value={fields.vendorName || ''}
                onChange={(e) => handleFieldChange('vendorName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('relation', language)}
              </label>
              <input
                type="text"
                value={fields.vendorRelation || ''}
                onChange={(e) => handleFieldChange('vendorRelation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder={translate('placeholderRelation', language)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('fatherName', language)}
              </label>
              <input
                type="text"
                value={fields.vendorFatherName || ''}
                onChange={(e) => handleFieldChange('vendorFatherName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('address', language)}
              </label>
              <textarea
                value={fields.vendorAddress || ''}
                onChange={(e) => handleFieldChange('vendorAddress', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('aadharNo', language)}
              </label>
              <input
                type="text"
                value={fields.vendorAadhar || ''}
                onChange={(e) => handleFieldChange('vendorAadhar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('panNo', language)}
              </label>
              <input
                type="text"
                value={fields.vendorPAN || ''}
                onChange={(e) => handleFieldChange('vendorPAN', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            {/* Vendor Photo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('vendorPhoto', language)} {fields.vendorPhoto?.cloudinaryUrl && !filePreviews.vendorPhoto && (
                  <span className="text-xs text-gray-500 font-normal">{translate('fromForm', language)}</span>
                )}
              </label>
              {(filePreviews.vendorPhoto || fields.vendorPhoto?.cloudinaryUrl) && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={filePreviews.vendorPhoto || fields.vendorPhoto?.cloudinaryUrl}
                      alt="Vendor Photo"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {filePreviews.vendorPhoto ? translate('newImage', language) : translate('currentImage', language)}
                      </p>
                      {fields.vendorPhoto?.filename && (
                        <p className="text-xs text-gray-500 mt-1">{fields.vendorPhoto.filename}</p>
                      )}
                    </div>
                    {filePreviews.vendorPhoto && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilePreviews(prev => {
                            const newPreviews = { ...prev };
                            delete newPreviews.vendorPhoto;
                            return newPreviews;
                          });
                          setFilesToUpload(prev => {
                            const newFiles = { ...prev };
                            delete newFiles.vendorPhoto;
                            return newFiles;
                          });
                          // Reset file input
                          const input = document.querySelector('input[type="file"][name*="vendorPhoto"]');
                          if (input) input.value = '';
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        {translate('cancel', language)}
                      </button>
                    )}
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileChange('vendorPhoto', e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {fields.vendorPhoto?.cloudinaryUrl ? translate('uploadToReplace', language) : translate('uploadPhoto', language)}
              </p>
            </div>
            
            {/* Vendor Signature */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('vendorSignature', language)} {fields.vendorSignature?.cloudinaryUrl && !filePreviews.vendorSignature && (
                  <span className="text-xs text-gray-500 font-normal">{translate('fromForm', language)}</span>
                )}
              </label>
              {(filePreviews.vendorSignature || fields.vendorSignature?.cloudinaryUrl) && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={filePreviews.vendorSignature || fields.vendorSignature?.cloudinaryUrl}
                      alt="Vendor Signature"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {filePreviews.vendorSignature ? translate('newImage', language) : translate('currentImage', language)}
                      </p>
                      {fields.vendorSignature?.filename && (
                        <p className="text-xs text-gray-500 mt-1">{fields.vendorSignature.filename}</p>
                      )}
                    </div>
                    {filePreviews.vendorSignature && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilePreviews(prev => {
                            const newPreviews = { ...prev };
                            delete newPreviews.vendorSignature;
                            return newPreviews;
                          });
                          setFilesToUpload(prev => {
                            const newFiles = { ...prev };
                            delete newFiles.vendorSignature;
                            return newFiles;
                          });
                          const input = document.querySelector('input[type="file"][name*="vendorSignature"]');
                          if (input) input.value = '';
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        {translate('cancel', language)}
                      </button>
                    )}
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileChange('vendorSignature', e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {fields.vendorSignature?.cloudinaryUrl ? translate('uploadToReplace', language) : translate('uploadSignature', language)}
              </p>
            </div>       <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Signature {fields.vendorSignature?.cloudinaryUrl && !filePreviews.vendorSignature && (
                  <span className="text-xs text-gray-500 font-normal">(from form)</span>
                )}
              </label>
              {(filePreviews.vendorSignature || fields.vendorSignature?.cloudinaryUrl) && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={filePreviews.vendorSignature || fields.vendorSignature?.cloudinaryUrl}
                      alt="Vendor Signature"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {filePreviews.vendorSignature ? 'New image selected' : 'Current image from form'}
                      </p>
                      {fields.vendorSignature?.filename && (
                        <p className="text-xs text-gray-500 mt-1">{fields.vendorSignature.filename}</p>
                      )}
                    </div>
                    {filePreviews.vendorSignature && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilePreviews(prev => {
                            const newPreviews = { ...prev };
                            delete newPreviews.vendorSignature;
                            return newPreviews;
                          });
                          setFilesToUpload(prev => {
                            const newFiles = { ...prev };
                            delete newFiles.vendorSignature;
                            return newFiles;
                          });
                          const input = document.querySelector('input[type="file"][name*="vendorSignature"]');
                          if (input) input.value = '';
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileChange('vendorSignature', e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {fields.vendorSignature?.cloudinaryUrl ? 'Upload a new file to replace the current image' : 'Upload vendor signature'}
              </p>
            </div>
          </div>
        </div>

        {/* Vendor Property Purchase Statement */}
        <div className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translate('vendorPropertyPurchaseDetails', language)}
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-600 whitespace-nowrap">{translate('vendorPropertyPurchaseIntro', language)}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{translate('companyName', language)}</label>
                    <input
                      type="text"
                      value={fields.vendorPropertyPurchaseCompanyName || ''}
                      onChange={(e) => handleFieldChange('vendorPropertyPurchaseCompanyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder={translate('placeholderCompanyName', language)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{translate('corporateId', language)}</label>
                    <input
                      type="text"
                      value={fields.vendorPropertyPurchaseCorporateId || ''}
                      onChange={(e) => handleFieldChange('vendorPropertyPurchaseCorporateId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder={translate('placeholderCorporateId', language)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">{translate('registeredOffice', language)}</label>
                    <input
                      type="text"
                      value={fields.vendorPropertyPurchaseRegdOffice || ''}
                      onChange={(e) => handleFieldChange('vendorPropertyPurchaseRegdOffice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder={translate('placeholderRegdOffice', language)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">{translate('corporateOffice', language)}</label>
                    <input
                      type="text"
                      value={fields.vendorPropertyPurchaseCorporateOffice || ''}
                      onChange={(e) => handleFieldChange('vendorPropertyPurchaseCorporateOffice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder={translate('placeholderCorporateOffice', language)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">{translate('throughRegisteredSaleDeed', language)}</span>
                    <input
                      type="text"
                      value={fields.vendorPropertyPurchaseBookNo || ''}
                      onChange={(e) => handleFieldChange('vendorPropertyPurchaseBookNo', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">{translate('volume', language)}</span>
                    <input
                      type="text"
                      value={fields.vendorPropertyPurchaseVolume || ''}
                      onChange={(e) => handleFieldChange('vendorPropertyPurchaseVolume', e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="3054"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">{translate('onPageNo', language)}</span>
                    <input
                      type="text"
                      value={fields.vendorPropertyPurchasePageFrom || ''}
                      onChange={(e) => handleFieldChange('vendorPropertyPurchasePageFrom', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="379"
                    />
                    <span className="text-sm text-gray-600 whitespace-nowrap">{translate('to', language)}</span>
                    <input
                      type="text"
                      value={fields.vendorPropertyPurchasePageTo || ''}
                      onChange={(e) => handleFieldChange('vendorPropertyPurchasePageTo', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="434"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">{translate('documentNo', language)}</span>
                    <input
                      type="text"
                      value={fields.vendorPropertyPurchaseDocumentNo || ''}
                      onChange={(e) => handleFieldChange('vendorPropertyPurchaseDocumentNo', e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="14871"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">{translate('onDated', language)}</span>
                    <input
                      type="text"
                      value={fields.vendorPropertyPurchaseDate || ''}
                      onChange={(e) => handleFieldChange('vendorPropertyPurchaseDate', e.target.value)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="29/11/2021"
                    />
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">{translate('inOfficeOfSubRegistrar', language)}</span>
                    <input
                      type="text"
                      value={fields.vendorPropertyPurchaseSubRegistrar || ''}
                      onChange={(e) => handleFieldChange('vendorPropertyPurchaseSubRegistrar', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder={translate('placeholderSubRegistrar', language)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vendee/Buyer Details */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{translate('buyerDetails', language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('name', language)}
              </label>
              <input
                type="text"
                value={fields.vendeeName || ''}
                onChange={(e) => handleFieldChange('vendeeName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('relation', language)}
              </label>
              <input
                type="text"
                value={fields.vendeeRelation || ''}
                onChange={(e) => handleFieldChange('vendeeRelation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder={translate('placeholderRelation', language)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('fatherName', language)}
              </label>
              <input
                type="text"
                value={fields.vendeeFatherName || ''}
                onChange={(e) => handleFieldChange('vendeeFatherName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('address', language)}
              </label>
              <textarea
                value={fields.vendeeAddress || ''}
                onChange={(e) => handleFieldChange('vendeeAddress', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('aadharNo', language)}
              </label>
              <input
                type="text"
                value={fields.vendeeAadhar || ''}
                onChange={(e) => handleFieldChange('vendeeAadhar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('panNo', language)}
              </label>
              <input
                type="text"
                value={fields.vendeePAN || ''}
                onChange={(e) => handleFieldChange('vendeePAN', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            {/* Vendee Photo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('vendeePhoto', language)} {fields.vendeePhoto?.cloudinaryUrl && !filePreviews.vendeePhoto && (
                  <span className="text-xs text-gray-500 font-normal">{translate('fromForm', language)}</span>
                )}
              </label>
              {(filePreviews.vendeePhoto || fields.vendeePhoto?.cloudinaryUrl) && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={filePreviews.vendeePhoto || fields.vendeePhoto?.cloudinaryUrl}
                      alt="Vendee Photo"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {filePreviews.vendeePhoto ? translate('newImage', language) : translate('currentImage', language)}
                      </p>
                      {fields.vendeePhoto?.filename && (
                        <p className="text-xs text-gray-500 mt-1">{fields.vendeePhoto.filename}</p>
                      )}
                    </div>
                    {filePreviews.vendeePhoto && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilePreviews(prev => {
                            const newPreviews = { ...prev };
                            delete newPreviews.vendeePhoto;
                            return newPreviews;
                          });
                          setFilesToUpload(prev => {
                            const newFiles = { ...prev };
                            delete newFiles.vendeePhoto;
                            return newFiles;
                          });
                          const input = document.querySelector('input[type="file"][name*="vendeePhoto"]');
                          if (input) input.value = '';
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        {translate('cancel', language)}
                      </button>
                    )}
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileChange('vendeePhoto', e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {fields.vendeePhoto?.cloudinaryUrl ? translate('uploadToReplace', language) : translate('uploadPhoto', language)}
              </p>
            </div>
            
            {/* Vendee Signature */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {translate('vendeeSignature', language)} {fields.vendeeSignature?.cloudinaryUrl && !filePreviews.vendeeSignature && (
                  <span className="text-xs text-gray-500 font-normal">{translate('fromForm', language)}</span>
                )}
              </label>
              {(filePreviews.vendeeSignature || fields.vendeeSignature?.cloudinaryUrl) && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={filePreviews.vendeeSignature || fields.vendeeSignature?.cloudinaryUrl}
                      alt="Vendee Signature"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">
                        {filePreviews.vendeeSignature ? translate('newImage', language) : translate('currentImage', language)}
                      </p>
                      {fields.vendeeSignature?.filename && (
                        <p className="text-xs text-gray-500 mt-1">{fields.vendeeSignature.filename}</p>
                      )}
                    </div>
                    {filePreviews.vendeeSignature && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilePreviews(prev => {
                            const newPreviews = { ...prev };
                            delete newPreviews.vendeeSignature;
                            return newPreviews;
                          });
                          setFilesToUpload(prev => {
                            const newFiles = { ...prev };
                            delete newFiles.vendeeSignature;
                            return newFiles;
                          });
                          const input = document.querySelector('input[type="file"][name*="vendeeSignature"]');
                          if (input) input.value = '';
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        {translate('cancel', language)}
                      </button>
                    )}
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileChange('vendeeSignature', e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {fields.vendeeSignature?.cloudinaryUrl ? translate('uploadToReplace', language) : translate('uploadSignature', language)}
              </p>
            </div>
          </div>
        </div>

        {/* Party Expression Statement */}
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-700 leading-relaxed">
            {translate('partyExpressionStatement', language)}
          </p>
        </div>

        {/* Payment Transactions */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{translate('paymentTransactions', language)}</h2>
            <button
              onClick={addTransaction}
              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              {translate('addTransaction', language)}
            </button>
          </div>
          <div className="space-y-4">
            {(fields.paymentTransactions || []).map((transaction, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-700">{translate('transaction', language)} {index + 1}</h3>
                  <button
                    onClick={() => removeTransaction(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    {translate('remove', language)}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translate('amount', language)}
                    </label>
                    <input
                      type="text"
                      value={transaction.amount || ''}
                      onChange={(e) => handleTransactionChange(index, 'amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translate('type', language)}
                    </label>
                    <select
                      value={transaction.transactionType || 'IMPS'}
                      onChange={(e) => handleTransactionChange(index, 'transactionType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="UTR">UTR</option>
                      <option value="IMPS">IMPS</option>
                      <option value="DD">DD</option>
                      <option value="Loan">Loan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translate('transactionNumber', language)}
                    </label>
                    <input
                      type="text"
                      value={transaction.transactionNumber || ''}
                      onChange={(e) => handleTransactionChange(index, 'transactionNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translate('date', language)}
                    </label>
                    <input
                      type="text"
                      value={transaction.date || ''}
                      onChange={(e) => handleTransactionChange(index, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translate('bankName', language)}
                    </label>
                    <input
                      type="text"
                      value={transaction.bankName || ''}
                      onChange={(e) => handleTransactionChange(index, 'bankName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translate('accountNumber', language)}
                    </label>
                    <input
                      type="text"
                      value={transaction.accountNumber || ''}
                      onChange={(e) => handleTransactionChange(index, 'accountNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details of Property and Sale Deed Clauses */}
        <div className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            {/* Details of Property */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">{translate('detailsOfProperty', language)}:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-700">{translate('detailsOfPropertyIntro', language)}</span>
                  <input
                    type="text"
                    value={fields.totalSaleConsideration || ''}
                    onChange={(e) => handleFieldChange('totalSaleConsideration', e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder={translate('placeholderSaleConsideration', language)}
                  />
                  <span className="text-sm text-gray-700">{translate('detailsOfPropertyEnd', language)}</span>
                </div>
              </div>
            </div>

            {/* NOW THEREFORE section */}
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">{translate('nowThereforeWitnesseth', language)}</p>
            </div>

            {/* Clauses 1-8 (Fixed text) */}
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>1.</strong> {translate('clause1', language)}</p>
              <p><strong>2.</strong> {translate('clause2', language)}</p>
              <p><strong>3.</strong> {translate('clause3', language)}</p>
              <p><strong>4.</strong> {translate('clause4', language)}</p>
              <p><strong>5.</strong> {translate('clause5', language)}</p>
              <p><strong>6.</strong> {translate('clause6', language)}</p>
              <p><strong>7.</strong> {translate('clause7', language)}</p>
              <p><strong>8.</strong> {translate('clause8', language)}</p>
            </div>

            {/* Clause 9 - Payment Transactions */}
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="text-sm text-gray-700"><strong>9.</strong> {translate('clause9Intro', language)}</span>
                <input
                  type="text"
                  value={fields.totalSaleConsideration || ''}
                  onChange={(e) => handleFieldChange('totalSaleConsideration', e.target.value)}
                  className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  placeholder={translate('placeholderSaleConsideration', language)}
                />
                <span className="text-sm text-gray-700">{translate('clause9End', language)}</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{translate('paymentTransactionsNote', language)}</p>
            </div>

            {/* Clause 10 */}
            <div>
              <p className="text-sm text-gray-700"><strong>10.</strong> {translate('clause10', language)}</p>
            </div>

            {/* IN WITNESS WHEREOF */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-700 mb-4">{translate('inWitnessWhereof', language)}</p>
              <div className="flex justify-between items-end mt-8">
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 w-48 mb-2"></div>
                  <p className="text-sm font-semibold text-gray-700">{translate('vendor', language)}</p>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 w-48 mb-2"></div>
                  <p className="text-sm font-semibold text-gray-700">{translate('vendee', language)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Witness Details */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{translate('witnessDetails', language)}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Witness 1 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">{translate('witness1', language)}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('name', language)}
                  </label>
                  <input
                    type="text"
                    value={fields.witness1Name || ''}
                    onChange={(e) => handleFieldChange('witness1Name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('relation', language)}
                  </label>
                  <input
                    type="text"
                    value={fields.witness1Relation || ''}
                    onChange={(e) => handleFieldChange('witness1Relation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('fatherName', language)}
                  </label>
                  <input
                    type="text"
                    value={fields.witness1FatherName || ''}
                    onChange={(e) => handleFieldChange('witness1FatherName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('address', language)}
                  </label>
                  <textarea
                    value={fields.witness1Address || ''}
                    onChange={(e) => handleFieldChange('witness1Address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('aadharNo', language)}
                  </label>
                  <input
                    type="text"
                    value={fields.witness1Aadhar || ''}
                    onChange={(e) => handleFieldChange('witness1Aadhar', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* Witness 1 Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('witness1Photo', language)} {fields.witness1Photo?.cloudinaryUrl && !filePreviews.witness1Photo && (
                      <span className="text-xs text-gray-500 font-normal">{translate('fromForm', language)}</span>
                    )}
                  </label>
                  {(filePreviews.witness1Photo || fields.witness1Photo?.cloudinaryUrl) && (
                    <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <img
                          src={filePreviews.witness1Photo || fields.witness1Photo?.cloudinaryUrl}
                          alt="Witness 1 Photo"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">
                            {filePreviews.witness1Photo ? translate('newImageShort', language) : translate('fromFormShort', language)}
                          </p>
                        </div>
                        {filePreviews.witness1Photo && (
                          <button
                            type="button"
                            onClick={() => {
                              setFilePreviews(prev => {
                                const newPreviews = { ...prev };
                                delete newPreviews.witness1Photo;
                                return newPreviews;
                              });
                              setFilesToUpload(prev => {
                                const newFiles = { ...prev };
                                delete newFiles.witness1Photo;
                                return newFiles;
                              });
                              const input = document.querySelector('input[type="file"][name*="witness1Photo"]');
                              if (input) input.value = '';
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            {translate('cancel', language)}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange('witness1Photo', e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fields.witness1Photo?.cloudinaryUrl ? translate('uploadToReplaceShort', language) : translate('uploadPhoto', language)}
                  </p>
                </div>
                
                {/* Witness 1 Signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('witness1Signature', language)} {fields.witness1Signature?.cloudinaryUrl && !filePreviews.witness1Signature && (
                      <span className="text-xs text-gray-500 font-normal">{translate('fromForm', language)}</span>
                    )}
                  </label>
                  {(filePreviews.witness1Signature || fields.witness1Signature?.cloudinaryUrl) && (
                    <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <img
                          src={filePreviews.witness1Signature || fields.witness1Signature?.cloudinaryUrl}
                          alt="Witness 1 Signature"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">
                            {filePreviews.witness1Signature ? translate('newImageShort', language) : translate('fromFormShort', language)}
                          </p>
                        </div>
                        {filePreviews.witness1Signature && (
                          <button
                            type="button"
                            onClick={() => {
                              setFilePreviews(prev => {
                                const newPreviews = { ...prev };
                                delete newPreviews.witness1Signature;
                                return newPreviews;
                              });
                              setFilesToUpload(prev => {
                                const newFiles = { ...prev };
                                delete newFiles.witness1Signature;
                                return newFiles;
                              });
                              const input = document.querySelector('input[type="file"][name*="witness1Signature"]');
                              if (input) input.value = '';
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            {translate('cancel', language)}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange('witness1Signature', e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fields.witness1Signature?.cloudinaryUrl ? translate('uploadToReplaceShort', language) : translate('uploadSignature', language)}
                  </p>
                </div>
              </div>
            </div>

            {/* Witness 2 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">{translate('witness2', language)}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('name', language)}
                  </label>
                  <input
                    type="text"
                    value={fields.witness2Name || ''}
                    onChange={(e) => handleFieldChange('witness2Name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('relation', language)}
                  </label>
                  <input
                    type="text"
                    value={fields.witness2Relation || ''}
                    onChange={(e) => handleFieldChange('witness2Relation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('fatherName', language)}
                  </label>
                  <input
                    type="text"
                    value={fields.witness2FatherName || ''}
                    onChange={(e) => handleFieldChange('witness2FatherName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('address', language)}
                  </label>
                  <textarea
                    value={fields.witness2Address || ''}
                    onChange={(e) => handleFieldChange('witness2Address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('aadharNo', language)}
                  </label>
                  <input
                    type="text"
                    value={fields.witness2Aadhar || ''}
                    onChange={(e) => handleFieldChange('witness2Aadhar', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                {/* Witness 2 Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('witness2Photo', language)} {fields.witness2Photo?.cloudinaryUrl && !filePreviews.witness2Photo && (
                      <span className="text-xs text-gray-500 font-normal">{translate('fromForm', language)}</span>
                    )}
                  </label>
                  {(filePreviews.witness2Photo || fields.witness2Photo?.cloudinaryUrl) && (
                    <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <img
                          src={filePreviews.witness2Photo || fields.witness2Photo?.cloudinaryUrl}
                          alt="Witness 2 Photo"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">
                            {filePreviews.witness2Photo ? translate('newImageShort', language) : translate('fromFormShort', language)}
                          </p>
                        </div>
                        {filePreviews.witness2Photo && (
                          <button
                            type="button"
                            onClick={() => {
                              setFilePreviews(prev => {
                                const newPreviews = { ...prev };
                                delete newPreviews.witness2Photo;
                                return newPreviews;
                              });
                              setFilesToUpload(prev => {
                                const newFiles = { ...prev };
                                delete newFiles.witness2Photo;
                                return newFiles;
                              });
                              const input = document.querySelector('input[type="file"][name*="witness2Photo"]');
                              if (input) input.value = '';
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            {translate('cancel', language)}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange('witness2Photo', e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fields.witness2Photo?.cloudinaryUrl ? translate('uploadToReplaceShort', language) : translate('uploadPhoto', language)}
                  </p>
                </div>
                
                {/* Witness 2 Signature */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translate('witness2Signature', language)} {fields.witness2Signature?.cloudinaryUrl && !filePreviews.witness2Signature && (
                      <span className="text-xs text-gray-500 font-normal">{translate('fromForm', language)}</span>
                    )}
                  </label>
                  {(filePreviews.witness2Signature || fields.witness2Signature?.cloudinaryUrl) && (
                    <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <img
                          src={filePreviews.witness2Signature || fields.witness2Signature?.cloudinaryUrl}
                          alt="Witness 2 Signature"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-600">
                            {filePreviews.witness2Signature ? translate('newImageShort', language) : translate('fromFormShort', language)}
                          </p>
                        </div>
                        {filePreviews.witness2Signature && (
                          <button
                            type="button"
                            onClick={() => {
                              setFilePreviews(prev => {
                                const newPreviews = { ...prev };
                                delete newPreviews.witness2Signature;
                                return newPreviews;
                              });
                              setFilesToUpload(prev => {
                                const newFiles = { ...prev };
                                delete newFiles.witness2Signature;
                                return newFiles;
                              });
                              const input = document.querySelector('input[type="file"][name*="witness2Signature"]');
                              if (input) input.value = '';
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            {translate('cancel', language)}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange('witness2Signature', e.target.files[0])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {fields.witness2Signature?.cloudinaryUrl ? translate('uploadToReplaceShort', language) : translate('uploadSignature', language)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deed Writer Details */}
        <div className="bg-white rounded-lg border p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translate('draftedStatement', language)}
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-700 whitespace-nowrap">{translate('draftedOn', language)}</span>
                  <input
                    type="text"
                    value={fields.draftedDate || ''}
                    onChange={(e) => handleFieldChange('draftedDate', e.target.value)}
                    className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder={translate('placeholderExecutionDate', language)}
                  />
                  <span className="text-sm text-gray-700 whitespace-nowrap">{translate('byDeedWriter', language)}</span>
                  <input
                    type="text"
                    value={fields.deedWriterChamberNo || ''}
                    onChange={(e) => handleFieldChange('deedWriterChamberNo', e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder={translate('placeholderChamberNo', language)}
                  />
                  <span className="text-sm text-gray-700 whitespace-nowrap">{translate('tehsil', language)}</span>
                  <input
                    type="text"
                    value={fields.deedWriterTehsil || ''}
                    onChange={(e) => handleFieldChange('deedWriterTehsil', e.target.value)}
                    className="flex-1 min-w-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder={translate('placeholderTehsil', language)}
                  />
                  <span className="text-sm text-gray-700">,</span>
                  <input
                    type="text"
                    value={fields.deedWriterDistrict || ''}
                    onChange={(e) => handleFieldChange('deedWriterDistrict', e.target.value)}
                    className="flex-1 min-w-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder={translate('placeholderDistrict', language)}
                  />
                  <span className="text-sm text-gray-700">.</span>
                  <input
                    type="text"
                    value={fields.deedWriterState || ''}
                    onChange={(e) => handleFieldChange('deedWriterState', e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder={translate('placeholderState', language)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


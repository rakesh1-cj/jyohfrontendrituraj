"use client";
import React, { useState, useEffect } from 'react';
import { getAuthHeaders } from '@/lib/utils/authHeaders';
import { useTranslation } from 'react-i18next';

const EStampApplication = ({ modulePassword = '', userFormId }) => {
  const userFormIdFromQuery = userFormId || null;
  const { t, i18n } = useTranslation();
  const language = i18n.language || 'hi';

  const [formData, setFormData] = useState({
    article: '',
    property: '',
    consideredPrice: '',
    amount: '',
    f_name: '',
    f_gender: '',
    f_mobile: '',
    f_email: '',
    f_pan: '',
    f_aad: '',
    f_addr: '',
    s_name: '',
    s_gender: '',
    s_mobile: '',
    s_email: '',
    s_pan: '',
    s_aad: '',
    s_addr: '',
    paid_by: '',
    purchased_by: 'mejyoh',
    purchased_by_other: '',
    declaration: false
  });

  // Separate state for stamp details to support multiple sections
  const [stampDetails, setStampDetails] = useState([{
    stampNumber: '',
    stampIssueDate: '',
    stampAmount: '',
    stampFile: null
  }]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    propertyDocuments: [],
    firstParty: { photo: null, aadhaar: null, pan: null },
    secondParty: { photo: null, aadhaar: null, pan: null },
    stampFile: null
  });
  const [previewImages, setPreviewImages] = useState({});
  const [linkedForm, setLinkedForm] = useState(null);
  const [linkedFormLoading, setLinkedFormLoading] = useState(false);
  const [linkedFormError, setLinkedFormError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Load linked form details when opened with userFormId (from Staff2 forms)
  useEffect(() => {
    const fetchLinkedForm = async () => {
      if (!userFormIdFromQuery) {
        setLinkedForm(null);
        setLinkedFormError(null);
        return;
      }

      try {
        setLinkedFormLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
        const response = await fetch(`${API_BASE}/api/staff/2/forms/${userFormIdFromQuery}`, {
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Failed to load linked form details');
        }

        const data = await response.json();
        const form = data.data?.form || null;
        setLinkedForm(form);
        setLinkedFormError(null);

        // Check Access Permissions - Allow if the form is already approved by Staff 1
        // OR if specific access is granted. Only deny if specifically excluded while NOT approved.
        const isStaff1Approved = form?.approvals?.staff1?.approved === true;
        
        if (form && form.staff2Access && form.staff2Access.eStamp === false && !isStaff1Approved) {
          setPermissionDenied(true);
          setLinkedFormLoading(false);
          return;
        }

        // Auto-fill basic details from the linked form into the e-Stamp form
        if (form) {
          const allFields = form.allFields || {};
          const verificationData = form.verificationData || {};
          const firstSeller = (verificationData.sellers && verificationData.sellers[0]) || {};
          const firstBuyer = (verificationData.buyers && verificationData.buyers[0]) || {};

          setFormData(prev => ({
            ...prev,
            // Property description
            property: prev.property || allFields.propertyAddress || allFields.propertyLocation || allFields.propertyDescription || '',
            // Considered price and stamp amount
            consideredPrice: prev.consideredPrice || allFields.salePrice || allFields.consideredPrice || allFields.amount || '',
            amount: prev.amount || (form.paymentInfo?.paymentAmount ?? allFields.stampDuty ?? ''),
            // First party from seller
            f_name: prev.f_name || firstSeller.name || '',
            f_mobile: prev.f_mobile || firstSeller.mobile || firstSeller.phone || '',
            f_email: prev.f_email || firstSeller.email || '',
            f_addr: prev.f_addr || firstSeller.address || '',
            // Second party from buyer
            s_name: prev.s_name || firstBuyer.name || '',
            s_mobile: prev.s_mobile || firstBuyer.mobile || firstBuyer.phone || '',
            s_email: prev.s_email || firstBuyer.email || '',
            s_addr: prev.s_addr || firstBuyer.address || ''
          }));
        }
      } catch (error) {
        console.error('Error loading linked form for e-Stamp:', error);
        setLinkedFormError(error.message || 'Unable to load linked form details');
      } finally {
        setLinkedFormLoading(false);
      }
    };

    fetchLinkedForm();
  }, [userFormIdFromQuery]);

  // Debug: Log when showPreview changes
  useEffect(() => {
    console.log('showPreview state changed to:', showPreview);
  }, [showPreview]);

  // Number to words conversion
  const numberToWordsEn = (num) => {
    num = Math.floor(Number(num) || 0);
    if (num === 0) return 'Zero Rupees Only';
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + inWords(n % 100) : '');
      return '';
    };

    let rem = num;
    let out = '';
    const crore = Math.floor(rem / 10000000);
    if (crore) { out += inWords(crore) + ' crore '; rem %= 10000000; }
    const lakh = Math.floor(rem / 100000);
    if (lakh) { out += inWords(lakh) + ' lakh '; rem %= 100000; }
    const thousand = Math.floor(rem / 1000);
    if (thousand) { out += inWords(thousand) + ' thousand '; rem %= 1000; }
    if (rem) out += inWords(rem);
    return out.trim().replace(/\s+/g, ' ') + ' Rupees Only';
  };

  const numberToWordsHi = (num) => {
    const eng = numberToWordsEn(num).toLowerCase();
    const map = {
      'crore': 'करोड़', 'lakh': 'लाख', 'thousand': 'हज़ार', 'hundred': 'सौ', 'and': 'और', 'zero': 'शून्य',
      'one': 'एक', 'two': 'दो', 'three': 'तीन', 'four': 'चार', 'five': 'पाँच', 'six': 'छह', 'seven': 'सात', 'eight': 'आठ', 'nine': 'नौ', 'ten': 'दस',
      'eleven': 'ग्यारह', 'twelve': 'बारह', 'thirteen': 'तेरह', 'fourteen': 'चौदह', 'fifteen': 'पंद्रह', 'sixteen': 'सोलह', 'seventeen': 'सत्रह', 'eighteen': 'अठारह', 'nineteen': 'उन्नीस',
      'twenty': 'बीस', 'thirty': 'तीस', 'forty': 'चालीस', 'fifty': 'पचास', 'sixty': 'साठ', 'seventy': 'सत्तर', 'eighty': 'अस्सी', 'ninety': 'नब्बे'
    };
    let out = eng;
    Object.keys(map).forEach(k => {
      out = out.replace(new RegExp('\\b' + k + '\\b', 'g'), map[k]);
    });
    out = out.charAt(0).toUpperCase() + out.slice(1);
    return out + ' मात्र';
  };

  // Validation functions
  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidMobile = (v) => /^\+?\d{7,15}$/.test(v);
  const isValidPAN = (v) => /^[A-Z]{5}\d{4}[A-Z]$/.test(v);
  const isValidAadhaar = (v) => /^\d{12}$/.test(v);

  const validateForm = () => {
    const newErrors = {};

    const f_name = String(formData.f_name || '').trim();
    const s_name = String(formData.s_name || '').trim();
    const property = String(formData.property || '').trim();
    const amountVal = String(formData.amount || '').replace(/,/g, '');
    const amount = parseFloat(amountVal);
    const consideredVal = String(formData.consideredPrice || '').replace(/,/g, '');
    const considered = parseFloat(consideredVal);

    // Basic required fields
    if (!formData.article) newErrors.article = 'Please select article/type.';
    if (!property) newErrors.property = 'Please enter property description.';
    if (isNaN(amount) || amount <= 0) newErrors.amount = 'Please enter valid amount.';
    if (f_name.length < 3) newErrors.f_name = 'Enter first party name (min 3 chars).';
    if (s_name.length < 3) newErrors.s_name = 'Enter second party name (min 3 chars).';
    if (!formData.paid_by) newErrors.paid_by = 'Select payer.';
    if (!formData.declaration) newErrors.declaration = 'Please accept the declaration.';

    // Payer mobile mandatory based on who pays
    if (formData.paid_by === 'first' && !isValidMobile(formData.f_mobile)) {
      newErrors.f_mobile = 'First party mobile required and must be valid.';
    }
    if (formData.paid_by === 'second' && !isValidMobile(formData.s_mobile)) {
      newErrors.s_mobile = 'Second party mobile required and must be valid.';
    }
    if (formData.paid_by === 'both' && (!isValidMobile(formData.f_mobile) || !isValidMobile(formData.s_mobile))) {
      newErrors.f_mobile = 'First party mobile required.';
      newErrors.s_mobile = 'Second party mobile required.';
    }

    // PAN conditional requirement when amount >= 200000
    if (amount >= 200000) {
      if (formData.paid_by === 'first' && !isValidPAN(formData.f_pan)) {
        newErrors.f_pan = 'First party PAN is required for amount >= ₹2,00,000.';
      }
      if (formData.paid_by === 'second' && !isValidPAN(formData.s_pan)) {
        newErrors.s_pan = 'Second party PAN is required for amount >= ₹2,00,000.';
      }
      if (formData.paid_by === 'both' && (!isValidPAN(formData.f_pan) || !isValidPAN(formData.s_pan))) {
        if (!isValidPAN(formData.f_pan)) newErrors.f_pan = 'First party PAN required.';
        if (!isValidPAN(formData.s_pan)) newErrors.s_pan = 'Second party PAN required.';
      }
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('handleChange called:', { name, value, type, checked });
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      console.log('Updated formData:', updated);
      return updated;
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle stamp details array changes
  const handleStampDetailChange = (index, field, value) => {
    setStampDetails(prev => prev.map((detail, i) => 
      i === index ? { ...detail, [field]: value } : detail
    ));
  };

  // Add new stamp detail section
  const addStampDetail = () => {
    setStampDetails(prev => [...prev, {
      stampNumber: '',
      stampIssueDate: '',
      stampAmount: '',
      stampFile: null
    }]);
  };

  // Remove stamp detail section
  const removeStampDetail = (index) => {
    if (stampDetails.length > 1) {
      setStampDetails(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Handle stamp file upload
  const handleStampFileChange = (index, file) => {
    if (!file) return;
    
    setStampDetails(prev => prev.map((detail, i) => 
      i === index ? { ...detail, stampFile: file } : detail
    ));

    // Update preview images
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImages(prev => ({ 
        ...prev, 
        [`stampFile_${index}`]: reader.result 
      }));
    };
    reader.readAsDataURL(file);
  };

  const handlePANInput = (e) => {
    e.target.value = e.target.value.toUpperCase();
    handleChange(e);
  };

  // Dynamic options for paid_by and purchased_by
  const getPaidByOptions = () => {
    const fName = formData.f_name.trim() || 'First Party';
    const sName = formData.s_name.trim() || 'Second Party';
    return [
      { value: '', label: 'Select' },
      { value: 'first', label: fName },
      { value: 'second', label: sName },
      { value: 'both', label: t('eStamp.both') }
    ];
  };

  const getPurchasedByOptions = () => {
    const fName = formData.f_name.trim() || 'First Party';
    const sName = formData.s_name.trim() || 'Second Party';
    return [
      { value: 'mejyoh', label: t('eStamp.purchasedDefault') },
      { value: 'first', label: fName },
      { value: 'second', label: sName },
      { value: 'others', label: t('eStamp.others') }
    ];
  };

  const preparePreview = () => {
    console.log('preparePreview called, setting showPreview to true');
    setShowPreview(true);
    console.log('showPreview state should now be true');
  };

  // File upload handlers
  const handleFileChange = (category, field, file, index = null) => {
    if (!file) return;

    const previewKey = index !== null ? `${category}_${field}_${index}` : `${category}_${field}`;
    let previewUrl = null;

    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
      setPreviewImages(prev => ({
        ...prev,
        [previewKey]: previewUrl
      }));
    }

    if (category === 'propertyDocuments') {
      setUploadedFiles(prev => ({
        ...prev,
        propertyDocuments: [...prev.propertyDocuments, {
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          preview: previewUrl
        }]
      }));
    } else {
      setUploadedFiles(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: file
        }
      }));
    }
  };

  const removeFile = (category, field, fileId = null) => {
    if (category === 'propertyDocuments') {
      const fileToRemove = uploadedFiles.propertyDocuments.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      setUploadedFiles(prev => ({
        ...prev,
        propertyDocuments: prev.propertyDocuments.filter(f => f.id !== fileId)
      }));
      const previewKey = `propertyDocuments_${fileId}`;
      setPreviewImages(prev => {
        const newPrev = { ...prev };
        delete newPrev[previewKey];
        return newPrev;
      });
    } else {
      const previewKey = `${category}_${field}`;
      if (previewImages[previewKey]) {
        URL.revokeObjectURL(previewImages[previewKey]);
        setPreviewImages(prev => {
          const newPrev = { ...prev };
          delete newPrev[previewKey];
          return newPrev;
        });
      }
      setUploadedFiles(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: null
        }
      }));
    }
  };

  const handleSubmit = (e) => {
    console.log('EStamp handleSubmit called');
    if (e) e.preventDefault();
    console.log('Current formData:', {
      article: formData.article,
      property: formData.property,
      amount: formData.amount,
      f_name: formData.f_name,
      s_name: formData.s_name,
      paid_by: formData.paid_by,
      declaration: formData.declaration
    });
    const newErrors = validateForm();
    console.log('Validation result - errors count:', Object.keys(newErrors).length);
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      setErrors(newErrors);
      alert('Please fill all required fields correctly.');
      return;
    }
    console.log('Validation passed! Opening preview...');
    console.log('Current showPreview state:', showPreview);
    preparePreview();
  };

  const confirmSubmit = async () => {
    console.log('EStamp confirmSubmit called');
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      setErrors(newErrors);
      alert('Please correct the highlighted fields before submitting.');
      setShowPreview(false);
      return;
    }

    console.log('Starting submission...');
    setIsSubmitting(true);
    try {
      const amount = Number(formData.amount) || 0;
      const considered = Number(formData.consideredPrice) || 0;

      const payload = {
        article: formData.article,
        property: formData.property,
        consideredPrice: considered,
        amount: amount,
        amountWordsEn: numberToWordsEn(amount),
        amountWordsHi: numberToWordsHi(amount),
        parentFormFormattedId: linkedForm?.formattedFormId || null,
        firstParty: {
          name: formData.f_name,
          gender: formData.f_gender,
          mobile: formData.f_mobile,
          email: formData.f_email,
          pan: formData.f_pan.toUpperCase(),
          aadhaar: formData.f_aad,
          address: formData.f_addr
        },
        secondParty: {
          name: formData.s_name,
          gender: formData.s_gender,
          mobile: formData.s_mobile,
          email: formData.s_email,
          pan: formData.s_pan.toUpperCase(),
          aadhaar: formData.s_aad,
          address: formData.s_addr
        },
        paidBy: formData.paid_by,
        purchasedBy: formData.purchased_by === 'mejyoh'
          ? t('eStamp.purchasedDefault')
          : formData.purchased_by === 'first'
            ? formData.f_name
            : formData.purchased_by === 'second'
              ? formData.s_name
              : formData.purchased_by === 'others'
                ? formData.purchased_by_other
                : '',
        stampDetails: stampDetails
      };

      // Create FormData for file uploads
      const formDataToSend = new FormData();

      // Add JSON payload
      formDataToSend.append('data', JSON.stringify(payload));

      // If opened from Staff2 for a specific form, link to that formId
      if (userFormIdFromQuery) {
        formDataToSend.append('userFormId', userFormIdFromQuery);
      }

      // Always include Staff2 sub-staff module password (empty string if not provided)
      formDataToSend.append('modulePassword', modulePassword || '');

      // Add property documents
      uploadedFiles.propertyDocuments.forEach((doc, index) => {
        formDataToSend.append(`propertyDocuments_${index}`, doc.file);
      });

      // Add first party documents
      if (uploadedFiles.firstParty.photo) {
        formDataToSend.append('firstParty_photo', uploadedFiles.firstParty.photo);
      }
      if (uploadedFiles.firstParty.aadhaar) {
        formDataToSend.append('firstParty_aadhaar', uploadedFiles.firstParty.aadhaar);
      }
      if (uploadedFiles.firstParty.pan) {
        formDataToSend.append('firstParty_pan', uploadedFiles.firstParty.pan);
      }

      // Add second party documents
      if (uploadedFiles.secondParty.photo) {
        formDataToSend.append('secondParty_photo', uploadedFiles.secondParty.photo);
      }
      if (uploadedFiles.secondParty.aadhaar) {
        formDataToSend.append('secondParty_aadhaar', uploadedFiles.secondParty.aadhaar);
      }
      if (uploadedFiles.secondParty.pan) {
        formDataToSend.append('secondParty_pan', uploadedFiles.secondParty.pan);
      }

      // Add stamp files
      stampDetails.forEach((stampDetail, index) => {
        if (stampDetail.stampFile) {
          formDataToSend.append(`stampFiles`, stampDetail.stampFile);
        }
      });

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';

      const response = await fetch(`${API_BASE}/api/staff/2/e-stamp/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Form submitted successfully.');
        // Reset form
        setFormData({
          article: '',
          property: '',
          consideredPrice: '',
          amount: '',
          f_name: '',
          f_gender: '',
          f_mobile: '',
          f_email: '',
          f_pan: '',
          f_aad: '',
          f_addr: '',
          s_name: '',
          s_gender: '',
          s_mobile: '',
          s_email: '',
          s_pan: '',
          s_aad: '',
          s_addr: '',
          paid_by: '',
          purchased_by: 'mejyoh',
          purchased_by_other: '',
          declaration: false
        });
        setErrors({});
        setShowPreview(false);
        // Reset stamp details
        setStampDetails([{
          stampNumber: '',
          stampIssueDate: '',
          stampAmount: '',
          stampFile: null
        }]);
        // Reset uploaded files
        uploadedFiles.propertyDocuments.forEach(doc => {
          if (doc.preview) URL.revokeObjectURL(doc.preview);
        });
        Object.values(previewImages).forEach(url => {
          if (url) URL.revokeObjectURL(url);
        });
        setUploadedFiles({
          propertyDocuments: [],
          firstParty: { photo: null, aadhaar: null, pan: null },
          secondParty: { photo: null, aadhaar: null, pan: null }
        });
        setPreviewImages({});
      } else {
        let errorMessage = 'Submission failed.';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || 'Submission failed.';
          } else {
            const errorText = await response.text();
            errorMessage = errorText || 'Submission failed.';
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          errorMessage = `Submission failed with status ${response.status}.`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const consideredWords = formData.consideredPrice
    ? `${numberToWordsEn(Number(formData.consideredPrice) || 0)} / ${numberToWordsHi(Number(formData.consideredPrice) || 0)}`
    : '';
  const amountWords = formData.amount
    ? `${numberToWordsEn(Number(formData.amount) || 0)} / ${numberToWordsHi(Number(formData.amount) || 0)}`
    : '';

  return (
    <div style={{ background: '#f6f7fb', minHeight: '100vh' }} className="py-4">
      <div className="container mx-auto px-4">
        <div className="d-flex justify-content-between align-items-center mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: '#000' }}>{t('eStamp.pageTitle')}</h3>
          <div className="d-flex align-items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="form-select form-select-sm"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>

        {userFormIdFromQuery && (
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                borderRadius: '8px',
                border: '1px solid #b6d4fe',
                background: '#e7f1ff',
                padding: '0.5rem 0.75rem',
                fontSize: '0.9rem',
                color: '#084298'
              }}
            >
              <strong>Linked Form:</strong>{' '}
              {linkedFormLoading && 'Loading form details...'}
              {!linkedFormLoading && linkedForm && (
                <>
                  This e-Stamp application will be created for{' '}
                  <span style={{ fontWeight: 600 }}>
                    {linkedForm.formattedFormId || linkedForm._id}
                  </span>{' '}
                  ({linkedForm.serviceType || 'form'}).
                </>
              )}
              {!linkedFormLoading && !linkedForm && !linkedFormError && (
                <>This e-Stamp application will be linked to form ID {userFormIdFromQuery}.</>
              )}
              {!linkedFormLoading && linkedFormError && (
                <>
                  This e-Stamp application will be linked to form ID {userFormIdFromQuery}.{' '}
                  <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    (Note: {linkedFormError})
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {permissionDenied ? (
          <div className="alert alert-danger p-4 rounded-lg shadow-sm border border-red-200 bg-red-50 text-red-800">
            <h4 className="alert-heading font-bold mb-2">Access Denied</h4>
            <p>
              You do not have permission to access the E-Stamp module for this form (ID: {userFormIdFromQuery}).
              <br />
              Please contact Staff 1 for access.
            </p>
          </div>
        ) : (
          <div className="card p-3 shadow-sm" style={{ borderRadius: '12px', background: 'white', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <form onSubmit={handleSubmit} noValidate>
              {/* Section 1: Stamp & Property Details */}
              <h5 style={{ color: '#000' }}>{t('eStamp.sec1Title')}</h5>
              <div className="row g-3 mb-3" style={{ display: 'flex', flexWrap: 'wrap', margin: '-0.5rem', marginBottom: '1rem' }}>
                <div className="col-md-4" style={{ flex: '0 0 33.333333%', maxWidth: '33.333333%', padding: '0.5rem' }}>
                  <label className="form-label">
                    {t('eStamp.label_article')} <span style={{ color: '#d63384' }}>*</span>
                  </label>
                  <select
                    name="article"
                    value={formData.article}
                    onChange={handleChange}
                    required
                    className={`form-select ${errors.article ? 'is-invalid' : ''}`}
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: `1px solid ${errors.article ? '#dc3545' : '#ced4da'}`, borderRadius: '0.25rem' }}
                  >
                    <option value="">-- {t('common.select')} --</option>
                    <option value="Affidavit">{t('eStamp.articles.affidavit')}</option>
                    <option value="Lease Agreement">{t('eStamp.articles.lease')}</option>
                    <option value="Conveyance Deed">{t('eStamp.articles.conveyance')}</option>
                    <option value="Sale Deed">{t('eStamp.articles.sale')}</option>
                    <option value="Agreement">{t('eStamp.articles.agreement')}</option>
                    <option value="Power of Attorney">{t('eStamp.articles.poa')}</option>
                    <option value="Cancellation">{t('eStamp.articles.cancellation')}</option>
                    <option value="Mortgage Deed">{t('eStamp.articles.mortgage')}</option>
                    <option value="Bond">{t('eStamp.articles.bond')}</option>
                    <option value="Court Bond">{t('eStamp.articles.courtBond')}</option>
                    <option value="Other">{t('eStamp.articles.other')}</option>
                  </select>
                  {errors.article && <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.article}</div>}
                </div>

                <div className="col-md-8" style={{ flex: '0 0 66.666667%', maxWidth: '66.666667%', padding: '0.5rem' }}>
                  <label className="form-label">
                    {t('eStamp.label_property')} <span style={{ color: '#d63384' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="property"
                    value={formData.property}
                    onChange={handleChange}
                    placeholder="Enter property description"
                    required
                    className={`form-control ${errors.property ? 'is-invalid' : ''}`}
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: `1px solid ${errors.property ? '#dc3545' : '#ced4da'}`, borderRadius: '0.25rem' }}
                  />
                  {errors.property && <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.property}</div>}
                </div>

                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_considered')} (₹)</label>
                  <input
                    type="number"
                    name="consideredPrice"
                    value={formData.consideredPrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g., 1500000"
                    className="form-control"
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                  />
                  {consideredWords && (
                    <div className="amount-words" style={{ fontStyle: 'italic', color: '#444', fontSize: '0.95rem', marginTop: '0.25rem' }}>{consideredWords}</div>
                  )}
                </div>

                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">
                    {t('eStamp.label_amount')} (₹) <span style={{ color: '#d63384' }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g., 2000"
                    required
                    className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: `1px solid ${errors.amount ? '#dc3545' : '#ced4da'}`, borderRadius: '0.25rem' }}
                  />
                  {amountWords && (
                    <div className="amount-words" style={{ fontStyle: 'italic', color: '#444', fontSize: '0.95rem', marginTop: '0.25rem' }}>{amountWords}</div>
                  )}
                  {errors.amount && <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.amount}</div>}
                </div>
              </div>

              {/* Property Documents Upload */}
              <div className="mb-3">
                <label className="form-label">Property Documents (Photos/Documents)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => {
                    Array.from(e.target.files).forEach(file => {
                      handleFileChange('propertyDocuments', 'document', file);
                    });
                  }}
                  className="form-control"
                  style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                />
                {uploadedFiles.propertyDocuments.length > 0 && (
                  <div className="mt-3" style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                    {uploadedFiles.propertyDocuments.map((file) => (
                      <div key={file.id} className="relative" style={{ position: 'relative' }}>
                        <div style={{ width: '100%', height: '96px', border: '1px solid #ced4da', borderRadius: '0.5rem', overflow: 'hidden', background: '#f8f9fa' }}>
                          {file.preview ? (
                            <img src={file.preview} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#6c757d' }}>
                              {file.name}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('propertyDocuments', 'document', file.id)}
                          style={{ position: 'absolute', top: '4px', right: '4px', background: '#dc3545', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr />

              {/* Section 2: First Party */}
              <h5 style={{ color: '#000' }}>{t('eStamp.sec2Title')}</h5>
              <div className="row g-3 mb-3" style={{ display: 'flex', flexWrap: 'wrap', margin: '-0.5rem', marginBottom: '1rem' }}>
                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">
                    {t('eStamp.label_f_name')} <span style={{ color: '#d63384' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="f_name"
                    value={formData.f_name}
                    onChange={handleChange}
                    minLength="3"
                    placeholder="First party name"
                    required
                    className={`form-control ${errors.f_name ? 'is-invalid' : ''}`}
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: `1px solid ${errors.f_name ? '#dc3545' : '#ced4da'}`, borderRadius: '0.25rem' }}
                  />
                  {errors.f_name && <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.f_name}</div>}
                </div>

                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_f_gender')}</label>
                  <select
                    name="f_gender"
                    value={formData.f_gender}
                    onChange={handleChange}
                    className="form-select"
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_f_mobile')}</label>
                  <input
                    type="text"
                    name="f_mobile"
                    value={formData.f_mobile}
                    onChange={handleChange}
                    placeholder="+9198xxxxxxx"
                    className={`form-control ${errors.f_mobile ? 'is-invalid' : ''}`}
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: `1px solid ${errors.f_mobile ? '#dc3545' : '#ced4da'}`, borderRadius: '0.25rem' }}
                  />
                  {errors.f_mobile && <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.f_mobile}</div>}
                </div>

                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_f_email')}</label>
                  <input
                    type="email"
                    name="f_email"
                    value={formData.f_email}
                    onChange={handleChange}
                    placeholder="example@mail.com"
                    className="form-control"
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                  />
                </div>

                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_f_pan')}</label>
                  <input
                    type="text"
                    name="f_pan"
                    value={formData.f_pan}
                    onChange={handlePANInput}
                    maxLength="10"
                    placeholder="ABCDE1234F"
                    className={`form-control ${errors.f_pan ? 'is-invalid' : ''}`}
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: `1px solid ${errors.f_pan ? '#dc3545' : '#ced4da'}`, borderRadius: '0.25rem', textTransform: 'uppercase' }}
                  />
                  {errors.f_pan && <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.f_pan}</div>}
                </div>

                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_f_aad')}</label>
                  <input
                    type="text"
                    name="f_aad"
                    value={formData.f_aad}
                    onChange={handleChange}
                    maxLength="12"
                    placeholder="12-digit Aadhaar"
                    className="form-control"
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                  />
                </div>

                <div className="col-12" style={{ flex: '0 0 100%', maxWidth: '100%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_f_addr')}</label>
                  <textarea
                    name="f_addr"
                    value={formData.f_addr}
                    onChange={handleChange}
                    rows="2"
                    className="form-control"
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                  />
                </div>

                {/* First Party Documents */}
                <div className="col-12" style={{ flex: '0 0 100%', maxWidth: '100%', padding: '0.5rem' }}>
                  <label className="form-label">First Party Documents</label>
                  <div className="row g-3" style={{ display: 'flex', flexWrap: 'wrap', margin: '-0.5rem' }}>
                    <div className="col-md-4" style={{ flex: '0 0 33.333333%', maxWidth: '33.333333%', padding: '0.5rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem' }}>Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('firstParty', 'photo', e.target.files[0])}
                        className="form-control form-control-sm"
                        style={{ width: '100%', padding: '0.25rem 0.5rem', fontSize: '0.875rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                      />
                      {uploadedFiles.firstParty.photo && (
                        <div className="mt-2 relative" style={{ marginTop: '0.5rem', position: 'relative' }}>
                          <img
                            src={previewImages['firstParty_photo']}
                            alt="First Party Photo"
                            style={{ width: '96px', height: '96px', objectFit: 'cover', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('firstParty', 'photo')}
                            style={{ position: 'absolute', top: '0', right: '0', background: '#dc3545', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="col-md-4" style={{ flex: '0 0 33.333333%', maxWidth: '33.333333%', padding: '0.5rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem' }}>Aadhaar Card</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange('firstParty', 'aadhaar', e.target.files[0])}
                        className="form-control form-control-sm"
                        style={{ width: '100%', padding: '0.25rem 0.5rem', fontSize: '0.875rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                      />
                      {uploadedFiles.firstParty.aadhaar && (
                        <div className="mt-2" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6c757d' }}>
                          {uploadedFiles.firstParty.aadhaar.name}
                          <button
                            type="button"
                            onClick={() => removeFile('firstParty', 'aadhaar')}
                            className="ms-2"
                            style={{ marginLeft: '0.5rem', color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="col-md-4" style={{ flex: '0 0 33.333333%', maxWidth: '33.333333%', padding: '0.5rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem' }}>PAN Card</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange('firstParty', 'pan', e.target.files[0])}
                        className="form-control form-control-sm"
                        style={{ width: '100%', padding: '0.25rem 0.5rem', fontSize: '0.875rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                      />
                      {uploadedFiles.firstParty.pan && (
                        <div className="mt-2" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6c757d' }}>
                          {uploadedFiles.firstParty.pan.name}
                          <button
                            type="button"
                            onClick={() => removeFile('firstParty', 'pan')}
                            className="ms-2"
                            style={{ marginLeft: '0.5rem', color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              {/* Section 3: Second Party */}
              <h5 style={{ color: '#000' }}>{t('eStamp.sec3Title')}</h5>
              <div className="row g-3 mb-3" style={{ display: 'flex', flexWrap: 'wrap', margin: '-0.5rem', marginBottom: '1rem' }}>
                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">
                    {t('eStamp.label_s_name')} <span style={{ color: '#d63384' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="s_name"
                    value={formData.s_name}
                    onChange={handleChange}
                    minLength="3"
                    placeholder="Second party name"
                    required
                    className={`form-control ${errors.s_name ? 'is-invalid' : ''}`}
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: `1px solid ${errors.s_name ? '#dc3545' : '#ced4da'}`, borderRadius: '0.25rem' }}
                  />
                  {errors.s_name && <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.s_name}</div>}
                </div>

                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_s_gender')}</label>
                  <select
                    name="s_gender"
                    value={formData.s_gender}
                    onChange={handleChange}
                    className="form-select"
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                  >
                    <option value="">Select</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_s_mobile')}</label>
                  <input
                    type="text"
                    name="s_mobile"
                    value={formData.s_mobile}
                    onChange={handleChange}
                    placeholder="+9198xxxxxxx"
                    className={`form-control ${errors.s_mobile ? 'is-invalid' : ''}`}
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: `1px solid ${errors.s_mobile ? '#dc3545' : '#ced4da'}`, borderRadius: '0.25rem' }}
                  />
                  {errors.s_mobile && <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.s_mobile}</div>}
                </div>

                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_s_email')}</label>
                  <input
                    type="email"
                    name="s_email"
                    value={formData.s_email}
                    onChange={handleChange}
                    placeholder="example@mail.com"
                    className="form-control"
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                  />
                </div>

                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_s_pan')}</label>
                  <input
                    type="text"
                    name="s_pan"
                    value={formData.s_pan}
                    onChange={handlePANInput}
                    maxLength="10"
                    placeholder="ABCDE1234F"
                    className={`form-control ${errors.s_pan ? 'is-invalid' : ''}`}
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: `1px solid ${errors.s_pan ? '#dc3545' : '#ced4da'}`, borderRadius: '0.25rem', textTransform: 'uppercase' }}
                  />
                  {errors.s_pan && <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.s_pan}</div>}
                </div>

                <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_s_aad')}</label>
                  <input
                    type="text"
                    name="s_aad"
                    value={formData.s_aad}
                    onChange={handleChange}
                    maxLength="12"
                    placeholder="12-digit Aadhaar"
                    className="form-control"
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                  />
                </div>

                <div className="col-12" style={{ flex: '0 0 100%', maxWidth: '100%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_s_addr')}</label>
                  <textarea
                    name="s_addr"
                    value={formData.s_addr}
                    onChange={handleChange}
                    rows="2"
                    className="form-control"
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                  />
                </div>

                {/* Second Party Documents */}
                <div className="col-12" style={{ flex: '0 0 100%', maxWidth: '100%', padding: '0.5rem' }}>
                  <label className="form-label">Second Party Documents</label>
                  <div className="row g-3" style={{ display: 'flex', flexWrap: 'wrap', margin: '-0.5rem' }}>
                    <div className="col-md-4" style={{ flex: '0 0 33.333333%', maxWidth: '33.333333%', padding: '0.5rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem' }}>Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange('secondParty', 'photo', e.target.files[0])}
                        className="form-control form-control-sm"
                        style={{ width: '100%', padding: '0.25rem 0.5rem', fontSize: '0.875rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                      />
                      {uploadedFiles.secondParty.photo && (
                        <div className="mt-2 relative" style={{ marginTop: '0.5rem', position: 'relative' }}>
                          <img
                            src={previewImages['secondParty_photo']}
                            alt="Second Party Photo"
                            style={{ width: '96px', height: '96px', objectFit: 'cover', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                          />
                          <button
                            type="button"
                            onClick={() => removeFile('secondParty', 'photo')}
                            style={{ position: 'absolute', top: '0', right: '0', background: '#dc3545', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="col-md-4" style={{ flex: '0 0 33.333333%', maxWidth: '33.333333%', padding: '0.5rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem' }}>Aadhaar Card</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange('secondParty', 'aadhaar', e.target.files[0])}
                        className="form-control form-control-sm"
                        style={{ width: '100%', padding: '0.25rem 0.5rem', fontSize: '0.875rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                      />
                      {uploadedFiles.secondParty.aadhaar && (
                        <div className="mt-2" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6c757d' }}>
                          {uploadedFiles.secondParty.aadhaar.name}
                          <button
                            type="button"
                            onClick={() => removeFile('secondParty', 'aadhaar')}
                            className="ms-2"
                            style={{ marginLeft: '0.5rem', color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="col-md-4" style={{ flex: '0 0 33.333333%', maxWidth: '33.333333%', padding: '0.5rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem' }}>PAN Card</label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange('secondParty', 'pan', e.target.files[0])}
                        className="form-control form-control-sm"
                        style={{ width: '100%', padding: '0.25rem 0.5rem', fontSize: '0.875rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                      />
                      {uploadedFiles.secondParty.pan && (
                        <div className="mt-2" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6c757d' }}>
                          {uploadedFiles.secondParty.pan.name}
                          <button
                            type="button"
                            onClick={() => removeFile('secondParty', 'pan')}
                            className="ms-2"
                            style={{ marginLeft: '0.5rem', color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              {/* Section 4: Payment & Submit */}
              <h5 style={{ color: '#000' }}>{t('eStamp.sec4Title')}</h5>
              <div className="row g-3 align-items-end" style={{ display: 'flex', flexWrap: 'wrap', margin: '-0.5rem', alignItems: 'flex-end' }}>
                <div className="col-md-4" style={{ flex: '0 0 33.333333%', maxWidth: '33.333333%', padding: '0.5rem' }}>
                  <label className="form-label">
                    {t('eStamp.label_paid_by')} <span style={{ color: '#d63384' }}>*</span>
                  </label>
                  <select
                    name="paid_by"
                    value={formData.paid_by}
                    onChange={handleChange}
                    required
                    className={`form-select ${errors.paid_by ? 'is-invalid' : ''}`}
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: `1px solid ${errors.paid_by ? '#dc3545' : '#ced4da'}`, borderRadius: '0.25rem' }}
                  >
                    {getPaidByOptions().map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.paid_by && <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.paid_by}</div>}
                </div>

                <div className="col-md-4" style={{ flex: '0 0 33.333333%', maxWidth: '33.333333%', padding: '0.5rem' }}>
                  <label className="form-label">{t('eStamp.label_purchased_by')}</label>
                  <select
                    name="purchased_by"
                    value={formData.purchased_by}
                    onChange={handleChange}
                    className="form-select"
                    style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                  >
                    {getPurchasedByOptions().map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4" style={{ flex: '0 0 33.333333%', maxWidth: '33.333333%', padding: '0.5rem' }}>
                  {formData.purchased_by === 'others' && (
                    <input
                      type="text"
                      name="purchased_by_other"
                      value={formData.purchased_by_other}
                      onChange={handleChange}
                      placeholder="If others, name"
                      className="form-control"
                      style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                    />
                  )}
                </div>

                {/* New Stamp Details Section */}
                <div className="col-12" style={{ flex: '0 0 100%', maxWidth: '100%', padding: '0.5rem', marginTop: '1rem', borderTop: '2px solid #dee2e6', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h5 style={{ marginBottom: '0', color: '#495057', fontWeight: '600' }}>Stamp Details</h5>
                    <button
                      type="button"
                      onClick={addStampDetail}
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease-in-out'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                    >
                      + Add Stamp Detail
                    </button>
                  </div>
                </div>

                {stampDetails.map((stampDetail, index) => (
                  <div key={index} style={{ 
                    width: '100%', 
                    border: '1px solid #dee2e6', 
                    borderRadius: '0.5rem', 
                    padding: '1rem', 
                    marginBottom: '1rem', 
                    backgroundColor: '#f8f9fa' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h6 style={{ margin: '0', color: '#495057', fontWeight: '500' }}>
                        Stamp Detail {index + 1}
                      </h6>
                      {stampDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStampDetail(index)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease-in-out'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="row g-3" style={{ display: 'flex', flexWrap: 'wrap', margin: '-0.5rem' }}>
                      <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                        <label className="form-label">Stamp Number</label>
                        <input
                          type="text"
                          value={stampDetail.stampNumber}
                          onChange={(e) => handleStampDetailChange(index, 'stampNumber', e.target.value)}
                          placeholder="Enter stamp number"
                          className="form-control"
                          style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                        />
                      </div>

                      <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                        <label className="form-label">Stamp Issue Date</label>
                        <input
                          type="date"
                          value={stampDetail.stampIssueDate}
                          onChange={(e) => handleStampDetailChange(index, 'stampIssueDate', e.target.value)}
                          className="form-control"
                          style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                        />
                      </div>

                      <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                        <label className="form-label">Stamp Amount (₹)</label>
                        <input
                          type="number"
                          value={stampDetail.stampAmount}
                          onChange={(e) => handleStampDetailChange(index, 'stampAmount', e.target.value)}
                          placeholder="Enter stamp amount"
                          className="form-control"
                          min="0"
                          step="0.01"
                          style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                        />
                      </div>

                      <div className="col-md-6" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0.5rem' }}>
                        <label className="form-label">Upload Stamp File</label>
                        <input
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              handleStampFileChange(index, file);
                            }
                          }}
                          accept="image/*,.pdf"
                          className="form-control"
                          style={{ width: '100%', padding: '0.375rem 0.75rem', border: '1px solid #ced4da', borderRadius: '0.25rem' }}
                        />
                        {previewImages[`stampFile_${index}`] && (
                          <div style={{ marginTop: '0.5rem' }}>
                            {stampDetail.stampFile?.type?.startsWith('image/') ? (
                              <img 
                                src={previewImages[`stampFile_${index}`]} 
                                alt="Stamp file preview" 
                                style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', borderRadius: '4px' }} 
                              />
                            ) : (
                              <span style={{ fontSize: '0.875rem', color: '#6c757d' }}>📄 {stampDetail.stampFile?.name}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="col-12" style={{ flex: '0 0 100%', maxWidth: '100%', padding: '0.5rem' }}>
                  <div className="form-check">
                    <input
                      className={`form-check-input ${errors.declaration ? 'is-invalid' : ''}`}
                      type="checkbox"
                      name="declaration"
                      checked={formData.declaration}
                      onChange={handleChange}
                      required
                      style={{ marginTop: '0.25rem' }}
                    />
                    <label className="form-check-label">{t('eStamp.label_decl')}</label>
                  </div>
                  {errors.declaration && <div className="invalid-feedback" style={{ display: 'block', color: '#dc3545', fontSize: '0.875rem', marginTop: '0.25rem' }}>{errors.declaration}</div>}
                </div>

                <div className="col-12 text-end" style={{ flex: '0 0 100%', maxWidth: '100%', padding: '0.5rem', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={preparePreview}
                    className="btn btn-outline-secondary me-2"
                    style={{ padding: '0.375rem 0.75rem', marginRight: '0.5rem', border: '1px solid #6c757d', borderRadius: '0.25rem', background: 'white', color: '#6c757d', cursor: 'pointer' }}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Direct submit clicked');
                      const newErrors = validateForm();
                      if (Object.keys(newErrors).length > 0) {
                        console.log('Validation errors:', newErrors);
                        setErrors(newErrors);
                        alert('Please fill all required fields correctly.');
                        return;
                      }
                      console.log('Validation passed, calling confirmSubmit directly');
                      confirmSubmit();
                    }}
                    className="btn btn-success me-2"
                    disabled={isSubmitting}
                    style={{ padding: '0.375rem 0.75rem', marginRight: '0.5rem', border: 'none', borderRadius: '0.25rem', background: '#198754', color: 'white', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.65 : 1 }}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Directly'}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '0.375rem 0.75rem', border: 'none', borderRadius: '0.25rem', background: '#0d6efd', color: 'white', cursor: 'pointer' }}
                  >
                    Submit (with Preview)
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div 
          className="modal fade show" 
          style={{ 
            display: 'block', 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
            zIndex: 999999,
            overflowY: 'auto',
            padding: '20px'
          }}
        >
          {console.log('Rendering preview modal')}
          <div className="modal-dialog modal-lg modal-dialog-scrollable" style={{ maxWidth: '800px', margin: '1.75rem auto', position: 'relative', width: '90%', zIndex: 1000000 }}>
            <div className="modal-content" style={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 5px 15px rgba(0,0,0,0.5)', border: 'none', outline: 0 }}>
              <div className="modal-header" style={{ display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #dee2e6', borderTopLeftRadius: '0.3rem', borderTopRightRadius: '0.3rem' }}>
                <h5 className="modal-title" style={{ color: '#000' }}>{t('eStamp.previewTitle')}</h5>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="btn-close"
                  style={{ padding: '0.5rem', margin: '-0.5rem -0.5rem -0.5rem auto', background: 'none', border: 0, borderRadius: '0.25rem', opacity: 0.5, cursor: 'pointer' }}
                  aria-label="Close"
                >
                  <span style={{ fontSize: '1.5rem', lineHeight: 1, color: '#000' }}>×</span>
                </button>
              </div>
              <div className="modal-body" style={{ position: 'relative', flex: '1 1 auto', padding: '1rem', maxHeight: '70vh', overflowY: 'auto' }}>
                <p><strong>{t('eStamp.label_article')}:</strong> {formData.article || '-'}</p>
                <p><strong>{t('eStamp.label_property')}:</strong> {formData.property || '-'}</p>
                {formData.consideredPrice && (
                  <p>
                    <strong>{t('eStamp.label_considered')}:</strong> ₹{formData.consideredPrice}
                    <br />
                    <em>{numberToWordsEn(Number(formData.consideredPrice) || 0)} / {numberToWordsHi(Number(formData.consideredPrice) || 0)}</em>
                  </p>
                )}
                <p>
                  <strong>{t('eStamp.label_amount')}:</strong> ₹{formData.amount || '-'}
                  <br />
                  <em>{formData.amount ? `${numberToWordsEn(Number(formData.amount) || 0)} / ${numberToWordsHi(Number(formData.amount) || 0)}` : ''}</em>
                </p>
                <hr />
                <p><strong>{language === 'hi' ? 'पहली पार्टी' : 'First Party'}:</strong> {formData.f_name || '-'}</p>
                <p><strong>{language === 'hi' ? 'दूसरी पार्टी' : 'Second Party'}:</strong> {formData.s_name || '-'}</p>
                <p><strong>{t('eStamp.label_paid_by')}:</strong> {
                  formData.paid_by === 'first' ? formData.f_name :
                    formData.paid_by === 'second' ? formData.s_name :
                      formData.paid_by === 'both' ? t('eStamp.both') : '-'
                }</p>
                <p><strong>{t('eStamp.label_purchased_by')}:</strong> {
                  formData.purchased_by === 'mejyoh' ? t('eStamp.purchasedDefault') :
                    formData.purchased_by === 'first' ? formData.f_name :
                      formData.purchased_by === 'second' ? formData.s_name :
                        formData.purchased_by === 'others' ? formData.purchased_by_other :
                          '-'
                }</p>
              </div>
              <div className="modal-footer" style={{ display: 'flex', flexWrap: 'wrap', flexShrink: 0, alignItems: 'center', justifyContent: 'flex-end', padding: '0.75rem', borderTop: '1px solid #dee2e6', borderBottomRightRadius: '0.3rem', borderBottomLeftRadius: '0.3rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.375rem 0.75rem', border: '1px solid #6c757d', borderRadius: '0.25rem', background: '#6c757d', color: 'white', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={confirmSubmit}
                  disabled={isSubmitting}
                  className="btn btn-success"
                  style={{ padding: '0.375rem 0.75rem', border: 'none', borderRadius: '0.25rem', background: '#198754', color: 'white', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.65 : 1 }}
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EStampApplication;

"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CameraCapture from "./CameraCapture";
import LanguageSelectorDropdown from "./LanguageSelectorDropdown";
import ClientOnly from "./ClientOnly";
import { useTranslation } from "react-i18next";
import { FormWorkflowProvider, useFormWorkflow } from './FormWorkflow/FormWorkflowProvider';
import FormWorkflow from './FormWorkflow/FormWorkflow';
import FormPreview from './FormWorkflow/FormPreview';
import ProcessingState from './FormWorkflow/ProcessingState';
import PaymentGateway from './FormWorkflow/PaymentGateway';

const AdoptionDeedFormContent = () => {
  const { t } = useTranslation();
  const { goToPreview } = useFormWorkflow();

  // Form state
  const [formData, setFormData] = useState({
    // Registration Details
    country: t('adoptionDeed.country', 'India'),
    state: "",
    district: "",
    tehsil: "",
    subRegistrarOffice: "",

    // Child Details
    childName: "",
    childDOB: "",
    childGender: "",
    childBloodGroup: "",
    childEducation: "",
    childCurrentAddress: "",
    childBirthCertNo: "",
    childBirthCertIssueDate: "",
    childBirthCertIssuePlace: "",
    isOrphanageAdoption: false,
    orphanageName: "",
    orphanageAddress: "",

    // Stamp Details
    stampAmount: "",
    stampNo: "",
    stampDate: "",
  });

  // Dynamic arrays
  const [firstParties, setFirstParties] = useState([]);
  const [secondParties, setSecondParties] = useState([]);
  const [witnesses, setWitnesses] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [previewPhotos, setPreviewPhotos] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Location data
  const states = t('common.locations.states', { returnObjects: true }) || ['Uttar Pradesh', 'Delhi', 'Maharashtra'];
  const districts = t('common.locations.districts', { returnObjects: true }) || {};
  const tehsils = t('common.locations.tehsils', { returnObjects: true }) || {};
  const offices = t('common.locations.offices', { returnObjects: true }) || {};

  const prefixes = {
    [t('adoptionDeed.options.genders.male', 'Male')]: [t('common.salutations.mr', 'Mr.'), t('common.salutations.kumar', 'Kumar')],
    [t('adoptionDeed.options.genders.female', 'Female')]: [t('common.salutations.mrs', 'Mrs.'), t('common.salutations.kumari', 'Kumari')]
  };

  // Validation function
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'state':
      case 'district':
      case 'tehsil':
      case 'subRegistrarOffice':
        if (!value) error = 'This field is required';
        break;
      case 'childName':
        if (!value) error = 'Child name is required';
        else if (value.length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'childDOB':
        if (!value) error = 'Date of birth is required';
        else if (new Date(value) > new Date()) error = 'Date cannot be in the future';
        break;
      case 'childGender':
      case 'childBloodGroup':
        if (!value) error = 'Please select an option';
        break;
      case 'childEducation':
        if (!value) error = 'Education details are required';
        break;
      case 'childCurrentAddress':
        if (!value) error = 'Current address is required';
        else if (value.length < 10) error = 'Address must be at least 10 characters';
        break;
      case 'childBirthCertNo':
        if (!value) error = 'Birth certificate number is required';
        break;
      case 'stampAmount':
        if (!value) error = 'Stamp amount is required';
        else if (isNaN(value) || value <= 0) error = 'Please enter a valid amount';
        break;
      case 'stampNo':
        if (!value) error = 'Stamp number is required';
        break;
      case 'stampDate':
        if (!value) error = 'Stamp date is required';
        break;
      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate main form fields
    Object.keys(formData).forEach(field => {
      if (field !== 'isOrphanageAdoption' && field !== 'orphanageName' && field !== 'orphanageAddress') {
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      }
    });

    // Validate orphanage fields if applicable
    if (formData.isOrphanageAdoption) {
      if (!formData.orphanageName) newErrors.orphanageName = 'Orphanage name is required';
      if (!formData.orphanageAddress) newErrors.orphanageAddress = 'Orphanage address is required';
    }

    // Validate parties
    if (firstParties.length === 0) {
      newErrors.firstParties = 'At least one adopting party (First Party) is required';
    }

    firstParties.forEach((party, index) => {
      ['name', 'gender', 'prefix', 'dob', 'maritalStatus', 'sonOf', 'mobile', 'occupation', 'idType', 'idNo', 'address'].forEach(field => {
        if (!party[field]) {
          newErrors[`firstParty_${index}_${field}`] = 'This field is required';
        }
      });

      if (party.maritalStatus === t('adoptionDeed.options.maritalStatus.married') && !party.spouseConsent) {
        newErrors[`firstParty_${index}_spouseConsent`] = t('adoptionDeed.errors.spouseConsentRequired', 'Spouse consent is required for married persons');
      }
    });

    if (!formData.isOrphanageAdoption && secondParties.length === 0) {
      newErrors.secondParties = 'At least one natural parent (Second Party) is required';
    }

    secondParties.forEach((party, index) => {
      ['name', 'gender', 'prefix', 'dob', 'sonOf', 'mobile', 'occupation', 'idType', 'idNo', 'address'].forEach(field => {
        if (!party[field]) {
          newErrors[`secondParty_${index}_${field}`] = 'This field is required';
        }
      });
    });

    // Validate witnesses
    if (witnesses.length === 0) {
      newErrors.witnesses = 'At least one witness is required';
    }

    witnesses.forEach((witness, index) => {
      ['name', 'gender', 'prefix', 'sonOf', 'mobile', 'occupation', 'idType', 'idNo', 'address'].forEach(field => {
        if (!witness[field]) {
          newErrors[`witness_${index}_${field}`] = 'This field is required';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle file uploads
  const handleFileChange = (fieldName, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewPhotos(prev => ({
          ...prev,
          [fieldName]: e.target.result
        }));
      };
      reader.readAsDataURL(file);

      setUploadedFiles(prev => [...prev, { field: fieldName, file }]);
    }
  };

  // Handle camera capture
  const handleCameraCapture = (fieldName, file, imageSrc) => {
    setPreviewPhotos(prev => ({
      ...prev,
      [fieldName]: imageSrc
    }));

    setUploadedFiles(prev => [...prev, { field: fieldName, file }]);
  };

  // Calculate age
  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    const ageDiffMs = today - birthDate;
    const years = Math.floor(ageDiffMs / (365.25 * 24 * 60 * 60 * 1000));
    const months = Math.floor((ageDiffMs % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
    return `${years} वर्ष ${months} महीने`;
  };

  // Add party functions
  const addFirstParty = () => {
    setFirstParties(prev => [...prev, {
      name: '',
      gender: '',
      prefix: '',
      dob: '',
      maritalStatus: '',
      spouseConsent: false,
      sonOf: '',
      mobile: '',
      occupation: '',
      idType: '',
      idNo: '',
      address: ''
    }]);
  };

  const addSecondParty = () => {
    if (formData.isOrphanageAdoption) {
      toast.warning("अनाथ आश्रम से दत्तक ग्रहण के मामले में, केवल दत्तक लेने वाले (प्रथम पक्ष) की जानकारी ही भरी जानी चाहिए।");
      return;
    }
    setSecondParties(prev => [...prev, {
      name: '',
      gender: '',
      prefix: '',
      dob: '',
      sonOf: '',
      mobile: '',
      occupation: '',
      idType: '',
      idNo: '',
      address: ''
    }]);
  };

  const addWitness = () => {
    setWitnesses(prev => [...prev, {
      name: '',
      gender: '',
      prefix: '',
      sonOf: '',
      mobile: '',
      occupation: '',
      idType: '',
      idNo: '',
      address: ''
    }]);
  };

  const addGift = () => {
    setGifts(prev => [...prev, { description: '' }]);
  };

  // Remove functions
  const removeFirstParty = (index) => {
    setFirstParties(prev => prev.filter((_, i) => i !== index));
  };

  const removeSecondParty = (index) => {
    setSecondParties(prev => prev.filter((_, i) => i !== index));
  };

  const removeWitness = (index) => {
    setWitnesses(prev => prev.filter((_, i) => i !== index));
  };

  const removeGift = (index) => {
    setGifts(prev => prev.filter((_, i) => i !== index));
  };

  // Update party data
  const updateFirstParty = (index, field, value) => {
    setFirstParties(prev => prev.map((party, i) =>
      i === index ? { ...party, [field]: value } : party
    ));
  };

  const updateSecondParty = (index, field, value) => {
    setSecondParties(prev => prev.map((party, i) =>
      i === index ? { ...party, [field]: value } : party
    ));
  };

  const updateWitness = (index, field, value) => {
    setWitnesses(prev => prev.map((witness, i) =>
      i === index ? { ...witness, [field]: value } : witness
    ));
  };

  const updateGift = (index, value) => {
    setGifts(prev => prev.map((gift, i) =>
      i === index ? { ...gift, description: value } : gift
    ));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    // Instead of submitting directly, go to preview
    const dataToSave = {
      ...formData,
      firstParties,
      secondParties,
      witnesses,
      gifts,
      amount: 1000, // Base amount for adoption deed
      formType: 'adoption-deed'
    };

    goToPreview(dataToSave);
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full px-2 sm:px-4 lg:px-6 py-3">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('adoptionDeed.title')}</h1>
              <p className="text-sm text-gray-600 mt-1">{t('adoptionDeed.description')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? t('common.submitting') : t('common.submitForm')}
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Registration Details Section */}
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 pb-1.5 border-b border-gray-200">
                {t('adoptionDeed.registrationDetails')}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.country')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="भारत">{t('adoptionDeed.options.india')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.state')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">{t('adoptionDeed.options.select')}</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.district')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                    disabled={!formData.state}
                  >
                    <option value="">{t('adoptionDeed.options.select')}</option>
                    {formData.state && districts[formData.state]?.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.tehsil')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tehsil"
                    value={formData.tehsil}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                    disabled={!formData.district}
                  >
                    <option value="">{t('adoptionDeed.options.select')}</option>
                    {formData.district && tehsils[formData.district]?.map(tehsil => (
                      <option key={tehsil} value={tehsil}>{tehsil}</option>
                    ))}
                  </select>
                  {errors.tehsil && <p className="text-red-500 text-sm mt-1">{errors.tehsil}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.subRegistrarOffice')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subRegistrarOffice"
                    value={formData.subRegistrarOffice}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                    disabled={!formData.tehsil}
                  >
                    <option value="">{t('adoptionDeed.options.select')}</option>
                    {formData.tehsil && offices[formData.tehsil]?.map(office => (
                      <option key={office} value={office}>{office}</option>
                    ))}
                  </select>
                  {errors.subRegistrarOffice && <p className="text-red-500 text-sm mt-1">{errors.subRegistrarOffice}</p>}
                </div>
              </div>
            </div>

            {/* Child Details Section */}
            <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-2 sm:mb-3 border-b-2 border-blue-500 pb-1.5">
                {t('adoptionDeed.childDetails.title')}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
                <div className="md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6">
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.childDetails.uploadPhoto')} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('childPhoto', e.target.files[0])}
                      className="w-full md:flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="w-20 h-20 sm:w-24 sm:h-24 border border-gray-300 rounded flex items-center justify-center bg-gray-50 flex-shrink-0">
                      {previewPhotos.childPhoto ? (
                        <img
                          src={previewPhotos.childPhoto}
                          alt={t('adoptionDeed.childDetails.photoPreview')}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-xs text-gray-500 text-center">{t('adoptionDeed.childDetails.photoPreview')}</span>
                      )}
                    </div>
                  </div>

                  {/* Camera Capture Option */}
                  <div className="mt-2">
                    <CameraCapture
                      onCapture={(file, imageSrc) => handleCameraCapture('childPhoto', file, imageSrc)}
                      label={t('adoptionDeed.childDetails.capturePhoto')}
                      previewLabel={t('adoptionDeed.childDetails.photoPreview')}
                      width={280}
                      height={200}
                      aspectRatio={1.333}
                      compact={true}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.childDetails.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="childName"
                    value={formData.childName}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  {errors.childName && <p className="text-red-500 text-xs mt-1">{errors.childName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.childDetails.dob')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="childDOB"
                    value={formData.childDOB}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  {formData.childDOB && (
                    <p className="text-xs text-gray-600 mt-1">
                      {t('adoptionDeed.childDetails.age')}: {calculateAge(formData.childDOB)}
                    </p>
                  )}
                  {errors.childDOB && <p className="text-red-500 text-xs mt-1">{errors.childDOB}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.childDetails.gender')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="childGender"
                    value={formData.childGender}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">{t('adoptionDeed.options.select')}</option>
                    <option value={t('adoptionDeed.options.genders.male')}>{t('adoptionDeed.options.genders.male')}</option>
                    <option value={t('adoptionDeed.options.genders.female')}>{t('adoptionDeed.options.genders.female')}</option>
                    <option value={t('adoptionDeed.options.genders.other')}>{t('adoptionDeed.options.genders.other')}</option>
                  </select>
                  {errors.childGender && <p className="text-red-500 text-xs mt-1">{errors.childGender}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.childDetails.bloodGroup')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="childBloodGroup"
                    value={formData.childBloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">{t('adoptionDeed.options.select')}</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                  {errors.childBloodGroup && <p className="text-red-500 text-xs mt-1">{errors.childBloodGroup}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.childDetails.education')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="childEducation"
                    value={formData.childEducation}
                    onChange={handleInputChange}
                    placeholder={t('adoptionDeed.childDetails.educationPlaceholder')}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  {errors.childEducation && <p className="text-red-500 text-xs mt-1">{errors.childEducation}</p>}
                </div>

                <div className="md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6">
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.childDetails.currentAddress')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="childCurrentAddress"
                    value={formData.childCurrentAddress}
                    onChange={handleInputChange}
                    placeholder={t('common.fullAddress')}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  {errors.childCurrentAddress && <p className="text-red-500 text-xs mt-1">{errors.childCurrentAddress}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.childDetails.birthCertNo')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="childBirthCertNo"
                    value={formData.childBirthCertNo}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  {errors.childBirthCertNo && <p className="text-red-500 text-xs mt-1">{errors.childBirthCertNo}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.childDetails.issueDate')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="childBirthCertIssueDate"
                    value={formData.childBirthCertIssueDate}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.childDetails.issuePlace')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="childBirthCertIssuePlace"
                    value={formData.childBirthCertIssuePlace}
                    onChange={handleInputChange}
                    placeholder={t('adoptionDeed.childDetails.issuePlacePlaceholder')}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6">
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.childDetails.uploadBirthCert')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange('childBirthCert', e.target.files[0])}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6">
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.childDetails.uploadID')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange('childID', e.target.files[0])}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isOrphanageAdoption"
                      checked={formData.isOrphanageAdoption}
                      onChange={handleInputChange}
                      className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-xs text-gray-700">
                      {t('adoptionDeed.childDetails.isOrphanageAdoption')}
                    </label>
                  </div>
                </div>

                {formData.isOrphanageAdoption && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        {t('adoptionDeed.childDetails.orphanageName')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="orphanageName"
                        value={formData.orphanageName}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      {errors.orphanageName && <p className="text-red-500 text-xs mt-1">{errors.orphanageName}</p>}
                    </div>

                    <div className="md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6">
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">
                        {t('adoptionDeed.childDetails.orphanageAddress')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="orphanageAddress"
                        value={formData.orphanageAddress}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      {errors.orphanageAddress && <p className="text-red-500 text-xs mt-1">{errors.orphanageAddress}</p>}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Parties Section */}
            <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-2 sm:mb-3 border-b-2 border-blue-500 pb-1.5">
                {t('adoptionDeed.partiesDetails.title')}
              </h2>

              <div className="space-y-6">
                {/* First Parties */}
                {firstParties.map((party, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      {t('adoptionDeed.partiesDetails.firstParty')} #{index + 1}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
                      <div className="md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">
                          {t('adoptionDeed.partiesDetails.uploadPhoto')} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(`firstPartyPhoto_${index}`, e.target.files[0])}
                            className="w-full md:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="w-20 h-20 sm:w-24 sm:h-24 border border-gray-300 rounded flex items-center justify-center bg-gray-50 flex-shrink-0">
                            {previewPhotos[`firstPartyPhoto_${index}`] ? (
                              <img
                                src={previewPhotos[`firstPartyPhoto_${index}`]}
                                alt={t('adoptionDeed.partiesDetails.photoPreview')}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <span className="text-xs text-gray-500 text-center">{t('adoptionDeed.partiesDetails.photoPreview')}</span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4">
                          <CameraCapture
                            onCapture={(file, imageSrc) => handleCameraCapture(`firstPartyPhoto_${index}`, file, imageSrc)}
                            label={t('adoptionDeed.partiesDetails.capturePhoto')}
                            previewLabel={t('adoptionDeed.partiesDetails.photoPreview')}
                            width={280}
                            height={200}
                            aspectRatio={1.333}
                            compact={true}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.gender')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={party.gender}
                          onChange={(e) => updateFirstParty(index, 'gender', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          <option value={t('adoptionDeed.options.genders.male')}>{t('adoptionDeed.options.genders.male')}</option>
                          <option value={t('adoptionDeed.options.genders.female')}>{t('adoptionDeed.options.genders.female')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.prefix')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={party.prefix}
                          onChange={(e) => updateFirstParty(index, 'prefix', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          {party.gender && prefixes[party.gender]?.map(prefix => (
                            <option key={prefix} value={prefix}>{prefix}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={party.name}
                          onChange={(e) => updateFirstParty(index, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.dob')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={party.dob}
                          onChange={(e) => updateFirstParty(index, 'dob', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.maritalStatus')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={party.maritalStatus}
                          onChange={(e) => updateFirstParty(index, 'maritalStatus', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          <option value={t('adoptionDeed.options.maritalStatus.unmarried')}>{t('adoptionDeed.options.maritalStatus.unmarried')}</option>
                          <option value={t('adoptionDeed.options.maritalStatus.married')}>{t('adoptionDeed.options.maritalStatus.married')}</option>
                          <option value={t('adoptionDeed.options.maritalStatus.divorced')}>{t('adoptionDeed.options.maritalStatus.divorced')}</option>
                          <option value={t('adoptionDeed.options.maritalStatus.widowed')}>{t('adoptionDeed.options.maritalStatus.widowed')}</option>
                        </select>
                      </div>

                      {party.maritalStatus === t('adoptionDeed.options.maritalStatus.married') && (
                        <div className="md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={party.spouseConsent}
                              onChange={(e) => updateFirstParty(index, 'spouseConsent', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                              {t('adoptionDeed.partiesDetails.spouseConsent')} <span className="text-red-500">*</span>
                            </label>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.sonOf')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={party.sonOf}
                          onChange={(e) => updateFirstParty(index, 'sonOf', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.mobile')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={party.mobile}
                          onChange={(e) => updateFirstParty(index, 'mobile', e.target.value)}
                          pattern="[0-9]{10}"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.occupation')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={party.occupation}
                          onChange={(e) => updateFirstParty(index, 'occupation', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          <option value={t('adoptionDeed.options.occupation.govt')}>{t('adoptionDeed.options.occupation.govt')}</option>
                          <option value={t('adoptionDeed.options.occupation.private')}>{t('adoptionDeed.options.occupation.private')}</option>
                          <option value={t('adoptionDeed.options.occupation.business')}>{t('adoptionDeed.options.occupation.business')}</option>
                          <option value={t('adoptionDeed.options.occupation.other')}>{t('adoptionDeed.options.occupation.other')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.idType')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={party.idType}
                          onChange={(e) => updateFirstParty(index, 'idType', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          <option value={t('adoptionDeed.options.idType.aadhaar')}>{t('adoptionDeed.options.idType.aadhaar')}</option>
                          <option value={t('adoptionDeed.options.idType.pan')}>{t('adoptionDeed.options.idType.pan')}</option>
                          <option value={t('adoptionDeed.options.idType.passport')}>{t('adoptionDeed.options.idType.passport')}</option>
                          <option value={t('adoptionDeed.options.idType.voter')}>{t('adoptionDeed.options.idType.voter')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.idNo')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={party.idNo}
                          onChange={(e) => updateFirstParty(index, 'idNo', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.currentAddress')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={party.address}
                          onChange={(e) => updateFirstParty(index, 'address', e.target.value)}
                          rows="3"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFirstParty(index)}
                      className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      {t('common.remove')}
                    </button>
                  </div>
                ))}

                {/* Second Parties */}
                {!formData.isOrphanageAdoption && secondParties.map((party, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      {t('adoptionDeed.partiesDetails.secondParty')} #{index + 1}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
                      <div className="md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">
                          {t('adoptionDeed.partiesDetails.uploadPhoto')} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(`secondPartyPhoto_${index}`, e.target.files[0])}
                            className="w-full md:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="w-20 h-20 sm:w-24 sm:h-24 border border-gray-300 rounded flex items-center justify-center bg-gray-50 flex-shrink-0">
                            {previewPhotos[`secondPartyPhoto_${index}`] ? (
                              <img
                                src={previewPhotos[`secondPartyPhoto_${index}`]}
                                alt={t('adoptionDeed.partiesDetails.photoPreview')}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <span className="text-xs text-gray-500 text-center">{t('adoptionDeed.partiesDetails.photoPreview')}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.gender')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={party.gender}
                          onChange={(e) => updateSecondParty(index, 'gender', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          <option value={t('adoptionDeed.options.genders.male')}>{t('adoptionDeed.options.genders.male')}</option>
                          <option value={t('adoptionDeed.options.genders.female')}>{t('adoptionDeed.options.genders.female')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.prefix')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={party.prefix}
                          onChange={(e) => updateSecondParty(index, 'prefix', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          {party.gender && prefixes[party.gender]?.map(prefix => (
                            <option key={prefix} value={prefix}>{prefix}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={party.name}
                          onChange={(e) => updateSecondParty(index, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.dob')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={party.dob}
                          onChange={(e) => updateSecondParty(index, 'dob', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.sonOf')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={party.sonOf}
                          onChange={(e) => updateSecondParty(index, 'sonOf', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.mobile')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={party.mobile}
                          onChange={(e) => updateSecondParty(index, 'mobile', e.target.value)}
                          pattern="[0-9]{10}"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.occupation')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={party.occupation}
                          onChange={(e) => updateSecondParty(index, 'occupation', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          <option value={t('adoptionDeed.options.occupation.govt')}>{t('adoptionDeed.options.occupation.govt')}</option>
                          <option value={t('adoptionDeed.options.occupation.private')}>{t('adoptionDeed.options.occupation.private')}</option>
                          <option value={t('adoptionDeed.options.occupation.business')}>{t('adoptionDeed.options.occupation.business')}</option>
                          <option value={t('adoptionDeed.options.occupation.other')}>{t('adoptionDeed.options.occupation.other')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.idType')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={party.idType}
                          onChange={(e) => updateSecondParty(index, 'idType', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          <option value={t('adoptionDeed.options.idType.aadhaar')}>{t('adoptionDeed.options.idType.aadhaar')}</option>
                          <option value={t('adoptionDeed.options.idType.pan')}>{t('adoptionDeed.options.idType.pan')}</option>
                          <option value={t('adoptionDeed.options.idType.passport')}>{t('adoptionDeed.options.idType.passport')}</option>
                          <option value={t('adoptionDeed.options.idType.voter')}>{t('adoptionDeed.options.idType.voter')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.idNo')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={party.idNo}
                          onChange={(e) => updateSecondParty(index, 'idNo', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.partiesDetails.currentAddress')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={party.address}
                          onChange={(e) => updateSecondParty(index, 'address', e.target.value)}
                          rows="3"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSecondParty(index)}
                      className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      {t('common.remove')}
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-4 mt-6">
                <button
                  type="button"
                  onClick={addFirstParty}
                  className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors font-semibold"
                >
                  {t('adoptionDeed.partiesDetails.addFirstParty')}
                </button>
                {!formData.isOrphanageAdoption && (
                  <button
                    type="button"
                    onClick={addSecondParty}
                    className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors font-semibold"
                  >
                    {t('adoptionDeed.partiesDetails.addSecondParty')}
                  </button>
                )}
              </div>
            </div>

            {/* Witnesses Section */}
            <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-2 sm:mb-3 border-b-2 border-blue-500 pb-1.5">
                {t('adoptionDeed.witnessDetails.title')}
              </h2>

              <div className="space-y-6">
                {witnesses.map((witness, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      {t('adoptionDeed.witnessDetails.witness')} #{index + 1}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
                      <div className="md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">
                          {t('adoptionDeed.witnessDetails.uploadPhoto')} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(`witnessPhoto_${index}`, e.target.files[0])}
                            className="w-full md:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="w-20 h-20 sm:w-24 sm:h-24 border border-gray-300 rounded flex items-center justify-center bg-gray-50 flex-shrink-0">
                            {previewPhotos[`witnessPhoto_${index}`] ? (
                              <img
                                src={previewPhotos[`witnessPhoto_${index}`]}
                                alt={t('adoptionDeed.witnessDetails.photoPreview')}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <span className="text-xs text-gray-500 text-center">{t('adoptionDeed.witnessDetails.photoPreview')}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.witnessDetails.gender')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={witness.gender}
                          onChange={(e) => updateWitness(index, 'gender', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          <option value={t('adoptionDeed.options.genders.male')}>{t('adoptionDeed.options.genders.male')}</option>
                          <option value={t('adoptionDeed.options.genders.female')}>{t('adoptionDeed.options.genders.female')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.witnessDetails.prefix')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={witness.prefix}
                          onChange={(e) => updateWitness(index, 'prefix', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          {witness.gender && prefixes[witness.gender]?.map(prefix => (
                            <option key={prefix} value={prefix}>{prefix}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.witnessDetails.name')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={witness.name}
                          onChange={(e) => updateWitness(index, 'name', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.witnessDetails.sonOf')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={witness.sonOf}
                          onChange={(e) => updateWitness(index, 'sonOf', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.witnessDetails.mobile')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={witness.mobile}
                          onChange={(e) => updateWitness(index, 'mobile', e.target.value)}
                          pattern="[0-9]{10}"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.witnessDetails.occupation')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={witness.occupation}
                          onChange={(e) => updateWitness(index, 'occupation', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          <option value={t('adoptionDeed.options.occupation.govt')}>{t('adoptionDeed.options.occupation.govt')}</option>
                          <option value={t('adoptionDeed.options.occupation.private')}>{t('adoptionDeed.options.occupation.private')}</option>
                          <option value={t('adoptionDeed.options.occupation.business')}>{t('adoptionDeed.options.occupation.business')}</option>
                          <option value={t('adoptionDeed.options.occupation.other')}>{t('adoptionDeed.options.occupation.other')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.witnessDetails.idType')} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={witness.idType}
                          onChange={(e) => updateWitness(index, 'idType', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        >
                          <option value="">{t('adoptionDeed.options.select')}</option>
                          <option value={t('adoptionDeed.options.idType.aadhaar')}>{t('adoptionDeed.options.idType.aadhaar')}</option>
                          <option value={t('adoptionDeed.options.idType.pan')}>{t('adoptionDeed.options.idType.pan')}</option>
                          <option value={t('adoptionDeed.options.idType.passport')}>{t('adoptionDeed.options.idType.passport')}</option>
                          <option value={t('adoptionDeed.options.idType.voter')}>{t('adoptionDeed.options.idType.voter')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.witnessDetails.idNo')} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={witness.idNo}
                          onChange={(e) => updateWitness(index, 'idNo', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('adoptionDeed.witnessDetails.currentAddress')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={witness.address}
                          onChange={(e) => updateWitness(index, 'address', e.target.value)}
                          rows="3"
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeWitness(index)}
                      className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                    >
                      {t('common.remove')}
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addWitness}
                className="mt-6 bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors font-semibold"
              >
                {t('adoptionDeed.witnessDetails.addWitness')}
              </button>
            </div>

            {/* Rules and Conditions Section */}
            {/* <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-2 sm:mb-3 border-b-2 border-blue-500 pb-1.5">
                {t('adoptionDeed.rulesAndConditions.title')}
              </h2>

              <ul className="space-y-3 text-gray-700">
                {t('adoptionDeed.rulesAndConditions.options', { returnObjects: true }).map((option, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{option}</span>
                  </li>
                ))}
                {formData.isOrphanageAdoption && t('adoptionDeed.rulesAndConditions.orphanageOptions', { returnObjects: true }).map((option, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{option}</span>
                  </li>
                ))}
              </ul>
            </div> */}

            {/* Rules and Conditions Section */}
<div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200">
  <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-2 sm:mb-3 border-b-2 border-blue-500 pb-1.5">
    {t('adoptionDeed.rulesAndConditions.title')}
  </h2>

  {(() => {
    const rules = t('adoptionDeed.rulesAndConditions.options', { returnObjects: true });
    const orphanRules = t('adoptionDeed.rulesAndConditions.orphanageOptions', { returnObjects: true });

    const safeRules = Array.isArray(rules) ? rules : [];
    const safeOrphanRules = Array.isArray(orphanRules) ? orphanRules : [];

    return (
      <ul className="space-y-3 text-gray-700">
        {safeRules.map((option, index) => (
          <li key={index} className="flex items-start">
            <span className="text-blue-600 mr-2">•</span>
            <span>{option}</span>
          </li>
        ))}

        {formData.isOrphanageAdoption &&
          safeOrphanRules.map((option, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>{option}</span>
            </li>
          ))}
      </ul>
    );
  })()}
</div>

            {/* Stamp and Gifts Section */}
            <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg border border-gray-200">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-700 mb-2 sm:mb-3 border-b-2 border-blue-500 pb-1.5">
                {t('adoptionDeed.stampAndGifts.title')}
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.stampAndGifts.stampAmount')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stampAmount"
                    value={formData.stampAmount}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  {errors.stampAmount && <p className="text-red-500 text-sm mt-1">{errors.stampAmount}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.stampAndGifts.stampNo')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="stampNo"
                    value={formData.stampNo}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  {errors.stampNo && <p className="text-red-500 text-sm mt-1">{errors.stampNo}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('adoptionDeed.stampAndGifts.stampDate')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="stampDate"
                    value={formData.stampDate}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  {errors.stampDate && <p className="text-red-500 text-sm mt-1">{errors.stampDate}</p>}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">{t('adoptionDeed.stampAndGifts.giftsTitle')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>{t('common.note')}:</strong> {t('adoptionDeed.stampAndGifts.giftsNote')}
                </p>

                <div className="space-y-4">
                  {gifts.map((gift, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        type="text"
                        value={gift.description}
                        onChange={(e) => updateGift(index, e.target.value)}
                        placeholder={t('adoptionDeed.stampAndGifts.giftPlaceholder')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeGift(index)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                      >
                        {t('common.remove')}
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addGift}
                  className="mt-4 bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors font-semibold"
                >
                  {t('adoptionDeed.stampAndGifts.addGift')}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isLoading ? t('common.submitting') : t('adoptionDeed.buttons.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// const AdoptionDeedForm = () => {
//   return (
//     <FormWorkflowProvider formType="adoption-deed">
//       <FormWorkflow
//         formTitle={t('adoptionDeed.title')}
//         formType="adoption-deed"
//         fields={[
//           { name: 'childName', label: t('adoptionDeed.childDetails.name') },
//           { name: 'childDOB', label: t('adoptionDeed.childDetails.dob') },
//           { name: 'childGender', label: t('adoptionDeed.childDetails.gender') },
//           { name: 'country', label: t('adoptionDeed.country') },
//           { name: 'state', label: t('adoptionDeed.state') },
//           { name: 'district', label: t('adoptionDeed.district') },
//         ]}
//       >
//         <AdoptionDeedFormContent />
//       </FormWorkflow>
//     </FormWorkflowProvider>
//   );
// };

const AdoptionDeedForm = () => {
  const { t } = useTranslation(); // ✅ ADD THIS

  return (
    <FormWorkflowProvider formType="adoption-deed">
      <FormWorkflow
        formTitle={t('adoptionDeed.title')}
        formType="adoption-deed"
        fields={[
          { name: 'childName', label: t('adoptionDeed.childDetails.name') },
          { name: 'childDOB', label: t('adoptionDeed.childDetails.dob') },
          { name: 'childGender', label: t('adoptionDeed.childDetails.gender') },
          { name: 'country', label: t('adoptionDeed.country') },
          { name: 'state', label: t('adoptionDeed.state') },
          { name: 'district', label: t('adoptionDeed.district') },
        ]}
      >
        <AdoptionDeedFormContent />
      </FormWorkflow>
    </FormWorkflowProvider>
  );
};

export default AdoptionDeedForm;

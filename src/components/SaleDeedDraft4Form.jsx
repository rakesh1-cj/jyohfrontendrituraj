"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getFieldLabel, detectFormLanguage } from '@/utils/fieldLabelTranslations';
import { LanguageBadge } from '@/components/LanguageAwareFormDisplay';

// Constants
const STAMP_DUTY_RATE = 0.07;
const REGISTRATION_CHARGE_RATE = 0.01;
const PARKING_CHARGE_RATE = 0.04;
const NALKOOP_RATE = 20000;
const BOREWELL_RATE = 15000;
const TREE_RATES = {
  'mango': 15000,
  'neem': 10000,
  'eucalyptus': 5000,
  'guava': 8000
};

const CONSTRUCTION_RATES = {
  'residential': {
    '1st_class': 16000,
    '2nd_class': 14000,
    '3rd_class': 12000,
    '4th_class': 10000
  },
  'commercial': {
    'single-shop': 18000,
    'multiple-shops': 20000,
    'mall': 22000
  }
};

const ROOM_TYPES = ['Bedroom', 'Kitchen', 'Bathroom', 'Drawing Room', 'Dining Room', 'Hall', 'Open Area', 'Balcony', 'Washing Room', 'Servant Room'];

// Utility functions
const convertToHectare = (value, unit) => {
  if (!value) return 0;
  switch (unit) {
    case 'sq_meters':
      return value / 10000;
    case 'sq_yards':
      return value * 0.0000836127;
    case 'sq_feet':
      return value * 0.0000092903;
    case 'acre':
      return value * 0.404686;
    case 'bigha':
      return value * 0.252928;
    case 'kanal':
      return value * 0.0505857;
    case 'marla':
      return value * 0.00252928;
    case 'hectare':
    default:
      return value;
  }
};

const convertToSqMeters = (value, unit) => {
  if (!value) return 0;
  switch (unit) {
    case 'sq_yards':
      return value * 0.836127;
    case 'sq_feet':
      return value * 0.092903;
    case 'acre':
      return value * 4046.86;
    case 'hectare':
      return value * 10000;
    case 'sq_meters':
    default:
      return value;
  }
};

const convertToMeters = (value, unit) => {
  if (!value) return 0;
  switch (unit) {
    case 'feet':
      return value * 0.3048;
    case 'meters':
    default:
      return value;
  }
};

export default function SaleDeedDraft4Form() {
  const router = useRouter();
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCalculations, setShowCalculations] = useState(false);
  const [calculationResults, setCalculationResults] = useState(null);
  const [formLanguage, setFormLanguage] = useState('en'); // Language state

  // Form state
  const [formData, setFormData] = useState({
    documentType: '',
    propertyType: '',
    plotType: '',
    salePrice: '',
    circleRateAmount: '',
    areaInputType: 'total',
    area: '',
    areaUnit: 'sq_meters',
    propertyLength: '',
    propertyWidth: '',
    dimUnit: 'meters',
    buildupType: 'single-shop',
    numShops: 1,
    numFloorsMall: 1,
    numFloorsMulti: 1,
    superAreaMulti: '',
    coveredAreaMulti: '',
    nalkoopCount: 0,
    borewellCount: 0,
    state: '',
    district: '',
    tehsil: '',
    village: '',
    khasraNo: '',
    plotNo: '',
    colonyName: '',
    wardNo: '',
    streetNo: '',
    roadSize: '',
    roadUnit: 'meter',
    doubleSideRoad: false,
    directionNorth: '',
    directionEast: '',
    directionSouth: '',
    directionWest: '',
    coveredParkingCount: 0,
    openParkingCount: 0,
    deductionType: '',
    otherDeductionPercent: '',
    selectAllFacilities: false,
    otherFacilityName: '',
  });

  // Dynamic arrays
  const [sellers, setSellers] = useState([{
    name: '',
    relation: '',
    address: '',
    mobile: '',
    idType: '',
    idNo: ''
  }]);

  const [buyers, setBuyers] = useState([{
    name: '',
    relation: '',
    address: '',
    mobile: '',
    idType: '',
    idNo: ''
  }]);

  const [witnesses, setWitnesses] = useState([
    { name: '', relation: '', address: '', mobile: '' },
    { name: '', relation: '', address: '', mobile: '' }
  ]);

  const [rooms, setRooms] = useState([]);
  const [trees, setTrees] = useState([]);
  const [shops, setShops] = useState([]);
  const [mallFloors, setMallFloors] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [dynamicFacilities, setDynamicFacilities] = useState([]);

  // Check if Staff 1 is filling form
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStaff1Filling = sessionStorage.getItem('staff1_filling_form') === 'true';
      const formId = sessionStorage.getItem('staff1_formId');
      
      if (isStaff1Filling && formId) {
        // Load existing draft data if available
        loadDraftData(formId);
      }
    }
  }, []);

  const loadDraftData = async (formId) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/1/forms/${formId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        const form = data.data?.form;
        if (form) {
          const fields = form.allFields || form.fields || form.data || {};
          
          // Detect and set language
          const detectedLanguage = form.language || detectFormLanguage(fields);
          setFormLanguage(detectedLanguage);
          
          // Populate form data
          setFormData(prev => ({
            ...prev,
            ...fields
          }));

          // Populate arrays
          if (fields.sellers) setSellers(fields.sellers);
          if (fields.buyers) setBuyers(fields.buyers);
          if (fields.witnesses) setWitnesses(fields.witnesses);
          if (fields.rooms) setRooms(fields.rooms);
          if (fields.trees) setTrees(fields.trees);
            if (fields.shops) {
              const shopArray = Array.isArray(fields.shops) 
                ? fields.shops.map(area => typeof area === 'object' && area !== null ? area : { area })
                : [];
              setShops(shopArray);
              updateFormData('numShops', shopArray.length);
            }
            if (fields.mallFloors) {
              const floorArray = Array.isArray(fields.mallFloors)
                ? fields.mallFloors.map(area => typeof area === 'object' && area !== null ? area : { area })
                : [];
              setMallFloors(floorArray);
              updateFormData('numFloorsMall', floorArray.length);
            }
        }
      }
    } catch (error) {
      console.error('Error loading draft data:', error);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSeller = () => {
    setSellers([...sellers, { name: '', relation: '', address: '', mobile: '', idType: '', idNo: '' }]);
  };

  const removeSeller = (index) => {
    setSellers(sellers.filter((_, i) => i !== index));
  };

  const updateSeller = (index, field, value) => {
    const updated = [...sellers];
    updated[index] = { ...updated[index], [field]: value };
    setSellers(updated);
  };

  const addBuyer = () => {
    setBuyers([...buyers, { name: '', relation: '', address: '', mobile: '', idType: '', idNo: '' }]);
  };

  const removeBuyer = (index) => {
    setBuyers(buyers.filter((_, i) => i !== index));
  };

  const updateBuyer = (index, field, value) => {
    const updated = [...buyers];
    updated[index] = { ...updated[index], [field]: value };
    setBuyers(updated);
  };

  const updateWitness = (index, field, value) => {
    const updated = [...witnesses];
    updated[index] = { ...updated[index], [field]: value };
    setWitnesses(updated);
  };

  const addRoom = () => {
    setRooms([...rooms, { type: 'bedroom', length: '', width: '' }]);
  };

  const removeRoom = (index) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const updateRoom = (index, field, value) => {
    const updated = [...rooms];
    updated[index] = { ...updated[index], [field]: value };
    setRooms(updated);
  };

  const addTree = () => {
    setTrees([...trees, { type: 'mango', count: 1 }]);
  };

  const removeTree = (index) => {
    setTrees(trees.filter((_, i) => i !== index));
  };

  const updateTree = (index, field, value) => {
    const updated = [...trees];
    updated[index] = { ...updated[index], [field]: value };
    setTrees(updated);
  };

  const addShop = () => {
    const newShops = [...shops, { area: '' }];
    setShops(newShops);
    updateFormData('numShops', newShops.length);
  };

  const removeShop = (index) => {
    const newShops = shops.filter((_, i) => i !== index);
    setShops(newShops);
    updateFormData('numShops', newShops.length);
  };

  const updateShop = (index, value) => {
    const updated = [...shops];
    updated[index] = { ...updated[index], area: value };
    setShops(updated);
  };

  const addMallFloor = () => {
    const newFloors = [...mallFloors, { area: '' }];
    setMallFloors(newFloors);
    updateFormData('numFloorsMall', newFloors.length);
  };

  const removeMallFloor = (index) => {
    const newFloors = mallFloors.filter((_, i) => i !== index);
    setMallFloors(newFloors);
    updateFormData('numFloorsMall', newFloors.length);
  };

  const updateMallFloor = (index, value) => {
    const updated = [...mallFloors];
    updated[index] = { ...updated[index], area: value };
    setMallFloors(updated);
  };

  const toggleFacility = (facility) => {
    if (facilities.includes(facility)) {
      setFacilities(facilities.filter(f => f !== facility));
    } else {
      setFacilities([...facilities, facility]);
    }
  };

  const selectAllFacilities = (checked) => {
    const allFacilities = ['swimming_pool', 'gym', 'club_house', 'garden', 'security_guard', 'park', 'lift', ...dynamicFacilities];
    if (checked) {
      setFacilities(allFacilities);
    } else {
      setFacilities([]);
    }
    updateFormData('selectAllFacilities', checked);
  };

  const addOtherFacility = () => {
    if (formData.otherFacilityName.trim()) {
      const facilityName = formData.otherFacilityName.toLowerCase().replace(' ', '_');
      setDynamicFacilities([...dynamicFacilities, facilityName]);
      setFacilities([...facilities, facilityName]);
      updateFormData('otherFacilityName', '');
    }
  };

  const getFormValues = () => {
    const { propertyType, plotType, documentType, salePrice, circleRateAmount, areaInputType, area, areaUnit, 
            propertyLength, propertyWidth, dimUnit, buildupType, doubleSideRoad, deductionType, 
            otherDeductionPercent, coveredParkingCount, openParkingCount, nalkoopCount, borewellCount,
            superAreaMulti, coveredAreaMulti } = formData;

    if (!documentType || !propertyType || !salePrice || !circleRateAmount) {
      alert("Please fill in all required fields (Document Type, Property Type, Sale Price, Circle Rate Amount).");
      return null;
    }

    let totalPlotAreaSqMeters = 0;
    if (propertyType !== 'agriculture') {
      if (areaInputType === 'total') {
        totalPlotAreaSqMeters = convertToSqMeters(parseFloat(area) || 0, areaUnit);
      } else if (areaInputType === 'dimensions') {
        const lengthMeters = convertToMeters(parseFloat(propertyLength) || 0, dimUnit);
        const widthMeters = convertToMeters(parseFloat(propertyWidth) || 0, dimUnit);
        totalPlotAreaSqMeters = lengthMeters * widthMeters;
      }
    } else {
      const areaValue = parseFloat(area) || 0;
      totalPlotAreaSqMeters = convertToSqMeters(convertToHectare(areaValue, areaUnit) * 10000, 'sq_meters');
    }

    if (totalPlotAreaSqMeters <= 0 && propertyType !== 'flat' && propertyType !== 'multistory') {
      alert("Please provide a valid property area.");
      return null;
    }

    let totalBuildupAreaSqMeters = 0;
    let buildupValue = 0;
    let additionCharges = 0;

    if (propertyType === 'residential') {
      if (plotType === 'buildup') {
        const buildupAreaSqFt = totalPlotAreaSqMeters * 10.7639;
        const buildupRate = CONSTRUCTION_RATES.residential['1st_class'];
        buildupValue = buildupAreaSqFt * buildupRate;
      } else if (plotType === 'flat') {
        let totalRoomsAreaSqFt = 0;
        rooms.forEach(room => {
          const length = parseFloat(room.length) || 0;
          const width = parseFloat(room.width) || 0;
          totalRoomsAreaSqFt += length * width;
        });
        totalBuildupAreaSqMeters = totalRoomsAreaSqFt * 0.092903;
        const buildupRate = CONSTRUCTION_RATES.residential['1st_class'];
        buildupValue = totalRoomsAreaSqFt * buildupRate;

        facilities.forEach(facility => {
          additionCharges += totalBuildupAreaSqMeters * 1; // Each facility adds 1 per sq meter
        });
      } else if (plotType === 'multistory') {
        const coveredAreaSqFt = parseFloat(coveredAreaMulti) || 0;
        totalBuildupAreaSqMeters = coveredAreaSqFt * 0.092903;
        const buildupRate = CONSTRUCTION_RATES.residential['1st_class'];
        buildupValue = coveredAreaSqFt * buildupRate;

        additionCharges += (parseInt(coveredParkingCount) + parseInt(openParkingCount)) * PARKING_CHARGE_RATE * parseFloat(circleRateAmount) * 100;

        facilities.forEach(facility => {
          additionCharges += coveredAreaSqFt * 1;
        });
      }
    } else if (propertyType === 'commercial') {
      if (plotType === 'buildup') {
        if (buildupType === 'single-shop' || buildupType === 'multiple-shops') {
          let totalShopAreaSqFt = 0;
          shops.forEach(shop => {
            totalShopAreaSqFt += parseFloat(shop.area) || 0;
          });
          totalBuildupAreaSqMeters = totalShopAreaSqFt * 0.092903;
          const buildupRate = CONSTRUCTION_RATES.commercial[buildupType];
          buildupValue = totalShopAreaSqFt * buildupRate;
        } else if (buildupType === 'mall') {
          let totalFloorAreaSqFt = 0;
          mallFloors.forEach(floor => {
            totalFloorAreaSqFt += parseFloat(floor.area) || 0;
          });
          totalBuildupAreaSqMeters = totalFloorAreaSqFt * 0.092903;
          const buildupRate = CONSTRUCTION_RATES.commercial[buildupType];
          buildupValue = totalFloorAreaSqFt * buildupRate;
        }
      }
    } else if (propertyType === 'agriculture') {
      additionCharges += parseInt(nalkoopCount) * NALKOOP_RATE;
      additionCharges += parseInt(borewellCount) * BOREWELL_RATE;

      trees.forEach(tree => {
        const count = parseInt(tree.count) || 0;
        if (TREE_RATES[tree.type]) {
          additionCharges += TREE_RATES[tree.type] * count;
        }
      });
    }

    let baseCircleRateValue = (totalPlotAreaSqMeters / 10.7639) * parseFloat(circleRateAmount);

    if (doubleSideRoad) {
      baseCircleRateValue *= 1.10;
    }

    let finalCircleRateValue = baseCircleRateValue + buildupValue + additionCharges;
    const finalValue = Math.max(parseFloat(salePrice), finalCircleRateValue);

    let stampDuty = finalValue * STAMP_DUTY_RATE;
    let registrationCharge = finalValue * REGISTRATION_CHARGE_RATE;
    let deductionAmount = 0;

    if (deductionType === 'female') {
      deductionAmount = finalValue * 0.01;
      stampDuty -= deductionAmount;
    } else if (deductionType === 'ex-serviceman') {
      stampDuty = 100;
    } else if (deductionType === 'handicapped') {
      const handicappedDeductionBase = Math.min(finalValue, 500000);
      deductionAmount = handicappedDeductionBase * 0.25;
      stampDuty -= deductionAmount;
    } else if (deductionType === 'other') {
      const otherDeductionPercentValue = parseFloat(otherDeductionPercent) || 0;
      deductionAmount = finalValue * (otherDeductionPercentValue / 100);
      stampDuty -= deductionAmount;
    }

    stampDuty = Math.max(0, stampDuty);

    const finalPayableAmount = stampDuty + registrationCharge;

    return {
      salePrice: parseFloat(salePrice),
      totalPlotAreaSqMeters,
      totalBuildupAreaSqMeters,
      baseCircleRateValue,
      finalCircleRateValue,
      stampDuty,
      registrationCharge,
      finalPayableAmount,
      deductionAmount,
      propertyType,
      plotType
    };
  };

  const displayResults = (results) => {
    setCalculationResults(results);
    setShowCalculations(true);
  };

  const handleShowCalculations = () => {
    const results = getFormValues();
    if (results) {
      displayResults(results);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const results = getFormValues();
      if (!results) return;

      const formDataToSave = {
        ...formData,
        sellers,
        buyers,
        witnesses,
        rooms,
        trees,
        shops,
        mallFloors,
        facilities,
        calculations: results
      };

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const isStaff1Filling = typeof window !== 'undefined' && sessionStorage.getItem('staff1_filling_form') === 'true';
      const formId = typeof window !== 'undefined' ? sessionStorage.getItem('staff1_formId') : null;

      if (isStaff1Filling && formId) {
        // Update existing draft
        const response = await fetch(`${API_BASE}/api/staff/1/forms/${formId}/correct`, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: formDataToSave,
            correctionNotes: 'Draft saved'
          })
        });

        if (response.ok) {
          alert('Draft saved successfully!');
        } else {
          throw new Error('Failed to save draft');
        }
      } else {
        // Create new draft
        const response = await fetch(`${API_BASE}/api/forms/save`, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            serviceType: 'sale-deed',
            fields: formDataToSave,
            formTitle: 'Sale Deed',
            formDescription: 'Sale Deed - Property Deed Details'
          })
        });

        if (response.ok) {
          const data = await response.json();
          alert('Draft created successfully!');
          if (data.data?.formData?._id) {
            router.push(`/staff1/forms/${data.data.formData._id}`);
          }
        } else {
          throw new Error('Failed to create draft');
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Error saving draft: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const results = getFormValues();
      if (!results) {
        alert('Please fill in all required fields and show calculations before submitting.');
        return;
      }

      const formDataToSubmit = {
        ...formData,
        sellers,
        buyers,
        witnesses,
        rooms,
        trees,
        shops,
        mallFloors,
        facilities,
        calculations: results
      };

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const isStaff1Filling = typeof window !== 'undefined' && sessionStorage.getItem('staff1_filling_form') === 'true';
      const formId = typeof window !== 'undefined' ? sessionStorage.getItem('staff1_formId') : null;
      const onBehalfOfUserId = typeof window !== 'undefined' ? sessionStorage.getItem('staff1_onBehalfOfUserId') || '' : '';

      if (!isStaff1Filling) {
        alert('This form can only be submitted by Staff 1.');
        return;
      }

      // Submit form using Staff 1 submit endpoint
      const response = await fetch(`${API_BASE}/api/staff/1/forms/submit`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formId: formId,
          serviceType: 'sale-deed',
          fields: formDataToSubmit,
          formTitle: 'Sale Deed',
          formDescription: 'Sale Deed - Property Deed Details',
          onBehalfOfUserId: onBehalfOfUserId || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Form submitted successfully! It will now be reviewed by Staff 3.');
        // Clear session storage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('staff1_filling_form');
          sessionStorage.removeItem('staff1_formId');
          sessionStorage.removeItem('staff1_form_serviceType');
          sessionStorage.removeItem('staff1_onBehalfOfUserId');
          sessionStorage.removeItem('staff1_use_draft4');
        }
        // Redirect to Staff 1 forms page
        router.push('/staff1/forms');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Populate form data
        Object.keys(data).forEach(key => {
          if (key !== 'sellers' && key !== 'buyers' && key !== 'witnesses' && 
              key !== 'rooms' && key !== 'trees' && key !== 'shops' && 
              key !== 'mallFloors' && key !== 'facilities') {
            updateFormData(key, data[key]);
          }
        });

        if (data.sellers) setSellers(data.sellers);
        if (data.buyers) setBuyers(data.buyers);
        if (data.witnesses) setWitnesses(data.witnesses);
        if (data.rooms) setRooms(data.rooms);
        if (data.trees) setTrees(data.trees);
        if (data.shops) {
          setShops(data.shops.map(area => ({ area })));
          updateFormData('numShops', data.shops.length);
        }
        if (data.mallFloors) {
          setMallFloors(data.mallFloors.map(area => ({ area })));
          updateFormData('numFloorsMall', data.mallFloors.length);
        }
        if (data.facilities) setFacilities(data.facilities);

        alert("Form data imported successfully!");
      } catch (e) {
        alert("Failed to parse JSON file. Please ensure it's a valid JSON format.");
        console.error(e);
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const formDataToExport = {
      ...formData,
      sellers,
      buyers,
      witnesses,
      rooms,
      trees,
      shops: shops.map(s => s.area),
      mallFloors: mallFloors.map(f => f.area),
      facilities
    };

    const dataStr = JSON.stringify(formDataToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "sale-deed-draft-4.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Form data exported as sale-deed-draft-4.json");
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all form data?')) {
      setFormData({
        documentType: '',
        propertyType: '',
        plotType: '',
        salePrice: '',
        circleRateAmount: '',
        areaInputType: 'total',
        area: '',
        areaUnit: 'sq_meters',
        propertyLength: '',
        propertyWidth: '',
        dimUnit: 'meters',
        buildupType: 'single-shop',
        numShops: 1,
        numFloorsMall: 1,
        numFloorsMulti: 1,
        superAreaMulti: '',
        coveredAreaMulti: '',
        nalkoopCount: 0,
        borewellCount: 0,
        state: '',
        district: '',
        tehsil: '',
        village: '',
        khasraNo: '',
        plotNo: '',
        colonyName: '',
        wardNo: '',
        streetNo: '',
        roadSize: '',
        roadUnit: 'meter',
        doubleSideRoad: false,
        directionNorth: '',
        directionEast: '',
        directionSouth: '',
        directionWest: '',
        coveredParkingCount: 0,
        openParkingCount: 0,
        deductionType: '',
        otherDeductionPercent: '',
        selectAllFacilities: false,
        otherFacilityName: '',
      });
      setSellers([{ name: '', relation: '', address: '', mobile: '', idType: '', idNo: '' }]);
      setBuyers([{ name: '', relation: '', address: '', mobile: '', idType: '', idNo: '' }]);
      setWitnesses([
        { name: '', relation: '', address: '', mobile: '' },
        { name: '', relation: '', address: '', mobile: '' }
      ]);
      setRooms([]);
      setTrees([]);
      setShops([]);
      setMallFloors([]);
      setFacilities([]);
      setDynamicFacilities([]);
      setShowCalculations(false);
      setCalculationResults(null);
    }
  };

  const getPartyDetails = () => {
    const sellerNames = sellers.filter(s => s.name.trim()).map(s => s.name);
    const buyerNames = buyers.filter(b => b.name.trim()).map(b => b.name);
    return { sellerNames, buyerNames };
  };

  const { sellerNames, buyerNames } = getPartyDetails();

  const showBuildupDetails = formData.propertyType === 'residential' || formData.propertyType === 'commercial';
  const showAgricultureDetails = formData.propertyType === 'agriculture';
  const showFlatDetails = formData.plotType === 'flat';
  const showMultistoryDetails = formData.plotType === 'multistory';
  const showBuildupSection = formData.plotType === 'buildup';
  const showCommonFacilities = (formData.plotType === 'flat' || formData.plotType === 'multistory' || formData.plotType === 'buildup') && 
                               (formData.propertyType === 'residential' || formData.propertyType === 'commercial');

  // Helper function to get translated label
  const getLabel = (key) => getFieldLabel(key, formLanguage);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Language Badge */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800">Property Deed Details</h2>
          <LanguageBadge language={formLanguage} size="md" />
        </div>
        
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Property Information Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">Property Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => updateFormData('documentType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Deed Type</option>
                  <option value="sale-deed">Sale Deed</option>
                  <option value="gift-deed">Gift Deed</option>
                  <option value="partition-deed">Partition Deed</option>
                  <option value="exchange-deed">Exchange Deed</option>
                  <option value="other-deed">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => {
                    updateFormData('propertyType', e.target.value);
                    if (e.target.value === 'agriculture') {
                      updateFormData('plotType', '');
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="residential">Residential</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
            </div>

            {showBuildupDetails && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Plot Type *</label>
                <select
                  value={formData.plotType}
                  onChange={(e) => updateFormData('plotType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Plot Type</option>
                  <option value="vacant">Vacant Plot/Land</option>
                  <option value="buildup">Buildup</option>
                  {formData.propertyType === 'residential' && (
                    <>
                      <option value="flat">Flat/Floor</option>
                      <option value="multistory">Multistory</option>
                    </>
                  )}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Consideration Price (INR) *</label>
                <input
                  type="number"
                  value={formData.salePrice}
                  onChange={(e) => updateFormData('salePrice', e.target.value)}
                  min="1"
                  step="any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Circle Rate Amount (per unit area) (INR) *</label>
                <input
                  type="number"
                  value={formData.circleRateAmount}
                  onChange={(e) => updateFormData('circleRateAmount', e.target.value)}
                  min="1"
                  step="any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Area Input Type</label>
              <select
                value={formData.areaInputType}
                onChange={(e) => updateFormData('areaInputType', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="total">Total Area</option>
                <option value="dimensions">Length & Width</option>
              </select>
            </div>

            {formData.areaInputType === 'total' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Area *</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => updateFormData('area', e.target.value)}
                    min="1"
                    step="any"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area Unit</label>
                  <select
                    value={formData.areaUnit}
                    onChange={(e) => updateFormData('areaUnit', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="sq_meters">Sq. Meters</option>
                    <option value="sq_yards">Sq. Yards</option>
                    <option value="sq_feet">Sq. Feet</option>
                    <option value="acre">Acre</option>
                    <option value="hectare">Hectare</option>
                    <option value="bigha">Bigha</option>
                    <option value="kanal">Kanal</option>
                    <option value="marla">Marla</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Length *</label>
                  <input
                    type="number"
                    value={formData.propertyLength}
                    onChange={(e) => updateFormData('propertyLength', e.target.value)}
                    min="1"
                    step="any"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width *</label>
                  <input
                    type="number"
                    value={formData.propertyWidth}
                    onChange={(e) => updateFormData('propertyWidth', e.target.value)}
                    min="1"
                    step="any"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={formData.dimUnit}
                    onChange={(e) => updateFormData('dimUnit', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="meters">Meters</option>
                    <option value="feet">Feet</option>
                  </select>
                </div>
              </div>
            )}

            {/* Buildup Details */}
            {showBuildupSection && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Buildup Details</h4>
                {formData.propertyType === 'commercial' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buildup Type</label>
                    <select
                      value={formData.buildupType}
                      onChange={(e) => {
                        updateFormData('buildupType', e.target.value);
                        // Initialize arrays when type changes
                        if (e.target.value === 'mall') {
                          if (mallFloors.length === 0) {
                            setMallFloors([{ area: '' }]);
                            updateFormData('numFloorsMall', 1);
                          }
                          setShops([]);
                        } else {
                          if (shops.length === 0) {
                            setShops([{ area: '' }]);
                            updateFormData('numShops', 1);
                          }
                          setMallFloors([]);
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="single-shop">Single Shop</option>
                      <option value="multiple-shops">Multiple Shops</option>
                      <option value="mall">Mall</option>
                    </select>
                  </div>
                )}

                {(formData.buildupType === 'single-shop' || formData.buildupType === 'multiple-shops') && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-md font-medium text-gray-700">Shop Details</h5>
                      <button
                        type="button"
                        onClick={addShop}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Add Shop
                      </button>
                    </div>
                    {shops.map((shop, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2 p-3 bg-white rounded border">
                        <label className="text-sm font-medium text-gray-700 min-w-[100px]">Shop {index + 1} Area (Sq.Ft.)</label>
                        <input
                          type="number"
                          value={shop.area}
                          onChange={(e) => updateShop(index, e.target.value)}
                          min="1"
                          step="any"
                          className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeShop(index)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {formData.buildupType === 'mall' && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-md font-medium text-gray-700">Mall Floor Details</h5>
                      <button
                        type="button"
                        onClick={addMallFloor}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                      >
                        Add Floor
                      </button>
                    </div>
                    {mallFloors.map((floor, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2 p-3 bg-white rounded border">
                        <label className="text-sm font-medium text-gray-700 min-w-[100px]">Floor {index + 1} Area (Sq.Ft.)</label>
                        <input
                          type="number"
                          value={floor.area}
                          onChange={(e) => updateMallFloor(index, e.target.value)}
                          min="1"
                          step="any"
                          className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeMallFloor(index)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Flat Details */}
            {showFlatDetails && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Flat/Floor Details</h4>
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={addRoom}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Add Room
                  </button>
                </div>
                {rooms.map((room, index) => (
                  <div key={index} className="mb-3 p-3 bg-white rounded border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                        <select
                          value={room.type}
                          onChange={(e) => updateRoom(index, 'type', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          {ROOM_TYPES.map(type => (
                            <option key={type} value={type.toLowerCase().replace(' ', '-')}>{type}</option>
                          ))}
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Length (Ft)</label>
                        <input
                          type="number"
                          value={room.length}
                          onChange={(e) => updateRoom(index, 'length', e.target.value)}
                          min="1"
                          step="any"
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Width (Ft)</label>
                        <input
                          type="number"
                          value={room.width}
                          onChange={(e) => updateRoom(index, 'width', e.target.value)}
                          min="1"
                          step="any"
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeRoom(index)}
                          className="w-full px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Multistory Details */}
            {showMultistoryDetails && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Multistory Building Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Super Area (Sq. Ft.)</label>
                    <input
                      type="number"
                      value={formData.superAreaMulti}
                      onChange={(e) => updateFormData('superAreaMulti', e.target.value)}
                      min="0"
                      step="any"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Covered Area (Sq. Ft.)</label>
                    <input
                      type="number"
                      value={formData.coveredAreaMulti}
                      onChange={(e) => updateFormData('coveredAreaMulti', e.target.value)}
                      min="0"
                      step="any"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Agriculture Details */}
            {showAgricultureDetails && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Agriculture Land Additions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nalkoop Count</label>
                    <input
                      type="number"
                      value={formData.nalkoopCount}
                      onChange={(e) => updateFormData('nalkoopCount', e.target.value)}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.nalkoopCount > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Amount: ₹{(formData.nalkoopCount * NALKOOP_RATE).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Borewell Count</label>
                    <input
                      type="number"
                      value={formData.borewellCount}
                      onChange={(e) => updateFormData('borewellCount', e.target.value)}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.borewellCount > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Amount: ₹{(formData.borewellCount * BOREWELL_RATE).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-md font-medium text-gray-700">Trees</h5>
                    <button
                      type="button"
                      onClick={addTree}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      Add Tree
                    </button>
                  </div>
                  {trees.map((tree, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2 p-3 bg-white rounded border">
                      <select
                        value={tree.type}
                        onChange={(e) => updateTree(index, 'type', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.keys(TREE_RATES).map(type => (
                          <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="number"
                        value={tree.count}
                        onChange={(e) => updateTree(index, 'count', e.target.value)}
                        min="1"
                        placeholder="Count"
                        className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      {tree.type !== 'other' && TREE_RATES[tree.type] && (
                        <span className="text-sm text-gray-600">
                          Amount: ₹{(tree.count * TREE_RATES[tree.type]).toLocaleString()}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeTree(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Seller Details Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-700 pb-2 border-b-2 border-blue-500">Seller Details</h3>
              <button
                type="button"
                onClick={addSeller}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Add More Sellers
              </button>
            </div>
            {sellers.map((seller, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-700">Seller {index + 1}</h4>
                  {sellers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSeller(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={seller.name}
                      onChange={(e) => updateSeller(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Son of / Husband of</label>
                    <input
                      type="text"
                      value={seller.relation}
                      onChange={(e) => updateSeller(index, 'relation', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={seller.address}
                      onChange={(e) => updateSeller(index, 'address', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No.</label>
                    <input
                      type="text"
                      value={seller.mobile}
                      onChange={(e) => updateSeller(index, 'mobile', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Card Type</label>
                    <select
                      value={seller.idType}
                      onChange={(e) => updateSeller(index, 'idType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select ID Type</option>
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="voter-id">Voter ID</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Card No.</label>
                    <input
                      type="text"
                      value={seller.idNo}
                      onChange={(e) => updateSeller(index, 'idNo', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Buyer Details Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-700 pb-2 border-b-2 border-blue-500">Buyer Details</h3>
              <button
                type="button"
                onClick={addBuyer}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Add More Buyers
              </button>
            </div>
            {buyers.map((buyer, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-gray-700">Buyer {index + 1}</h4>
                  {buyers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBuyer(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={buyer.name}
                      onChange={(e) => updateBuyer(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Son of / Husband of</label>
                    <input
                      type="text"
                      value={buyer.relation}
                      onChange={(e) => updateBuyer(index, 'relation', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={buyer.address}
                      onChange={(e) => updateBuyer(index, 'address', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No.</label>
                    <input
                      type="text"
                      value={buyer.mobile}
                      onChange={(e) => updateBuyer(index, 'mobile', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Card Type</label>
                    <select
                      value={buyer.idType}
                      onChange={(e) => updateBuyer(index, 'idType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select ID Type</option>
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="passport">Passport</option>
                      <option value="voter-id">Voter ID</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID Card No.</label>
                    <input
                      type="text"
                      value={buyer.idNo}
                      onChange={(e) => updateBuyer(index, 'idNo', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Party Details Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">Party Details</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">First Party (Seller):</label>
              <div className="p-3 bg-blue-50 rounded-lg">
                {sellerNames.length > 0 ? (
                  sellerNames.map((name, index) => (
                    <div key={index} className="font-semibold text-blue-800">
                      {name} {index === sellerNames.length - 1 ? '(Hereinafter Called The First Party)' : ''}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No sellers added yet</div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Second Party (Buyer):</label>
              <div className="p-3 bg-green-50 rounded-lg">
                {buyerNames.length > 0 ? (
                  buyerNames.map((name, index) => (
                    <div key={index} className="font-semibold text-green-800">
                      {name} {index === buyerNames.length - 1 ? '(Hereinafter Called The Second Party)' : ''}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No buyers added yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Witness Details Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">Witness Details</h3>
            {witnesses.map((witness, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Witness {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={witness.name}
                      onChange={(e) => updateWitness(index, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Son of / Husband of</label>
                    <input
                      type="text"
                      value={witness.relation}
                      onChange={(e) => updateWitness(index, 'relation', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={witness.address}
                      onChange={(e) => updateWitness(index, 'address', e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No.</label>
                    <input
                      type="text"
                      value={witness.mobile}
                      onChange={(e) => updateWitness(index, 'mobile', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Property Description Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">Property Description</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District *</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => updateFormData('district', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tehsil *</label>
                <input
                  type="text"
                  value={formData.tehsil}
                  onChange={(e) => updateFormData('tehsil', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village / Locality *</label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) => updateFormData('village', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khasra/Survey No.</label>
                <input
                  type="text"
                  value={formData.khasraNo}
                  onChange={(e) => updateFormData('khasraNo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plot No.</label>
                <input
                  type="text"
                  value={formData.plotNo}
                  onChange={(e) => updateFormData('plotNo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Colony Name</label>
                <input
                  type="text"
                  value={formData.colonyName}
                  onChange={(e) => updateFormData('colonyName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward No.</label>
                <input
                  type="text"
                  value={formData.wardNo}
                  onChange={(e) => updateFormData('wardNo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street No.</label>
                <input
                  type="text"
                  value={formData.streetNo}
                  onChange={(e) => updateFormData('streetNo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Road Size</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.roadSize}
                    onChange={(e) => updateFormData('roadSize', e.target.value)}
                    step="any"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={formData.roadUnit}
                    onChange={(e) => updateFormData('roadUnit', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="meter">Meter</option>
                    <option value="foot">Foot</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.doubleSideRoad}
                  onChange={(e) => updateFormData('doubleSideRoad', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Double Side Road (+10% on Circle Rate)</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Directions (North, East, South, West)</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={formData.directionNorth}
                  onChange={(e) => updateFormData('directionNorth', e.target.value)}
                  placeholder="North"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData.directionEast}
                  onChange={(e) => updateFormData('directionEast', e.target.value)}
                  placeholder="East"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData.directionSouth}
                  onChange={(e) => updateFormData('directionSouth', e.target.value)}
                  placeholder="South"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData.directionWest}
                  onChange={(e) => updateFormData('directionWest', e.target.value)}
                  placeholder="West"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Common Facilities Section */}
          {showCommonFacilities && (
            <div className="mb-8 p-6 border border-gray-200 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">Common Facilities</h3>
              <p className="text-sm text-gray-600 mb-4">These charges will increase the **Circle Rate Value**.</p>
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.selectAllFacilities}
                    onChange={(e) => selectAllFacilities(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Select/Deselect All</span>
                </label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {['swimming_pool', 'gym', 'club_house', 'garden', 'security_guard', 'park', 'lift'].map(facility => (
                  <label key={facility} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={facilities.includes(facility)}
                      onChange={() => toggleFacility(facility)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{facility.replace('_', ' ')}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={facilities.includes('others')}
                    onChange={() => toggleFacility('others')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Others</span>
                </label>
              </div>
              {facilities.includes('others') && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={formData.otherFacilityName}
                    onChange={(e) => updateFormData('otherFacilityName', e.target.value)}
                    placeholder="Type a facility name here"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addOtherFacility}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Add
                  </button>
                </div>
              )}
              {dynamicFacilities.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {dynamicFacilities.map(facility => (
                    <label key={facility} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={facilities.includes(facility)}
                        onChange={() => toggleFacility(facility)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{facility.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Covered Parking Count</label>
                  <input
                    type="number"
                    value={formData.coveredParkingCount}
                    onChange={(e) => updateFormData('coveredParkingCount', e.target.value)}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Open Parking Count</label>
                  <input
                    type="number"
                    value={formData.openParkingCount}
                    onChange={(e) => updateFormData('openParkingCount', e.target.value)}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Deductions Section */}
          <div className="mb-8 p-6 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">Deductions</h3>
            <p className="text-sm text-gray-600 mb-4">Select only ONE option for stamp duty deduction.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buyer's Gender</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deduction-type"
                    value="female"
                    checked={formData.deductionType === 'female'}
                    onChange={(e) => updateFormData('deductionType', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Female (-1% Stamp Duty)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deduction-type"
                    value="male"
                    checked={formData.deductionType === 'male'}
                    onChange={(e) => updateFormData('deductionType', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Male</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deduction-type"
                    value="transgender"
                    checked={formData.deductionType === 'transgender'}
                    onChange={(e) => updateFormData('deductionType', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Transgender</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Other Deductions</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deduction-type"
                    value="ex-serviceman"
                    checked={formData.deductionType === 'ex-serviceman'}
                    onChange={(e) => updateFormData('deductionType', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Ex-Serviceman (₹100 Stamp Duty)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deduction-type"
                    value="handicapped"
                    checked={formData.deductionType === 'handicapped'}
                    onChange={(e) => updateFormData('deductionType', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Handicapped (25% on first ₹5 Lakh of Circle Value)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deduction-type"
                    value="other"
                    checked={formData.deductionType === 'other'}
                    onChange={(e) => updateFormData('deductionType', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Other Deduction (%)</span>
                </label>
              </div>
              {formData.deductionType === 'other' && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter Percentage</label>
                  <input
                    type="number"
                    value={formData.otherDeductionPercent}
                    onChange={(e) => updateFormData('otherDeductionPercent', e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              type="button"
              onClick={handleShowCalculations}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Show Final Calculation
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-semibold"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            {typeof window !== 'undefined' && sessionStorage.getItem('staff1_filling_form') === 'true' && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !showCalculations}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                title={!showCalculations ? 'Please show calculations before submitting' : 'Submit form for Staff 3 verification'}
              >
                {loading ? 'Submitting...' : 'Submit Form'}
              </button>
            )}
            <label className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold cursor-pointer">
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={handleExport}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Export Data
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Clear All
            </button>
          </div>

          {/* Calculation Display */}
          {showCalculations && calculationResults && (
            <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-500 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Calculation Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-lg font-medium text-gray-700">Sale Consideration Price:</span>
                  <strong className="text-xl text-gray-900">₹{calculationResults.salePrice.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-lg font-medium text-gray-700">Plot Area:</span>
                  <strong className="text-xl text-gray-900">
                    {calculationResults.propertyType === 'agriculture'
                      ? `${(calculationResults.totalPlotAreaSqMeters / 10000).toFixed(4)} Hectare`
                      : `${calculationResults.totalPlotAreaSqMeters.toFixed(2)} Sq.Meters`}
                  </strong>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-lg font-medium text-gray-700">Total Built-up/Additions Area:</span>
                  <strong className="text-xl text-gray-900">{calculationResults.totalBuildupAreaSqMeters.toFixed(2)} Sq.Meters</strong>
                </div>
                {calculationResults.totalBuildupAreaSqMeters > calculationResults.totalPlotAreaSqMeters && (
                  <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 font-semibold">
                    Warning: Built-up area exceeds plot area!
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-lg font-medium text-gray-700">Circle Rate Value (Before additions):</span>
                  <strong className="text-xl text-gray-900">₹{calculationResults.baseCircleRateValue.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-lg font-medium text-gray-700">Circle Rate Value (After additions):</span>
                  <strong className="text-xl text-gray-900">₹{calculationResults.finalCircleRateValue.toFixed(2)}</strong>
                </div>
                {calculationResults.deductionAmount > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="text-lg font-medium text-gray-700">Deduction:</span>
                    <strong className="text-xl text-red-600">- ₹{calculationResults.deductionAmount.toFixed(2)}</strong>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-lg font-medium text-gray-700">Stamp Duty (7% of Final Value):</span>
                  <strong className="text-xl text-gray-900">₹{calculationResults.stampDuty.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="text-lg font-medium text-gray-700">Registration Charge (1% of Final Value):</span>
                  <strong className="text-xl text-gray-900">₹{calculationResults.registrationCharge.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between items-center py-4 border-t-2 border-blue-500 mt-4">
                  <span className="text-2xl font-bold text-gray-800">Total Stamp Duty & Registration Charges:</span>
                  <strong className="text-3xl font-bold text-blue-700">₹{calculationResults.finalPayableAmount.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

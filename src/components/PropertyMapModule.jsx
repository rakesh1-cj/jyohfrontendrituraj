"use client";
import React, { useState, useEffect, useRef } from 'react';
import { getAuthHeaders } from '@/lib/utils/authHeaders';

const PropertyMapModule = ({ modulePassword = '', userFormId }) => {
  const userFormIdFromQuery = userFormId || null;
  
  // Initialize with empty values - will be filled based on whether userFormId exists
  const [formData, setFormData] = useState({
    propertyType: '',
    propertySubType: '',
    propertyAddress: '',
    vicinityRadius: '100',
    plotLength: '',
    plotWidth: '',
    unitLength: 'feet',
    unitWidth: 'feet',
    entryDirection: 'North',
    builtUpUnit: 'feet',
    neighbourNorthType: 'Plot',
    neighbourNorthOther: '',
    roadNorth: '0',
    neighbourSouthType: 'Plot',
    neighbourSouthOther: '',
    roadSouth: '0',
    neighbourEastType: 'Plot',
    neighbourEastOther: '',
    roadEast: '0',
    neighbourWestType: 'Plot',
    neighbourWestOther: '',
    roadWest: '0'
  });

  // Separate state for stamp details to support multiple sections
  const [stampDetails, setStampDetails] = useState([{
    stampNumber: '',
    stampIssueDate: '',
    stampAmount: '',
    stampFile: null
  }]);

  const [builtUpRows, setBuiltUpRows] = useState([]);

  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rowCounter, setRowCounter] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState({
    propertyPhotos: [],
    mapImages: [],
    propertyDocuments: [],
    stampFile: null
  });
  const [previewImages, setPreviewImages] = useState({});
  const [linkedForm, setLinkedForm] = useState(null);
  const [linkedFormError, setLinkedFormError] = useState(null);
  const [linkedFormLoading, setLinkedFormLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Conversion constants
  const METER_TO_FEET = 3.28084;
  const YARD_TO_FEET = 3;
  const SQ_FEET_TO_SQ_METER = 0.092903;

  const propertyTypes = {
    Residential: ['Vacant Plot', 'Flat', 'House', 'Villa', 'Other Residential'],
    Commercial: ['Shop', 'Office', 'Showroom', 'Other Commercial'],
    Industrial: ['Shed', 'Factory', 'Warehouse', 'Other Industrial'],
    Agriculture: ['Agricultural Land', 'Farm House', 'Other Agriculture']
  };

  const builtUpOptions = [
    { id: 'room', label: 'Room', color: '#ffc107' },
    { id: 'kitchen', label: 'Kitchen', color: '#dc3545' },
    { id: 'bathroom', label: 'Bathroom', color: '#28a745' },
    { id: 'hall', label: 'Hall', color: '#17a2b8' },
    { id: 'open', label: 'Open Area', color: '#007bff' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'propertyType') {
      setFormData(prev => ({ ...prev, [name]: value, propertySubType: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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

  // Load linked form details when Map Module is opened from Staff2 forms
  useEffect(() => {
    const fetchLinkedForm = async () => {
      // If we have a userFormId, we want to clear default hardcoded values and start fresh or with form data
      if (userFormIdFromQuery) {
        setFormData({
          propertyType: '',
          propertySubType: '',
          propertyAddress: '',
          vicinityRadius: '100',
          plotLength: '',
          plotWidth: '',
          unitLength: 'feet',
          unitWidth: 'feet',
          entryDirection: 'North',
          builtUpUnit: 'feet',
          neighbourNorthType: 'Plot',
          neighbourNorthOther: '',
          roadNorth: '0',
          neighbourSouthType: 'Plot',
          neighbourSouthOther: '',
          roadSouth: '0',
          neighbourEastType: 'Plot',
          neighbourEastOther: '',
          roadEast: '0',
          neighbourWestType: 'Plot',
          neighbourWestOther: '',
          roadWest: '0'
        });
        setBuiltUpRows([]);
      } else {
        // Keep defaults for unlinked access
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
        // OR if specific access is granted.
        const isStaff1Approved = form?.approvals?.staff1?.approved === true;
        
        if (form && form.staff2Access && form.staff2Access.mapModule === false && !isStaff1Approved) {
          setPermissionDenied(true);
          setLinkedFormLoading(false);
          return;
        }

        // Auto-fill basic property details from the linked form into the Map Module form
        if (form) {
          const allFields = form.allFields || {};

          // Property Type Mapping
          let pType = allFields.propertyType || allFields.property_type || '';
          if (pType) {
            pType = pType.charAt(0).toUpperCase() + pType.slice(1).toLowerCase();
            if (pType === 'Agricultural') pType = 'Agriculture';
          }

          // Sub Type Mapping
          let pSubType = allFields.plotType || allFields.propertySubType || '';
          if (pSubType) {
            if (pSubType === 'buildup') pSubType = 'House';
            if (pSubType === 'vacant') pSubType = 'Vacant Plot';
            // capitalize first letter
            pSubType = pSubType.charAt(0).toUpperCase() + pSubType.slice(1);
          }

          setFormData(prev => ({
            ...prev,
            propertyType: pType || prev.propertyType,
            propertySubType: pSubType || prev.propertySubType,
            // Prefer a precise property address / location from the original form
            propertyAddress: allFields.propertyAddress || allFields.propertyLocation || allFields.property_address || allFields.address || prev.propertyAddress,
            // If plot dimensions are present in the original form, use them
            plotLength: allFields.propertyLength || allFields.plotLength || allFields.length || prev.plotLength,
            plotWidth: allFields.propertyWidth || allFields.plotWidth || allFields.width || prev.plotWidth,
            unitLength: allFields.dimUnit || allFields.unit || prev.unitLength,
            unitWidth: allFields.dimUnit || allFields.unit || prev.unitWidth,
            
            // Neighbours
            neighbourNorthType: allFields.directionNorth ? 'Others' : prev.neighbourNorthType,
            neighbourNorthOther: allFields.directionNorth || prev.neighbourNorthOther,
            neighbourSouthType: allFields.directionSouth ? 'Others' : prev.neighbourSouthType,
            neighbourSouthOther: allFields.directionSouth || prev.neighbourSouthOther,
            neighbourEastType: allFields.directionEast ? 'Others' : prev.neighbourEastType,
            neighbourEastOther: allFields.directionEast || prev.neighbourEastOther,
            neighbourWestType: allFields.directionWest ? 'Others' : prev.neighbourWestType,
            neighbourWestOther: allFields.directionWest || prev.neighbourWestOther
          }));

          // If it's a house, add some default rooms if none mapped
          if (pSubType === 'House' || allFields.plotType === 'buildup') {
            setBuiltUpRows([
              { id: 0, type: 'room', l: '14', w: '12' },
              { id: 1, type: 'hall', l: '18', w: '15' },
              { id: 2, type: 'kitchen', l: '8', w: '6' }
            ]);
            setRowCounter(3);
          }
        }
      } catch (error) {
        console.error('Error loading linked form for Map Module:', error);
        setLinkedFormError(error.message || 'Unable to load linked form details');
      } finally {
        setLinkedFormLoading(false);
      }
    };

    fetchLinkedForm();
  }, [userFormIdFromQuery]);

  const checkOther = (direction, value) => {
    const otherId = `neighbour${direction}Other`;
    const roadId = `road${direction}`;

    if (value === 'Others') {
      setFormData(prev => ({
        ...prev,
        [otherId]: prev[otherId] || '',
        [roadId]: ''
      }));
    } else if (value === 'Road') {
      const currentRoad = formData[roadId];
      setFormData(prev => ({
        ...prev,
        [otherId]: '',
        [roadId]: currentRoad === '' || currentRoad === '0' ? '10' : currentRoad
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [otherId]: '',
        [roadId]: ''
      }));
    }
  };

  const toFeet = (value, unit) => {
    if (unit === 'meters') return value * METER_TO_FEET;
    if (unit === 'yards') return value * YARD_TO_FEET;
    return value;
  };

  const generateColor = (index) => {
    const colors = ['#ffc107', '#17a2b8', '#dc3545', '#28a745', '#6f42c1', '#fd7e14', '#007bff', '#20c997', '#6c757d', '#adb5bd', '#ff6b6b'];
    return colors[index % colors.length];
  };

  const isBuiltUpVisible = () => {
    const subType = formData.propertySubType;
    return subType !== 'Vacant Plot' && subType !== 'Agricultural Land' && subType !== '';
  };

  const addBuiltUpRow = (defaultType = 'room', defaultL = '', defaultW = '') => {
    setBuiltUpRows(prev => [...prev, { id: rowCounter, type: defaultType, l: defaultL, w: defaultW }]);
    setRowCounter(prev => prev + 1);
  };

  const removeBuiltUpRow = (id) => {
    setBuiltUpRows(prev => prev.filter(row => row.id !== id));
  };

  const updateBuiltUpRow = (id, field, value) => {
    setBuiltUpRows(prev => prev.map(row =>
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const getLabel = (rowId, type) => {
    const allRows = builtUpRows.filter(r => r.type === type && r.id <= rowId);
    const count = allRows.length;
    const labelMap = {
      room: 'R', kitchen: 'K', bathroom: 'B', hall: 'H', open: 'OA'
    };
    let finalLabel = labelMap[type] || type.toUpperCase().substring(0, 2);
    if (type === 'room' || type === 'bathroom') {
      finalLabel += count;
    }
    return finalLabel;
  };

  const calculateBuiltUpArea = () => {
    let totalSqFeet = 0;
    const roomDims = [];
    let maxL = 0;
    let maxW = 0;

    builtUpRows.forEach(row => {
      const l = parseFloat(row.l) || 0;
      const w = parseFloat(row.w) || 0;
      if (l > 0 && w > 0) {
        const l_feet = toFeet(l, formData.builtUpUnit);
        const w_feet = toFeet(w, formData.builtUpUnit);
        const area = l_feet * w_feet;
        totalSqFeet += area;
        maxL = Math.max(maxL, l_feet);
        maxW = Math.max(maxW, w_feet);

        const colorIndex = builtUpOptions.findIndex(opt => opt.id === row.type);
        const color = generateColor(colorIndex !== -1 ? colorIndex : 0);
        const label = getLabel(row.id, row.type);

        roomDims.push({
          label, area, l, w, unit: formData.builtUpUnit,
          l_feet, w_feet, color
        });
      }
    });

    let builtL = 0;
    let builtW = 0;
    if (roomDims.length > 0) {
      const sortedL = roomDims.map(d => d.l_feet).sort((a, b) => b - a);
      const sortedW = roomDims.map(d => d.w_feet).sort((a, b) => b - a);
      builtL = sortedL[0] + (sortedL[1] || 0) * 0.5;
      builtW = sortedW[0] + (sortedW[1] || 0) * 0.5;
    }

    return {
      totalSqFeet,
      dimensions: roomDims,
      totalSqMeters: totalSqFeet * SQ_FEET_TO_SQ_METER,
      totalSqYards: totalSqFeet / 9,
      builtL,
      builtW
    };
  };

  const getNeighbourData = (direction) => {
    const type = formData[`neighbour${direction}Type`];
    if (type === 'Road') {
      const size = parseFloat(formData[`road${direction}`]) || 0;
      return `ROAD (${size} ft)`;
    } else if (type === 'Others') {
      return formData[`neighbour${direction}Other`] || 'NEIGHBOUR';
    } else {
      return 'PLOT (Padosi)';
    }
  };

  const drawArrow = (ctx, x, y, direction, size) => {
    ctx.fillStyle = '#007bff';
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.beginPath();

    if (direction === 'North') {
      ctx.moveTo(x, y);
      ctx.lineTo(x - size, y + size);
      ctx.lineTo(x + size, y + size);
    } else if (direction === 'South') {
      ctx.moveTo(x, y);
      ctx.lineTo(x - size, y - size);
      ctx.lineTo(x + size, y - size);
    } else if (direction === 'East') {
      ctx.moveTo(x, y);
      ctx.lineTo(x - size, y - size);
      ctx.lineTo(x - size, y + size);
    } else if (direction === 'West') {
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y - size);
      ctx.lineTo(x + size, y + size);
    }
    ctx.closePath();
    ctx.fill();
  };

  const drawDimension = (ctx, x1, y1, x2, y2, text, orientation, offset) => {
    ctx.strokeStyle = '#6c757d';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#343a40';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.beginPath();

    if (orientation === 'H') {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1, y1 + offset);
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2, y2 + offset);
      ctx.moveTo(x1, y1 + offset);
      ctx.lineTo(x2, y2 + offset);
      ctx.stroke();
      ctx.fillText(text, (x1 + x2) / 2, y1 + offset + 15);
    } else {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 + offset, y1);
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 + offset, y2);
      ctx.moveTo(x1 + offset, y1);
      ctx.lineTo(x2 + offset, y2);
      ctx.stroke();
      ctx.save();
      ctx.translate(x1 + offset + 15, (y1 + y2) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  };

  const drawPlot = (canvas) => {
    if (!canvas) return;

    const lengthVal = parseFloat(formData.plotLength);
    const widthVal = parseFloat(formData.plotWidth);

    if (isNaN(lengthVal) || isNaN(widthVal) || lengthVal <= 0 || widthVal <= 0) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const lengthFeet = toFeet(lengthVal, formData.unitLength);
    const widthFeet = toFeet(widthVal, formData.unitWidth);
    const areaSqFeet = lengthFeet * widthFeet;
    const builtUpResult = calculateBuiltUpArea();
    const isBuilt = isBuiltUpVisible() && builtUpResult.dimensions.length > 0;

    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const maxDimension = Math.max(lengthFeet, widthFeet);
    const margin = 80;
    const scale = (Math.min(canvasWidth, canvasHeight) - margin) / maxDimension;

    const scaledWidth = widthFeet * scale;
    const scaledLength = lengthFeet * scale;
    const plotX = (canvasWidth - scaledWidth) / 2;
    const plotY = (canvasHeight - scaledLength) / 2;

    // Draw plot boundary
    ctx.beginPath();
    ctx.rect(plotX, plotY, scaledWidth, scaledLength);
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#eaf5ff';
    ctx.fill();
    ctx.closePath();

    ctx.font = '16px Arial bold';
    ctx.fillStyle = '#343a40';
    ctx.textAlign = 'center';
    ctx.fillText(`PLOT AREA (${areaSqFeet.toFixed(0)} sq. ft.)`, plotX + scaledWidth / 2, plotY + scaledLength / 2 - 20);

    // Draw built-up layout
    if (isBuilt) {
      const plotInnerL = scaledWidth * 0.9;
      const plotInnerW = scaledLength * 0.9;

      let builtScaleL = builtUpResult.builtL * scale;
      let builtScaleW = builtUpResult.builtW * scale;

      let sizeRatio = 1;
      if (builtScaleL > plotInnerL || builtScaleW > plotInnerW) {
        const ratioL = plotInnerL / builtScaleL;
        const ratioW = plotInnerW / builtScaleW;
        sizeRatio = Math.min(ratioL, ratioW, 1);
      }

      builtScaleL *= sizeRatio;
      builtScaleW *= sizeRatio;
      const finalBuiltScale = scale * sizeRatio;

      const builtDrawX = plotX + (scaledWidth - builtScaleL) / 2;
      const builtDrawY = plotY + (scaledLength - builtScaleW) / 2;

      ctx.beginPath();
      ctx.rect(builtDrawX, builtDrawY, builtScaleL, builtScaleW);
      ctx.strokeStyle = '#343a40';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#f2f2f2';
      ctx.fill();
      ctx.closePath();

      ctx.font = '14px Arial bold';
      ctx.fillStyle = '#dc3545';
      ctx.textAlign = 'center';
      ctx.fillText(`BUILT UP: ${builtUpResult.totalSqFeet.toFixed(0)} Sq. Ft.`, plotX + scaledWidth / 2, plotY + scaledLength / 2 + 30);

      let current_x = builtDrawX + 5;
      let current_y = builtDrawY + 5;
      const max_x_limit = builtDrawX + builtScaleL - 5;
      const max_y_limit = builtDrawY + builtScaleW - 5;
      let max_row_w = 0;

      builtUpResult.dimensions.forEach((dim) => {
        const dimScaleL = dim.l_feet * finalBuiltScale;
        const dimScaleW = dim.w_feet * finalBuiltScale;

        if (current_x + dimScaleL > max_x_limit) {
          current_x = builtDrawX + 5;
          current_y += max_row_w + 5;
          max_row_w = 0;
        }

        if (current_y + dimScaleW > max_y_limit) return;

        ctx.beginPath();
        ctx.rect(current_x, current_y, dimScaleL, dimScaleW);
        ctx.strokeStyle = dim.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = dim.color + '33';
        ctx.fill();
        ctx.closePath();

        ctx.font = '12px Arial bold';
        ctx.fillStyle = dim.color;
        ctx.textAlign = 'center';
        ctx.fillText(dim.label, current_x + dimScaleL / 2, current_y + dimScaleW / 2 - 5);
        ctx.font = '10px Arial';
        ctx.fillText(`${dim.l.toFixed(0)}x${dim.w.toFixed(0)} ${dim.unit.charAt(0)}`, current_x + dimScaleL / 2, current_y + dimScaleW / 2 + 8);

        current_x += dimScaleL + 5;
        max_row_w = Math.max(max_row_w, dimScaleW);
      });

      const arrowSize = 8;
      let arrowX, arrowY;

      if (formData.entryDirection === 'North') {
        arrowX = plotX + scaledWidth / 2;
        arrowY = plotY;
      } else if (formData.entryDirection === 'South') {
        arrowX = plotX + scaledWidth / 2;
        arrowY = plotY + scaledLength;
      } else if (formData.entryDirection === 'East') {
        arrowX = plotX + scaledWidth;
        arrowY = plotY + scaledLength / 2;
      } else if (formData.entryDirection === 'West') {
        arrowX = plotX;
        arrowY = plotY + scaledLength / 2;
      }

      drawArrow(ctx, arrowX, arrowY, formData.entryDirection, arrowSize);

      ctx.font = '12px Arial bold';
      ctx.fillStyle = '#007bff';
      ctx.textAlign = 'center';
      if (formData.entryDirection === 'North') {
        ctx.fillText('ENTRY', arrowX, arrowY - 10);
      } else if (formData.entryDirection === 'South') {
        ctx.fillText('ENTRY', arrowX, arrowY + 20);
      } else if (formData.entryDirection === 'East') {
        ctx.fillText('ENTRY', arrowX + 25, arrowY);
      } else if (formData.entryDirection === 'West') {
        ctx.fillText('ENTRY', arrowX - 25, arrowY);
      }
    }

    // Draw dimension lines
    drawDimension(ctx, plotX + scaledWidth, plotY, plotX + scaledWidth, plotY + scaledLength,
      `${lengthVal.toFixed(1)} ${formData.unitLength}`, 'V', 10);

    drawDimension(ctx, plotX, plotY, plotX + scaledWidth, plotY,
      `${widthVal.toFixed(1)} ${formData.unitWidth}`, 'H', -10);

    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.font = '18px Arial bold';
    ctx.fillText('↑ N', 20, 30);
  };


  const updateVicinityMap = () => {
    // This function is called when vicinity radius changes
    // The vicinity map rendering is handled in the render section
  };

  useEffect(() => {
    if (canvasRef.current) {
      drawPlot(canvasRef.current);
    }
  }, [formData, builtUpRows]);

  useEffect(() => {
    if (showPreview && previewCanvasRef.current) {
      drawPlot(previewCanvasRef.current);
    }
  }, [showPreview, formData, builtUpRows]);

  // Initialize component on mount
  useEffect(() => {
    // Set default built-up rows if none exist and property type is House
    if (builtUpRows.length === 0 && formData.propertySubType === 'House') {
      setBuiltUpRows([
        { id: 0, type: 'room', l: '14', w: '12' },
        { id: 1, type: 'hall', l: '18', w: '15' },
        { id: 2, type: 'kitchen', l: '8', w: '6' }
      ]);
      setRowCounter(3);
    }
  }, []);

  const openPreview = () => {
    console.log('MapModule openPreview called');
    // Ensure plot is drawn before showing preview
    if (canvasRef.current) {
      drawPlot(canvasRef.current);
    }
    console.log('Opening preview...');
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // File upload handlers
  const handleFileChange = (category, file, index = null) => {
    if (!file) return;

    const fileId = Math.random().toString(36).substr(2, 9);
    const previewKey = index !== null ? `${category}_${index}` : `${category}_${fileId}`;
    let previewUrl = null;

    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
      setPreviewImages(prev => ({
        ...prev,
        [previewKey]: previewUrl
      }));
    }

    setUploadedFiles(prev => ({
      ...prev,
      [category]: [...prev[category], {
        id: fileId,
        file,
        name: file.name,
        preview: previewUrl
      }]
    }));
  };

  const removeFile = (category, fileId) => {
    const fileToRemove = uploadedFiles[category].find(f => f.id === fileId);
    if (fileToRemove && fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setUploadedFiles(prev => ({
      ...prev,
      [category]: prev[category].filter(f => f.id !== fileId)
    }));
    const previewKey = `${category}_${fileId}`;
    setPreviewImages(prev => {
      const newPrev = { ...prev };
      delete newPrev[previewKey];
      return newPrev;
    });
  };

  const handleSubmit = async () => {
    console.log('MapModule handleSubmit called');
    try {
      console.log('Starting submission...');
      setIsSubmitting(true);
      const _lengthFeet = toFeet(parseFloat(formData.plotLength) || 0, formData.unitLength);
      const _widthFeet = toFeet(parseFloat(formData.plotWidth) || 0, formData.unitWidth);
      const _areaSqFeet = _lengthFeet * _widthFeet;
      const _areaSqMeters = _areaSqFeet * SQ_FEET_TO_SQ_METER;
      const _areaSqYards = _areaSqFeet / 9;
      const payload = {
        ...formData,
        builtUpRows,
        stampDetails,
        calculatedData: {
          areaSqFeet: _areaSqFeet,
          areaSqMeters: _areaSqMeters,
          areaSqYards: _areaSqYards,
          builtUpResult: calculateBuiltUpArea()
        }
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

      // Add property photos
      uploadedFiles.propertyPhotos.forEach((photo) => {
        formDataToSend.append('propertyPhotos', photo.file);
      });

      // Add map images
      uploadedFiles.mapImages.forEach((image) => {
        formDataToSend.append('mapImages', image.file);
      });

      // Add property documents
      uploadedFiles.propertyDocuments.forEach((doc) => {
        formDataToSend.append('propertyDocuments', doc.file);
      });

      // Add stamp files
      stampDetails.forEach((stampDetail, index) => {
        if (stampDetail.stampFile) {
          formDataToSend.append(`stampFiles`, stampDetail.stampFile);
        }
      });

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
      const response = await fetch(`${API_BASE}/api/staff/2/map-module/submit`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formDataToSend
      });

      if (response.ok) {
        const data = await response.json();
        alert('Map Module submitted successfully.');
        setShowPreview(false);
        // Reset form
        setFormData({
          propertyType: 'Residential',
          propertySubType: 'House',
          propertyAddress: 'Main Street, Khasra No. 123',
          vicinityRadius: '100',
          plotLength: '50',
          plotWidth: '30',
          unitLength: 'feet',
          unitWidth: 'feet',
          entryDirection: 'North',
          builtUpUnit: 'feet',
          neighbourNorthType: 'Road',
          neighbourNorthOther: '',
          roadNorth: '20',
          neighbourSouthType: 'Plot',
          neighbourSouthOther: '',
          roadSouth: '0',
          neighbourEastType: 'Road',
          neighbourEastOther: '',
          roadEast: '15',
          neighbourWestType: 'Plot',
          neighbourWestOther: '',
          roadWest: '0'
        });
        setBuiltUpRows([]);
        setRowCounter(0);
        // Reset stamp details
        setStampDetails([{
          stampNumber: '',
          stampIssueDate: '',
          stampAmount: '',
          stampFile: null
        }]);
        // Reset uploaded files
        [...uploadedFiles.propertyPhotos, ...uploadedFiles.mapImages, ...uploadedFiles.propertyDocuments].forEach(file => {
          if (file.preview) URL.revokeObjectURL(file.preview);
        });
        Object.values(previewImages).forEach(url => {
          if (url) URL.revokeObjectURL(url);
        });
        setUploadedFiles({
          propertyPhotos: [],
          mapImages: [],
          propertyDocuments: []
        });
        setPreviewImages({});
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Submission failed.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const lengthFeet = toFeet(parseFloat(formData.plotLength) || 0, formData.unitLength);
  const widthFeet = toFeet(parseFloat(formData.plotWidth) || 0, formData.unitWidth);
  const areaSqFeet = lengthFeet * widthFeet;
  const areaSqMeters = areaSqFeet * SQ_FEET_TO_SQ_METER;
  const areaSqYards = areaSqFeet / 9;
  const builtUpResult = calculateBuiltUpArea();
  const isBuilt = isBuiltUpVisible() && builtUpResult.dimensions.length > 0;
  const vicinityRadius = parseFloat(formData.vicinityRadius) || 100;
  const radiusValue = vicinityRadius > 0 ? Math.sqrt(vicinityRadius / Math.PI).toFixed(1) : '0';

  if (permissionDenied) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-900 mb-2">Access Denied</h2>
            <p className="text-gray-700 max-w-md mx-auto">
              You do not have permission to access the Map Module for this form.
              <br />
              Please contact Staff 1 to request access adjustments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border-2 border-blue-500 p-6">
          <h1 className="text-2xl font-bold text-blue-600 text-center mb-6 border-b-2 border-blue-500 pb-2">
            संपत्ति का विस्तृत नक़्शा और बिल्ट-अप रिपोर्ट
          </h1>

          {userFormIdFromQuery && (
            <div className="mb-4">
              <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                <span className="font-semibold">Linked Form: </span>
                {linkedFormLoading && 'Loading form details...'}
                {!linkedFormLoading && linkedForm && (
                  <>
                    This Map Module will be created for{' '}
                    <span className="font-semibold">
                      {linkedForm.formattedFormId || linkedForm._id}
                    </span>{' '}
                    ({linkedForm.serviceType || 'form'}).
                  </>
                )}
                {!linkedFormLoading && !linkedForm && !linkedFormError && (
                  <>This Map Module will be linked to form ID {userFormIdFromQuery}.</>
                )}
                {!linkedFormLoading && linkedFormError && (
                  <>
                    This Map Module will be linked to form ID {userFormIdFromQuery}.{' '}
                    <span className="block text-xs mt-1">
                      (Note: {linkedFormError})
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-6">
            {/* Input Form */}
            <div className="flex-1 min-w-[350px] pr-4 border-r border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                प्रॉपर्टी विवरण
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  प्रॉपर्टी का प्रकार (Property Type):
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={(e) => {
                    handleChange(e);
                    setFormData(prev => ({ ...prev, propertySubType: '' }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="Residential">आवासीय (Residential)</option>
                  <option value="Commercial">व्यावसायिक (Commercial)</option>
                  <option value="Industrial">औद्योगिक (Industrial)</option>
                  <option value="Agriculture">कृषि (Agriculture)</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  प्रॉपर्टी उप-प्रकार (Sub-Type):
                </label>
                <select
                  name="propertySubType"
                  value={formData.propertySubType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">-- चुनें --</option>
                  {propertyTypes[formData.propertyType]?.map(subType => (
                    <option key={subType} value={subType}>{subType}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  प्रॉपर्टी का पता (Address):
                </label>
                <input
                  type="text"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleChange}
                  placeholder="गाँव/शहर, खसरा नंबर आदि"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              {/* Property Photos Upload */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Property Photos
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    Array.from(e.target.files).forEach(file => {
                      handleFileChange('propertyPhotos', file);
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {uploadedFiles.propertyPhotos.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {uploadedFiles.propertyPhotos.map((photo) => (
                      <div key={photo.id} className="relative">
                        <div className="w-full h-24 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                          {photo.preview ? (
                            <img
                              src={photo.preview}
                              alt={photo.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                              {photo.name}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('propertyPhotos', photo.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Map/Diagram Images Upload */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Map/Diagram Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    Array.from(e.target.files).forEach(file => {
                      handleFileChange('mapImages', file);
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {uploadedFiles.mapImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {uploadedFiles.mapImages.map((image) => (
                      <div key={image.id} className="relative">
                        <div className="w-full h-24 border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                          {image.preview ? (
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                              {image.name}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile('mapImages', image.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Documents Upload */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Property Documents (PDF/Images)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => {
                    Array.from(e.target.files).forEach(file => {
                      handleFileChange('propertyDocuments', file);
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {uploadedFiles.propertyDocuments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.propertyDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <span className="text-xs text-gray-700">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile('propertyDocuments', doc.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr className="my-4" />

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 border-b border-yellow-400 pb-2">
                  Stamp Details (स्टाम्प विवरण)
                </h2>
                <button
                  type="button"
                  onClick={addStampDetail}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  + Add Stamp Detail
                </button>
              </div>

              {stampDetails.map((stampDetail, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h6 className="text-md font-medium text-gray-800">
                      Stamp Detail {index + 1} (स्टैम्प विवरण {index + 1})
                    </h6>
                    {stampDetails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStampDetail(index)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        Remove (हटाएं)
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Stamp Number (स्टाम्प नंबर)
                      </label>
                      <input
                        type="text"
                        value={stampDetail.stampNumber}
                        onChange={(e) => handleStampDetailChange(index, 'stampNumber', e.target.value)}
                        placeholder="Enter stamp number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Stamp Issue Date (स्टाम्प जारी तिथि)
                      </label>
                      <input
                        type="date"
                        value={stampDetail.stampIssueDate}
                        onChange={(e) => handleStampDetailChange(index, 'stampIssueDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Stamp Amount (स्टाम्प राशि) ₹
                      </label>
                      <input
                        type="number"
                        value={stampDetail.stampAmount}
                        onChange={(e) => handleStampDetailChange(index, 'stampAmount', e.target.value)}
                        placeholder="Enter stamp amount"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Upload Stamp File (स्टाम्प फ़ाइल अपलोड करें)
                      </label>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleStampFileChange(index, file);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      {previewImages[`stampFile_${index}`] && (
                        <div className="mt-2">
                          {stampDetail.stampFile?.type?.startsWith('image/') ? (
                            <img 
                              src={previewImages[`stampFile_${index}`]} 
                              alt="Stamp file preview" 
                              className="max-w-full h-24 object-cover rounded border" 
                            />
                          ) : (
                            <span className="text-xs text-gray-600">📄 {stampDetail.stampFile?.name}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <hr className="my-4" />

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Vicinity Radius (त्रिज्या) Sq. Mtr. में:
                </label>
                <input
                  type="number"
                  name="vicinityRadius"
                  value={formData.vicinityRadius}
                  onChange={(e) => {
                    handleChange(e);
                    updateVicinityMap();
                  }}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <hr className="my-4" />

              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                प्लॉट के आयाम (Total Plot Size)
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  प्लॉट की लंबाई (Length - N/S):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="plotLength"
                    value={formData.plotLength}
                    onChange={handleChange}
                    placeholder="50"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <select
                    name="unitLength"
                    value={formData.unitLength}
                    onChange={handleChange}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="feet">Feet</option>
                    <option value="yards">Yards</option>
                    <option value="meters">Meters</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  प्लॉट की चौड़ाई (Width - E/W):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="plotWidth"
                    value={formData.plotWidth}
                    onChange={handleChange}
                    placeholder="30"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <select
                    name="unitWidth"
                    value={formData.unitWidth}
                    onChange={handleChange}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="feet">Feet</option>
                    <option value="yards">Yards</option>
                    <option value="meters">Meters</option>
                  </select>
                </div>
              </div>

              <hr className="my-4" />

              {isBuiltUpVisible() && (
                <>
                  <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                    बिल्ट-अप डिटेल्स (Built-up Area Details)
                  </h2>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      एंट्री दिशा (House Entry Direction):
                    </label>
                    <select
                      name="entryDirection"
                      value={formData.entryDirection}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="North">North (उत्तर)</option>
                      <option value="South">South (दक्षिण)</option>
                      <option value="East">East (पूर्व)</option>
                      <option value="West">West (पश्चिम)</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      आयाम की यूनिट (Unit):
                    </label>
                    <select
                      name="builtUpUnit"
                      value={formData.builtUpUnit}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="feet">Feet</option>
                      <option value="yards">Yards</option>
                      <option value="meters">Meters</option>
                    </select>
                  </div>

                  <div className="mb-4 space-y-2">
                    {builtUpRows.map((row) => {
                      const label = getLabel(row.id, row.type);
                      const option = builtUpOptions.find(opt => opt.id === row.type);
                      return (
                        <div key={row.id} className="flex gap-2 items-center border-l-2 border-gray-300 pl-2">
                          <select
                            value={row.type}
                            onChange={(e) => updateBuiltUpRow(row.id, 'type', e.target.value)}
                            className="w-28 px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            {builtUpOptions.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                          </select>
                          <label className="w-12 text-xs text-center">{label}:</label>
                          <input
                            type="number"
                            value={row.l}
                            onChange={(e) => updateBuiltUpRow(row.id, 'l', e.target.value)}
                            placeholder="लंबाई (L)"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                          <input
                            type="number"
                            value={row.w}
                            onChange={(e) => updateBuiltUpRow(row.id, 'w', e.target.value)}
                            placeholder="चौड़ाई (W)"
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                          <button
                            onClick={() => removeBuiltUpRow(row.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={addBuiltUpRow}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    + Add More Room/Area
                  </button>

                  <hr className="my-4" />
                </>
              )}

              <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                पड़ोसी विवरण
              </h2>
              <p className="text-xs text-gray-600 mb-4">(रोड साइज़ केवल Feet में दर्ज करें)</p>

              {['North', 'South', 'East', 'West'].map(direction => (
                <div key={direction} className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {direction === 'North' ? 'उत्तर' : direction === 'South' ? 'दक्षिण' : direction === 'East' ? 'पूर्व' : 'पश्चिम'} दिशा में:
                  </label>
                  <div className="flex gap-2 items-center">
                    <select
                      name={`neighbour${direction}Type`}
                      value={formData[`neighbour${direction}Type`]}
                      onChange={(e) => {
                        handleChange(e);
                        checkOther(direction, e.target.value);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      {direction === 'North' || direction === 'East' ? (
                        <>
                          <option value="Road">Road</option>
                          <option value="Plot">Plot (पड़ोसी)</option>
                          <option value="Others">Others</option>
                        </>
                      ) : (
                        <>
                          <option value="Plot">Plot (पड़ोसी)</option>
                          <option value="Road">Road</option>
                          <option value="Others">Others</option>
                        </>
                      )}
                    </select>
                    {formData[`neighbour${direction}Type`] === 'Others' && (
                      <input
                        type="text"
                        name={`neighbour${direction}Other`}
                        value={formData[`neighbour${direction}Other`]}
                        onChange={handleChange}
                        placeholder="Others का नाम"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    )}
                    {formData[`neighbour${direction}Type`] === 'Road' && (
                      <input
                        type="number"
                        name={`road${direction}`}
                        value={formData[`road${direction}`]}
                        onChange={handleChange}
                        placeholder="Road Size (ft)"
                        className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    )}
                  </div>
                </div>
              ))}

              <div className="space-y-3 mt-6">
                <button
                  onClick={openPreview}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold"
                >
                  प्रीव्यू (Preview) & कैलकुलेट
                </button>
                <button
                  onClick={() => {
                    console.log('Direct submit clicked for Map Module');
                    handleSubmit();
                  }}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Directly (सीधे सबमिट करें)'}
                </button>
              </div>
            </div>

            {/* Diagram Area */}
            <div className="flex-1 min-w-[500px] text-center">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="border border-gray-300 mx-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Overlay */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-gray-100 overflow-y-auto p-5 print:static print:inset-0 print:bg-white">
          <div className="max-w-4xl mx-auto bg-white p-6 border border-gray-300 shadow-lg print:shadow-none print:border-0">
            <div className="flex justify-between items-center mb-4 print:hidden">
              <h1 className="text-xl font-bold text-gray-900">संपत्ति का विस्तृत नक़्शा और बिल्ट-अप रिपोर्ट (PREVIEW)</h1>
              <div className="flex gap-2">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Close Preview
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Print Report 🖨️
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex-1 min-w-[300px]">
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                  प्रॉपर्टी सारांश
                </h2>
                <div className="mb-4 text-center">
                  <p className="font-bold text-blue-600">{formData.propertyAddress || 'पता दर्ज करें'}</p>
                </div>

                <div className="mb-4 border border-gray-300 p-4">
                  <p className="text-lg font-bold text-blue-600 text-center border-b border-gray-300 pb-2 mb-2">
                    कुल प्लॉट एरिया (Total Plot Area):
                  </p>
                  <div className="flex justify-around text-sm">
                    <p><strong>{areaSqMeters.toFixed(3)}</strong> Sq. Meter</p>
                    <p><strong>{areaSqFeet.toFixed(3)}</strong> Sq. Feet</p>
                    <p><strong>{areaSqYards.toFixed(3)}</strong> Sq. Yards</p>
                  </div>
                </div>

                {isBuilt && (
                  <div className="mb-4 border border-gray-300 p-4">
                    <p className="text-lg font-bold text-gray-800 text-center border-b border-gray-300 pb-2 mb-2">
                      बिल्ट-अप एरिया (Built-up Area):
                    </p>
                    <ul className="list-none p-0 text-sm space-y-1">
                      {builtUpResult.dimensions.map((dim, idx) => (
                        <li key={idx}>
                          <span style={{ color: dim.color }}>{dim.label}: </span>
                          {dim.l.toFixed(1)} x {dim.w.toFixed(1)} {dim.unit} = {dim.area.toFixed(2)} Sq. Ft.
                        </li>
                      ))}
                    </ul>
                    <p className="text-center mt-4">
                      <strong>Total: {builtUpResult.totalSqMeters.toFixed(3)} Sq. Meter | </strong>
                      <strong>{builtUpResult.totalSqFeet.toFixed(3)} Sq. Feet</strong>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex-1.5 min-w-[400px] text-center">
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
                  प्लॉट का नक़्शा (Design)
                </h2>
                <div className="relative inline-block">
                  <canvas
                    ref={previewCanvasRef}
                    width={500}
                    height={500}
                    className="border border-gray-300"
                  />
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-sm font-bold">
                      <strong>N:</strong> {getNeighbourData('North')} ({formData.plotLength} {formData.unitLength})
                    </div>
                    <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-sm font-bold">
                      <strong>S:</strong> {getNeighbourData('South')} ({formData.plotLength} {formData.unitLength})
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-[-90deg] text-sm font-bold">
                      <strong>E:</strong> {getNeighbourData('East')} ({formData.plotWidth} {formData.unitWidth})
                    </div>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 rotate-90 text-sm font-bold">
                      <strong>W:</strong> {getNeighbourData('West')} ({formData.plotWidth} {formData.unitWidth})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-dashed border-gray-400 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">नक़्शे का त्रिज्या और स्थान</h3>
              <div className="flex justify-around items-center flex-wrap">
                <div className="w-full md:w-1/2 text-sm mb-4 md:mb-0">
                  <p className="font-bold mb-2">
                    यह प्लॉट लगभग <span>{formData.vicinityRadius || 100}</span> Sq. Meter के व्यास (Vicinity) में:
                  </p>
                  <ul className="list-none p-0 space-y-1 border-b border-dotted border-gray-300">
                    <li className="pb-1 border-b border-dotted border-gray-300">
                      <strong>North:</strong> {formData.neighbourNorthType === 'Road'
                        ? `Road (${formData.roadNorth} ft)`
                        : formData.neighbourNorthType === 'Others'
                          ? formData.neighbourNorthOther
                          : 'PLOT (Padosi)'}
                    </li>
                    <li className="pb-1 border-b border-dotted border-gray-300">
                      <strong>South:</strong> {formData.neighbourSouthType === 'Road'
                        ? `Road (${formData.roadSouth} ft)`
                        : formData.neighbourSouthType === 'Others'
                          ? formData.neighbourSouthOther
                          : 'PLOT (Padosi)'}
                    </li>
                    <li className="pb-1 border-b border-dotted border-gray-300">
                      <strong>East:</strong> {formData.neighbourEastType === 'Road'
                        ? `Road (${formData.roadEast} ft)`
                        : formData.neighbourEastType === 'Others'
                          ? formData.neighbourEastOther
                          : 'PLOT (Padosi)'}
                    </li>
                    <li>
                      <strong>West:</strong> {formData.neighbourWestType === 'Road'
                        ? `Road (${formData.roadWest} ft)`
                        : formData.neighbourWestType === 'Others'
                          ? formData.neighbourWestOther
                          : 'PLOT (Padosi)'}
                    </li>
                  </ul>
                  <p className="mt-4"><strong>**प्रॉपर्टी टाइप:**</strong> {formData.propertyType}</p>
                  <p><strong>**उप-प्रकार:**</strong> {formData.propertySubType}</p>
                </div>
                <div className="w-full md:w-1/2 flex justify-center">
                  <div className="relative w-64 h-64 rounded-full border-2 border-blue-600 bg-gray-50 shadow-md overflow-hidden">
                    {/* Radius Labels */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-6 text-xs font-bold text-blue-600">
                      {formData.vicinityRadius || 100} Sq. Mtr. Vicinity
                    </div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-[-90deg] text-xs font-bold text-gray-800">
                      Radius: {radiusValue} Mtr.
                    </div>
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 rotate-90 text-xs font-bold text-gray-800">
                      Radius: {radiusValue} Mtr.
                    </div>

                    {/* Center Lines */}
                    <div className="absolute top-0 left-0 w-full h-full">
                      <div className="absolute left-1/2 top-0 w-px h-full bg-gray-300 transform -translate-x-1/2"></div>
                      <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 transform -translate-y-1/2"></div>

                      {/* Grid lines based on roads */}
                      {(() => {
                        const roadDirections = [];
                        if (formData.neighbourNorthType === 'Road') roadDirections.push('North');
                        if (formData.neighbourSouthType === 'Road') roadDirections.push('South');
                        if (formData.neighbourEastType === 'Road') roadDirections.push('East');
                        if (formData.neighbourWestType === 'Road') roadDirections.push('West');

                        return (
                          <>
                            {/* Vertical lines */}
                            {!roadDirections.includes('West') && (
                              <div className="absolute left-[25%] top-0 w-px bg-gray-300" style={{
                                height: roadDirections.includes('North') ? '90%' : roadDirections.includes('South') ? '90%' : '100%',
                                top: roadDirections.includes('North') ? '10%' : '0'
                              }}></div>
                            )}
                            {!roadDirections.includes('East') && (
                              <div className="absolute left-[75%] top-0 w-px bg-gray-300" style={{
                                height: roadDirections.includes('North') ? '90%' : roadDirections.includes('South') ? '90%' : '100%',
                                top: roadDirections.includes('North') ? '10%' : '0'
                              }}></div>
                            )}

                            {/* Horizontal lines */}
                            {!roadDirections.includes('North') && (
                              <div className="absolute top-[25%] left-0 h-px bg-gray-300" style={{
                                width: roadDirections.includes('East') ? '90%' : roadDirections.includes('West') ? '90%' : '100%',
                                left: roadDirections.includes('West') ? '10%' : '0'
                              }}></div>
                            )}
                            {!roadDirections.includes('South') && (
                              <div className="absolute top-[75%] left-0 h-px bg-gray-300" style={{
                                width: roadDirections.includes('East') ? '90%' : roadDirections.includes('West') ? '90%' : '100%',
                                left: roadDirections.includes('West') ? '10%' : '0'
                              }}></div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* Plot Center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 border border-white z-10"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white z-10">
                      PLOT
                    </div>

                    {/* Road Visualizations */}
                    {formData.neighbourNorthType === 'Road' && (
                      <div className="absolute top-0 left-[25%] w-[50%] h-[10%] bg-red-600 border-2 border-dashed border-yellow-400 z-5"></div>
                    )}
                    {formData.neighbourSouthType === 'Road' && (
                      <div className="absolute bottom-0 left-[25%] w-[50%] h-[10%] bg-red-600 border-2 border-dashed border-yellow-400 z-5"></div>
                    )}
                    {formData.neighbourEastType === 'Road' && (
                      <div className="absolute right-0 top-[25%] w-[10%] h-[50%] bg-red-600 border-2 border-dashed border-yellow-400 z-5"></div>
                    )}
                    {formData.neighbourWestType === 'Road' && (
                      <div className="absolute left-0 top-[25%] w-[10%] h-[50%] bg-red-600 border-2 border-dashed border-yellow-400 z-5"></div>
                    )}

                    {/* Direction Labels */}
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 text-xs font-bold" style={{
                      color: formData.neighbourNorthType === 'Road' ? 'white' : '#333'
                    }}>
                      {formData.neighbourNorthType === 'Road'
                        ? `ROAD (${formData.roadNorth || 0}ft)`
                        : formData.neighbourNorthType === 'Others'
                          ? formData.neighbourNorthOther || 'NEIGHBOUR'
                          : 'PLOT'}
                    </div>
                    <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-bold" style={{
                      color: formData.neighbourSouthType === 'Road' ? 'white' : '#333'
                    }}>
                      {formData.neighbourSouthType === 'Road'
                        ? `ROAD (${formData.roadSouth || 0}ft)`
                        : formData.neighbourSouthType === 'Others'
                          ? formData.neighbourSouthOther || 'NEIGHBOUR'
                          : 'PLOT'}
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-[-90deg] text-xs font-bold" style={{
                      color: formData.neighbourEastType === 'Road' ? 'white' : '#333'
                    }}>
                      {formData.neighbourEastType === 'Road'
                        ? `ROAD (${formData.roadEast || 0}ft)`
                        : formData.neighbourEastType === 'Others'
                          ? formData.neighbourEastOther || 'NEIGHBOUR'
                          : 'PLOT'}
                    </div>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 rotate-90 text-xs font-bold" style={{
                      color: formData.neighbourWestType === 'Road' ? 'white' : '#333'
                    }}>
                      {formData.neighbourWestType === 'Road'
                        ? `ROAD (${formData.roadWest || 0}ft)`
                        : formData.neighbourWestType === 'Others'
                          ? formData.neighbourWestOther || 'NEIGHBOUR'
                          : 'PLOT'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">हस्ताक्षर (Signatures)</h3>
              <div className="flex justify-around mt-5">
                <div className="w-[45%] text-center">
                  <div className="h-px bg-black mt-12"></div>
                  <p className="mt-2">First Party Sign (प्रथम पक्ष के हस्ताक्षर)</p>
                </div>
                <div className="w-[45%] text-center">
                  <div className="h-px bg-black mt-12"></div>
                  <p className="mt-2">Second Party Sign (द्वितीय पक्ष के हस्ताक्षर)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyMapModule;


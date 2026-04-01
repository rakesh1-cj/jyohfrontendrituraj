"use client";
import React, { useState, useEffect, useRef } from 'react';

// Simple in-memory cache
const apiCache = {};

// Helper: Custom Searchable Select Component for Tehsil/Village
const SearchableSelect = ({
    label,
    value,
    onChange,
    onSearch,
    options,
    loading,
    disabled,
    placeholder = "Select...",
    allowOther = false,
    isOtherSelected,
    onOtherToggle
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync internal search term with value if strictly selecting from list
    useEffect(() => {
        if (!isOtherSelected && value) {
            const found = options.find(o => o.name === value || o.id === value);
            if (found) setSearchTerm(found.name);
        } else if (!value && !isOtherSelected) {
            setSearchTerm('');
        }
    }, [value, isOtherSelected, options]);

    const handleInputChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        // If we were in "Other" mode, we just update the text value directly
        if (isOtherSelected) {
            onChange(term); // Treat as text input
        } else {
            setIsOpen(true);
            onSearch(term); // Trigger API search
        }
    };

    const handleOptionClick = (option) => {
        if (option.id === 'other') {
            onOtherToggle(true);
            setSearchTerm('');
            onChange(''); // Reset value for new input
        } else {
            onChange(option.id); // Pass ID back
            setSearchTerm(option.name);
            onOtherToggle(false);
        }
        setIsOpen(false);
    };

    const switchToDropdown = () => {
        onOtherToggle(false);
        setSearchTerm('');
        onChange('');
        setIsOpen(true);
        onSearch(''); // Refresh basic list
    };

    return (
        <div className="mb-4" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onClick={() => !disabled && !isOtherSelected && setIsOpen(true)}
                    disabled={disabled}
                    placeholder={isOtherSelected ? `Enter ${label} manually` : placeholder}
                    className={`w-full p-2 border rounded-md ${disabled ? 'bg-gray-100' : 'bg-white'}`}
                    autoComplete="off"
                />

                {/* Loading Indicator */}
                {loading && (
                    <div className="absolute right-3 top-2.5">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* List Toggle when in Other mode */}
                {isOtherSelected && (
                    <button
                        type="button"
                        onClick={switchToDropdown}
                        className="absolute right-3 top-2.5 text-xs text-blue-600 underline"
                    >
                        List
                    </button>
                )}

                {/* Dropdown Options */}
                {isOpen && !disabled && !isOtherSelected && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {options.length > 0 ? (
                            options.map(opt => (
                                <div
                                    key={opt.id}
                                    onClick={() => handleOptionClick(opt)}
                                    className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                >
                                    {opt.name}
                                </div>
                            ))
                        ) : (
                            <div className="p-2 text-gray-400 text-sm">No results</div>
                        )}

                        {allowOther && (
                            <div
                                onClick={() => handleOptionClick({ id: 'other', name: 'Other' })}
                                className="p-2 border-t text-blue-600 cursor-pointer hover:bg-gray-50 text-sm font-medium"
                            >
                                + My {label} is not listed
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple Select for State/District (No search required by user spec, simplified)
const SimpleLocationSelect = ({ label, value, onChange, options, loading, disabled }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            disabled={disabled || loading}
            className="w-full p-2 border rounded-md bg-white disabled:bg-gray-100"
        >
            <option value="">Select {label}</option>
            {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
        </select>
    </div>
);

const LocationSelector = ({ formData, setFormData }) => {
    const [data, setData] = useState({
        states: [],
        districts: [],
        tehsils: [],
        villages: []
    });

    const [loading, setLoading] = useState({
        states: false,
        districts: false,
        tehsils: false,
        villages: false
    });

    // Track if "Other" is active for Tehsil/Village
    const [isOther, setIsOther] = useState({
        tehsil: false,
        village: false
    });

    // Fetch with Caching
    const fetchData = async (key, urlPath) => { // renamed url to urlPath for clarity
        // Construct full URL
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001';
        const fullUrl = `${baseUrl}${urlPath}`;

        if (apiCache[fullUrl]) return apiCache[fullUrl];

        try {
            const res = await fetch(fullUrl);
            const json = await res.json();
            // Handle flat array response or { data: [] } wrapper
            const result = Array.isArray(json) ? json : (json.data || []);
            apiCache[fullUrl] = result;
            return result;
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    // 1. Load States on Mount
    useEffect(() => {
        const load = async () => {
            setLoading(p => ({ ...p, states: true }));
            const res = await fetchData('states', '/api/locations/states');
            setData(p => ({ ...p, states: res }));
            setLoading(p => ({ ...p, states: false }));
        };
        load();
    }, []);

    // 2. State Change Handler
    const handleStateChange = async (stateId) => {
        const stateName = data.states.find(s => s.id === stateId)?.name || '';

        // Reset Everything below
        setFormData(prev => ({
            ...prev,
            state: stateName, state_id: stateId,
            district: '', district_id: '',
            tehsil: '', tehsil_id: '',
            village: '', village_id: ''
        }));

        // Reset Other flags
        setIsOther({ tehsil: false, village: false });
        setData(p => ({ ...p, districts: [], tehsils: [], villages: [] }));

        if (stateId) {
            setLoading(p => ({ ...p, districts: true }));
            const res = await fetchData(`districts_${stateId}`, `/api/locations/districts?state_id=${stateId}`);
            setData(p => ({ ...p, districts: res }));
            setLoading(p => ({ ...p, districts: false }));
        }
    };

    // 3. District Change Handler
    const handleDistrictChange = async (districtId) => {
        const districtName = data.districts.find(d => d.id === districtId)?.name || '';

        setFormData(prev => ({
            ...prev,
            district: districtName, district_id: districtId,
            tehsil: '', tehsil_id: '',
            village: '', village_id: ''
        }));

        setIsOther(prev => ({ ...prev, tehsil: false, village: false }));
        setData(p => ({ ...p, tehsils: [], villages: [] }));

        // Initial load for Tehsils (empty search)
        if (districtId) {
            searchTehsils(districtId, '');
        }
    };

    // Search Tehsils
    const searchTehsils = async (districtId, term) => {
        setLoading(p => ({ ...p, tehsils: true }));
        const res = await fetchData(`tehsils_${districtId}_${term}`, `/api/locations/tehsils?district_id=${districtId}&search=${term}`);
        setData(p => ({ ...p, tehsils: res }));
        setLoading(p => ({ ...p, tehsils: false }));
    };

    // 4. Tehsil Change/Search Handler
    const handleTehsilSearch = (term) => {
        if (formData.district_id) {
            searchTehsils(formData.district_id, term);
        }
    };

    const handleTehsilChange = (val) => {
        // Val could be ID (from list) or Text (if Other)
        if (isOther.tehsil) {
            // It's a text input
            setFormData(prev => ({ ...prev, tehsil: val, tehsil_id: 'other' }));
        } else {
            // It's an ID
            const tehsil = data.tehsils.find(t => t.id === val);
            setFormData(prev => ({
                ...prev,
                tehsil: tehsil?.name || '',
                tehsil_id: val,
                village: '', village_id: ''
            }));

            setIsOther(prev => ({ ...prev, village: false }));
            setData(p => ({ ...p, villages: [] }));

            if (val) {
                searchVillages(val, '');
            }
        }
    };

    // Search Villages
    const searchVillages = async (tehsilId, term) => {
        setLoading(p => ({ ...p, villages: true }));
        const res = await fetchData(`villages_${tehsilId}_${term}`, `/api/locations/villages?tehsil_id=${tehsilId}&search=${term}`);
        setData(p => ({ ...p, villages: res }));
        setLoading(p => ({ ...p, villages: false }));
    };

    const handleVillageSearch = (term) => {
        if (formData.tehsil_id && formData.tehsil_id !== 'other') {
            searchVillages(formData.tehsil_id, term);
        }
    };

    const handleVillageChange = (val) => {
        if (isOther.village) {
            setFormData(prev => ({ ...prev, village: val, village_id: 'other' }));
        } else {
            const village = data.villages.find(v => v.id === val);
            setFormData(prev => ({ ...prev, village: village?.name || '', village_id: val }));
        }
    };


    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <SimpleLocationSelect
                    label="State"
                    value={formData.state_id || ''}
                    onChange={handleStateChange}
                    options={data.states}
                    loading={loading.states}
                />

                <SimpleLocationSelect
                    label="District"
                    value={formData.district_id || ''}
                    onChange={handleDistrictChange}
                    options={data.districts}
                    loading={loading.districts}
                    disabled={!formData.state_id}
                />

                <SearchableSelect
                    label="Tehsil"
                    value={formData.tehsil || ''} // Use name for display in searchable input logic
                    onChange={handleTehsilChange}
                    onSearch={handleTehsilSearch}
                    options={data.tehsils}
                    loading={loading.tehsils}
                    disabled={!formData.district_id}
                    allowOther={true}
                    isOtherSelected={isOther.tehsil}
                    onOtherToggle={(val) => setIsOther(prev => ({ ...prev, tehsil: val }))}
                />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
                <input
                    type="text"
                    value={formData.village || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value, village_id: 'manual' }))}
                    disabled={!formData.tehsil_id}
                    placeholder="Enter Village Name"
                    className="w-full p-2 border rounded-md bg-white disabled:bg-gray-100"
                />
            </div>
        </>
    );
};

export default LocationSelector;

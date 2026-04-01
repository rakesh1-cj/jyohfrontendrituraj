"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Simple in-memory cache
const cache = {};

const SearchableDropdown = ({
    label,
    placeholder = "Select...",
    apiEndpoint,
    parentId, // e.g. state_id for districts
    queryParams = {}, // Extra params like { state_id: '...' }
    value, // Current selected value (name string)
    onSelect, // Callback(value, originalItem)
    disabled = false,
    required = false,
    allowOther = true,
    name // field name for form usage
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCustomInput, setIsCustomInput] = useState(false);

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const searchTimeout = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch data
    const fetchData = async (search = '') => {
        if (!apiEndpoint || disabled) return;

        // Construct cache key
        const queryStr = new URLSearchParams({ ...queryParams, search }).toString();
        const cacheKey = `${apiEndpoint}?${queryStr}`;

        if (cache[cacheKey]) {
            setOptions(cache[cacheKey]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001'}${apiEndpoint}?${queryStr}`);
            if (response.ok) {
                const result = await response.json();
                const data = result.data || [];
                cache[cacheKey] = data;
                setOptions(data);
            }
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to reset or re-fetch when Parent ID changes
    useEffect(() => {
        if (disabled) {
            setOptions([]);
            setSearchTerm('');
            setIsCustomInput(false);
            return;
        }

        // Initial fetch (empty search) when enabled/parent ready
        if (apiEndpoint) fetchData('');
    }, [apiEndpoint, JSON.stringify(queryParams), disabled]);

    // Sync value prop with local state
    useEffect(() => {
        if (value) {
            // If value matches an option, good. If not and allowOther, set custom.
            // We don't verify against options here to avoid async complexity, 
            // just trust the passed value unless we want strict validation.
            setSearchTerm(value);

            // Heuristic: If we have options loaded and value isn't in them, could be custom?
            // For now, let's assume it's standard unless switched manually, 
            // or if we detect "Other" logic upstream.
            // But standard way: display the value in the input.
        } else {
            setSearchTerm('');
        }
    }, [value]);

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (isCustomInput) {
            onSelect(term, { name: term, isOther: true });
            return;
        }

        if (!isOpen) setIsOpen(true);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        // Debounce search
        searchTimeout.current = setTimeout(() => {
            fetchData(term);
        }, 300);
    };

    const handleFocus = () => {
        if (!disabled && !isCustomInput) {
            setIsOpen(true);
            if (options.length === 0) fetchData('');
        }
    };

    const selectOption = (option) => {
        setSearchTerm(option.name);
        setIsOpen(false);
        onSelect(option.name, option);
    };

    const selectOther = () => {
        setIsCustomInput(true);
        setIsOpen(false);
        setSearchTerm('');
        onSelect('', { name: '', isOther: true }); // Clear so they type new
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const switchToDropdown = () => {
        setIsCustomInput(false);
        setSearchTerm('');
        onSelect('', null);
        setIsOpen(true);
        fetchData('');
    };

    return (
        <div className="form-group mb-4" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    name={name}
                    value={searchTerm}
                    onChange={handleSearch}
                    onFocus={handleFocus}
                    disabled={disabled}
                    placeholder={isCustomInput ? `Enter ${label} manually` : placeholder}
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white'
                        }`}
                    autoComplete="off"
                />

                {/* Icons/Indicators */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {isLoading && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}

                    {isCustomInput && !disabled && (
                        <button
                            type="button"
                            onClick={switchToDropdown}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                            title="Switch to list"
                        >
                            List
                        </button>
                    )}

                    {!isLoading && !isCustomInput && !disabled && (
                        <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            onClick={() => !disabled && setIsOpen(!isOpen)}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </div>

                {/* Dropdown Menu */}
                {isOpen && !disabled && !isCustomInput && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {options.length > 0 ? (
                            options.map((option) => (
                                <div
                                    key={option._id || option.id}
                                    onClick={() => selectOption(option)}
                                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors text-sm"
                                >
                                    {option.name}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-gray-500 text-sm">
                                {searchTerm ? 'No results found' : 'Type to search...'}
                            </div>
                        )}

                        {/* Other Option */}
                        {allowOther && (
                            <div
                                onClick={selectOther}
                                className="px-4 py-2 border-t border-gray-100 cursor-pointer hover:bg-blue-50 text-blue-600 font-medium text-sm flex items-center"
                            >
                                <span className="mr-2">+</span> Other (Enter manually)
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchableDropdown;

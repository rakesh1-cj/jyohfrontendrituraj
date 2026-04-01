
"use client";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CircleRatePage = () => {
    const [formData, setFormData] = useState({
        documentType: '',
        propertyType: '',
        plotType: '',
        circleRateAmount: ''
    });
    const [loading, setLoading] = useState(false);
    const [circleRates, setCircleRates] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Options
    const documentTypes = [
        { value: "sale-deed", label: "Sale Deed" },
        { value: "gift-deed", label: "Gift Deed" },
        { value: "partition-deed", label: "Partition Deed" },
        { value: "exchange-deed", label: "Exchange Deed" },
        { value: "other-deed", label: "Others" }
    ];

    const propertyTypes = [
        { value: "residential", label: "Residential" },
        { value: "agriculture", label: "Agriculture" },
        { value: "commercial", label: "Commercial" },
        { value: "industrial", label: "Industrial" }
    ];

    const plotTypes = [
        { value: "vacant", label: "Vacant Plot/Land" },
        { value: "buildup", label: "Buildup" },
        { value: "flat", label: "Flat/Floor" },
        { value: "multistory", label: "Multistory" }
    ];

    const fetchCircleRates = async () => {
        setFetchLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001'}/api/circle-rates/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            if (response.ok) {
                const result = await response.json();
                if (result.status === 'success') {
                    setCircleRates(result.data);
                }
            }
        } catch (error) {
            console.error("Error fetching rates:", error);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchCircleRates();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editingId 
                ? `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001'}/api/circle-rates/${editingId}`
                : `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001'}/api/circle-rates`;
            
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || `Circle Rate ${editingId ? 'updated' : 'saved'} successfully!`);
                handleReset();
                fetchCircleRates(); // Refresh list
            } else {
                toast.error(data.message || "Failed to save Circle Rate");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this circle rate?")) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001'}/api/circle-rates/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                toast.success("Circle Rate deleted successfully");
                fetchCircleRates();
                if (editingId === id) handleReset();
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to delete");
            }
        } catch (error) {
            console.error("Error deleting:", error);
            toast.error("An error occurred");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4001'}/api/circle-rates/${id}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.ok) {
                toast.success("Status updated successfully");
                fetchCircleRates();
            } else {
                const data = await response.json();
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error toggling status:", error);
            toast.error("An error occurred");
        }
    };

    const handleEdit = (rate) => {
        setFormData({
            documentType: rate.documentType,
            propertyType: rate.propertyType,
            plotType: rate.plotType,
            circleRateAmount: rate.circleRateAmount
        });
        setEditingId(rate._id);
    };

    const handleReset = () => {
        setFormData({
            documentType: '',
            propertyType: '',
            plotType: '',
            circleRateAmount: ''
        });
        setEditingId(null);
    };

    const getLabel = (value, options) => {
        const opt = options.find(o => o.value === value);
        return opt ? opt.label : value;
    };

    return (
        <div className="p-6">
            <ToastContainer />
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Circle Rates</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Section */}
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">{editingId ? 'Update Circle Rate' : 'Add Circle Rate'}</h2>
                        {editingId && (
                            <button 
                                onClick={handleReset}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Clear Selection
                            </button>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type *</label>
                            <select
                                value={formData.documentType}
                                onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                            >
                                <option value="">Select Document Type</option>
                                {documentTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                            <select
                                value={formData.propertyType}
                                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                            >
                                <option value="">Select Property Type</option>
                                {propertyTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plot Type *</label>
                            <select
                                value={formData.plotType}
                                onChange={(e) => setFormData({ ...formData, plotType: e.target.value })}
                                required
                                className="w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                            >
                                <option value="">Select Plot Type</option>
                                {plotTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Circle Rate Amount (INR) *</label>
                            <input
                                type="number"
                                value={formData.circleRateAmount}
                                onChange={(e) => setFormData({ ...formData, circleRateAmount: e.target.value })}
                                required
                                min="0"
                                className="w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                                placeholder="Enter Amount"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full ${editingId ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded-md transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Processing...' : editingId ? 'Update Circle Rate' : 'Set Circle Rate'}
                            </button>
                        </div>

                    </form>
                </div>

                {/* List Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Existing Circle Rates</h2>

                    {fetchLoading ? (
                        <div className="text-gray-500">Loading rates...</div>
                    ) : circleRates.length === 0 ? (
                        <div className="text-gray-500 italic">No circle rates added yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doc Type</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plot</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (₹)</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {circleRates.map((rate) => (
                                        <tr key={rate._id} className={`${editingId === rate._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {getLabel(rate.documentType, documentTypes)}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getLabel(rate.propertyType, propertyTypes)}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getLabel(rate.plotType, plotTypes)}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {rate.circleRateAmount.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rate.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {rate.isActive !== false ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                                                <button 
                                                    onClick={() => handleEdit(rate)}
                                                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1 rounded"
                                                    title="Edit"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleToggleStatus(rate._id)}
                                                    className={`${rate.isActive !== false ? 'text-orange-600 hover:text-orange-900 bg-orange-50' : 'text-green-600 hover:text-green-900 bg-green-50'} p-1 rounded`}
                                                    title={rate.isActive !== false ? "Disable" : "Enable"}
                                                >
                                                    {rate.isActive !== false ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(rate._id)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded"
                                                    title="Delete"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CircleRatePage;

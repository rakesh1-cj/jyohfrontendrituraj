"use client";
import React from 'react';

// This component displays SaleDeedDraft4Form data in read-only mode
// Same structure as SaleDeedDraft4Form but all fields are display-only
export default function SaleDeedDraft4ReadOnlyView({ formData = {} }) {
  // Extract arrays from formData
  const sellers = formData.sellers || [];
  const buyers = formData.buyers || [];
  const witnesses = formData.witnesses || [];
  const rooms = formData.rooms || [];
  const trees = formData.trees || [];
  const shops = formData.shops || [];
  const mallFloors = formData.mallFloors || [];
  const facilities = formData.facilities || [];

  // Helper to format shop/mall floor data
  const formatShopFloor = (item) => {
    if (typeof item === 'object' && item !== null && item.area !== undefined) {
      return item.area;
    }
    return typeof item === 'number' ? item : String(item || '');
  };

  // Get seller and buyer names for party details
  const sellerNames = sellers.filter(s => s && s.name && s.name.trim()).map(s => s.name);
  const buyerNames = buyers.filter(b => b && b.name && b.name.trim()).map(b => b.name);

  const showBuildupDetails = formData.propertyType === 'residential' || formData.propertyType === 'commercial';
  const showAgricultureDetails = formData.propertyType === 'agriculture';
  const showFlatDetails = formData.plotType === 'flat';
  const showMultistoryDetails = formData.plotType === 'multistory';
  const showBuildupSection = formData.plotType === 'buildup';
  const showCommonFacilities = (formData.plotType === 'flat' || formData.plotType === 'multistory' || formData.plotType === 'buildup') && 
                               (formData.propertyType === 'residential' || formData.propertyType === 'commercial');

  return (
    <div>
      {/* Property Information Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">Property Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.documentType || 'Not provided'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.propertyType || 'Not provided'}
            </div>
          </div>
        </div>

        {showBuildupDetails && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Plot Type</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.plotType || 'Not provided'}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Consideration Price (INR)</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.salePrice ? `₹${Number(formData.salePrice).toLocaleString()}` : 'Not provided'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Circle Rate Amount (per unit area) (INR)</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.circleRateAmount ? `₹${Number(formData.circleRateAmount).toLocaleString()}` : 'Not provided'}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Property Area Input Type</label>
          <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
            {formData.areaInputType === 'dimensions' ? 'Length & Width' : 'Total Area'}
          </div>
        </div>

        {formData.areaInputType === 'total' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Area</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {formData.area ? `${formData.area} ${formData.areaUnit || 'sq_meters'}` : 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area Unit</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {formData.areaUnit || 'Not provided'}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {formData.propertyLength ? `${formData.propertyLength} ${formData.dimUnit || 'meters'}` : 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {formData.propertyWidth ? `${formData.propertyWidth} ${formData.dimUnit || 'meters'}` : 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {formData.dimUnit || 'Not provided'}
              </div>
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
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                  {formData.buildupType || 'Not provided'}
                </div>
              </div>
            )}

            {(formData.buildupType === 'single-shop' || formData.buildupType === 'multiple-shops') && shops.length > 0 && (
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-3">Shop Details</h5>
                {shops.map((shop, index) => (
                  <div key={index} className="mb-2 p-3 bg-white rounded border">
                    <span className="text-sm font-medium text-gray-700">Shop {index + 1} Area (Sq.Ft.): </span>
                    <span className="text-gray-900">{formatShopFloor(shop)}</span>
                  </div>
                ))}
              </div>
            )}

            {formData.buildupType === 'mall' && mallFloors.length > 0 && (
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-3">Mall Floor Details</h5>
                {mallFloors.map((floor, index) => (
                  <div key={index} className="mb-2 p-3 bg-white rounded border">
                    <span className="text-sm font-medium text-gray-700">Floor {index + 1} Area (Sq.Ft.): </span>
                    <span className="text-gray-900">{formatShopFloor(floor)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Flat Details */}
        {showFlatDetails && rooms.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Flat/Floor Details</h4>
            {rooms.map((room, index) => (
              <div key={index} className="mb-3 p-3 bg-white rounded border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Room Type: </span>
                    <span className="text-gray-900">{room.type || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Length (Ft): </span>
                    <span className="text-gray-900">{room.length || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Width (Ft): </span>
                    <span className="text-gray-900">{room.width || 'Not provided'}</span>
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
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                  {formData.superAreaMulti || 'Not provided'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Covered Area (Sq. Ft.)</label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                  {formData.coveredAreaMulti || 'Not provided'}
                </div>
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
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                  {formData.nalkoopCount || 0}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Borewell Count</label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                  {formData.borewellCount || 0}
                </div>
              </div>
            </div>
            {trees.length > 0 && (
              <div>
                <h5 className="text-md font-medium text-gray-700 mb-3">Trees</h5>
                {trees.map((tree, index) => (
                  <div key={index} className="mb-2 p-3 bg-white rounded border">
                    <span className="text-sm font-medium text-gray-700">Type: {tree.type || 'Not provided'}, </span>
                    <span className="text-sm font-medium text-gray-700">Count: {tree.count || 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seller Details Section */}
      {sellers.length > 0 && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">Seller Details</h3>
          {sellers.map((seller, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Seller {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {seller.name || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Son of / Husband of</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {seller.relation || 'Not provided'}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {seller.address || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No.</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {seller.mobile || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Card Type</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {seller.idType || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Card No.</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {seller.idNo || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Card Number</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {seller.panCardNo || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Buyer Details Section */}
      {buyers.length > 0 && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">Buyer Details</h3>
          {buyers.map((buyer, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Buyer {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {buyer.name || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Son of / Husband of</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {buyer.relation || 'Not provided'}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {buyer.address || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No.</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {buyer.mobile || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Card Type</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {buyer.idType || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Card No.</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {buyer.idNo || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Card Number</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {buyer.panCardNo || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Party Details Section */}
      {(sellerNames.length > 0 || buyerNames.length > 0) && (
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
                <div className="text-gray-500">No sellers</div>
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
                <div className="text-gray-500">No buyers</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Witness Details Section */}
      {witnesses.length > 0 && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">Witness Details</h3>
          {witnesses.map((witness, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-medium text-gray-700 mb-3">Witness {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {witness.name || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Son of / Husband of</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {witness.relation || 'Not provided'}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {witness.address || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No.</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {witness.mobile || 'Not provided'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Card Number</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900">
                    {witness.panCardNo || 'Not provided'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Property Description Section */}
      <div className="mb-8 p-6 border border-gray-200 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">Property Description</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.state || 'Not provided'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.district || 'Not provided'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tehsil</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.tehsil || 'Not provided'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Village / Locality</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.village || 'Not provided'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khasra/Survey No.</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.khasraNo || 'Not provided'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plot No.</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.plotNo || 'Not provided'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colony Name</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.colonyName || 'Not provided'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ward Number</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.wardNo || 'Not provided'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Number</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.streetNo || 'Not provided'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Road Size</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.roadSize ? `${formData.roadSize} ${formData.roadUnit || 'meter'}` : 'Not provided'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Double Side Road</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.doubleSideRoad ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Property Directions */}
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">Property Directions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">North (उत्तर)</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {formData.directionNorth || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">East (पूर्व)</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {formData.directionEast || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">South (दक्षिण)</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {formData.directionSouth || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">West (पश्चिम)</label>
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
                {formData.directionWest || 'Not provided'}
              </div>
            </div>
          </div>
        </div>

        {/* Parking Details */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Covered Parking Count</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.coveredParkingCount || 0}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Open Parking Count</label>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900">
              {formData.openParkingCount || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Facilities Section - if applicable */}
      {showCommonFacilities && facilities.length > 0 && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b-2 border-blue-500">Facilities</h3>
          <div className="flex flex-wrap gap-2">
            {facilities.map((facility, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {facility}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


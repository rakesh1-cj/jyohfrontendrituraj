"use client";
import { useEffect } from "react";
import "./willdeed.css";
import "./willdeed.js";
import LanguageSelectorDropdown from "../../components/LanguageSelectorDropdown";
import ClientOnly from "../../components/ClientOnly";

export default function WillDeed() {
  useEffect(() => {
    window.initWillDeed();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 w-full px-2 sm:px-3 lg:px-4 py-2">
      <div className="w-full">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 sm:gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">अंतिम वसीयतनामा (Will Deed) — Generator</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Preview में legal Hindi draft बनेगा — allocation mapping, rules, conditions और watermark included.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ClientOnly fallback={
                <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm">
                  <span className="text-lg">🌐</span>
                  <span className="hidden sm:inline">Loading...</span>
                </div>
              }>
                <LanguageSelectorDropdown />
              </ClientOnly>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                onClick={() => window.saveDraft()}
              >
                💾 Save Draft
              </button>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                onClick={() => window.generatePreview()}
              >
                🔍 Preview
              </button>
              <button 
                className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                onClick={() => window.submitForm()}
              >
                ✅ Submit
              </button>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-3 lg:p-4">
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 mb-2">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5 sm:mb-2 pb-1.5 border-b border-gray-200">1) वसीयतकर्ता (Testator)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1.5 sm:gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">नाम</label>
              <div className="flex gap-1">
                <select id="testatorPrefix" className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">-- Select --</option>
                  <option>श्री</option>
                  <option>श्रीमती</option>
                  <option>कुमारी</option>
                  <option>अन्य</option>
                </select>
                <input
                  type="text"
                  id="testatorName"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="नाम"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">पिता/पति का नाम</label>
              <input
                type="text"
                id="testatorFH"
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="पिता/पति नाम"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">मोबाइल</label>
              <input
                type="tel"
                id="testatorMobile"
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10 अंक"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">पता</label>
              <textarea id="testatorAddress" className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500" rows="1"></textarea>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Identity Type</label>
              <select id="testatorIdType" className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option>आधार</option>
                <option>पैन</option>
                <option>वोटर आईडी</option>
                <option>पासपोर्ट</option>
                <option>ड्राइविंग</option>
                <option>अन्य</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Identity No.</label>
              <input type="text" id="testatorIdNo" className="border rounded px-2 py-1 w-full text-xs" placeholder="ID नंबर" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Identity Upload</label>
              <input
                type="file"
                id="testatorIdUpload"
                className="border rounded px-2 py-1 w-full text-xs"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Photo</label>
              <div className="flex gap-1">
                <input
                  type="file"
                  id="testatorPhoto"
                  className="border rounded px-2 py-1 flex-1 text-xs"
                  accept="image/*"
                  onChange={(e) => window.previewImage(e.target, "testatorPreview")}
                />
                <img id="testatorPreview" className="w-10 h-10 object-cover rounded border border-gray-300" alt="" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 mb-2">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5 sm:mb-2 pb-1.5 border-b border-gray-200">2) लाभार्थी (Beneficiaries)</h2>
          <div id="beneficiaries" className="space-y-2"></div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors mt-2"
            onClick={() => window.addBeneficiary()}
          >
            + लाभार्थी जोड़ें
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 mb-2">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5 sm:mb-2 pb-1.5 border-b border-gray-200">3) निष्पादक (Executors)</h2>
          <div id="executors" className="space-y-2"></div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors mt-2"
            onClick={() => window.addExecutor()}
          >
            + निष्पादक जोड़ें
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 mb-2">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5 sm:mb-2 pb-1.5 border-b border-gray-200">4) गवाह (Witnesses)</h2>
          <div id="witnesses" className="space-y-2"></div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors mt-2"
            onClick={() => window.addWitness()}
          >
            + गवाह जोड़ें
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 mb-2">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5 sm:mb-2 pb-1.5 border-b border-gray-200">5) संपत्ति विवरण (Property Details)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">संपत्ति का प्रकार चुनें</label>
              <select
                id="propertyType"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={() => window.onPropertyTypeChange()}
              >
                <option value="">-- चुनें --</option>
                <option value="immovable">अचल संपत्ति</option>
                <option value="movable">चल संपत्ति</option>
                <option value="both">दोनों</option>
              </select>
            </div>
          </div>

          <div id="immovableArea" className="mt-2 hidden">
            <h3 className="text-sm font-semibold text-gray-800 mb-1.5">अचल संपत्ति (Immovable)</h3>
            <div id="immovableList" className="space-y-2"></div>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors mt-1.5"
              onClick={() => window.addImmovable()}
            >
              + अचल संपत्ति जोड़ें
            </button>
          </div>

          <div id="movableArea" className="mt-2 hidden">
            <h3 className="text-sm font-semibold text-gray-800 mb-1.5">चल संपत्ति (Movable)</h3>
            <div id="movableList" className="space-y-2"></div>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors mt-1.5"
              onClick={() => window.addMovable()}
            >
              + चल संपत्ति जोड़ें
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 mb-2">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-1.5 sm:mb-2 pb-1.5 border-b border-gray-200">6) नियम एवं घोषणाएँ (Rules & Regulations)</h2>
          <div className="mb-1.5 sm:mb-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                id="selectAllRules"
                className="w-4 h-4"
                onChange={(e) => window.toggleAllRules(e.target)}
              />
              <span className="text-sm font-medium text-gray-700">Select All</span>
            </label>
          </div>
          <div id="rulesList" className="space-y-1 mb-1.5 sm:mb-2 max-h-60 overflow-y-auto pr-1"></div>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-medium transition-colors"
            onClick={() => window.addCustomRule()}
          >
            + Add More Rule
          </button>
          <hr className="my-1.5 sm:my-2 border-gray-300" />
          <div className="mb-1.5">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enableConditions"
                className="w-4 h-4"
                onChange={(e) => window.toggleConditions(e.target)}
              />
              <span className="text-sm font-medium text-gray-700">Add Conditions</span>
            </label>
          </div>
          <div id="conditionsArea" className="mt-1.5 hidden">
            <div id="conditionsList" className="space-y-1 max-h-40 overflow-y-auto pr-1"></div>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-medium transition-colors"
              onClick={() => window.addCondition()}
            >
              + Add Condition
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200 mb-2">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1.5 sm:mb-2 pb-1.5 border-b border-gray-200">7) Draft By</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 sm:gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prepared By:
              </label>
              <select id="draftBy" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Jyoh Services Pvt. Ltd.</option>
                <option>Self</option>
                <option>Other Advocate</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                यह ड्राफ्टर नाम ड्राफ्ट में दिखाई देगा।
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          नोट: फोटो/ID अपलोड केवल preview/metadata हेतु — सर्वर पर भेजने के लिए backend आवश्यक है।
        </p>
      </div>

      <div id="previewWrap" className="preview-wrap hidden">
        <div className="flex justify-end gap-2 mb-4">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => {
              document.getElementById("previewWrap").className = "preview-wrap hidden";
              document.getElementById("formCard").className = "card bg-white p-6 rounded shadow";
            }}
          >
            ✏️ Edit
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => window.saveDraft()}>
            💾 Save
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => window.print()}>
            🖨️ Print
          </button>
        </div>
        <div className="preview-page bg-white p-6 rounded shadow relative">
          <div className="watermark-layer" id="wmLayer"></div>
          <div className="preview-body" id="previewBody"></div>
        </div>
        </div>
      </div>
    </div>
  );
}
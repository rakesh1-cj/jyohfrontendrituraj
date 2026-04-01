"use client";
import React, { useEffect, useState } from "react";

const MODULES = [
  { key: "e-stamp", label: "E-Stamp Application" },
  { key: "map-module", label: "Map Module" },
  { key: "register-appointment", label: "Register Appointment" }
];

export default function Staff2SubStaffManagePage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState({});
  const [passwords, setPasswords] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4001";
        const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

        const res = await fetch(`${API_BASE}/api/admin/staff2/sub-staff-access`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : ""
          }
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load settings");
        }

        const byKey = {};
        (data.data || []).forEach((entry) => {
          byKey[entry.moduleKey] = entry;
        });
        setEntries(byKey);
      } catch (err) {
        setError(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePasswordChange = (moduleKey, value) => {
    setPasswords((prev) => ({ ...prev, [moduleKey]: value }));
  };

  const handleSave = async (moduleKey) => {
    const password = passwords[moduleKey];
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4001";
      const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

      const res = await fetch(`${API_BASE}/api/admin/staff2/sub-staff-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken ? `Bearer ${accessToken}` : ""
        },
        body: JSON.stringify({ moduleKey, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save password");
      }

      setEntries((prev) => ({
        ...prev,
        [moduleKey]: data.data
      }));
      setMessage(`Password for "${moduleKey}" updated successfully`);
      setPasswords((prev) => ({ ...prev, [moduleKey]: "" }));
    } catch (err) {
      setError(err.message || "Failed to save password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff 2 Sub-Staff Manage</h1>
        <p className="text-gray-600 mt-1">
          Configure passwords for Staff 2 sub-staff modules. Staff 2 members must enter these passwords
          before accessing the corresponding modules.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border divide-y">
          {MODULES.map((mod) => {
            const current = entries[mod.key];
            return (
              <div key={mod.key} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">{mod.label}</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Module key: <span className="font-mono">{mod.key}</span>
                  </p>
                  {current && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last updated: {current.updatedAt ? new Date(current.updatedAt).toLocaleString() : "N/A"}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <input
                    type="password"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm w-56"
                    placeholder="Enter new password"
                    value={passwords[mod.key] || ""}
                    onChange={(e) => handlePasswordChange(mod.key, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleSave(mod.key)}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : current ? "Update Password" : "Set Password"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(message || error) && (
        <div className="mt-4">
          {message && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-2 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}




"use client";

import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/components/UserContext";
import { supabase } from "@/lib/supabaseClient";

export default function MaintenanceRequest() {
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();

  const [selectedIssues, setSelectedIssues] = useState([]);
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [leases, setLeases] = useState([]);
  const [loadingLeases, setLoadingLeases] = useState(true);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const commonIssues = [
    "HVAC problems (heating/cooling)",
    "Electrical problems",
    "Light bulb out",
    "Plumbing issues (leaks, clogs)",
    "Appliance malfunction",
    "Door/window issues",
    "Lock/key problems",
    "Pest control",
    "Water damage",
    "Smoke detector issues",
    "Internet/WiFi problems",
    "Parking issues", 
  ];

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        setLoadingLeases(true);

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setUser(null);
          window.dispatchEvent(new Event("userChange"));
          setLeases([]);
          return;
        }

        const { data, error } = await supabase
          .from("Leases")
          .select(`
            lease_id,
            apartment_id,
            start_date,
            end_date,
            status,
            Apartments!leases_apartment_fk (
              apartment_id,
              apartment_name,
              address
            )
          `)
          .eq("user_id", authUser.id)
          .eq("status", 1)
          .order("start_date", { ascending: false });

        if (error) {
          throw error;
        }

        setLeases(data || []);
      } catch (err) {
        console.error("Error loading leases:", err);
        setLeases([]);
      } finally {
        setLoadingLeases(false);
      }
    };

    fetchLeases();
  }, [setUser]);

  const handleCheckboxChange = (issue) => {
    setSelectedIssues((prev) =>
      prev.includes(issue)
        ? prev.filter((i) => i !== issue)
        : [...prev, issue]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (selectedIssues.length === 0) {
      setError("Please select at least one maintenance issue");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setUser(null);
        window.dispatchEvent(new Event("userChange"));
        throw new Error("Session expired. Please log in again.");
      }

      const { data, error } = await supabase
        .from("MaintenanceRequest")
        .insert({
          user_id: authUser.id,
          lease_id: selectedLeaseId ? Number(selectedLeaseId) : null,
          selected_issues: selectedIssues,
          additional_details: additionalDetails.trim() || "",
          status: "pending",
        })
        .select("request_id")
        .single();

      if (error) {
        throw error;
      }

      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setSelectedIssues([]);
        setAdditionalDetails("");
        setSelectedLeaseId("");
      }, 3000);
    } catch (err) {
      console.error("Error submitting maintenance request:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Login Required
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to submit a maintenance request.
          </p>
          <a
            href="/tenants/login"
            className="text-indigo-600 hover:underline font-medium"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Maintenance Request
            </h1>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="text-gray-600">
                Select the issues you're experiencing and provide additional
                details below.
              </p>

              <a
                href="/tenants/maintenance/progress"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100 hover:bg-indigo-100"
              >
                View Request Status
              </a>
            </div>
          </div>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-green-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <h3 className="text-lg font-semibold text-green-800">
                Request Submitted Successfully!
              </h3>
              <p className="text-green-700 mt-2">
                We'll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {!loadingLeases && leases.length > 0 && (
                <div>
                  <label
                    htmlFor="lease"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Which property/unit is this for?
                  </label>

                  <select
                    id="lease"
                    value={selectedLeaseId}
                    onChange={(e) => setSelectedLeaseId(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">
                      — Not sure / affects multiple units —
                    </option>

                    {leases.map((lease) => (
                      <option key={lease.lease_id} value={lease.lease_id}>
                        {lease.Apartments?.address ||
                          lease.Apartments?.apartment_name ||
                          "Unknown Address"}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-gray-500">
                    Leave blank if the issue is in a common area or you're
                    unsure.
                  </p>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Common Issues <span className="text-red-600">*</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {commonIssues.map((issue) => (
                    <label
                      key={issue}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIssues.includes(issue)}
                        onChange={() => handleCheckboxChange(issue)}
                        className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />

                      <span className="ml-3 text-sm text-gray-700">
                        {issue}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="details"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Additional Details (Optional)
                </label>

                <textarea
                  id="details"
                  rows={6}
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Location in unit, how long it's been happening, urgency, photos, etc..."
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-6 rounded-lg shadow"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

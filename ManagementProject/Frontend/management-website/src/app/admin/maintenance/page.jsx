"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const formatIssues = (value) => {
  if (!value) return "Not provided";

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;

    if (Array.isArray(parsed)) {
      return parsed.length > 0 ? parsed.join(", ") : "Not provided";
    }

    if (typeof parsed === "object" && parsed !== null) {
      return Object.values(parsed).join(", ");
    }

    return String(parsed);
  } catch {
    return String(value);
  }
};

const formatDate = (dateValue) => {
  if (!dateValue) return "Not provided";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function MaintenanceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("MaintenanceRequest")
        .select(`
          request_id,
          user_id,
          lease_id,
          selected_issues,
          additional_details,
          status,
          created_at,
          Users (
            name,
            email
          ),
          Leases!maintenance_lease_fk (
            lease_id,
            apartment_id,
            Apartments!leases_apartment_fk (
              apartment_name,
              address
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setRequests(data || []);
    } catch (err) {
      console.error("Error loading maintenance requests:", err);
      setError(err.message || "Error loading maintenance requests");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);

      const { error } = await supabase
        .from("MaintenanceRequest")
        .update({ status: newStatus })
        .eq("request_id", id);

      if (error) {
        throw error;
      }

      setRequests((prev) =>
        prev.map((req) =>
          req.request_id === id
            ? {
                ...req,
                status: newStatus,
              }
            : req
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.message || "Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Maintenance Requests
            </h1>
            <p className="text-sm text-slate-500">
              View and manage maintenance requests submitted by tenants.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Loading maintenance requests...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 text-sm">
              {error}
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No maintenance requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Tenant
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Apartment
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Issues
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Created At
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((req) => {
                    const status = req.status || "pending";
                    const isUpdating = updatingId === req.request_id;

                    return (
                      <tr
                        key={req.request_id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        {/* Tenant */}
                        <td className="px-4 py-3 align-top">
                          <div className="text-slate-900 font-medium">
                            {req.Users?.username ||
                              req.Users?.email ||
                              `User #${req.user_id}`}
                          </div>
                        </td>

                        {/* Apartment */}
                        <td className="px-4 py-3 align-top">
                          <div className="text-slate-900 font-medium max-w-[180px] whitespace-pre-line">
                            {req.Leases?.Apartments?.address ||
                              req.Leases?.Apartments?.apartment_name ||
                              "Not provided"}
                          </div>
                        </td>

                        {/* Issues */}
                        <td className="px-4 py-3 align-top">
                          <div className="text-slate-900 max-w-[260px] whitespace-normal">
                            {formatIssues(req.selected_issues)}
                          </div>
                        </td>

                        {/* Additional details */}
                        <td className="px-4 py-3 align-top">
                          <div className="text-slate-900 max-w-[240px] whitespace-pre-line">
                            {req.additional_details || "Not provided"}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 align-top">
                          <select
                            disabled={isUpdating}
                            className={[
                              "rounded-full px-2.5 py-1 text-xs font-medium border outline-none",
                              isUpdating ? "opacity-60 cursor-not-allowed" : "",
                              status === "completed"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : status === "in_progress"
                                ? "bg-sky-100 text-sky-700 border-sky-200"
                                : "bg-amber-100 text-amber-700 border-amber-200",
                            ].join(" ")}
                            value={status}
                            onChange={(e) =>
                              updateStatus(req.request_id, e.target.value)
                            }
                          >
                            <option value="pending">pending</option>
                            <option value="in_progress">in_progress</option>
                            <option value="completed">completed</option>
                          </select>
                        </td>

                        {/* Created at */}
                        <td className="px-4 py-3 align-top text-slate-900 whitespace-nowrap">
                          {formatDate(req.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

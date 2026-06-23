"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "@/components/UserContext";
import { supabase } from "@/lib/supabaseClient";

const statusOrder = ["pending", "in_progress", "completed"];

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

const normalizeStatus = (status) => {
  const value = String(status || "pending").toLowerCase();

  if (value === "completed" || value === "complete") return "completed";
  if (value === "in_progress" || value === "progress") return "in_progress";

  return "pending";
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatIssues = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;

    if (Array.isArray(parsed)) return parsed;

    return [String(parsed)];
  } catch {
    return [String(value)];
  }
};

export default function MaintenanceProgressPage() {
  const { user, setUser } = useContext(UserContext);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setUser(null);
          window.dispatchEvent(new Event("userChange"));
          setRequests([]);
          setError("Please log in to view maintenance progress.");
          return;
        }

        const { data, error } = await supabase
          .from("MaintenanceRequest")
          .select(`
            request_id,
            user_id,
            lease_id,
            selected_issues,
            additional_details,
            status,
            created_at
          `)
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setRequests(data || []);
      } catch (err) {
        console.error("Error loading maintenance requests:", err);
        setError(err.message || "Failed to load maintenance requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [setUser]);

  const summary = useMemo(() => {
    return requests.reduce(
      (acc, req) => {
        const status = normalizeStatus(req.status);
        acc[status] += 1;
        return acc;
      },
      {
        pending: 0,
        in_progress: 0,
        completed: 0,
      }
    );
  }, [requests]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Login required
          </h2>

          <p className="text-slate-600 mb-6">
            Please log in to track your maintenance requests.
          </p>

          <a
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wide">
                Maintenance
              </p>

              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
                Maintenance Requests
              </h1>

              <p className="text-slate-600 mt-2">
                View the latest status of your submitted maintenance requests.
              </p>
            </div>

            <a
              href="/tenants/maintenance"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-sm"
            >
              Submit new request
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statusOrder.map((key) => (
            <div
              key={key}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
            >
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                {statusLabels[key]}
              </p>

              <p className="text-3xl font-bold text-slate-900 mt-2">
                {summary[key]}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Loading maintenance requests...
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-600">{error}</div>
          ) : requests.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                No maintenance requests yet
              </h2>

              <p className="text-slate-600 mt-2 mb-6">
                Once you submit a maintenance request, it will appear here.
              </p>

              <a
                href="/tenants/maintenance"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Submit maintenance request
              </a>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((req) => {
                const status = normalizeStatus(req.status);
                const badge = statusStyles[status] || statusStyles.pending;
                const issues = formatIssues(req.selected_issues);

                return (
                  <div
                    key={req.request_id}
                    className="p-6 hover:bg-slate-50 transition-colors duration-200"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Request #{req.request_id}
                        </p>

                        <h3 className="text-xl font-bold text-slate-900 mt-1">
                          {issues.length > 0
                            ? issues[0]
                            : "Maintenance request"}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          Created {formatDate(req.created_at)}
                        </p>

                        {req.lease_id && (
                          <p className="text-sm text-slate-600 mt-2">
                            Lease #{req.lease_id}
                          </p>
                        )}
                      </div>

                      <span
                        className={`w-fit rounded-full border px-4 py-1.5 text-sm font-semibold ${badge}`}
                      >
                        {statusLabels[status]}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase font-semibold tracking-wide text-slate-500">
                          Status
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {statusLabels[status]}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase font-semibold tracking-wide text-slate-500">
                          Submitted
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {formatDate(req.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase font-semibold tracking-wide text-slate-500">
                        Issues Reported
                      </p>

                      {issues.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {issues.map((issue) => (
                            <span
                              key={issue}
                              className="rounded-full bg-white border border-slate-200 px-3 py-1 text-sm text-slate-700"
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-600">
                          No issues listed.
                        </p>
                      )}
                    </div>

                    {req.additional_details && (
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase font-semibold tracking-wide text-slate-500">
                          Additional Details
                        </p>

                        <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                          {req.additional_details}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
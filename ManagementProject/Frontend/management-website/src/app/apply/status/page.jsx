"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "@/components/UserContext";
import { supabase } from "@/lib/supabaseClient";

const statusOrder = ["pending", "approved", "rejected"];

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const normalizeStatus = (status) => {
  const value = String(status || "pending").toLowerCase();

  if (value === "rejected") return "rejected";
  if (value === "approved" || value === "leased") return "approved";
  return "pending";
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ApplicationStatusPage() {
  const { user, setUser } = useContext(UserContext);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setUser(null);
          setApplications([]);
          setError("Please log in to view your applications.");
          return;
        }

        const { data, error } = await supabase
          .from("RentalApplications")
          .select(`
            application_id,
            apartment_id,
            user_id,
            first_name,
            last_name,
            email,
            phone,
            status,
            created_at,
            monthly_income,
            rent_amount,
            Apartments (
              apartment_id,
              apartment_name,
              address,
              pricing,
              bed,
              bath
            )
          `)
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setApplications(data || []);
      } catch (err) {
        console.error("Error loading applications:", err);
        setError(err.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [setUser]);

  const summary = useMemo(() => {
    return applications.reduce(
      (acc, app) => {
        const status = normalizeStatus(app.status);
        acc[status] += 1;
        return acc;
      },
      {
        pending: 0,
        approved: 0,
        rejected: 0,
      }
    );
  }, [applications]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Login required
          </h2>

          <p className="text-slate-600 mb-6">
            Please log in to view your apartment applications.
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
                Applications
              </p>

              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
                Application Status
              </h1>

              <p className="text-slate-600 mt-2">
                View the latest status of your apartment applications.
              </p>
            </div>

            <a
              href="/apply"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-sm"
            >
              Submit new application
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
              Loading applications...
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-600">{error}</div>
          ) : applications.length === 0 ? (
            <div className="p-10 text-center">
              <h2 className="text-xl font-bold text-slate-900">
                No applications yet
              </h2>

              <p className="text-slate-600 mt-2 mb-6">
                Once you submit an application, its status will appear here.
              </p>

              <a
                href="/apply"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Submit application
              </a>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.map((app) => {
                const displayStatus = normalizeStatus(app.status);
                const badge =
                  statusStyles[displayStatus] || statusStyles.pending;

                return (
                  <div
                    key={app.application_id}
                    className="p-6 hover:bg-slate-50 transition"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Application #{app.application_id}
                        </p>

                        <h3 className="text-xl font-bold text-slate-900 mt-1">
                          {app.Apartments?.apartment_name ||
                            app.Apartments?.address ||
                            "Apartment Application"}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          Applied {formatDate(app.created_at)}
                        </p>

                        {app.Apartments?.address && (
                          <p className="text-sm text-slate-600 mt-2">
                            {app.Apartments.address}
                          </p>
                        )}
                      </div>

                      <span
                        className={`w-fit rounded-full border px-4 py-1.5 text-sm font-semibold ${badge}`}
                      >
                        {statusLabels[displayStatus]}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500 font-semibold uppercase">
                          Rent
                        </p>
                        <p className="text-slate-900 font-bold mt-1">
                          {app.Apartments?.pricing
                            ? `$${app.Apartments.pricing}/mo`
                            : "Not listed"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500 font-semibold uppercase">
                          Layout
                        </p>
                        <p className="text-slate-900 font-bold mt-1">
                          {app.Apartments?.bed && app.Apartments?.bath
                            ? `${app.Apartments.bed} bed, ${app.Apartments.bath} bath`
                            : "Not listed"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500 font-semibold uppercase">
                          Monthly Income
                        </p>
                        <p className="text-slate-900 font-bold mt-1">
                          {app.monthly_income
                            ? `$${app.monthly_income}`
                            : "Not provided"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs text-slate-500 font-semibold uppercase">
                          Current Rent
                        </p>
                        <p className="text-slate-900 font-bold mt-1">
                          {app.rent_amount
                            ? `$${app.rent_amount}`
                            : "Not provided"}
                        </p>
                      </div>
                    </div>
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
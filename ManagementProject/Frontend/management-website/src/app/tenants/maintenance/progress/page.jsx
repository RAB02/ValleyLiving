// 'use client';

// import React, { useContext, useEffect, useMemo, useState } from "react";
// import { UserContext } from "@/components/UserContext";
// import {supabase} from "@/lib/supabaseClient";

// const statusOrder = ["pending", "in_progress", "completed"];

// const statusStyles = {
//   pending: "bg-amber-100 text-amber-800 border-amber-200",
//   in_progress: "bg-sky-100 text-sky-800 border-sky-200",
//   completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
// };

// const formatDate = (value) => {
//   if (!value) return "Not available";
//   const parsed = new Date(value);
//   if (Number.isNaN(parsed.getTime())) return value;
//   return parsed.toLocaleString(undefined, {
//     month: "short",
//     day: "numeric",
//     hour: "numeric",
//     minute: "2-digit",
//   });
// };

// export default function MaintenanceProgressPage() {
//   const { user, setUser } = useContext(UserContext);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!user) {
//       setLoading(false);
//       return;
//     }

//     const fetchRequests = async () => {
//       try {
//         const {
//           data: { user: authUser },
//           error: authError,
//         } = await supabase.auth.getUser();

//         if (authError || !authUser) {
//           setUser(null);
//           window.dispatchEvent(new Event("userChange"));
//           setError("Please log in to view maintenance progress.");
//           return;
//         }

//         const { data, error } = await supabase
//           .from("MaintenanceRequest")
//           .select("*")
//           .eq("user_id", authUser.id)
//           .order("created_at", { ascending: false });

//         if (error) {
//           throw error;
//         }

//         setRequests(data || []);
//       } catch (err) {
//         setError(err.message || "Failed to load maintenance requests");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRequests();
//   }, [user, setUser]);
//           window.dispatchEvent(new Event("userChange"));
//           setError("Please log in to view maintenance progress.");
//           return;
//         }

//         if (!res.ok) {
//           throw new Error("Failed to load maintenance requests");
//         }

//         const data = await res.json();
//         setRequests(data.requests || []);
//       } catch (err) {
//         setError(err.message || "Failed to load maintenance requests");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRequests();
//   }, [user, setUser]);

//   const summary = useMemo(() => {
//     return requests.reduce(
//       (acc, req) => {
//         const key = req.status || "pending";
//         acc[key] = (acc[key] || 0) + 1;
//         return acc;
//       },
//       { pending: 0, in_progress: 0, completed: 0 }
//     );
//   }, [requests]);

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
//         <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
//           <h2 className="text-2xl font-semibold text-gray-900 mb-2">
//             Login required
//           </h2>
//           <p className="text-gray-600 mb-4">
//             Please log in to track your maintenance requests.
//           </p>
//           <a
//             href="/login"
//             className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
//           >
//             Go to login
//           </a>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-10">
//       <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
//           <div>
//             <p className="text-sm text-indigo-600 font-semibold">
//               Maintenance
//             </p>
//             <h1 className="text-3xl font-bold text-gray-900">
//               Request progress
//             </h1>
//             <p className="text-gray-600 mt-1">
//               Track the status of requests you have submitted.
//             </p>
//           </div>
//           <div className="flex gap-2">
//             <a
//               href="/tenants/maintenance"
//               className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
//             >
//               Submit new request
//             </a>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//           {["pending", "in_progress", "completed"].map((key) => (
//             <div
//               key={key}
//               className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
//             >
//               <p className="text-xs uppercase tracking-wide text-gray-500">
//                 {key.replace("_", " ")}
//               </p>
//               <p className="text-2xl font-bold text-gray-900">
//                 {summary[key] || 0}
//               </p>
//             </div>
//           ))}
//         </div>

//         <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
//           {loading ? (
//             <div className="p-8 text-center text-gray-500">Loading...</div>
//           ) : error ? (
//             <div className="p-8 text-center text-red-600">{error}</div>
//           ) : requests.length === 0 ? (
//             <div className="p-8 text-center text-gray-600 space-y-3">
//               <p className="font-semibold text-gray-900">
//                 No maintenance requests yet
//               </p>
//               <p className="text-sm text-gray-600">
//                 Submit a request to start tracking its progress.
//               </p>
//               <a
//                 href="/tenants/maintenance"
//                 className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
//               >
//                 Submit maintenance request
//               </a>
//             </div>
//           ) : (
//             <ul className="divide-y divide-gray-100">
//               {requests.map((req) => {
//                 const currentStep = statusOrder.indexOf(req.status);
//                 const badge =
//                   statusStyles[req.status] || statusStyles.pending;

//                 return (
//                   <li key={req.request_id} className="p-6">
//                     <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
//                       <div className="space-y-1">
//                         <p className="text-xs text-gray-500">
//                           Request #{req.request_id}
//                         </p>
//                         <h3 className="text-xl font-semibold text-gray-900">
//                           {req.selected_issues && req.selected_issues.length > 0
//                             ? req.selected_issues[0]
//                             : "Maintenance request"}
//                         </h3>
//                         <p className="text-sm text-gray-600">
//                           Created {formatDate(req.created_at)}
//                         </p>
//                         {req.lease_id && (
//                           <p className="text-sm text-gray-600">
//                             Lease #{req.lease_id}
//                           </p>
//                         )}
//                       </div>
//                       <span
//                         className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}
//                       >
//                         {req.status?.replace("_", " ") || "pending"}
//                       </span>
//                     </div>

//                     <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
//                       <div className="flex items-center gap-3">
//                         {statusOrder.map((step, index) => {
//                           const reached = index <= currentStep;
//                           return (
//                             <div
//                               key={step}
//                               className="flex items-center gap-3"
//                             >
//                               <div
//                                 className={`h-9 w-9 rounded-full border flex items-center justify-center text-xs font-semibold ${
//                                   reached
//                                     ? "bg-indigo-600 border-indigo-600 text-white"
//                                     : "bg-gray-100 border-gray-200 text-gray-500"
//                                 }`}
//                               >
//                                 {index + 1}
//                               </div>
//                               {index < statusOrder.length - 1 && (
//                                 <div
//                                   className={`h-0.5 w-12 md:w-16 ${
//                                     index < currentStep
//                                       ? "bg-indigo-600"
//                                       : "bg-gray-200"
//                                   }`}
//                                 />
//                               )}
//                             </div>
//                           );
//                         })}
//                       </div>

//                       <div className="flex-1">
//                         <p className="text-sm text-gray-800 font-medium">
//                           Details
//                         </p>
//                         <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
//                           {(req.selected_issues || []).map((issue) => (
//                             <li key={issue}>{issue}</li>
//                           ))}
//                         </ul>
//                         {req.additional_details && (
//                           <p className="mt-2 text-sm text-gray-600">
//                             {req.additional_details}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </li>
//                 );
//               })}
//             </ul>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "@/components/UserContext";
import { supabase } from "@/lib/supabaseClient";

const statusOrder = ["pending", "in_progress", "completed"];

const statusStyles = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  in_progress: "bg-sky-100 text-sky-800 border-sky-200",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatIssues = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;

    if (Array.isArray(parsed)) {
      return parsed;
    }

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
          setError("Please log in to view maintenance progress.");
          setRequests([]);
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

        if (error) {
          throw error;
        }

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
        const key = req.status || "pending";
        acc[key] = (acc[key] || 0) + 1;
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Login required
          </h2>

          <p className="text-gray-600 mb-4">
            Please log in to track your maintenance requests.
          </p>

          <a
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <p className="text-sm text-indigo-600 font-semibold">
              Maintenance
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              Request progress
            </h1>

            <p className="text-gray-600 mt-1">
              Track the status of requests you have submitted.
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href="/tenants/maintenance"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Submit new request
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {statusOrder.map((key) => (
            <div
              key={key}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {key.replace("_", " ")}
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {summary[key] || 0}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center text-gray-600 space-y-3">
              <p className="font-semibold text-gray-900">
                No maintenance requests yet
              </p>

              <p className="text-sm text-gray-600">
                Submit a request to start tracking its progress.
              </p>

              <a
                href="/tenants/maintenance"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Submit maintenance request
              </a>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {requests.map((req) => {
                const status = req.status || "pending";
                const currentStep = Math.max(statusOrder.indexOf(status), 0);
                const badge = statusStyles[status] || statusStyles.pending;
                const issues = formatIssues(req.selected_issues);

                return (
                  <li key={req.request_id} className="p-6">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">
                          Request #{req.request_id}
                        </p>

                        <h3 className="text-xl font-semibold text-gray-900">
                          {issues.length > 0
                            ? issues[0]
                            : "Maintenance request"}
                        </h3>

                        <p className="text-sm text-gray-600">
                          Created {formatDate(req.created_at)}
                        </p>

                        {req.lease_id && (
                          <p className="text-sm text-gray-600">
                            Lease #{req.lease_id}
                          </p>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 text-xs font-semibold ${badge}`}
                      >
                        {status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
                      <div className="flex items-center gap-3">
                        {statusOrder.map((step, index) => {
                          const reached = index <= currentStep;

                          return (
                            <div key={step} className="flex items-center gap-3">
                              <div
                                className={`h-9 w-9 rounded-full border flex items-center justify-center text-xs font-semibold ${
                                  reached
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "bg-gray-100 border-gray-200 text-gray-500"
                                }`}
                              >
                                {index + 1}
                              </div>

                              {index < statusOrder.length - 1 && (
                                <div
                                  className={`h-0.5 w-12 md:w-16 ${
                                    index < currentStep
                                      ? "bg-indigo-600"
                                      : "bg-gray-200"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm text-gray-800 font-medium">
                          Details
                        </p>

                        {issues.length > 0 ? (
                          <ul className="mt-2 text-sm text-gray-700 list-disc list-inside space-y-1">
                            {issues.map((issue) => (
                              <li key={issue}>{issue}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-sm text-gray-600">
                            No issues listed.
                          </p>
                        )}

                        {req.additional_details && (
                          <p className="mt-2 text-sm text-gray-600">
                            {req.additional_details}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
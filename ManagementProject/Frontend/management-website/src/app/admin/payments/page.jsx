// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import {supabase} from "@/lib/supabaseClient";
// import AdminPaymentForm from "@/components/AdminPaymentForm";
// import AdminPaymentTable from "@/components/AdminPaymentTable";

// export default function AdminPaymentsPage() {
//   const router = useRouter();

//   const [tenants, setTenants] = useState([]);
//   const [leases, setLeases] = useState([]);
//   const [payments, setPayments] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("all");

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(true);

//   const [form, setForm] = useState({
//     user_id: "",
//     lease_id: "",
//     amount: "",
//     payment_date: new Date().toISOString().slice(0, 10),
//     method: "Card",
//     status: "Paid",
//   });

//   // Fetch leases (for form) + payments (for Recent Payments) from one route
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await fetch("http://localhost:8080/admin/payments", {
//         method: "GET",
//         credentials: "include",
//       });

//       if (!res.ok) {
//         throw new Error("Unauthorized");
//       }

//       const json = await res.json();

//       const leasesFromApi = json.leases || [];
//       setLeases(leasesFromApi);
//       console.log("Leases set:", leasesFromApi);

//       // Build tenants from leases
//       const tenantMap = new Map();
//       for (const l of leasesFromApi) {
//         if (!tenantMap.has(l.user_id)) {
//           tenantMap.set(l.user_id, {
//             id: l.user_id,
//             email: l.email,
//             apartment: l.address,
//           });
//         }
//       }
//       setTenants(Array.from(tenantMap.values()));

//       // Fill Recent Payments table
//       setPayments(json.payments || []);
//     } catch (err) {
//       console.error("Error loading payments page:", err);
//       setError("Session expired or unauthorized");
//       router.push("/admin/dashboard");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [router]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => {
//       const updated = { ...prev, [name]: value };

//       if (name === "lease_id") {
//         const lease = leases.find(
//           (l) => l.lease_id === Number(value)
//         );
//         if (lease) {
//           updated.amount = lease.rent_amount;
//         }
//       }

//       return updated;
//     });
//   };

//   const handleAddPayment = async (e) => {
//     e.preventDefault();

//     if (!form.user_id || !form.lease_id || !form.amount) {
//       alert("Please fill in tenant, lease, and amount.");
//       return;
//     }

//     try {
//       setError("");

//       const res = await fetch("http://localhost:8080/admin/payments", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(form),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.error || "Failed to create payment");
//       }

//       // Re-sync leases + payments from database
//       await fetchData();

//       // Reset amount, keep tenant + lease + date/method/status
//       setForm((prev) => ({
//         ...prev,
//         amount: "",
//       }));
//     } catch (err) {
//       console.error("Error saving payment:", err);
//       setError(err.message || "Failed to save payment.");
//     }
//   };

//   const filteredPayments =
//     statusFilter === "all"
//       ? payments
//       : payments.filter((p) => p.status === statusFilter);

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
//           <div>
//             <h1 className="text-2xl font-semibold text-slate-900">
//               Payments
//             </h1>
//             <p className="text-sm text-slate-500">
//               Manage tenant payments, record new transactions, and keep track of overdue balances.
//             </p>
//           </div>
//         </div>

//         {error && (
//           <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
//             {error}
//           </div>
//         )}

//         <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
//           <AdminPaymentForm
//             loading={loading}
//             tenants={tenants}
//             leases={leases}
//             form={form}
//             onChange={handleChange}
//             onSubmit={handleAddPayment}
//           />

//           <AdminPaymentTable
//             payments={filteredPayments}
//             statusFilter={statusFilter}
//             setStatusFilter={setStatusFilter}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminPaymentForm from "@/components/AdminPaymentForm";
import AdminPaymentTable from "@/components/AdminPaymentTable";

export default function AdminPaymentsPage() {
  const router = useRouter();

  const [tenants, setTenants] = useState([]);
  const [leases, setLeases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    user_id: "",
    lease_id: "",
    amount: "",
    payment_date: new Date().toISOString().slice(0, 10),
    method: "Card",
    status: "Paid",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("Users")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile || profile.role !== "admin") {
        router.push("/");
        return;
      }

      const { data: leasesData, error: leasesError } = await supabase
        .from("Leases")
        .select(`
          lease_id,
          user_id,
          apartment_id,
          rent_amount,
          status,
          Users (
            email
          ),
          Apartments (
            address
          )
        `)
        .eq("status", "active");

      if (leasesError) throw leasesError;

      const formattedLeases = (leasesData || []).map((lease) => ({
        lease_id: lease.lease_id,
        user_id: lease.user_id,
        apartment_id: lease.apartment_id,
        rent_amount: lease.rent_amount,
        status: lease.status,
        email: lease.Users?.email || "No email",
        address: lease.Apartments?.address || "No address",
      }));

      setLeases(formattedLeases);

      const tenantMap = new Map();

      formattedLeases.forEach((lease) => {
        if (!tenantMap.has(lease.user_id)) {
          tenantMap.set(lease.user_id, {
            id: lease.user_id,
            email: lease.email,
          });
        }
      });

      setTenants(Array.from(tenantMap.values()));

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("Payments")
        .select(`
          payment_id,
          lease_id,
          amount,
          payment_date,
          method,
          status,
          Leases (
            user_id,
            Apartments (
              address
            ),
            Users (
              email
            )
          )
        `)
        .order("payment_date", { ascending: false });

      if (paymentsError) throw paymentsError;

      const formattedPayments = (paymentsData || []).map((payment) => ({
        id: payment.payment_id,
        tenantName: payment.Leases?.Users?.email || "Unknown tenant",
        apartment: payment.Leases?.Apartments?.address || "Unknown apartment",
        date: payment.payment_date,
        method: payment.method,
        amount: payment.amount,
        status: payment.status,
      }));

      setPayments(formattedPayments);
    } catch (err) {
      console.error("Error loading payments page:", err);
      setError(err.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "user_id") {
        updated.lease_id = "";
        updated.amount = "";
      }

      if (name === "lease_id") {
        const selectedLease = leases.find(
          (lease) => String(lease.lease_id) === String(value)
        );

        if (selectedLease) {
          updated.amount = selectedLease.rent_amount;
        }
      }

      return updated;
    });
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();

    if (!form.user_id || !form.lease_id || !form.amount) {
      setError("Please fill in tenant, lease, and amount.");
      return;
    }

    try {
      setError("");

      const { error: insertError } = await supabase.from("Payments").insert([
        {
          lease_id: Number(form.lease_id),
          amount: Number(form.amount),
          payment_date: form.payment_date,
          method: form.method,
          status: form.status,
        },
      ]);

      if (insertError) throw insertError;

      await fetchData();

      setForm({
        user_id: "",
        lease_id: "",
        amount: "",
        payment_date: new Date().toISOString().slice(0, 10),
        method: "Card",
        status: "Paid",
      });
    } catch (err) {
      console.error("Error saving payment:", err);
      setError(err.message || "Failed to save payment.");
    }
  };

  const filteredPayments =
    statusFilter === "all"
      ? payments
      : payments.filter((payment) => payment.status === statusFilter);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Payments
            </h1>
            <p className="text-sm text-slate-500">
              Manage tenant payments and record new transactions.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
          <AdminPaymentForm
            loading={loading}
            tenants={tenants}
            leases={leases}
            form={form}
            onChange={handleChange}
            onSubmit={handleAddPayment}
          />

          <AdminPaymentTable
            payments={filteredPayments}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        </div>
      </div>
    </div>
  );
}
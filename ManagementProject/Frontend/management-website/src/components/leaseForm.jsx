// "use client";

// import { useState, useEffect } from "react";
// import { supabase } from "@/lib/supabaseClient";

// export default function  AddLeaseForm({ apartments = [], users = [], refreshData }) {
//   const [leases, setLeases] = useState([]);
//   const [form, setForm] = useState({
//     apartment_id: "",
//     user_id: "",
//     start_date: "",
//     end_date: "",
//     rent_amount: "",
//   });
//   const [message, setMessage] = useState("");
//   const activeLeases = leases.filter((l) => Number(l.status) === 1);
//   const pastLeases = leases.filter((l) => Number(l.status) === 0);
//   const [showPast, setShowPast] = useState(false);

//   // ✅ Fetch leases when the page loads
//   const fetchLeases = async () => {
//     try {
//       const { data, error } = await supabase
//       .from("Leases")
//       .select(`
//         *
//       `);

//     if (error) throw error;

//     setLeases(data);
//     } catch (err) {
//       console.error("Error fetching leases:", err);
//       setMessage("Failed to load leases.");
//     }
//   };

//   useEffect(() => {
//     fetchLeases();
//   }, []);

//   // ✅ Handle changes and submissions (same as before)
//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "apartment_id") {
//       const selectedApartment = apartments.find((a) => a.apartment_id == value);
//       const today = new Date();
//       const nextYear = new Date();
//       nextYear.setFullYear(today.getFullYear() + 1);
//       const formatDate = (d) => d.toISOString().split("T")[0];

//       setForm({
//         ...form,
//         apartment_id: value,
//         rent_amount: selectedApartment ? selectedApartment.pricing : "",
//         start_date: formatDate(today),
//         end_date: formatDate(nextYear),
//       });
//     } else {
//       setForm({ ...form, [name]: value });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     const res = await fetch("http://localhost:8080/admin/lease", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//       body: JSON.stringify(form),
//     });

//     const data = await res.json();
//     setMessage(data.message || data.error);

//     // ✅ Re-fetch leases after adding one
//     if (res.ok){
//       fetchLeases();
//       refreshData();
//     }

//     setForm({
//       apartment_id: "",
//       user_id: "",
//       start_date: "",
//       end_date: "",
//       rent_amount: "",
//     });
//   };
//   const handleEndLease = async (leaseId) => {
//     if (!confirm("Are you sure you want to end this lease?")) return;

//     try {
//       const res = await fetch(
//         `http://localhost:8080/admin/lease/${leaseId}/end`,
//         {
//           method: "PUT",
//           credentials: "include",
//         }
//       );

//       const data = await res.json();
//       alert(data.message || data.error);

//       // Refresh leases list
//       await fetchLeases();
//       await refreshData();
//     } catch (err) {
//       console.error("Error ending lease:", err);
//       alert("Failed to end lease.");
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-8">
//       <h2 className="text-xl font-semibold mb-4 text-gray-800">Leases</h2>
//       {/* ✅ Form to add lease (same as before) */}
//       <h2 className="text-xl font-semibold mb-4 text-gray-800">
//         Add New Lease
//       </h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <select
//           name="apartment_id"
//           value={form.apartment_id}
//           onChange={handleChange}
//           className="border rounded-lg p-2 w-full"
//         >
//           <option value="">Select Apartment</option>
//           {apartments
//             .filter((a) => !a.is_occupied)
//             .map((a) => (
//               <option key={a.apartment_id} value={a.apartment_id}>
//                 {a.address} — ${a.pricing}
//               </option>
//             ))}
//         </select>

//         <select
//           name="user_id"
//           value={form.user_id}
//           onChange={handleChange}
//           className="border rounded-lg p-2 w-full"
//         >
//           <option value="">Select Tenant</option>
//           {users.map((u) => (
//             <option key={u.user_id} value={u.id}>
//               {u.email}
//             </option>
//           ))}
//         </select>

//         <input
//           type="date"
//           name="start_date"
//           value={form.start_date}
//           onChange={handleChange}
//           className="border rounded-lg p-2 w-full"
//         />
//         <input
//           type="date"
//           name="end_date"
//           value={form.end_date}
//           onChange={handleChange}
//           className="border rounded-lg p-2 w-full"
//         />

//         <div className="relative">
//           <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
//             $
//           </span>
//           <input
//             type="number"
//             name="rent_amount"
//             placeholder="Rent amount"
//             value={form.rent_amount}
//             onChange={handleChange}
//             className="border rounded-lg p-2 pl-7 w-full"
//           />
//         </div>

//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
//         >
//           Add Lease
//         </button>
//       </form>
//       <h2 className="pt-6 text-xl font-semibold mb-4 text-gray-800">
//         Current Leases
//       </h2>
//       <LeaseTable
//         leases={activeLeases}
//         handleEndLease={handleEndLease}
//         showEndButton={true}
//       />

//       <div className="pt-6">
//         <button
//           onClick={() => setShowPast(!showPast)}
//           className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
//         >
//           {showPast ? "Hide Past Leases" : "Show Past Leases"}
//         </button>

//         {showPast && (
//           <div className="mt-4">
//             <h2 className="text-lg font-semibold mb-3 text-gray-800">
//               Past Leases
//             </h2>
//             <LeaseTable
//               leases={pastLeases}
//               handleEndLease={handleEndLease}
//               showEndButton={false}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function LeaseTable({ leases, handleEndLease, showEndButton }) {
//   if (leases.length === 0)
//     return <p className="text-gray-500 text-sm">No leases found.</p>;

//   return (
//     <div className="overflow-x-auto mb-6">
//       <table className="min-w-full text-sm">
//         <thead className="border-b text-gray-600">
//           <tr>
//             <th className="py-2 pr-4 text-left">Apartment</th>
//             <th className="py-2 pr-4 text-left">Tenant</th>
//             <th className="py-2 pr-4 text-left">Rent</th>
//             <th className="py-2 pr-4 text-left">Start</th>
//             <th className="py-2 pr-4 text-left">End</th>
//             <th className="py-2 pr-4 text-left">Status</th>
//             {showEndButton && <th className="py-2 pr-4 text-left">Actions</th>}
//           </tr>
//         </thead>
//         <tbody>
//           {leases.map((lease) => (
//             <tr key={lease.lease_id} className="border-b hover:bg-gray-50">
//               <td className="py-2 pr-4">{lease.address}</td>
//               <td className="py-2 pr-4">{lease.email}</td>
//               <td className="py-2 pr-4">${lease.rent_amount}</td>
//               <td className="py-2 pr-4">{lease.start_date}</td>
//               <td className="py-2 pr-4">{lease.end_date}</td>
//               <td className="py-2 pr-4">
//                 {Number(lease.status) === 1 ? (
//                   <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
//                     Active
//                   </span>
//                 ) : (
//                   <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
//                     Ended
//                   </span>
//                 )}
//               </td>
//               {showEndButton && Number(lease.status) === 1 && (
//                 <td className="py-2 pr-4">
//                   <button
//                     onClick={() => handleEndLease(lease.lease_id)}
//                     className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 transition"
//                   >
//                     End Lease
//                   </button>
//                 </td>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AddLeaseForm({
  apartments = [],
  users = [],
  refreshData,
}) {
  const [leases, setLeases] = useState([]);
  const [form, setForm] = useState({
    apartment_id: "",
    user_id: "",
    start_date: "",
    end_date: "",
    rent_amount: "",
  });

  const [message, setMessage] = useState("");
  const [showPast, setShowPast] = useState(false);

  const activeLeases = leases.filter((l) => l.status === 1);
  const pastLeases = leases.filter((l) => l.status === 0);

  // -----------------------------
  // FETCH LEASES (FIXED SUPABASE RELATIONSHIPS)
  // -----------------------------
  const fetchLeases = async () => {
    try {
      const { data, error } = await supabase
        .from("Leases")
        .select(`
          lease_id,
          apartment_id,
          user_id,
          rent_amount,
          start_date,
          end_date,
          status,
          Apartments(address),
          Users(email)
        `);

      if (error) throw error;

      setLeases(data || []);
    } catch (err) {
      console.error("Error fetching leases:", err);
      setMessage("Failed to load leases.");
    }
  };

  useEffect(() => {
    fetchLeases();
  }, []);

  // -----------------------------
  // FORM CHANGE HANDLER
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "apartment_id") {
      const selectedApartment = apartments.find(
        (a) => a.apartment_id == value
      );

      const today = new Date();
      const nextYear = new Date();
      nextYear.setFullYear(today.getFullYear() + 1);

      const formatDate = (d) => d.toISOString().split("T")[0];

      setForm({
        ...form,
        apartment_id: value,
        rent_amount: selectedApartment ? selectedApartment.pricing : "",
        start_date: formatDate(today),
        end_date: formatDate(nextYear),
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // -----------------------------
  // SUBMIT LEASE (still using backend for now)
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch("http://localhost:8080/admin/lease", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setMessage(data.message || data.error);

    if (res.ok) {
      fetchLeases();
      refreshData?.();
    }

    setForm({
      apartment_id: "",
      user_id: "",
      start_date: "",
      end_date: "",
      rent_amount: "",
    });
  };

  // -----------------------------
  // END LEASE
  // -----------------------------
  const handleEndLease = async (leaseId) => {
    if (!confirm("Are you sure you want to end this lease?")) return;

    try {
      const res = await fetch(
        `http://localhost:8080/admin/lease/${leaseId}/end`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await res.json();
      alert(data.message || data.error);

      await fetchLeases();
      await refreshData?.();
    } catch (err) {
      console.error("Error ending lease:", err);
      alert("Failed to end lease.");
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Leases</h2>

      {/* FORM */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Add New Lease
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Apartment */}
        <select
          name="apartment_id"
          value={form.apartment_id}
          onChange={handleChange}
          className="border rounded-lg p-2 w-full"
        >
          <option value="">Select Apartment</option>
          {apartments
            .filter((a) => !a.is_occupied)
            .map((a) => (
              <option key={a.apartment_id} value={a.apartment_id}>
                {a.address} — ${a.pricing}
              </option>
            ))}
        </select>

        {/* Users */}
        <select
          name="user_id"
          value={form.user_id}
          onChange={handleChange}
          className="border rounded-lg p-2 w-full"
        >
          <option value="">Select Tenant</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email}
            </option>
          ))}
        </select>

        {/* Dates */}
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          className="border rounded-lg p-2 w-full"
        />

        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          className="border rounded-lg p-2 w-full"
        />

        {/* Rent */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            $
          </span>
          <input
            type="number"
            name="rent_amount"
            placeholder="Rent amount"
            value={form.rent_amount}
            onChange={handleChange}
            className="border rounded-lg p-2 pl-7 w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Add Lease
        </button>
      </form>

      {/* ACTIVE LEASES */}
      <h2 className="pt-6 text-xl font-semibold mb-4 text-gray-800">
        Current Leases
      </h2>

      <LeaseTable
        leases={activeLeases}
        handleEndLease={handleEndLease}
        showEndButton={true}
      />

      {/* PAST LEASES */}
      <div className="pt-6">
        <button
          onClick={() => setShowPast(!showPast)}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
        >
          {showPast ? "Hide Past Leases" : "Show Past Leases"}
        </button>

        {showPast && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">
              Past Leases
            </h2>

            <LeaseTable
              leases={pastLeases}
              handleEndLease={handleEndLease}
              showEndButton={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------
// TABLE COMPONENT
// -----------------------------
function LeaseTable({ leases, handleEndLease, showEndButton }) {
  if (!leases.length)
    return <p className="text-gray-500 text-sm">No leases found.</p>;

  return (
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full text-sm">
        <thead className="border-b text-gray-600">
          <tr>
            <th className="py-2 pr-4 text-left">Apartment</th>
            <th className="py-2 pr-4 text-left">Tenant</th>
            <th className="py-2 pr-4 text-left">Rent</th>
            <th className="py-2 pr-4 text-left">Start</th>
            <th className="py-2 pr-4 text-left">End</th>
            <th className="py-2 pr-4 text-left">Status</th>
            {showEndButton && (
              <th className="py-2 pr-4 text-left">Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {leases.map((lease) => (
            <tr key={lease.lease_id} className="border-b hover:bg-gray-50">
              <td className="py-2 pr-4">
                {lease.Apartments?.address || "N/A"}
              </td>

              <td className="py-2 pr-4">
                {lease.Users?.email || "N/A"}
              </td>

              <td className="py-2 pr-4">${lease.rent_amount}</td>
              <td className="py-2 pr-4">{lease.start_date}</td>
              <td className="py-2 pr-4">{lease.end_date}</td>

              <td className="py-2 pr-4">
                {lease.status === 1 ? (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    Active
                  </span>
                ) : (
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                    Ended
                  </span>
                )}
              </td>

              {showEndButton && lease.status === 1 && (
                <td className="py-2 pr-4">
                  <button
                    onClick={() => handleEndLease(lease.lease_id)}
                    className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    End Lease
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

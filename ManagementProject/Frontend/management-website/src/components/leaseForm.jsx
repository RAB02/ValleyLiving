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

  const activeLeases = leases.filter((l) => l.status === "active");
  const pastLeases = leases.filter((l) => l.status === "past");

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

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("AUTH USER:", user?.id, user?.email);

    const { data: profile, error: profileError } = await supabase
      .from("Users")
      .select("id, email, role")
      .eq("id", user.id)
      .single();

    console.log("PROFILE:", profile, profileError);

    if (!profile || profile.role !== "admin") {
      setMessage("You are not authorized to create leases.");
      return;
    }

    const { error } = await supabase.from("Leases").insert([
      {
        apartment_id: form.apartment_id,
        user_id: form.user_id,
        start_date: form.start_date,
        end_date: form.end_date,
        rent_amount: Number(form.rent_amount),
        status: "active",
      },
    ]);

    if (error) throw error;

    await supabase
      .from("Apartments")
      .update({ is_occupied: 1 })
      .eq("apartment_id", form.apartment_id);

    setMessage("Lease created successfully!");

    fetchLeases();
    refreshData?.();

    setForm({
      apartment_id: "",
      user_id: "",
      start_date: "",
      end_date: "",
      rent_amount: "",
    });
    
  } catch (err) {
    console.error(err);
    setMessage(err.message);
  }
};
  // -----------------------------
  // END LEASE
  // -----------------------------
  const handleEndLease = async (lease) => {
    if (!confirm("Are you sure you want to end this lease?")) return;

    try {
      const { error: leaseError } = await supabase
        .from("Leases")
        .update({ status: "past" })
        .eq("lease_id", lease.lease_id);

      if (leaseError) throw leaseError;

      const { error: apartmentError } = await supabase
        .from("Apartments")
        .update({ is_occupied: 0 })
        .eq("apartment_id", lease.apartment_id);

      if (apartmentError) throw apartmentError;

      setMessage("Lease ended successfully!");

      await fetchLeases();
      await refreshData?.();
    } catch (err) {
      console.error("Error ending lease:", err);
      setMessage(err.message || "Failed to end lease.");
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
                {lease.status === "active" ? (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                    Active
                  </span>
                ) : (
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                    Ended
                  </span>
                )}
              </td>

              {showEndButton && lease.status === "active" && (
                <td className="py-2 pr-4">
                  <button
                    onClick={() => handleEndLease(lease)}
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

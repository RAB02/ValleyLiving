"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import StatCard from "@/components/StatCard";

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      // 1️⃣ get logged in user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // 2️⃣ check role
      const { data: profile } = await supabase
        .from("Users")
        .select("role, email")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/");
        return;
      }

      // 3️⃣ fetch stats
      const { count: apartmentCount } = await supabase
        .from("Apartments")
        .select("*", { count: "exact", head: true });

      const { count: userCount } = await supabase
        .from("Users")
        .select("*", { count: "exact", head: true });

      const { data: apartments } = await supabase
        .from("Apartments")
        .select("*")
        .order("apartment_id");

      const occupied = apartments?.filter(a => a.is_occupied).length || 0;
      const vacant = apartments?.filter(a => !a.is_occupied).length || 0;

      setData({
        apartmentCount,
        userCount,
        apartments,
        occupied,
        vacant,
        adminEmail: profile.email,
      });

      setLoading(false);
    };

    loadDashboard();
  }, [router]);

  if (loading) return <p className="p-4">Loading dashboard...</p>;

  if (!data) return <p className="p-4 text-gray-600">No data available</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage apartment and tenants
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Occupied Units" value={data.occupied} />
        <StatCard label="Vacant Units" value={data.vacant} />
        <StatCard label="Total Apartments" value={data.apartmentCount} />
        <StatCard label="Total Users" value={data.userCount} />
      </section>

      <div className="mt-10 text-gray-600 text-sm">
        Logged in as{" "}
        <span className="font-semibold text-gray-800">
          {data.adminEmail}
        </span>
      </div>

      <section className="mt-10 bg-white rounded-2xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Apartments</h2>

        {!data.apartments?.length ? (
          <p className="text-gray-500 text-sm">No apartments found.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600 border-b">
              <tr>
                <th>Complex</th>
                <th>Address</th>
                <th>Beds</th>
                <th>Baths</th>
                <th>Rent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.apartments.map((apt) => (
                <tr key={apt.apartment_id} className="border-b">
                  <td>{apt.apartment_name}</td>
                  <td>{apt.address}</td>
                  <td>{apt.bed}</td>
                  <td>{apt.bath}</td>
                  <td>${apt.pricing}</td>
                  <td>
                    {apt.is_occupied ? "Occupied" : "Vacant"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
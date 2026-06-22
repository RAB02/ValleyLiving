"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddLeaseForm from "@/components/leaseForm";
import { supabase } from "@/lib/supabaseClient";

export default function AddLease() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Fetch apartments + users for the form
  const fetchDashboardData = async () => {
    try {
      // 1️⃣ Get logged in user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // 2️⃣ Get user profile (role check)
      const { data: profile, error: profileError } = await supabase
        .from("Users")
        .select("role, email")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Failed to load profile");
      }

      if (profile.role !== "admin") {
        router.push("/");
        return;
      }

      // 3️⃣ Fetch stats
      const [{ count: apartmentCount }, { count: userCount }, { data: apartments }] =
        await Promise.all([
          supabase.from("Apartments").select("*", { count: "exact", head: true }),
          supabase.from("Users").select("*", { count: "exact", head: true }),
          supabase.from("Apartments").select("*"),
        ]);

      const occupied = apartments?.filter(a => a.is_occupied).length || 0;
      const vacant = apartments?.length - occupied || 0;

      // 4️⃣ Set state (same as your old API response)
      const dashboardData = {
        apartmentCount: apartmentCount || 0,
        userCount: userCount || 0,
        apartments: apartments || [],
        occupied,
        vacant,
        adminEmail: profile.email,
      };

      setData(dashboardData);

      console.log("Data:", dashboardData); // ✅ fixed logging
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Session expired or unauthorized");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-600 text-lg animate-pulse">
          Loading lease data...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-red-600">
        <p className="text-lg font-medium">{error}</p>
        <button
          onClick={() => router.push("/admin/login")}
          className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    );

  if (!data)
    return (
      <div className="p-6 text-center text-gray-500">
        No data available. Try refreshing the page.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Lease Managment
      </h1>
      <AddLeaseForm
        apartments={data.apartments || []}
        users={data.users || []}
        onLeaseAdded={fetchDashboardData}
        refreshData={fetchDashboardData}
      />
    </div>
  );
}

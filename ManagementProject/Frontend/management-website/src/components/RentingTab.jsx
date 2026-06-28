"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function RentingTab() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

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
            Apartments (
              apartment_name,
              address,
              bed,
              bath,
              pricing,
              ApartmentImages (
                image_url
              )
            )
          `)
          .eq("user_id", user.id)
          .eq("status", "active");

        if (error) throw error;

        console.log("USER RENTALS:", data);
        setItems(data || []);
      } catch (err) {
        console.error("Failed loading leases:", err);
        setError(err.message || "Could not load rentals");
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, [router]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Currently Renting</h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Currently Renting</h2>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Currently Renting</h2>
        <p className="text-sm text-gray-500">No active leases found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Currently Renting</h2>

      <ul className="space-y-3">
        {items.slice(0, 6).map((item) => {
          const apartment = item.Apartments;
          const image =
            apartment?.ApartmentImages?.[0]?.image_url ||
            "https://via.placeholder.com/64?text=No+Image";

          return (
            <li key={item.lease_id} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <img
                  src={image}
                  alt={apartment?.apartment_name || "Apartment"}
                  className="w-16 h-16 rounded object-cover border border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/64?text=No+Image";
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium truncate">
                  {apartment?.apartment_name ||
                    apartment?.address ||
                    "Apartment"}
                </p>

                <div className="text-xs text-gray-600 mt-1">
                  {apartment?.bed} bed • {apartment?.bath} bath • $
                  {item.rent_amount || apartment?.pricing}
                </div>
              </div>

              <Link
                href={`/tenants/payments/${item.lease_id}`}
                className="text-sm text-blue-600 hover:underline flex-shrink-0"
              >
                Pay Rent
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
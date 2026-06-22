"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/lib/supabaseClient";
import CheckoutForm from "@/components/Checkoutform";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function UserPaymentPage() {
  const { lease_id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    amount: "",
  });

  const [clientSecret, setClientSecret] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPaymentPage = async () => {
      try {
        setLoading(true);
        setError("");
        setClientSecret("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user) {
          router.push("/login");
          return;
        }

        setCurrentUser(user);

        const { data: lease, error: leaseError } = await supabase
          .from("Leases")
          .select(`
            lease_id,
            user_id,
            rent_amount,
            status,
            Users (
              name,
              email
            ),
            Apartments (
              address
            )
          `)
          .eq("lease_id", Number(lease_id))
          .eq("user_id", user.id)
          .single();

        if (leaseError) throw leaseError;

        if (!lease) {
          throw new Error("Lease not found.");
        }

        setForm({
          name: lease.Users?.name || "",
          email: lease.Users?.email || user.email || "",
          address: lease.Apartments?.address || "",
          amount: lease.rent_amount ? String(lease.rent_amount) : "",
        });

        const res = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lease_id: Number(lease_id),
            user_id: user.id,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create payment intent.");
        }

        if (!data.clientSecret) {
          throw new Error("No client secret returned from Stripe.");
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Payment page error:", err);
        setError(err.message || "Failed to load payment page.");
      } finally {
        setLoading(false);
      }
    };

    if (lease_id) {
      loadPaymentPage();
    }
  }, [lease_id, router]);

  const onPaid = async (stripePaymentIntentId) => {
    if (!currentUser) {
      throw new Error("User not found.");
    }

    const { data: lease, error: leaseError } = await supabase
      .from("Leases")
      .select("lease_id, user_id, rent_amount")
      .eq("lease_id", Number(lease_id))
      .eq("user_id", currentUser.id)
      .eq("status", "active")
      .single();

    if (leaseError) throw leaseError;

    const { error: paymentError } = await supabase.from("Payments").insert([
      {
        lease_id: Number(lease_id),
        amount: Number(lease.rent_amount),
        payment_date: new Date().toISOString().slice(0, 10),
        method: "Card",
        status: "Paid",
        stripe_payment_intent_id: stripePaymentIntentId,
      },
    ]);

    if (paymentError) throw paymentError;

    return { message: "Payment recorded successfully." };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
        <p className="text-sm text-gray-600">Loading payment page...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
        <div className="text-red-600 bg-red-50 border border-red-100 rounded-xl p-4">
          {error}
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
        <p className="text-sm text-gray-600">Preparing secure payment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-3xl">
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
            },
          }}
        >
          <CheckoutForm form={form} onPaid={onPaid} />
        </Elements>
      </div>
    </div>
  );
}
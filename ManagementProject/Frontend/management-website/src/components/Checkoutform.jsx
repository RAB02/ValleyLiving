"use client";

import { useState } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

export default function CheckoutForm({ form, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    // Validate Stripe inputs
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Check payment details.");
      setLoading(false);
      return;
    }

    // Confirm payment
    const { error: stripeError, paymentIntent } =
      await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

    if (stripeError) {
      setError(stripeError.message || "Payment failed.");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status !== "succeeded") {
      setError(`Payment status: ${paymentIntent?.status || "unknown"}`);
      setLoading(false);
      return;
    }

    try {
      await onPaid(paymentIntent.id);
      setSuccessMsg("✅ Payment successful! Your payment was recorded.");
    } catch (err) {
      setError(err.message || "Payment saved failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handlePay}
      className="w-full bg-white rounded-2xl shadow-md border border-gray-200 p-8 space-y-8"
    >
      <h1 className="text-2xl font-semibold text-gray-800">
        Make a Payment
      </h1>

      {/* Lease info */}
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
        <div>
          <label className="text-sm font-medium text-gray-600">
            Full Name: 
          </label>
          <input value={form.name} readOnly className="input-box bg-gray-50" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">
            Email: 
          </label>
          <input value={form.email} readOnly className="input-box bg-gray-50" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">
            Apartment: 
          </label>
          <input value={form.address} readOnly className="input-box bg-gray-50" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">
            Amount: 
          </label>
          <input value={form.amount} readOnly className="input-box bg-gray-50" />
        </div>
      </div>

      {/* Stripe UI */}
      <div className="rounded-xl border border-slate-200 p-4">
        <PaymentElement />
      </div>

      {successMsg && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || !!successMsg}
        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Processing..." : successMsg ? "Paid" : "Pay Now"}
      </button>
    </form>
  );
}
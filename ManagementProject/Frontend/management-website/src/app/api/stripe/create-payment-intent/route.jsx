import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { lease_id, user_id } = await req.json();

    if (!lease_id || !user_id) {
      return NextResponse.json(
        { error: "Missing lease_id or user_id" },
        { status: 400 }
      );
    }

    const { data: lease, error } = await supabaseAdmin
      .from("Leases")
      .select("lease_id, user_id, rent_amount")
      .eq("lease_id", lease_id)
      .eq("user_id", user_id)
      .eq("status", "active")
      .single();

    if (error || !lease) {
      return NextResponse.json(
        { error: "Lease not found" },
        { status: 404 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(lease.rent_amount) * 100),
      currency: "usd",
      metadata: {
        lease_id: String(lease.lease_id),
        user_id: String(user_id),
      },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: lease.rent_amount,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
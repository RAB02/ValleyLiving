"use client";

import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/components/UserContext";
import { supabase } from "@/lib/supabaseClient";

export default function LogIn() {
  const router = useRouter();
  const { setUser } = useContext(UserContext);

  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
  const checkSession = async () => {
    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData.session?.user) {
      await redirectByRole(sessionData.session.user);
    }
  };

  checkSession();
  }, []);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const redirectByRole = async (user) => {
    // 🔑 Get role from Users table
    const { data: profile, error } = await supabase
      .from("Users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      setError("Unable to load user profile.");
      return;
    }

    setUser(user);
    console.log("USER:", user);
    console.log("PROFILE:", profile);
    
    if (profile.role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/rentals");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.email || !data.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    await redirectByRole(authData.user);
    setLoading(false);
  };

  return (
    <div className="w-2/3 min-w-[600px] bg-white border-4 shadow-2xl shadow-inner p-6 rounded-2xl mt-6 md:w-3/4 md:max-w-[500px]">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="********"
            value={data.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 font-semibold text-white rounded-lg shadow transition ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
}
"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export const UserContext = createContext();

const IDLE_TIME = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 14 * 60 * 1000; // 14 minutes (show warning)

export function UserProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showWarning, setShowWarning] = useState(false);

  const logoutTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  const clearTimers = () => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  };

  const startTimers = () => {
    clearTimers();

    // ⏰ warning modal at 14 min
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, WARNING_TIME);

    // ⛔ force logout at 15 min
    logoutTimerRef.current = setTimeout(async () => {
      setShowWarning(false);
      await supabase.auth.signOut();
      alert("You were logged out due to inactivity");
      router.push("/login");
    }, IDLE_TIME);
  };

  const resetTimer = () => {
    if (!user) return;
    setShowWarning(false);
    startTimers();
  };

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    if (user) startTimers();

    return () => {
      events.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
      clearTimers();
    };
  }, [user]);

  useEffect(() => {
    // 1️⃣ Get initial session
    const getSession = async () => {
    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user ?? null;

    setUser(sessionUser);

    if (sessionUser) {
      const { data: roleData } = await supabase
        .from("Users")
        .select("role")
        .eq("id", sessionUser.id)
        .single();

      setAdmin(roleData?.role === "admin");
    } else {
      setAdmin(false);
    }

    setLoading(false);
  };

    getSession();

    // 2️⃣ Listen for login/logout/session expiry
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const sessionUser = session?.user ?? null;

        setUser(sessionUser);

        if (!sessionUser) {
          setAdmin(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("Users")
          .select("role")
          .eq("id", sessionUser.id)
          .single();

        if (error) {
          console.error("Role lookup error:", error);
          setAdmin(false);
          return;
        }

        setAdmin(profile?.role === "admin");
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <UserContext.Provider value={{ user, setUser, admin, setAdmin, loading }}>
      {children}

      {/* ⚠️ Idle Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2">
              Session Expiring
            </h2>
            <p className="text-gray-600 mb-4">
              You will be logged out in 1 minute due to inactivity.
            </p>
            <button
              onClick={resetTimer}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      )}
    </UserContext.Provider>
  );
}

// optional helper hook
export const useUser = () => useContext(UserContext);
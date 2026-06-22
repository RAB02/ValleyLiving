"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { UserProvider } from "@/components/UserContext";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className="background flex flex-col min-h-screen">
      <UserProvider>
        <Navbar />

        <main className={`flex-grow ${isHomePage ? "" : "pt-20"}`}>
          {children}
        </main>
      </UserProvider>

      <Footer />
    </div>
  );
}
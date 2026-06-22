
"use client";

import { useState, useEffect, useContext } from "react";
import { usePathname } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { UserContext } from "./UserContext";
import { supabase } from "@/lib/supabaseClient";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, setUser, admin, setAdmin } = useContext(UserContext);
  const isAdminLogin = pathname === "/admin/login";

  // ✅ Supabase session check
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user || null;

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
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user || null;

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
    });

    return () => subscription.unsubscribe();
  }, [setUser, setAdmin]);

  // ✅ Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // ✅ Supabase logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAdmin(false);
    window.location.href = "/";
  };

  const linkClass = `text-lg ${
    pathname === "/" && !isScrolled ? "text-white" : "text"
  }`;

  if (isAdminLogin) return <nav className="py-4"></nav>;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        pathname === "/"
          ? isScrolled
            ? "bg-white shadow-md"
            : "bg-transparent"
          : "accent"
      }`}
    >
      <ul className="list-none flex flex-row space-x-4 w-full justify-around text-center items-center py-4 font-medium">
        <>
          {/* --- Dropdown Menu (Admin/User/Guest) --- */}
          <li>
            {admin ? (
              <Menu as="div" className="relative inline-block text-center">
                <MenuButton className="some-color inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none">
                  Admin
                  <ChevronDownIcon className="-mr-1 h-5 w-5" />
                </MenuButton>
                <MenuItems className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg px-4 py-2 left-1/2 -translate-x-1/2">
                  <div className="py-1">
                    <MenuItem><a href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Dashboard</a></MenuItem>
                    <MenuItem><a href="/admin/lease" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Leases</a></MenuItem>
                    <MenuItem><a href="/admin/payments" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Payments</a></MenuItem>
                    <MenuItem><a href="/admin/add-lease" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Add Apartments</a></MenuItem>
                    <MenuItem><a href="/admin/applicants" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Applicants</a></MenuItem>
                    <MenuItem><a href="/admin/maintenance" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Maintenance Forms</a></MenuItem>
                    <MenuItem>
                      <a onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                        Log Out
                      </a>
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            ) : user ? (
              <Menu as="div" className="relative inline-block text-center">
                <MenuButton className="some-color inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none">
                  User
                  <ChevronDownIcon className="-mr-1 h-5 w-5" />
                </MenuButton>
                <MenuItems className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg px-4 py-2 left-1/2 -translate-x-1/2">
                  <div className="py-1">
                    <MenuItem><a href="/contact" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Contact</a></MenuItem>
                    <MenuItem><a href="/about" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">About</a></MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            ) : (
              <Menu as="div" className="relative inline-block text-center">
                <MenuButton className="some-color inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none">
                  Guest
                  <ChevronDownIcon className="-mr-1 h-5 w-5" />
                </MenuButton>
                <MenuItems className="absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg px-4 py-2 left-1/2 -translate-x-1/2">
                  <div className="py-1">
                    <MenuItem><a href="/signin" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Sign Up</a></MenuItem>
                    <MenuItem><a href="/contact" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Contact</a></MenuItem>
                    <MenuItem><a href="/about" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">About</a></MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            )}
          </li>

          {/* --- Nav Links --- */}
          {!admin && (
            <>
              <li><a href="/" className={linkClass}>Home</a></li>
              <li><a href="/rentals" className={linkClass}>For Rent</a></li>
            </>
          )}

          {/* --- Login/User Dropdown --- */}
          {!admin && (
            <li>
              {user ? (
                <Menu as="div" className="relative inline-block text-left">
                  <MenuButton className="some-color inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none">
                    {user?.user_metadata?.full_name ?? "account"}
                    <ChevronDownIcon className="-mr-1 h-5 w-5" />
                  </MenuButton>
                  <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 shadow-lg">
                    <div className="py-1">
                      <MenuItem><a href="/tenants/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Profile</a></MenuItem>
                      <MenuItem>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
                          Log Out
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              ) : (
                <a href="/login" className={linkClass}>Log In</a>
              )}
            </li>
          )}
        </>
      </ul>
    </nav>
  );
}
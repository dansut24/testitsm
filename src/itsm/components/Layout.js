import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../common/context/AuthContext";
import { getCentralLogoutUrl } from "../../common/utils/portalUrl";

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = useMemo(
    () => [
      { label: "Dashboard", path: "/itsm" },
      { label: "Tickets", path: "/itsm/tickets" },
      { label: "Assets", path: "/itsm/assets" },
      { label: "Users", path: "/itsm/users" },
      { label: "Settings", path: "/itsm/settings" },
    ],
    []
  );

  const handleLogout = () => {
    // IMPORTANT:
    // Always route through the portal's /logout route.
    // This avoids corrupting querystrings and eliminates multi-redirect loops.
    window.location.replace(`${getCentralLogoutUrl()}?t=${Date.now()}`);
  };

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b1220] text-slate-900 dark:text-slate-100">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#0b1220]/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
              onClick={() => setIsSidebarOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              ☰
            </button>

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400" />
              <div className="leading-tight">
                <div className="font-semibold">ITSM</div>
                <div className="text-xs opacity-70">Hi5Tech</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm opacity-80">
              {user?.email}
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-2 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block w-64 shrink-0 py-6 pr-6">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={[
                    "block rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive(item.path)
                      ? "bg-slate-100 dark:bg-slate-800"
                      : "hover:bg-slate-50 dark:hover:bg-slate-900/40",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Sidebar (mobile drawer) */}
          {isSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setIsSidebarOpen(false)}
              />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0b1220] border-r border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold">Menu</div>
                  <button
                    className="rounded-md border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    Close
                  </button>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={[
                        "block rounded-lg px-3 py-2 text-sm font-medium transition",
                        isActive(item.path)
                          ? "bg-slate-100 dark:bg-slate-800"
                          : "hover:bg-slate-50 dark:hover:bg-slate-900/40",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="mt-6">
                  <button
                    onClick={handleLogout}
                    className="w-full inline-flex items-center justify-center rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-2 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main */}
          <main className="flex-1 py-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-4 sm:p-6 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Hi5Tech ITSM
      </footer>
    </div>
  );
};

export default Layout;

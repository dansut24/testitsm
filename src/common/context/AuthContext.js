/// src/common/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tenant, setTenant] = useState(null);
  const [tenantError, setTenantError] = useState(null);
  const navigate = useNavigate();

  const getSubdomain = () => {
    const host = window.location.hostname;
    if (host.includes("localhost")) return "local";
    const parts = host.split(".");
    if (parts.length < 3) return null;
    return parts[0].replace("-itsm", "");
  };

  const isRootDomain = () => {
    const host = window.location.hostname;
    return host === "hi5tech.co.uk" || host === "www.hi5tech.co.uk";
  };

  useEffect(() => {
    const init = async () => {
      if (!isRootDomain()) {
        const subdomain = getSubdomain();
        console.log("[Subdomain]", subdomain);

        if (subdomain && subdomain !== "local") {
          const { data, error } = await supabase
            .from("tenants")
            .select("*")
            .eq("subdomain", subdomain)
            .maybeSingle();

          if (error || !data) {
            setTenant(null);
            setTenantError("🚫 Tenant not found for this subdomain.");
            setAuthLoading(false);
            return;
          }

          setTenant(data);
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("[Session]", session);

      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
        setAuthLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", supabaseUser.id)
      .maybeSingle();

    console.log("[Profile]", profile);

    // Auto-create profile if missing
    if (!profile && tenant?.id) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          tenant_id: tenant.id,
          role: "user",
          full_name: supabaseUser.email.split("@")[0],
        });

      if (insertError) {
        console.error("❌ Failed to insert default profile:", insertError.message);
        setUser(null);
        setAuthLoading(false);
        return;
      }

      // Try fetching again after insert
      return await fetchUserProfile(supabaseUser);
    }

    if (error || !profile) {
      console.warn("⚠️ No profile found, user will be limited.");
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: "user",
        roles: ["user"],
        full_name: supabaseUser.email,
        tenant_id: tenant?.id || null,
      });
    } else {
      const role = profile.role || "user";
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        role,
        roles: [role],
        full_name: profile.full_name,
        tenant_id: profile.tenant_id,
      });
    }

    setAuthLoading(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
  };

  if (!isRootDomain() && tenantError) {
    return (
      <div style={{ padding: 40 }}>
        <h2>{tenantError}</h2>
        <p>This subdomain is not linked to a tenant.</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, logout, tenant }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

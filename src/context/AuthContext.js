// src/context/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
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

  useEffect(() => {
    const init = async () => {
      const subdomain = getSubdomain();

      if (subdomain && subdomain !== "local") {
        const { data, error } = await supabase
          .from("tenants")
          .select("*")
          .eq("subdomain", subdomain)
          .single();

        if (error || !data) {
          setTenant(null);
          setTenantError("🚫 Tenant not found for this domain.");
          setAuthLoading(false);
          return;
        }

        // Fetch logo from tenant_settings
        const { data: settings, error: settingsError } = await supabase
          .from("tenant_settings")
          .select("logo_url")
          .eq("tenant_id", data.id)
          .single();

        if (settings?.logo_url) {
          setTenant({ ...data, settings });
        } else {
          setTenant(data);
        }
      } else {
        setTenant(null);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

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
      .single();

    if (error) {
      console.error("Failed to fetch user profile:", error.message);
      setUser(null);
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

  if (tenantError) {
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

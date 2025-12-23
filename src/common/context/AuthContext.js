import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../../common/utils/supabaseClient";
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
    return parts[0].replace("-itsm", "").replace("-control", "");
  };

  const isRootDomain = () => {
    const host = window.location.hostname;
    return host === "hi5tech.co.uk" || host === "www.hi5tech.co.uk";
  };

  // If you ever want to enforce tenant scoping, flip this to true.
  // For now (testing), leaving false avoids "logged in but blocked".
  const ENFORCE_TENANT_MATCH = false;

  const safeSetLoggedOut = () => {
    setUser(null);
    setAuthLoading(false);
  };

  const fetchUserProfile = async (supabaseUser, currentTenant) => {
    // Always start from a base user so you don't get bounced to login
    const baseUser = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      role: "user",
      roles: ["user"],
      full_name: null,
      tenant_id: null,
    };

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      // If profile fetch fails (common with RLS), DO NOT log out.
      if (error || !profile) {
        console.warn("Profile fetch failed; continuing with base user.", error?.message);
        setUser(baseUser);
        setAuthLoading(false);
        return;
      }

      const role = profile.role || "user";
      const resolvedUser = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role,
        roles: [role],
        full_name: profile.full_name,
        tenant_id: profile.tenant_id,
      };

      // Optional tenant enforcement (off by default for now)
      if (
        ENFORCE_TENANT_MATCH &&
        currentTenant?.id &&
        resolvedUser.tenant_id &&
        resolvedUser.tenant_id !== currentTenant.id
      ) {
        console.warn("Tenant mismatch; logging out for safety.", {
          currentTenant: currentTenant.id,
          userTenant: resolvedUser.tenant_id,
        });
        await supabase.auth.signOut();
        safeSetLoggedOut();
        return;
      }

      setUser(resolvedUser);
      setAuthLoading(false);
    } catch (e) {
      console.warn("Profile fetch exception; continuing with base user.", e);
      setUser(baseUser);
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setAuthLoading(true);
      setTenantError(null);

      // 1) Resolve tenant from subdomain (Control + ITSM both use this)
      let resolvedTenant = null;
      const subdomain = getSubdomain();

      if (!isRootDomain() && subdomain && subdomain !== "local") {
        const { data, error } = await supabase
          .from("tenants")
          .select("*")
          .eq("subdomain", subdomain)
          .maybeSingle();

        if (error || !data) {
          if (!isMounted) return;
          setTenant(null);
          setTenantError("🚫 Tenant not found for this subdomain.");
          setAuthLoading(false);
          return;
        }

        resolvedTenant = data;
        if (!isMounted) return;
        setTenant(data);
      } else {
        if (!isMounted) return;
        setTenant(null);
      }

      // 2) Resolve auth session user
      const {
        data: { user: supabaseUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (userError || !supabaseUser) {
        safeSetLoggedOut();
        return;
      }

      // Set base user immediately so ProtectedRoute doesn't bounce while profile loads
      setUser({ id: supabaseUser.id, email: supabaseUser.email, role: "user", roles: ["user"] });

      // 3) Load profile (role/tenant/name) but do not log out if it fails
      await fetchUserProfile(supabaseUser, resolvedTenant);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;

      if (!session?.user) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      // Keep UI responsive: base user first, then profile
      setAuthLoading(true);
      setUser({
        id: session.user.id,
        email: session.user.email,
        role: "user",
        roles: ["user"],
      });

      await fetchUserProfile(session.user, tenant);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthLoading(false);
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

  const value = useMemo(() => ({ user, authLoading, logout, tenant }), [user, authLoading, tenant]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useEffect, useState } from "react";
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

  // Turn on later if you want strict tenant enforcement
  const ENFORCE_TENANT_MATCH = false;

  const safeLogoutLocal = () => {
    setUser(null);
    setAuthLoading(false);
  };

  const fetchUserProfile = async (supabaseUser, resolvedTenant) => {
    // Base user so ProtectedRoute doesn't bounce while profile loads (or if it fails)
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

      // IMPORTANT: do NOT setUser(null) on profile failure
      if (error || !profile) {
        console.warn(
          "Profile fetch failed; continuing with base user.",
          error?.message
        );
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

      if (
        ENFORCE_TENANT_MATCH &&
        resolvedTenant?.id &&
        resolvedUser.tenant_id &&
        resolvedUser.tenant_id !== resolvedTenant.id
      ) {
        console.warn("Tenant mismatch; signing out.", {
          currentTenant: resolvedTenant.id,
          userTenant: resolvedUser.tenant_id,
        });
        await supabase.auth.signOut();
        safeLogoutLocal();
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
    let mounted = true;

    const init = async () => {
      setAuthLoading(true);
      setTenantError(null);

      // 1) Resolve tenant by subdomain
      let resolvedTenant = null;
      const subdomain = getSubdomain();

      if (!isRootDomain() && subdomain && subdomain !== "local") {
        const { data, error } = await supabase
          .from("tenants")
          .select("*")
          .eq("subdomain", subdomain)
          .maybeSingle();

        if (!mounted) return;

        if (error || !data) {
          setTenant(null);
          setTenantError("🚫 Tenant not found for this subdomain.");
          setAuthLoading(false);
          return;
        }

        resolvedTenant = data;
        setTenant(data);
      } else {
        if (!mounted) return;
        setTenant(null);
      }

      // 2) Resolve supabase user (session)
      const {
        data: { user: supabaseUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError || !supabaseUser) {
        safeLogoutLocal();
        return;
      }

      // Set base user immediately so routes can render while we fetch profile
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: "user",
        roles: ["user"],
      });

      // 3) Fetch profile (role/tenant)
      await fetchUserProfile(supabaseUser, resolvedTenant);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      // Base user first
      setAuthLoading(true);
      setUser({
        id: session.user.id,
        email: session.user.email,
        role: "user",
        roles: ["user"],
      });

      // Use latest tenant from state (fine for most cases)
      await fetchUserProfile(session.user, tenant);
    });

    return () => {
      mounted = false;
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

  // Tenant error gate (no hooks below this line)
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

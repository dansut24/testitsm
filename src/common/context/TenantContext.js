// src/common/context/TenantContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient"; // ✅ match AuthContext location

const TenantContext = createContext();

export const useTenant = () => useContext(TenantContext);

const isRootDomain = () => {
  const host = window.location.hostname;
  return host === "hi5tech.co.uk" || host === "www.hi5tech.co.uk";
};

// Extract tenant slug from host like:
// demoitsm-control.hi5tech.co.uk -> demoitsm
// demoitsm-itsm.hi5tech.co.uk    -> demoitsm
// demoitsm-self.hi5tech.co.uk   -> demoitsm
const getTenantSlugFromHost = () => {
  const host = window.location.hostname || "";
  if (host.includes("localhost")) return "local";

  const first = host.split(".")[0] || ""; // "demoitsm-control"
  // strip known suffixes
  const slug = first
    .replace("-control", "")
    .replace("-itsm", "")
    .replace("-self", "");

  return slug || null;
};

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [tenantSettings, setTenantSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadTenant = async () => {
      try {
        if (isRootDomain()) {
          if (!mounted) return;
          setLoading(false);
          return;
        }

        setLoading(true);

        const subdomain = getTenantSlugFromHost();

        if (!subdomain || subdomain === "local") {
          console.warn("[Tenant] No tenant subdomain found from host:", window.location.hostname);
          if (!mounted) return;
          setLoading(false);
          return;
        }

        // ✅ Load tenant record
        const { data: tenantData, error: tenantError } = await supabase
          .from("tenants")
          .select("*")
          .eq("subdomain", subdomain)
          .maybeSingle();

        if (!mounted) return;

        if (tenantError || !tenantData) {
          console.error("[Tenant] Failed to load tenant", {
            host: window.location.hostname,
            subdomain,
            tenantError: tenantError?.message || tenantError || "no error object",
          });
          setTenant(null);
          setTenantSettings(null);
          setLoading(false);
          return;
        }

        setTenant(tenantData);

        // ✅ Load tenant settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("tenant_settings")
          .select("*")
          .eq("tenant_id", tenantData.id)
          .maybeSingle();

        if (!mounted) return;

        if (settingsError || !settingsData) {
          if (window.location.pathname !== "/tenant-setup") {
            console.warn("[Tenant] No settings found for tenant", {
              tenant_id: tenantData.id,
              settingsError: settingsError?.message || settingsError || "no error object",
            });
          }
          setTenantSettings(null);
          setLoading(false);
          return;
        }

        // ✅ Normalize logo_url
        const logoUrl = settingsData.logo_url;
        if (logoUrl && !logoUrl.startsWith("http")) {
          const { data: publicData } = supabase.storage
            .from("tenant-logos")
            .getPublicUrl(logoUrl);
          settingsData.logo_url = publicData?.publicUrl || "";
        }

        setTenantSettings(settingsData);
        setLoading(false);
      } catch (e) {
        console.error("[Tenant] Exception while loading tenant:", e);
        if (!mounted) return;
        setTenant(null);
        setTenantSettings(null);
        setLoading(false);
      }
    };

    loadTenant();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <TenantContext.Provider
      value={{
        tenant,
        tenantId: tenant?.id || null,
        tenantSettings,
        loading,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

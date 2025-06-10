// TenantContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const TenantContext = createContext();

export const useTenant = () => useContext(TenantContext);

const getSubdomain = () => {
  const host = window.location.hostname;
  const parts = host.split(".");
  if (parts.length >= 3) return parts[0];
  return null;
};

const isRootDomain = () => {
  const host = window.location.hostname;
  return host === "hi5tech.co.uk" || host === "www.hi5tech.co.uk";
};

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [tenantSettings, setTenantSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTenant = async () => {
      if (isRootDomain()) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const rawSubdomain = getSubdomain();
      const subdomain = rawSubdomain?.replace("-itsm", "");

      if (!subdomain) {
        console.warn("No subdomain found.");
        setLoading(false);
        return;
      }

      const { data: tenantData, error: tenantError } = await supabase
        .from("tenants")
        .select("*")
        .eq("subdomain", subdomain)
        .maybeSingle();

      if (tenantError || !tenantData) {
        console.error("❌ Failed to load tenant:", tenantError?.message);
        setLoading(false);
        return;
      }

      setTenant(tenantData);

      const { data: settingsData, error: settingsError } = await supabase
        .from("tenant_settings")
        .select("*")
        .eq("tenant_id", tenantData.id)
        .maybeSingle();

      if (settingsError || !settingsData) {
        if (window.location.pathname !== "/tenant-setup") {
          console.warn("⚠️ No settings found for tenant");
        }
      } else {
        // Handle both full URLs and relative paths
        const logoUrl = settingsData.logo_url;
        if (logoUrl?.startsWith("http")) {
          settingsData.logo_url = logoUrl;
        } else {
          const { data: publicData } = supabase.storage
            .from("tenant-logos")
            .getPublicUrl(logoUrl);
          settingsData.logo_url = publicData?.publicUrl || "";
        }
        setTenantSettings(settingsData);
      }

      setLoading(false);
    };

    loadTenant();
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

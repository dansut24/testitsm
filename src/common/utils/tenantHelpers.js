// src/common/utils/tenantHelpers.js
import { supabase } from "../supabaseClient";

export const checkSubdomainAvailability = async (subdomain) => {
  const { data, error } = await supabase
    .from("tenants")
    .select("id")
    .eq("subdomain", subdomain)
    .maybeSingle();

  if (error) throw error;
  return !data; // if no tenant returned, it's available
};

export const uploadTenantLogo = async (subdomain, file) => {
  const filePath = `${subdomain}-itsm/logo.png`;
  const { error } = await supabase.storage
    .from("tenant-logos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw new Error("Logo upload failed.");
  return filePath;
};

export const createTenantWithSetup = async ({ company_name, subdomain, created_by }) => {
  // Insert tenant
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert([{ company_name, subdomain, created_by }])
    .select()
    .single();
  if (tenantError) throw tenantError;

  const tenant_id = tenant.id;

  // Insert settings (default)
  const { error: settingsError } = await supabase
    .from("tenant_settings")
    .insert([{ tenant_id, logo_url: `${subdomain}-itsm/logo.png` }]);
  if (settingsError) throw settingsError;

  // Insert default teams
  const { error: teamError } = await supabase
    .from("teams")
    .insert([
      { tenant_id, name: "Service Desk" },
      { tenant_id, name: "Desktop Support" },
      { tenant_id, name: "Server Support" },
    ]);
  if (teamError) throw teamError;

  return tenant;
};

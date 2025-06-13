import supabase from "../../common/utils/supabaseClient";

// Upload tenant logo (e.g., for "acme" -> acme/logo.png)
export const uploadTenantLogo = async (subdomain, file) => {
  if (!file || !subdomain) return { error: new Error("Missing file or subdomain") };

  const path = `${subdomain}/logo.png`;

  const { error } = await supabase.storage
    .from("tenant-logos")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });

  return { error };
};

// Get public URL for a tenant logo
export const getTenantLogoUrl = (subdomain) => {
  const path = `${subdomain}/logo.png`;

  const { data } = supabase.storage
    .from("tenant-logos")
    .getPublicUrl(path);

  return data?.publicUrl || null;
};

// Remove tenant logo (optional helper)
export const deleteTenantLogo = async (subdomain) => {
  const path = `${subdomain}/logo.png`;
  const { error } = await supabase.storage
    .from("tenant-logos")
    .remove([path]);
  return { error };
};

// src/common/utils/moduleAccess.js
import { supabase } from "./supabaseClient";

function normalizeModule(m) {
  const s = String(m || "").toLowerCase().trim();
  if (!s) return null;
  // keep your stored values; also allow "selfservice" mapping
  if (s === "selfservice") return "self";
  return s;
}

export async function getUserModuleAccess({ userId, tenantId }) {
  if (!userId || !tenantId) {
    return { modules: [], role: null, profile: null };
  }

  // 1) Profile -> role
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, role, tenant_id, full_name, email")
    .eq("id", userId)
    .maybeSingle();

  if (pErr) throw pErr;

  const role = profile?.role || null;

  // 2) Role-based allows
  let roleAllowed = [];
  if (role) {
    const { data: rData, error: rErr } = await supabase
      .from("role_module_access")
      .select("module, allowed")
      .eq("tenant_id", tenantId)
      .eq("role", role);

    if (rErr) throw rErr;

    roleAllowed = (rData || [])
      .filter((x) => x.allowed === true)
      .map((x) => normalizeModule(x.module))
      .filter(Boolean);
  }

  // 3) User overrides (allow/deny)
  const { data: uData, error: uErr } = await supabase
    .from("user_module_access")
    .select("module, effect")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId);

  if (uErr) throw uErr;

  const set = new Set(roleAllowed);

  for (const row of uData || []) {
    const mod = normalizeModule(row.module);
    const eff = String(row.effect || "").toLowerCase().trim();

    if (!mod) continue;

    if (eff === "deny" || eff === "block") set.delete(mod);
    if (eff === "allow" || eff === "grant") set.add(mod);
  }

  return {
    modules: Array.from(set),
    role,
    profile: profile || null,
  };
}

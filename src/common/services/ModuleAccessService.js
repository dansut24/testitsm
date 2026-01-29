// src/common/services/ModuleAccessService.js
import { supabase } from "../utils/supabaseClient";

function normalizeModule(m) {
  const s = String(m || "").toLowerCase().trim();
  if (s === "self" || s === "selfservice") return "self_service";
  return s;
}

function applyOverride(set, row) {
  const module = normalizeModule(row.module);
  if (!module) return;

  // Support both schemas:
  // - effect: 'allow' | 'deny'
  // - allowed: boolean
  const effect = row.effect ? String(row.effect).toLowerCase() : null;

  if (typeof row.allowed === "boolean") {
    if (row.allowed) set.add(module);
    else set.delete(module);
    return;
  }

  if (effect === "allow") set.add(module);
  else if (effect === "deny") set.delete(module);
}

export async function getAccessibleModules({ tenantId, userId, role }) {
  if (!tenantId || !userId) return [];

  // 1) Determine role (prefer provided role to avoid extra DB call)
  let resolvedRole = role;

  if (!resolvedRole) {
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profErr) throw profErr;
    resolvedRole = profile?.role || "user";
  }

  // 2) role based modules
  const { data: roleRows, error: roleErr } = await supabase
    .from("role_module_access")
    .select("module, allowed")
    .eq("tenant_id", tenantId)
    .eq("role", resolvedRole)
    .eq("allowed", true);

  if (roleErr) throw roleErr;

  const allowed = new Set((roleRows || []).map((r) => normalizeModule(r.module)));

  // 3) user overrides (schema-flexible: select * so we don't reference missing columns)
  const { data: userRows, error: userErr } = await supabase
    .from("user_module_access")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("user_id", userId);

  // If table blocked by RLS or doesn't exist etc, treat as none (don’t break login)
  if (!userErr && Array.isArray(userRows)) {
    for (const row of userRows) applyOverride(allowed, row);
  }

  const out = Array.from(allowed).filter(Boolean);

  // Optional: order
  const order = { itsm: 1, control: 2, self_service: 3 };
  out.sort((a, b) => (order[a] || 99) - (order[b] || 99));

  return out;
}

// src/portal/App.js
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  Avatar,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import CentralLogin from "../common/pages/CentralLogin";
import { supabase } from "../common/utils/supabaseClient";

// -------------------------
// Host + URL helpers
// -------------------------

function getTenantBaseHost(search) {
  const host = window.location.hostname || "";
  const firstLabel = host.split(".")[0] || "";

  const qpTenant = new URLSearchParams(search || "").get("tenant");
  if (qpTenant) return String(qpTenant).toLowerCase().trim();

  // Robust: if user accidentally hits demoitsm-itsm.hi5tech... treat tenant as demoitsm
  return (firstLabel.split("-")[0] || "").toLowerCase().trim();
}

function getParentDomain() {
  const host = window.location.hostname || "";
  return host.split(".").slice(1).join(".");
}

function buildModuleUrl(tenantBase, moduleKey) {
  const parent = getParentDomain();

  const sub =
    moduleKey === "itsm"
      ? `${tenantBase}-itsm`
      : moduleKey === "control"
      ? `${tenantBase}-control`
      : `${tenantBase}-self`;

  return `https://${sub}.${parent}`;
}

async function loadTenantByBaseHost(tenantBase) {
  const { data, error } = await supabase
    .from("tenants")
    .select("id, subdomain, name")
    .eq("subdomain", tenantBase)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

function normalizeModuleValue(v) {
  const raw = String(v || "").toLowerCase().trim();
  if (!raw) return null;

  const m = raw.replaceAll("-", "_").replaceAll(" ", "_");

  // Ignore admin as a "module card"
  if (m === "admin") return null;

  if (m === "itsm" || m.includes("itsm")) return "itsm";
  if (m === "control" || m.includes("control")) return "control";
  if (m === "self" || m === "self_service" || m.includes("self")) return "self";

  return null;
}

// -------------------------
// Access loading
// -------------------------

async function loadProfileRole(userId, tenantId) {
  // tenant-scoped profile row (preferred)
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error) throw error;
    if (data?.role) return data.role;
  } catch {
    // fallback below
  }

  // global fallback
  const { data: fallback, error: fallbackErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (fallbackErr) throw fallbackErr;
  return fallback?.role || null;
}

async function loadRoleModules(role, tenantId) {
  if (!role) return [];

  const { data, error } = await supabase
    .from("role_module_access")
    .select("module, allowed")
    .eq("tenant_id", tenantId)
    .eq("role", role);

  if (error) throw error;

  const rows = Array.isArray(data) ? data : [];
  const allow = new Set();

  for (const r of rows) {
    if (!r?.allowed) continue;
    const mod = normalizeModuleValue(r.module);
    if (mod) allow.add(mod);
  }

  return Array.from(allow);
}

async function loadUserOverrides(userId, tenantId) {
  const tries = [
    { cols: "module, effect", mode: "effect" },
    { cols: "module, action", mode: "effect" },
    { cols: "module, access", mode: "effect" },
    { cols: "module, allowed", mode: "allowedBool" },
  ];

  let rows = [];
  let mode = null;

  for (const t of tries) {
    const res = await supabase
      .from("user_module_access")
      .select(t.cols)
      .eq("tenant_id", tenantId)
      .eq("user_id", userId);

    if (!res?.error) {
      rows = Array.isArray(res.data) ? res.data : [];
      mode = t.mode;
      break;
    }

    const msg = String(res.error?.message || "").toLowerCase();
    if (
      msg.includes("does not exist") ||
      msg.includes("column") ||
      msg.includes("parse")
    ) {
      continue;
    }
    throw res.error;
  }

  const allow = new Set();
  const deny = new Set();

  for (const r of rows) {
    const mod = normalizeModuleValue(r.module);
    if (!mod) continue;

    if (mode === "allowedBool") {
      if (r.allowed === true) allow.add(mod);
      if (r.allowed === false) deny.add(mod);
      continue;
    }

    const effRaw = r.effect ?? r.action ?? r.access ?? "";
    const eff = String(effRaw || "").toLowerCase().trim();

    if (eff === "deny" || eff === "block" || eff === "remove") deny.add(mod);
    if (eff === "allow" || eff === "grant" || eff === "add") allow.add(mod);
  }

  return { allow: Array.from(allow), deny: Array.from(deny) };
}

// -------------------------
// Tiny utils
// -------------------------

function withTimeout(promise, ms, label = "Operation") {
  let t;
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error(`${label} timed out (${ms}ms)`)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

// -------------------------
// UI helpers
// -------------------------

function GlassPanel({ children, sx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,0.10)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 18px 55px rgba(0,0,0,0.35)",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function ModuleCard({ title, subtitle, chips = [], icon, onOpen, href }) {
  return (
    <GlassPanel sx={{ p: 2.2, height: "100%" }}>
      <Stack direction="row" spacing={1.6} alignItems="center">
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            background: "rgba(124,92,255,0.18)",
            border: "1px solid rgba(255,255,255,0.12)",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 950, fontSize: 18 }} noWrap>
            {title}
          </Typography>
          <Typography sx={{ opacity: 0.7, fontSize: 13 }} noWrap>
            {subtitle}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 1.6, flexWrap: "wrap" }}>
        {chips.map((c) => (
          <Chip
            key={c}
            label={c}
            sx={{
              height: 30,
              borderRadius: 999,
              fontWeight: 900,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.90)",
            }}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 1.8, borderColor: "rgba(255,255,255,0.10)" }} />

      <Stack
        direction="row"
        spacing={1}
        justifyContent="space-between"
        alignItems="center"
      >
        <Button
          variant="contained"
          onClick={onOpen}
          endIcon={<KeyboardArrowRightIcon />}
          sx={{
            borderRadius: 999,
            fontWeight: 950,
            textTransform: "none",
            px: 2,
          }}
        >
          Open
        </Button>

        <Button
          variant="outlined"
          onClick={() => window.open(href, "_blank", "noopener,noreferrer")}
          startIcon={<OpenInNewIcon />}
          sx={{
            borderRadius: 999,
            fontWeight: 950,
            textTransform: "none",
            borderColor: "rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.88)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          New tab
        </Button>
      </Stack>
    </GlassPanel>
  );
}

// -------------------------
// Portal pages
// -------------------------

function PortalHome() {
  const navigate = useNavigate();
  const location = useLocation();

  const tenantBase = useMemo(
    () => getTenantBaseHost(location.search),
    [location.search]
  );

  const cacheKey = useMemo(
    () => `hi5tech_portal_cache:${tenantBase || "unknown"}`,
    [tenantBase]
  );

  const cached = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // expire after 30 mins
      if (parsed?.ts && Date.now() - parsed.ts > 30 * 60 * 1000) return null;
      return parsed;
    } catch {
      return null;
    }
  }, [cacheKey]);

  // IMPORTANT: Never allow "Loading..." to hang forever.
  // If we have cached content, render immediately and refresh in background.
  const [busy, setBusy] = useState(!cached);
  const [refreshing, setRefreshing] = useState(!!cached);

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  const [tenant, setTenant] = useState(cached?.tenant || null);
  const [modules, setModules] = useState(cached?.modules || []);
  const [query, setQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const runSeq = useRef(0);

  const writeCache = useCallback(
    (t, mods) => {
      try {
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({
            ts: Date.now(),
            tenant: t || null,
            modules: Array.isArray(mods) ? mods : [],
          })
        );
      } catch {
        // ignore
      }
    },
    [cacheKey]
  );

  const run = useCallback(
    async ({ soft = false } = {}) => {
      const seq = ++runSeq.current;

      // soft=true means: do not blank the UI; just refresh in background
      if (soft) {
        setRefreshing(true);
      } else {
        setBusy(true);
      }

      setErrorMsg("");

      try {
        // ⛔ Do NOT refreshSession() here — it can hang on iOS/Safari + cookie storage.
        // If getSession stalls, timeout and show retry.
        const sessRes = await withTimeout(
          supabase.auth.getSession(),
          8000,
          "Get session"
        );

        const sess = sessRes?.data?.session || null;
        const u = sess?.user || null;

        if (seq !== runSeq.current) return;

        setSession(sess);
        setUser(u);

        if (!u) {
          setTenant(null);
          setModules([]);
          writeCache(null, []);
          return;
        }

        // Tenant lookup
        const t = await withTimeout(
          loadTenantByBaseHost(tenantBase),
          8000,
          "Load tenant"
        );

        if (seq !== runSeq.current) return;

        setTenant(t);

        if (!t?.id) {
          setModules([]);
          writeCache(t, []);
          return;
        }

        // Access calc
        const role = await withTimeout(
          loadProfileRole(u.id, t.id),
          8000,
          "Load role"
        );

        const roleAllowed = await withTimeout(
          loadRoleModules(role, t.id),
          8000,
          "Load role modules"
        );

        let userAllow = [];
        let userDeny = [];
        try {
          const o = await withTimeout(
            loadUserOverrides(u.id, t.id),
            8000,
            "Load user overrides"
          );
          userAllow = o.allow || [];
          userDeny = o.deny || [];
        } catch {
          // overrides optional
        }

        const set = new Set(roleAllowed);
        userAllow.forEach((m) => set.add(m));
        userDeny.forEach((m) => set.delete(m));

        if (seq !== runSeq.current) return;

        const finalMods = Array.from(set);
        setModules(finalMods);
        writeCache(t, finalMods);
      } catch (e) {
        if (seq !== runSeq.current) return;

        const msg = String(e?.message || e || "Unknown error");
        console.error("[Portal] run error:", msg);

        // If we have cached tenant/modules, keep showing them and just show a banner.
        if (cached?.tenant || (cached?.modules && cached.modules.length)) {
          setErrorMsg("We couldn’t refresh portal data. Showing cached view.");
        } else {
          setErrorMsg("We couldn’t load portal data. Please retry.");
          setTenant(null);
          setModules([]);
        }
      } finally {
        if (seq === runSeq.current) {
          setBusy(false);
          setRefreshing(false);
        }
      }
    },
    [tenantBase, writeCache, cached]
  );

  // Run on mount + tenantBase change
  useEffect(() => {
    run({ soft: !!cached });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  // Auth state changes: re-run (soft if we already have something on screen)
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      run({ soft: !!cached });
    });

    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, [run, cached]);

  // Back-button / BFCache / tab restore:
  // DO NOT call refreshSession; just re-run a soft load.
  useEffect(() => {
    const onPageShow = () => run({ soft: true });
    const onVisibility = () => {
      if (document.visibilityState === "visible") run({ soft: true });
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [run]);

  const displayName = useMemo(() => {
    const name =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")?.[0] ||
      "User";
    return String(name || "User");
  }, [user]);

  const initials = useMemo(() => {
    const s = String(displayName || "U").trim();
    return (s[0] || "U").toUpperCase();
  }, [displayName]);

  // Hard loading screen ONLY when we have nothing to render.
  if (busy && !tenant && !modules.length) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Stack spacing={1} alignItems="center">
          <Typography sx={{ fontWeight: 950, opacity: 0.85 }}>Loading…</Typography>
          {!!errorMsg && (
            <Typography sx={{ opacity: 0.7, fontSize: 13, maxWidth: 320, textAlign: "center" }}>
              {errorMsg}
            </Typography>
          )}
        </Stack>
      </Box>
    );
  }

  if (!user || !session) return <Navigate to="/login" replace />;

  // Auto-route ONLY if exactly one module remains after proper access evaluation
  if (modules.length === 1 && tenantBase) {
    window.location.assign(buildModuleUrl(tenantBase, modules[0]));
    return null;
  }

  const catalog = [
    {
      key: "itsm",
      title: "ITSM",
      subtitle: "Incidents, Requests, Changes, KB",
      icon: <ListAltIcon sx={{ opacity: 0.92 }} />,
      chips: ["Tickets", "Knowledge", "Approvals"],
      href: buildModuleUrl(tenantBase, "itsm"),
    },
    {
      key: "control",
      title: "Control",
      subtitle: "Devices, remote actions, reporting",
      icon: <DashboardIcon sx={{ opacity: 0.92 }} />,
      chips: ["Devices", "Remote", "Patch"],
      href: buildModuleUrl(tenantBase, "control"),
    },
    {
      key: "self",
      title: "Self Service",
      subtitle: "End-user portal & service catalog",
      icon: <SupportAgentIcon sx={{ opacity: 0.92 }} />,
      chips: ["Catalog", "Raise ticket", "Status"],
      href: buildModuleUrl(tenantBase, "self"),
    },
  ];

  const allowedSet = new Set(modules);
  const q = query.trim().toLowerCase();

  const visible = catalog
    .filter((m) => allowedSet.has(m.key))
    .filter((m) => {
      if (!q) return true;
      return (
        m.title.toLowerCase().includes(q) ||
        m.subtitle.toLowerCase().includes(q) ||
        m.chips.some((c) => c.toLowerCase().includes(q))
      );
    });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        color: "rgba(255,255,255,0.92)",
        background: `
          radial-gradient(1200px 800px at 20% 10%, rgba(124, 92, 255, 0.28), transparent 60%),
          radial-gradient(1000px 700px at 85% 25%, rgba(56, 189, 248, 0.18), transparent 55%),
          radial-gradient(900px 700px at 60% 90%, rgba(34, 197, 94, 0.10), transparent 55%),
          linear-gradient(180deg, #070A12 0%, #0A1022 45%, #0B1633 100%)
        `,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <GlassPanel sx={{ p: 2.2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  fontWeight: 950,
                  background:
                    "linear-gradient(135deg, rgba(0,176,255,0.95), rgba(140,90,255,0.95))",
                }}
              >
                {initials}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 950, fontSize: 20 }} noWrap>
                    Choose a module
                  </Typography>

                  {refreshing ? (
                    <Chip
                      label="Refreshing…"
                      size="small"
                      sx={{
                        height: 24,
                        borderRadius: 999,
                        fontWeight: 900,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        color: "rgba(255,255,255,0.85)",
                      }}
                    />
                  ) : null}
                </Stack>

                <Typography sx={{ opacity: 0.72, fontSize: 13 }} noWrap>
                  {tenant?.name ? tenant.name : tenantBase} • {user.email}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems="center"
            >
              <TextField
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search modules…"
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 320 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    backdropFilter: "blur(10px)",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ opacity: 0.75 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                variant="outlined"
                onClick={() => run({ soft: false })}
                sx={{
                  borderRadius: 999,
                  fontWeight: 950,
                  textTransform: "none",
                  borderColor: "rgba(255,255,255,0.18)",
                  color: "rgba(255,255,255,0.88)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                Refresh
              </Button>

              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={() => navigate("/logout")}
                sx={{
                  borderRadius: 999,
                  fontWeight: 950,
                  textTransform: "none",
                  borderColor: "rgba(255,255,255,0.18)",
                  color: "rgba(255,255,255,0.88)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                Sign out
              </Button>
            </Stack>
          </Stack>
        </GlassPanel>

        {!!errorMsg ? (
          <GlassPanel sx={{ mt: 2.2, p: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Typography sx={{ fontWeight: 900, opacity: 0.85 }}>
                {errorMsg}
              </Typography>

              <Button
                variant="contained"
                onClick={() => run({ soft: false })}
                sx={{ borderRadius: 999, fontWeight: 950, textTransform: "none" }}
              >
                Retry
              </Button>
            </Stack>
          </GlassPanel>
        ) : null}

        <Box
          sx={{
            mt: 2.2,
            display: "grid",
            gap: 16,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          {visible.map((m) => (
            <ModuleCard
              key={m.key}
              title={m.title}
              subtitle={m.subtitle}
              chips={m.chips}
              icon={m.icon}
              href={m.href}
              onOpen={() => window.location.assign(m.href)}
            />
          ))}
        </Box>

        {!visible.length ? (
          <GlassPanel sx={{ mt: 2.2, p: 3 }}>
            <Typography sx={{ fontWeight: 950, fontSize: 18 }}>
              No modules available
            </Typography>
            <Typography sx={{ opacity: 0.72, mt: 0.6 }}>
              Your account doesn’t have access to any modules for this tenant yet.
              Contact an administrator to grant ITSM / Control / Self Service.
            </Typography>
          </GlassPanel>
        ) : null}

        <Box sx={{ height: 16 }} />
      </Container>
    </Box>
  );
}

function PortalLogout() {
  useEffect(() => {
    (async () => {
      try {
        await supabase.auth.signOut();
      } finally {
        const qpTenant = new URLSearchParams(window.location.search).get("tenant");
        window.location.assign(
          qpTenant ? `/login?tenant=${encodeURIComponent(qpTenant)}` : "/login"
        );
      }
    })();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Typography sx={{ fontWeight: 950, opacity: 0.8 }}>Signing out…</Typography>
    </Box>
  );
}

export default function PortalApp() {
  const qpTenant = new URLSearchParams(window.location.search).get("tenant");
  const withTenant = (path) =>
    qpTenant ? `${path}?tenant=${encodeURIComponent(qpTenant)}` : path;

  return (
    <Routes>
      <Route
        path="/login"
        element={<CentralLogin title="Sign in" afterLogin={withTenant("/app")} />}
      />
      <Route path="/app" element={<PortalHome />} />
      <Route path="/logout" element={<PortalLogout />} />
      <Route path="/" element={<Navigate to={withTenant("/app")} replace />} />
      <Route path="*" element={<Navigate to={withTenant("/app")} replace />} />
    </Routes>
  );
}

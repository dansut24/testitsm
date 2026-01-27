// src/common/components/ExternalRedirect.js
import { useEffect } from "react";

/**
 * Hard redirect to an external URL (or same-domain absolute URL).
 * This avoids React Router treating absolute URLs like relative paths.
 */
export default function ExternalRedirect({ to, replace = true }) {
  useEffect(() => {
    if (!to) return;
    if (replace) window.location.replace(to);
    else window.location.assign(to);
  }, [to, replace]);

  return null;
}

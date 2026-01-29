// src/common/components/ExternalRedirect.js
import { useEffect } from "react";

export default function ExternalRedirect({ to }) {
  useEffect(() => {
    if (!to) return;

    // Hard redirect (prevents router loops / history spam)
    window.location.replace(to);
  }, [to]);

  return null;
}

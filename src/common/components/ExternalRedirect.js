// src/common/components/ExternalRedirect.js
import { useEffect } from "react";

export default function ExternalRedirect({ to }) {
  useEffect(() => {
    if (to) window.location.replace(to);
  }, [to]);

  return null;
}

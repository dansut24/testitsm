// src/common/components/ExternalRedirect.js
import React, { useEffect, useRef } from "react";

export default function ExternalRedirect({ to }) {
  const did = useRef(false);

  useEffect(() => {
    if (did.current) return;
    did.current = true;

    // replace avoids back-button loops
    window.location.replace(to);
  }, [to]);

  return null;
}

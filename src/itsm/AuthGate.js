import { useEffect, useState } from "react";
import { supabase } from "../common/utils/supabaseClient";
import ExternalRedirect from "../common/components/ExternalRedirect";
import { getCentralLoginUrl } from "../common/utils/portalUrl";

export default function AuthGate({ children }) {
  const [state, setState] = useState({
    loading: true,
    session: null,
  });

  useEffect(() => {
    let mounted = true;

    // Initial resolve
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({ loading: false, session: data.session });
    });

    // Single listener
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setState({ loading: false, session });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (state.loading) {
    return (
      <div style={{ padding: 24, fontWeight: 600 }}>
        Loading session…
      </div>
    );
  }

  if (!state.session) {
    return <ExternalRedirect to={getCentralLoginUrl("/itsm")} />;
  }

  return children;
}

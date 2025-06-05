import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // must exist
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Assume roles are stored in metadata or use fallback
        const role = session.user.user_metadata?.role || "user";

        setUser({
          id: session.user.id,
          email: session.user.email,
          role,
          roles: [role], // keep consistent with includes("admin") logic
        });
      } else {
        setUser(null);
      }

      setAuthLoading(false);
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const role = session.user.user_metadata?.role || "user";
        setUser({
          id: session.user.id,
          email: session.user.email,
          role,
          roles: [role],
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

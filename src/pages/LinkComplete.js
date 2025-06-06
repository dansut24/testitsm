import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const LinkComplete = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const completeLogin = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("Error retrieving session:", error);
        navigate("/login");
        return;
      }

      const { user } = session;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        navigate("/login");
        return;
      }

      localStorage.setItem("user", JSON.stringify({
        id: user.id,
        email: user.email,
        full_name: profile.full_name,
        role: profile.role,
        roles: [profile.role],
      }));

      // Redirect based on role
      if (profile.role === "selfservice") {
        navigate("/user-dashboard");
      } else {
        navigate("/dashboard");
      }
    };

    completeLogin();
  }, [navigate]);

  return <div>Signing you in...</div>;
};

export default LinkComplete;

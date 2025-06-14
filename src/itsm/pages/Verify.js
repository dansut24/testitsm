import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";
import { CircularProgress, Box, Typography } from "@mui/material";

function Verify() {
  const [message, setMessage] = useState("Verifying login...");
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const type = params.get("type");

    const completeLogin = async () => {
      if (!accessToken) {
        setMessage("❌ Invalid login link.");
        return;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: "", // no refresh token in OTP link
      });

      if (error) {
        setMessage("❌ Failed to authenticate. Please try again.");
        return;
      }

      setMessage("✅ Login successful. Redirecting...");
      setTimeout(() => navigate("/dashboard"), 1500);
    };

    completeLogin();
  }, [navigate]);

  return (
    <Box sx={{ mt: 10, textAlign: "center" }}>
      <CircularProgress sx={{ mb: 2 }} />
      <Typography>{message}</Typography>
    </Box>
  );
}

export default Verify;

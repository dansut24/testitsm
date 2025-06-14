// itsm/pages/Verify.js
import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

function Verify() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const type = url.searchParams.get("type");
    const code = url.searchParams.get("code");

    if (type === "email" && code) {
      supabase.auth
        .exchangeCodeForSession(code)
        .then(({ data, error }) => {
          if (error) {
            setMessage(`❌ ${error.message}`);
            setLoading(false);
          } else {
            setSession(data.session);
            setEmail(data.user?.email ?? ""); // shows email for debug
            setLoading(false);
          }
        });
    } else {
      setMessage("❌ Invalid verification link");
      setLoading(false);
    }
  }, []);

  const handleSubmit = async () => {
    if (!session) return;

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Password updated. Redirecting...");
      setTimeout(() => {
        navigate("/dashboard"); // or whatever your default route is
      }, 2000);
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 10, mx: "auto", display: "block" }} />;

  return (
    <Box maxWidth={400} mx="auto" mt={10} p={3} boxShadow={2} borderRadius={2}>
      <Typography variant="h5" gutterBottom>
        Set Your Password
      </Typography>

      {email && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Email: <strong>{email}</strong>
        </Typography>
      )}

      {message && <Alert severity={message.startsWith("✅") ? "success" : "error"}>{message}</Alert>}

      <TextField
        fullWidth
        type="password"
        label="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mt: 2, mb: 2 }}
      />
      <Button variant="contained" fullWidth onClick={handleSubmit}>
        Set Password & Sign In
      </Button>
    </Box>
  );
}

export default Verify;

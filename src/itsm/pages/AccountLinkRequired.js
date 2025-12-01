// src/itsm/pages/AccountLinkRequired.js
import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AccountLinkRequired = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 480,
          width: "100%",
          p: 3,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Google account not linked
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your Google account is not currently linked to a Hi5Tech ITSM user.
          To use Google sign-in, you must first sign in with your work account,
          then link Google from your profile.
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Please:
        </Typography>

        <ul style={{ marginTop: 0, marginBottom: 16, paddingLeft: 20 }}>
          <li>
            <Typography variant="body2">
              Go back to the login page and sign in with your{" "}
              <strong>work email</strong> (or Microsoft / other provider).
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Open <strong>Settings → Linked Accounts</strong> and link your
              Google account.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Next time, you can sign in directly with Google.
            </Typography>
          </li>
        </ul>

        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate("/login")}
        >
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default AccountLinkRequired;

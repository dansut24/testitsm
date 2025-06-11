import React, { useState } from "react";
import {
  Drawer,
  Fab,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import askOpenAI from "../utils/openai";

const AiChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const aiReply = await askOpenAI(input);

    const assistantMessage = {
      role: "assistant",
      text: aiReply || "Sorry, I didn't get that.",
    };
    setMessages((prev) => [...prev, assistantMessage]);
  };

  return (
    <>
      <Fab
        color="primary"
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <ChatIcon />
      </Fab>

      <Drawer
        anchor={isMobile ? "bottom" : "right"}
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: isMobile ? "100%" : 360,
            height: isMobile ? "50%" : "100%",
            top: isMobile ? "auto" : 0,
            bottom: isMobile ? 0 : "auto",
            borderTopLeftRadius: isMobile ? 12 : 0,
            borderTopRightRadius: isMobile ? 12 : 0,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2 }}>
          <Typography variant="h6">AI Assistant</Typography>
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
          {messages.map((msg, idx) => (
            <Box
              key={idx}
              sx={{
                mb: 1,
                textAlign: msg.role === "user" ? "right" : "left",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  display: "inline-block",
                  p: 1,
                  borderRadius: 2,
                  bgcolor:
                    msg.role === "user"
                      ? theme.palette.primary.light
                      : theme.palette.grey[300],
                  color: msg.role === "user" ? "#fff" : "text.primary",
                  maxWidth: "80%",
                }}
              >
                {msg.text}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider />
        <Box sx={{ p: 2, display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button variant="contained" onClick={handleSend}>
            <SendIcon />
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default AiChat;

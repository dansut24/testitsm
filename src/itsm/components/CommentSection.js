// src/itsm/components/CommentSection.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Avatar,
  CircularProgress,
} from "@mui/material";
import MDEditor from "@uiw/react-md-editor";

const CommentSection = ({ comments = [], onAddComment }) => {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!value?.trim()) return;
    if (!onAddComment) return;

    setSubmitting(true);
    try {
      await onAddComment({ body: value });
      setValue("");
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Comments
      </Typography>

      {/* Editor Container */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1.5 }}
        >
          Add a comment. You can paste images, code blocks, PDFs (as links), or
          tables.  
          Use fenced code blocks like:
          <Box
            component="span"
            sx={{
              ml: 0.6,
              px: 0.6,
              py: 0.2,
              borderRadius: 1,
              bgcolor: "action.hover",
              fontFamily: "monospace",
            }}
          >
            ```js
          </Box>
        </Typography>

        {/* Markdown Editor */}
        <Box
          sx={{
            borderRadius: 1.5,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            "& .w-md-editor": {
              borderRadius: 0,
              boxShadow: "none",
            },
          }}
          data-color-mode="light"
        >
          <MDEditor
            value={value}
            onChange={setValue}
            height={200}
            preview="edit"
            textareaProps={{
              placeholder:
                "Type your comment here... Paste anything including screenshots, tables, or code.",
            }}
          />
        </Box>

        <Box sx={{ textAlign: "right", mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={submitting || !value.trim()}
          >
            {submitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              "Add Comment"
            )}
          </Button>
        </Box>
      </Paper>

      {/* Existing comments */}
      <Stack spacing={1.5}>
        {comments.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No comments yet.
          </Typography>
        )}

        {comments.map((c) => (
          <Paper
            key={c.id || c.created_at}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              borderColor: "divider",
            }}
          >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: 14,
                  mr: 1,
                }}
              >
                {(c.author || "U").charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {c.author || "User"}
                </Typography>
                {c.created_at && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(c.created_at).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Markdown Comment Body */}
            <Box
              sx={{
                "& .w-md-editor-preview": { p: 0 },
                "& pre": {
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  p: 1,
                  fontSize: "0.85rem",
                  overflowX: "auto",
                },
                "& img": {
                  maxWidth: "100%",
                  borderRadius: 2,
                  marginTop: 1,
                },
              }}
              data-color-mode="light"
            >
              <MDEditor.Markdown source={c.body} />
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default CommentSection;

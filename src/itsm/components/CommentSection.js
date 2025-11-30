// src/itsm/components/CommentSection.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Avatar,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import CodeIcon from "@mui/icons-material/Code";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import LinkIcon from "@mui/icons-material/Link";
import TitleIcon from "@mui/icons-material/Title";

const CommentSection = ({ comments = [], onAddComment }) => {
  const [submitting, setSubmitting] = useState(false);

  // TipTap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: true, // basic code blocks boxed inside editor
      }),
      Underline,
      Link.configure({
        openOnClick: true,
      }),
      Placeholder.configure({
        placeholder:
          "Type your comment here... You can paste tables, scripts, links, etc.",
      }),
    ],
    content: "",
  });

  useEffect(() => {
    return () => {
      if (editor) editor.destroy();
    };
  }, [editor]);

  const handleSubmit = async () => {
    if (!editor) return;
    const html = editor.getHTML().trim();
    const plainText = editor.getText().trim();

    if (!plainText) return;
    if (!onAddComment) return;

    setSubmitting(true);
    try {
      // You can store `html` in DB as the comment body.
      await onAddComment({
        body: html,
        // Optional extra fields like author, created_at can be added by parent
      });

      editor.commands.clearContent();
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const isEmpty = !editor || !editor.getText().trim();

  const toggleLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");

    // Cancel
    if (url === null) return;

    // Empty string -> unset link
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Comments
      </Typography>

      {/* EDITOR PANEL */}
      <Paper
        elevation={1}
        sx={{
          p: 1.5,
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 0.5,
            mb: 1,
          }}
        >
          {/* Headings */}
          <Tooltip title="Heading">
            <IconButton
              size="small"
              onClick={() =>
                editor &&
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              color={
                editor?.isActive("heading", { level: 2 })
                  ? "primary"
                  : "default"
              }
            >
              <TitleIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Bold / Italic / Underline */}
          <Tooltip title="Bold">
            <IconButton
              size="small"
              onClick={() => editor && editor.chain().focus().toggleBold().run()}
              color={editor?.isActive("bold") ? "primary" : "default"}
            >
              <FormatBoldIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Italic">
            <IconButton
              size="small"
              onClick={() =>
                editor && editor.chain().focus().toggleItalic().run()
              }
              color={editor?.isActive("italic") ? "primary" : "default"}
            >
              <FormatItalicIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Underline">
            <IconButton
              size="small"
              onClick={() =>
                editor && editor.chain().focus().toggleUnderline().run()
              }
              color={editor?.isActive("underline") ? "primary" : "default"}
            >
              <FormatUnderlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 0.5, borderColor: "divider" }}
          />

          {/* Lists */}
          <Tooltip title="Bullet List">
            <IconButton
              size="small"
              onClick={() =>
                editor && editor.chain().focus().toggleBulletList().run()
              }
              color={editor?.isActive("bulletList") ? "primary" : "default"}
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Numbered List">
            <IconButton
              size="small"
              onClick={() =>
                editor && editor.chain().focus().toggleOrderedList().run()
              }
              color={editor?.isActive("orderedList") ? "primary" : "default"}
            >
              <FormatListNumberedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Quote + Code */}
          <Tooltip title="Quote">
            <IconButton
              size="small"
              onClick={() =>
                editor && editor.chain().focus().toggleBlockquote().run()
              }
              color={editor?.isActive("blockquote") ? "primary" : "default"}
            >
              <FormatQuoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Code Block (for scripts, PowerShell, etc.)">
            <IconButton
              size="small"
              onClick={() =>
                editor && editor.chain().focus().toggleCodeBlock().run()
              }
              color={editor?.isActive("codeBlock") ? "primary" : "default"}
            >
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 0.5, borderColor: "divider" }}
          />

          {/* Link */}
          <Tooltip title="Insert/Edit Link">
            <IconButton size="small" onClick={toggleLink}>
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Little hint */}
          <Typography
            variant="caption"
            sx={{ ml: 1, color: "text.secondary" }}
          >
            Paste Excel tables, scripts, screenshots, etc.
          </Typography>
        </Box>

        {/* Editor area */}
        <Box
          sx={{
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
            minHeight: 200,
            maxHeight: 400,
            overflowY: "auto",
            px: 1.5,
            py: 1,
            "& .ProseMirror": {
              outline: "none",
              fontSize: 14,
              "& p": { margin: "0 0 0.5rem 0" },
              "& pre": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "#111827"
                    : "#f3f4f6",
                borderRadius: 1,
                padding: "0.5rem 0.75rem",
                border: "1px solid",
                borderColor: "divider",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                fontSize: 12,
                overflowX: "auto",
              },
              "& code": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "#111827"
                    : "#f3f4f6",
                padding: "0 4px",
                borderRadius: 4,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                fontSize: 12,
              },
              "& blockquote": {
                borderLeft: "3px solid",
                borderColor: "divider",
                marginLeft: 0,
                paddingLeft: "0.75rem",
                color: "text.secondary",
                fontStyle: "italic",
              },
              "& img": {
                maxWidth: "100%",
                borderRadius: 4,
                margin: "0.25rem 0",
              },
              "& ul, & ol": {
                paddingLeft: "1.4rem",
                margin: "0 0 0.5rem 0",
              },
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>

        <Box sx={{ textAlign: "right", mt: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={submitting || isEmpty}
          >
            {submitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              "Add Comment"
            )}
          </Button>
        </Box>
      </Paper>

      {/* COMMENT LIST */}
      <Stack spacing={1.5}>
        {comments.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No comments yet.
          </Typography>
        )}

        {comments.map((c) => (
          <Paper
            key={c.id || c.created_at || Math.random()}
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2,
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: 13,
                  mr: 1,
                }}
              >
                {(c.author || "U").charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {c.author || "User"}
                </Typography>
                {c.created_at && (
                  <Typography variant="caption" color="text.secondary">
                    {new Date(c.created_at).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Render HTML body as-is */}
            {c.body ? (
              <Box
                sx={{
                  fontSize: 14,
                  "& pre": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "#111827"
                        : "#f3f4f6",
                    borderRadius: 1,
                    padding: "0.5rem 0.75rem",
                    border: "1px solid",
                    borderColor: "divider",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    fontSize: 12,
                    overflowX: "auto",
                    mt: 0.5,
                  },
                  "& code": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "#111827"
                        : "#f3f4f6",
                    padding: "0 4px",
                    borderRadius: 4,
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    fontSize: 12,
                  },
                  "& img": {
                    maxWidth: "100%",
                    borderRadius: 4,
                    margin: "0.25rem 0",
                  },
                  "& ul, & ol": {
                    paddingLeft: "1.4rem",
                    margin: "0.25rem 0",
                  },
                  "& blockquote": {
                    borderLeft: "3px solid",
                    borderColor: "divider",
                    paddingLeft: "0.75rem",
                    color: "text.secondary",
                    fontStyle: "italic",
                  },
                }}
                dangerouslySetInnerHTML={{ __html: c.body }}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                (No content)
              </Typography>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default CommentSection;

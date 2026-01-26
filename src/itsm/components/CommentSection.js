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
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import CodeIcon from "@mui/icons-material/Code";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LinkIcon from "@mui/icons-material/Link";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

const CommentSection = ({ comments = [], onAddComment }) => {
  const [submitting, setSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit, // includes paragraph, headings, lists, code block, etc.
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder:
          "Type your comment here... Paste tables, screenshots or code. Use the toolbar to format.",
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: "",
  });

  const isEmpty = () => {
    if (!editor) return true;
    const json = editor.getJSON();
    return (
      !json ||
      !json.content ||
      json.content.length === 0 ||
      (json.content.length === 1 &&
        json.content[0].type === "paragraph" &&
        (!json.content[0].content ||
          json.content[0].content.length === 0))
    );
  };

  const handleSubmit = async () => {
    if (!editor || isEmpty() || !onAddComment) return;

    setSubmitting(true);
    try {
      const html = editor.getHTML();

      // Pull current user from localStorage if available
      const storedUser = (() => {
        try {
          return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
          return null;
        }
      })();

      const authorName =
        storedUser?.username ||
        storedUser?.full_name ||
        storedUser?.email ||
        "User";

      await onAddComment({
        body: html,
        author: authorName,
        created_at: new Date().toISOString(),
        format: "tiptap-html",
      });

      editor.commands.clearContent();
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");

    if (url === null) return;

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

 const toolbarButtonSx = (isActive) => ({
  minWidth: 0,
  width: 28,
  height: 28,
  mx: 0.25,
  borderRadius: 1,
  color: isActive ? "primary.main" : "text.secondary",
  border: "1px solid",
  borderColor: isActive ? "primary.main" : "divider",
  // Avoid string concatenation warnings in CRA CI (process.env.CI=true)
  bgcolor: isActive ? "rgba(124, 92, 255, 0.20)" : "background.paper",
  "&:hover": {
    bgcolor: isActive ? "rgba(124, 92, 255, 0.30)" : "action.hover",
  },
});

  // 🔹 Handle pasted screenshots/images
  const handlePaste = (event) => {
    if (!editor) return;

    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    if (!items || items.length === 0) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (!file) continue;
        if (!file.type.startsWith("image/")) continue;

        // We handle the paste ourselves
        event.preventDefault();

        const reader = new FileReader();
        reader.onload = () => {
          const src = reader.result;
          editor
            .chain()
            .focus()
            .setImage({ src }) // base64 image inside the comment
            .run();
        };
        reader.readAsDataURL(file);
        return; // stop after first image
      }
    }
    // If no image in clipboard, fall back to normal paste
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Comments
      </Typography>

      {/* Editor container */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Add a new comment. You can paste screenshots/images and format text
          with the toolbar.
        </Typography>

        {/* Toolbar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            mb: 1,
            gap: 0.5,
          }}
        >
          <Tooltip title="Bold">
            <span>
              <IconButton
                size="small"
                sx={toolbarButtonSx(editor?.isActive("bold"))}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                disabled={!editor}
              >
                <FormatBoldIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Italic">
            <span>
              <IconButton
                size="small"
                sx={toolbarButtonSx(editor?.isActive("italic"))}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                disabled={!editor}
              >
                <FormatItalicIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Underline">
            <span>
              <IconButton
                size="small"
                sx={toolbarButtonSx(editor?.isActive("underline"))}
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                disabled={!editor}
              >
                <FormatUnderlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

          <Tooltip title="Bullet List">
            <span>
              <IconButton
                size="small"
                sx={toolbarButtonSx(editor?.isActive("bulletList"))}
                onClick={() =>
                  editor?.chain().focus().toggleBulletList().run()
                }
                disabled={!editor}
              >
                <FormatListBulletedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Numbered List">
            <span>
              <IconButton
                size="small"
                sx={toolbarButtonSx(editor?.isActive("orderedList"))}
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
                disabled={!editor}
              >
                <FormatListNumberedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Block Quote">
            <span>
              <IconButton
                size="small"
                sx={toolbarButtonSx(editor?.isActive("blockquote"))}
                onClick={() =>
                  editor?.chain().focus().toggleBlockquote().run()
                }
                disabled={!editor}
              >
                <FormatQuoteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

          <Tooltip title="Code Block">
            <span>
              <IconButton
                size="small"
                sx={toolbarButtonSx(editor?.isActive("codeBlock"))}
                onClick={() =>
                  editor?.chain().focus().toggleCodeBlock().run()
                }
                disabled={!editor}
              >
                <CodeIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Insert / Edit Link">
            <span>
              <IconButton
                size="small"
                sx={toolbarButtonSx(editor?.isActive("link"))}
                onClick={handleSetLink}
                disabled={!editor}
              >
                <LinkIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Editor content */}
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
            "& .tiptap p.is-editor-empty:first-of-type::before": {
              content: "attr(data-placeholder)",
              float: "left",
              color: "text.disabled",
              pointerEvents: "none",
              height: 0,
            },
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              marginTop: 1,
              marginBottom: 1,
            },
            "& pre": {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              fontSize: "0.85rem",
              backgroundColor: "rgba(0,0,0,0.04)",
              padding: "8px 10px",
              borderRadius: 1,
              overflowX: "auto",
              border: "1px solid",
              borderColor: "divider",
              margin: "8px 0",
            },
          }}
          onPaste={handlePaste}
        >
          <EditorContent editor={editor} />
        </Box>

        <Box sx={{ textAlign: "right", mt: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={submitting || isEmpty()}
          >
            {submitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              "Add Comment"
            )}
          </Button>
        </Box>
      </Paper>

      {/* Existing comments list */}
      <Stack spacing={1.5}>
        {comments.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No comments yet.
          </Typography>
        )}

        {comments.map((c, idx) => (
          <Paper
            key={c.id || c.created_at || idx}
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
                  width: 26,
                  height: 26,
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

            {c.body ? (
              <Box
                sx={{
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    marginTop: 1,
                    marginBottom: 1,
                  },
                  "& pre": {
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                    fontSize: "0.85rem",
                    backgroundColor: "rgba(0,0,0,0.04)",
                    padding: "8px 10px",
                    borderRadius: 1,
                    overflowX: "auto",
                    border: "1px solid",
                    borderColor: "divider",
                    margin: "8px 0",
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

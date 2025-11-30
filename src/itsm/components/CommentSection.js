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
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

import { common, createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import bash from "highlight.js/lib/languages/bash";
import powershell from "highlight.js/lib/languages/powershell";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import CodeIcon from "@mui/icons-material/Code";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LinkIcon from "@mui/icons-material/Link";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";

const lowlight = createLowlight(common);

// Register extra languages explicitly
lowlight.registerLanguage("javascript", javascript);
lowlight.registerLanguage("js", javascript);
lowlight.registerLanguage("bash", bash);
lowlight.registerLanguage("sh", bash);
lowlight.registerLanguage("powershell", powershell);
lowlight.registerLanguage("ps", powershell);

const CommentSection = ({ comments = [], onAddComment }) => {
  const [submitting, setSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // we replace with CodeBlockLowlight
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder:
          "Type your comment here... Paste tables or code, use the toolbar for formatting.",
      }),
      CodeBlockLowlight.configure({
        lowlight,
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

      // Try to get current user from localStorage
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
    bgcolor: isActive ? "primary.light" + "33" : "background.paper",
    "&:hover": {
      bgcolor: isActive ? "primary.light" + "55" : "action.hover",
    },
  });

  // Shared code-block styling for editor & rendered comments
  const codeBlockStyles = {
    "& pre": {
      position: "relative",
      backgroundColor: "rgba(0,0,0,0.04)",
      borderRadius: 1.5,
      padding: "24px 10px 8px 10px", // extra top padding for label
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      fontSize: "0.8rem",
      overflowX: "auto",
      border: "1px solid",
      borderColor: "divider",
      margin: "8px 0",
    },
    "& pre code": {
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
    "& pre code::before": {
      content: '"Code"',
      position: "absolute",
      top: 4,
      right: 8,
      fontSize: "0.7rem",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      padding: "2px 6px",
      borderRadius: 999,
      backgroundColor: "rgba(0,0,0,0.08)",
      color: "rgba(0,0,0,0.7)",
    },
    // JS
    "& pre code[class*='language-javascript']::before, & pre code[class*='language-js']::before":
      {
        content: '"JavaScript"',
      },
    // Bash / Shell
    "& pre code[class*='language-bash']::before, & pre code[class*='language-sh']::before":
      {
        content: '"Bash"',
      },
    // PowerShell
    "& pre code[class*='language-powershell']::before, & pre code[class*='language-ps']::before":
      {
        content: '"PowerShell"',
      },
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
          Add a new comment. Use the toolbar for formatting and code blocks.
          For language labels use fenced code, e.g.{" "}
          <Box
            component="span"
            sx={{
              fontFamily: "monospace",
              bgcolor: "action.hover",
              px: 0.5,
              borderRadius: 0.75,
            }}
          >
            ```powershell
          </Box>
          ,{" "}
          <Box
            component="span"
            sx={{
              fontFamily: "monospace",
              bgcolor: "action.hover",
              px: 0.5,
              borderRadius: 0.75,
            }}
          >
            ```bash
          </Box>{" "}
          or{" "}
          <Box
            component="span"
            sx={{
              fontFamily: "monospace",
              bgcolor: "action.hover",
              px: 0.5,
              borderRadius: 0.75,
            }}
          >
            ```js
          </Box>
          .
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
            minHeight: 180,
            maxHeight: 360,
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
            ...codeBlockStyles,
          }}
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
                  ...codeBlockStyles,
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

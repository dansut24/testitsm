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

import { createLowlight, common } from "lowlight";

// you can swap this for another highlight.js theme if you like
import "highlight.js/styles/github.css";

// ✅ create a lowlight instance from the common languages
const lowlight = createLowlight(common);

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
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder:
          "Type your comment here… Paste tables, code, or rich text. Use ```ps, ```bash, ```js for code.",
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: "",
  });

  const handleSubmit = async () => {
    if (!editor || !onAddComment) return;

    const html = editor.getHTML().trim();
    if (!html || html === "<p></p>") return;

    setSubmitting(true);
    try {
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

      const newComment = {
        body: html,
        author: authorName,
        created_at: new Date().toISOString(),
      };

      await onAddComment(newComment);
      editor.commands.clearContent();
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const run = (cmd) => {
    if (!editor) return;
    cmd();
    editor.chain().focus().run();
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Comments
      </Typography>

      {/* Editor container - full-width panel */}
      <Paper
        elevation={2}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            px: 1,
            py: 0.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flexWrap: "wrap",
            bgcolor: "background.default",
          }}
        >
          <Tooltip title="Bold">
            <span>
              <IconButton
                size="small"
                color={editor?.isActive("bold") ? "primary" : "default"}
                onClick={() => run(() => editor.chain().toggleBold())}
              >
                <strong>B</strong>
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Italic">
            <span>
              <IconButton
                size="small"
                color={editor?.isActive("italic") ? "primary" : "default"}
                onClick={() => run(() => editor.chain().toggleItalic())}
              >
                <em>I</em>
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Underline">
            <span>
              <IconButton
                size="small"
                color={editor?.isActive("underline") ? "primary" : "default"}
                onClick={() => run(() => editor.chain().toggleUnderline())}
              >
                <span style={{ textDecoration: "underline" }}>U</span>
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Bullet list">
            <span>
              <IconButton
                size="small"
                color={editor?.isActive("bulletList") ? "primary" : "default"}
                onClick={() => run(() => editor.chain().toggleBulletList())}
              >
                ••
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Numbered list">
            <span>
              <IconButton
                size="small"
                color={editor?.isActive("orderedList") ? "primary" : "default"}
                onClick={() => run(() => editor.chain().toggleOrderedList())}
              >
                1.
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Code block">
            <span>
              <IconButton
                size="small"
                color={editor?.isActive("codeBlock") ? "primary" : "default"}
                onClick={() => run(() => editor.chain().toggleCodeBlock())}
              >
                {"</>"}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Blockquote">
            <span>
              <IconButton
                size="small"
                color={editor?.isActive("blockquote") ? "primary" : "default"}
                onClick={() => run(() => editor.chain().toggleBlockquote())}
              >
                “”
              </IconButton>
            </span>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="Clear formatting">
            <span>
              <IconButton
                size="small"
                onClick={() =>
                  run(() =>
                    editor
                      .chain()
                      .clearNodes()
                      .unsetAllMarks()
                  )
                }
              >
                ⌫
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Editor content area */}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            minHeight: 160,
            maxHeight: 360,
            overflowY: "auto",
            "& .tiptap": {
              outline: "none",
              "& p.is-editor-empty:first-of-type::before": {
                content: "attr(data-placeholder)",
                color: "text.disabled",
                float: "left",
                pointerEvents: "none",
                height: 0,
              },
            },
            "& pre": {
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              fontSize: "0.8rem",
              padding: "8px 10px",
              backgroundColor: "background.default",
              overflowX: "auto",
            },
            "& code": {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            },
          }}
        >
          <EditorContent editor={editor} className="tiptap" />
        </Box>

        {/* Footer / submit */}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={submitting || !editor}
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

            <Box
              sx={{
                "& pre": {
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  fontSize: "0.8rem",
                  padding: "8px 10px",
                  backgroundColor: "background.default",
                  overflowX: "auto",
                },
                "& code": {
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                },
              }}
              dangerouslySetInnerHTML={{ __html: c.body || "" }}
            />
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default CommentSection;

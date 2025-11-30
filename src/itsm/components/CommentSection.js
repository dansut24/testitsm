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
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

import { createLowlight, common } from "lowlight";
import powershell from "highlight.js/lib/languages/powershell";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";

import "highlight.js/styles/github.css";

// ✅ lowlight instance + extra languages
const lowlight = createLowlight(common);
lowlight.registerLanguage("powershell", powershell);
lowlight.registerLanguage("ps", powershell);
lowlight.registerLanguage("bash", bash);
lowlight.registerLanguage("sh", bash);
lowlight.registerLanguage("javascript", javascript);
lowlight.registerLanguage("js", javascript);

const CommentSection = ({ comments = [], onAddComment }) => {
  const [submitting, setSubmitting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // we provide our own
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({
        placeholder:
          "Type your comment here… Paste tables, screenshots, or code. Use ```ps, ```bash, ```js for labelled code blocks.",
      }),
      Image.configure({
        inline: false,
        allowBase64: true, // ✅ allows pasted screenshots as data URLs
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: "",
    editorProps: {
      handlePaste(view, event) {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const items = clipboardData.items;
        if (!items || items.length === 0) return false;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          if (item.type && item.type.indexOf("image") === 0) {
            const file = item.getAsFile();
            if (!file) continue;

            const reader = new FileReader();
            reader.onload = () => {
              const { schema } = view.state;
              const node = schema.nodes.image.create({
                src: reader.result,
              });

              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
            };
            reader.readAsDataURL(file);

            event.preventDefault();
            return true;
          }
        }

        // let other paste events continue as normal
        return false;
      },
    },
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

      {/* Editor container - full-width, big panel */}
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

          <Tooltip title="Code block (labelled if fenced)">
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
            minHeight: 200,
            maxHeight: 380,
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
            // code block styling + language label
            "& pre": {
              position: "relative",
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              fontSize: "0.8rem",
              padding: "16px 10px 10px 10px",
              backgroundColor: "background.default",
              overflowX: "auto",
            },
            "& pre[data-language]::before": {
              content: "attr(data-language)",
              position: "absolute",
              top: 2,
              right: 8,
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              opacity: 0.7,
            },
            "& code": {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
            },
            // images pasted
            "& img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              marginTop: 0.5,
              marginBottom: 0.5,
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
                  position: "relative",
                  borderRadius: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  fontSize: "0.8rem",
                  padding: "16px 10px 10px 10px",
                  backgroundColor: "background.default",
                  overflowX: "auto",
                },
                "& pre[data-language]::before": {
                  content: "attr(data-language)",
                  position: "absolute",
                  top: 2,
                  right: 8,
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  opacity: 0.7,
                },
                "& code": {
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                },
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  marginTop: 0.5,
                  marginBottom: 0.5,
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

// src/itsm/components/CommentSection.js
import React, { useState, useCallback, useRef } from "react";
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
  Select,
  MenuItem,
} from "@mui/material";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";

import { lowlight } from "lowlight";
import js from "highlight.js/lib/languages/javascript";
import powershell from "highlight.js/lib/languages/powershell";
import bash from "highlight.js/lib/languages/bash";
import jsonLang from "highlight.js/lib/languages/json";
import sql from "highlight.js/lib/languages/sql";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CodeIcon from "@mui/icons-material/Code";
import LinkIcon from "@mui/icons-material/Link";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ImageIcon from "@mui/icons-material/Image";

// Register languages for syntax highlighting
lowlight.registerLanguage("javascript", js);
lowlight.registerLanguage("powershell", powershell);
lowlight.registerLanguage("bash", bash);
lowlight.registerLanguage("json", jsonLang);
lowlight.registerLanguage("sql", sql);

// Custom code block with language attribute support
const CodeBlock = CodeBlockLowlight.extend({
  addAttributes() {
    return {
      language: {
        default: "plaintext",
      },
    };
  },
}).configure({ lowlight });

// simple helper to detect if a string is likely HTML
const isLikelyHtml = (str) => /<\/?[a-z][\s\S]*>/i.test(str || "");

const CommentSection = ({ comments = [], onAddComment }) => {
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // we replace with CodeBlock
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder:
          "Type your comment here… paste screenshots, tables, or code. Use the toolbar for formatting.",
      }),
      CodeBlock,
      Image.configure({
        inline: false,
        allowBase64: true, // good for quick screenshots; can switch to URL uploads later
      }),
    ],
    content: "",
  });

  const handlePaste = useCallback(
    (event) => {
      if (!editor) return;

      const items = event.clipboardData?.items;
      if (!items) return;

      // Look for image in clipboard
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          event.preventDefault();
          const file = item.getAsFile();
          if (!file) return;

          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result;
            editor
              .chain()
              .focus()
              .setImage({ src }) // base64 inline image
              .run();
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    },
    [editor]
  );

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result;
      editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
    // reset so same file can be chosen again later
    e.target.value = "";
  };

  const handleSubmit = async () => {
    if (!editor || !onAddComment) return;

    const html = editor.getHTML();
    const text = editor.getText().trim();

    // Don’t let them submit empty content
    const hasImage = html.includes("<img");
    if (!text && !hasImage) return;

    setSubmitting(true);
    try {
      await onAddComment({ body: html });
      editor.commands.clearContent();
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const isCodeBlockActive = editor?.isActive("codeBlock");
  const currentLanguage =
    editor?.getAttributes("codeBlock")?.language || "plaintext";

  const handleLanguageChange = (event) => {
    if (!editor) return;
    const lang = event.target.value;
    editor
      .chain()
      .focus()
      .setNodeAttribute("codeBlock", "language", lang)
      .run();
  };

  const languageOptions = [
    { value: "plaintext", label: "Plain" },
    { value: "powershell", label: "PowerShell" },
    { value: "bash", label: "Bash" },
    { value: "javascript", label: "JavaScript" },
    { value: "json", label: "JSON" },
    { value: "sql", label: "SQL" },
  ];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Comments
      </Typography>

      {/* Full-size rich editor section */}
      <Paper
        elevation={2}
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
            flexWrap: "wrap",
            alignItems: "center",
            gap: 0.5,
            mb: 1,
          }}
        >
          <Tooltip title="Bold">
            <span>
              <IconButton
                size="small"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                color={editor?.isActive("bold") ? "primary" : "default"}
              >
                <FormatBoldIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Italic">
            <span>
              <IconButton
                size="small"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                color={editor?.isActive("italic") ? "primary" : "default"}
              >
                <FormatItalicIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Underline">
            <span>
              <IconButton
                size="small"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                color={editor?.isActive("underline") ? "primary" : "default"}
              >
                <FormatUnderlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Bullet list">
            <span>
              <IconButton
                size="small"
                onClick={() =>
                  editor?.chain().focus().toggleBulletList().run()
                }
                color={editor?.isActive("bulletList") ? "primary" : "default"}
              >
                <FormatListBulletedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Numbered list">
            <span>
              <IconButton
                size="small"
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
                color={editor?.isActive("orderedList") ? "primary" : "default"}
              >
                <FormatListNumberedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Quote">
            <span>
              <IconButton
                size="small"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                color={editor?.isActive("blockquote") ? "primary" : "default"}
              >
                <FormatQuoteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Inline code">
            <span>
              <IconButton
                size="small"
                onClick={() => editor?.chain().focus().toggleCode().run()}
                color={editor?.isActive("code") ? "primary" : "default"}
              >
                <CodeIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Code block">
            <span>
              <IconButton
                size="small"
                onClick={() =>
                  editor?.chain().focus().toggleCodeBlock().run()
                }
                color={editor?.isActive("codeBlock") ? "primary" : "default"}
              >
                <CodeIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Insert / edit link">
            <span>
              <IconButton size="small" onClick={setLink}>
                <LinkIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Insert image (upload)">
            <span>
              <IconButton size="small" onClick={handleImageUploadClick}>
                <ImageIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Undo">
            <span>
              <IconButton
                size="small"
                onClick={() => editor?.chain().focus().undo().run()}
              >
                <UndoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo">
            <span>
              <IconButton
                size="small"
                onClick={() => editor?.chain().focus().redo().run()}
              >
                <RedoIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* When cursor is inside a code block, show language selector + label */}
        {isCodeBlockActive && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              mb: 1,
              px: 1,
              py: 0.25,
              borderRadius: 999,
              bgcolor: "action.hover",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              Code language:
            </Typography>
            <Select
              size="small"
              value={currentLanguage}
              onChange={handleLanguageChange}
              variant="standard"
              sx={{
                fontSize: "0.75rem",
                minWidth: 90,
              }}
            >
              {languageOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}

        {/* Hidden file input for images */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageFileChange}
        />

        {/* Editor area */}
        <Box
          sx={{
            mt: 1,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
            minHeight: 180,
            maxHeight: 360,
            overflowY: "auto",
            p: 1.5,
            "& .tiptap-editor": {
              outline: "none",
              minHeight: 160,
            },
            "& .tiptap-editor p": {
              margin: 0,
              marginBottom: "0.35rem",
            },
            "& .tiptap-editor ul, & .tiptap-editor ol": {
              paddingLeft: "1.25rem",
            },
            "& .tiptap-editor code": {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              backgroundColor: "rgba(0,0,0,0.04)",
              padding: "2px 4px",
              borderRadius: 4,
              fontSize: "0.82rem",
            },
            "& .tiptap-editor pre": {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              backgroundColor: "#0b1020",
              color: "#f8f8f2",
              padding: "12px 14px",
              borderRadius: 8,
              overflowX: "auto",
              fontSize: "0.82rem",
              margin: "6px 0",
            },
            "& .tiptap-editor img": {
              maxWidth: "100%",
              height: "auto",
              borderRadius: 4,
              margin: "6px 0",
            },
          }}
          onPaste={handlePaste}
        >
          <EditorContent editor={editor} className="tiptap-editor" />
        </Box>

        <Box sx={{ textAlign: "right", mt: 1.5 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={submitting}
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
              isLikelyHtml(c.body) ? (
                <Box
                  className="comment-body"
                  sx={{
                    "& pre": {
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                      backgroundColor: "#0b1020",
                      color: "#f8f8f2",
                      padding: "10px 12px",
                      borderRadius: 8,
                      overflowX: "auto",
                      fontSize: "0.8rem",
                      margin: "6px 0",
                    },
                    "& code": {
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                      backgroundColor: "rgba(0,0,0,0.04)",
                      padding: "2px 4px",
                      borderRadius: 4,
                      fontSize: "0.82rem",
                    },
                    "& img": {
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: 4,
                      margin: "6px 0",
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: c.body }}
                />
              ) : (
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: "pre-wrap" }}
                >
                  {c.body}
                </Typography>
              )
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

// src/components/CommentSection.js

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";
import MarkdownEditor from '@uiw/react-md-editor';

const CommentSection = ({ comments, onAddComment }) => {
  const [editorValue, setEditorValue] = useState("");

  const handlePostComment = () => {
    if (!editorValue.trim()) return;
    const newComment = {
      id: Date.now(),
      author: "John Doe",
      content: editorValue,
      timestamp: new Date().toISOString(),
    };
    onAddComment(newComment);
    setEditorValue("");
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Add a Comment</Typography>
      <MarkdownEditor
        value={editorValue}
        onChange={(val) => setEditorValue(val)}
        height={120}
      />
      <Button variant="contained" sx={{ mt: 1 }} onClick={handlePostComment}>
        Post
      </Button>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>Comments</Typography>
      <List dense>
        {comments.map((c) => (
          <ListItem alignItems="flex-start" key={c.id}>
            <ListItemAvatar>
              <Avatar>{c.author[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={c.author + " · " + new Date(c.timestamp).toLocaleString()}
              secondary={<span dangerouslySetInnerHTML={{ __html: c.content }} />}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CommentSection;

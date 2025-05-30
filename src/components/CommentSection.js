// src/components/CommentSection.js

import React, { useState } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { Box, Typography, Button, Divider, Avatar } from "@mui/material";

const CommentSection = () => {
  const [comment, setComment] = useState("");
  const [commentsList, setCommentsList] = useState([]);

  const handleAddComment = () => {
    if (!comment.trim()) return;
    const newComment = {
      id: Date.now(),
      user: "John Doe",
      timestamp: new Date().toLocaleString(),
      content: comment,
    };
    setCommentsList([newComment, ...commentsList]);
    setComment("");
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Comments</Typography>

      <ReactQuill value={comment} onChange={setComment} style={{ marginBottom: 8 }} />
      <Button variant="contained" onClick={handleAddComment}>Post Comment</Button>

      <Divider sx={{ my: 2 }} />

      {commentsList.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
      ) : (
        commentsList.map((c) => (
          <Box key={c.id} sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Avatar sx={{ width: 24, height: 24, mr: 1 }}>J</Avatar>
              <Typography variant="subtitle2">{c.user}</Typography>
              <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
                {c.timestamp}
              </Typography>
            </Box>
            <div dangerouslySetInnerHTML={{ __html: c.content }} />
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))
      )}
    </Box>
  );
};

export default CommentSection;

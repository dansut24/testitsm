import React, { useState } from "react";
import { Box, Typography, Avatar, Button } from "@mui/material";
import MarkdownEditor from "@uiw/react-markdown-editor";

const dummyComments = [
  {
    id: 1,
    user: "Alice",
    content: "This issue is being looked into.",
    timestamp: "2025-05-25 10:15",
  },
  {
    id: 2,
    user: "Bob",
    content: "Temporary workaround applied.",
    timestamp: "2025-05-26 14:45",
  },
];

const CommentSection = () => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(dummyComments);

  const handlePostComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: comments.length + 1,
        user: "CurrentUser",
        content: commentText,
        timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      };
      setComments([newComment, ...comments]);
      setCommentText("");
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Add a Comment
      </Typography>
      <MarkdownEditor
        value={commentText}
        onChange={(value) => setCommentText(value)}
        height="150px"
      />
      <Button
        onClick={handlePostComment}
        variant="contained"
        sx={{ mt: 2 }}
      >
        Post Comment
      </Button>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1">Previous Comments</Typography>
        {comments.map((comment) => (
          <Box key={comment.id} sx={{ mt: 2, p: 2, bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                {comment.user.charAt(0)}
              </Avatar>
              <Typography variant="body2" fontWeight="bold">
                {comment.user}
              </Typography>
              <Typography variant="caption" sx={{ ml: 1 }} color="text.secondary">
                {comment.timestamp}
              </Typography>
            </Box>
            <Typography variant="body2" component="div">
              <div dangerouslySetInnerHTML={{ __html: window.marked.parse(comment.content) }} />
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CommentSection;

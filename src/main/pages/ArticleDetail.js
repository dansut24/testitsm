import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Divider,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";

const dummyArticle = {
  id: 1,
  title: "How to Reset Your Password",
  content:
    "To reset your password, go to the login page and click on 'Forgot Password'. Follow the instructions sent to your registered email address.",
  lastUpdated: "2024-05-01",
};

const ArticleDetail = () => {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const handleLike = () => setLikes(likes + 1);
  const handleDislike = () => setDislikes(dislikes + 1);

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment.trim()]);
      setNewComment("");
    }
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography variant="h5" gutterBottom>
        {dummyArticle.title}
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Last updated: {dummyArticle.lastUpdated}
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1">{dummyArticle.content}</Typography>
      </Paper>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={handleLike} color="primary">
          <ThumbUpAltIcon />
        </IconButton>
        <Typography>{likes}</Typography>

        <IconButton onClick={handleDislike} color="error">
          <ThumbDownAltIcon />
        </IconButton>
        <Typography>{dislikes}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>
        Comments
      </Typography>

      {comments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No comments yet.
        </Typography>
      ) : (
        comments.map((comment, index) => (
          <Paper key={index} sx={{ p: 2, mb: 1 }}>
            <Typography variant="body2">{comment}</Typography>
          </Paper>
        ))
      )}

      <TextField
        fullWidth
        multiline
        minRows={3}
        variant="outlined"
        placeholder="Add a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        sx={{ mt: 2 }}
      />

      <Button
        variant="contained"
        sx={{ mt: 1 }}
        onClick={handleCommentSubmit}
        disabled={!newComment.trim()}
      >
        Submit Comment
      </Button>
    </Box>
  );
};

export default ArticleDetail;

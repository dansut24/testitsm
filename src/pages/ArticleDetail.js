import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Divider,
  Paper,
} from "@mui/material";

const dummyArticles = [
  {
    id: 1,
    title: "How to reset your password",
    category: "Accounts",
    content: `To reset your password, go to the login screen and click on "Forgot Password". Follow the instructions sent to your email.`,
    author: "IT Helpdesk",
    created: "2024-03-18",
  },
  {
    id: 2,
    title: "Troubleshooting network issues",
    category: "Network",
    content: `If you can't connect to the internet, try restarting your router or contact support for further help.`,
    author: "Network Admin",
    created: "2024-04-02",
  },
];

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = dummyArticles.find((a) => a.id === parseInt(id));

  if (!article) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Article not found</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Button variant="outlined" size="small" onClick={() => navigate(-1)}>
        Back
      </Button>

      <Typography variant="h4" sx={{ mt: 2 }}>
        {article.title}
      </Typography>
      <Chip label={article.category} size="small" sx={{ mt: 1 }} />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        By {article.author} • {article.created}
      </Typography>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
          {article.content}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ArticleDetail;

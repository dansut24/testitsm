import React from "react";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const BreadcrumbsNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ px: 2, py: 1 }}>
      <Link underline="hover" color="inherit" onClick={() => navigate("/")}>
        Home
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        return isLast ? (
          <Typography key={to} color="text.primary">
            {decodeURIComponent(value.replace(/-/g, " "))}
          </Typography>
        ) : (
          <Link key={to} underline="hover" color="inherit" onClick={() => navigate(to)}>
            {decodeURIComponent(value.replace(/-/g, " "))}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbsNav;

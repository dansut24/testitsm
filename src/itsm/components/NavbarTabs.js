// NavbarTabs.js
import React from "react";
import ChromeTabs from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";
import { Box, Avatar, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const NavbarTabs = ({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  sidebarOpen,
  sidebarWidth,
  collapsedWidth,
  storedUser,
  isMobile,
  height = 41.6,
}) => {
  const leftOffset = isMobile ? 0 : sidebarOpen ? sidebarWidth : collapsedWidth;
  const widthCalc = isMobile
    ? "100%"
    : `calc(100% - ${sidebarOpen ? sidebarWidth : collapsedWidth}px)`;

  // Map tabs to ChromeTabs format
  const chromeTabsData = tabs.map((tab, index) => ({
    id: tab.path, // must be unique
    title: tab.label,
    active: index === tabIndex,
    favicon: "", // optional: add favicons here
  }));

  const onTabActive = (id) => {
    const index = tabs.findIndex((t) => t.path === id);
    if (index !== -1) handleTabChange(null, index);
  };

  const onTabClose = (id) => {
    handleTabClose(id);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: leftOffset,
        width: widthCalc,
        height: `${height}px`,
        zIndex: (theme) => theme.zIndex.appBar + 1,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        px: 1,
      }}
    >
      <ChromeTabs
        tabs={chromeTabsData}
        onTabActive={onTabActive}
        onTabClose={onTabClose}
        draggable
        pinnedRight={
          <IconButton
            size="small"
            sx={{ height: "100%" }}
            onClick={() => handleTabChange(null, tabs.length)}
          >
            +
          </IconButton>
        }
      />
    </Box>
  );
};

export default NavbarTabs;

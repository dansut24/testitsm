// AppsBar.js — Chrome/Edge style tabs (fixed) — left aligned with sidebar
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Tab, Tabs, Box, IconButton } from "@mui/material";

const AppsBar = ({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  isMobile,
  sidebarOpen,
  sidebarWidth,
  collapsedWidth,
}) => {
  // left offset: align with sidebar on desktop so the bar doesn't sit under the sidebar
  const leftOffset = isMobile ? 0 : `${sidebarOpen ? sidebarWidth : collapsedWidth}px`;
  const widthCalc = isMobile
    ? "100%"
    : `calc(100% - ${sidebarOpen ? sidebarWidth : collapsedWidth}px)`;

  return (
    <Box
      position="fixed"
      sx={{
        top: 48, // must match your Header/AppBar height
        left: leftOffset,
        width: widthCalc,
        zIndex: (theme) => theme.zIndex.appBar + 1, // below the Header but above content
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          minHeight: 36,
          height: 36,
          "& .MuiTabs-indicator": { display: "none" },
        }}
      >
        {tabs.map((tab, i) => (
          <Tab
            key={tab.path}
            disableRipple
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {tab.label}
                {tab.path !== "/dashboard" && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabClose(tab.path);
                    }}
                    size="small"
                    sx={{ p: 0.25 }}
                    aria-label={`Close ${tab.label}`}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            }
            sx={{
              minHeight: 36,
              height: 36,
              fontSize: 13,
              px: 1.5,
              textTransform: "none",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
              border: "1px solid",
              borderColor: "divider",
              borderBottom: tabIndex === i ? "none" : "1px solid",
              bgcolor: tabIndex === i ? "background.paper" : "grey.100",
              zIndex: tabIndex === i ? 2 : 1,
              mr: -1,
              "&:hover": {
                bgcolor: tabIndex === i ? "background.paper" : "grey.200",
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default AppsBar;

// AppsBar.js — sticky tab bar with closable tabs

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
}) => {  return (
    <Box
  position="fixed"
      sx={{
        top: 48, // Adjust if Navbar height changes
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        width: isMobile ? "100%" : `calc(100% - ${sidebarOpen ? sidebarWidth : collapsedWidth}px)`,
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ minHeight: 32, height: 32 }}
      >
        {tabs.map((tab, i) => (
          <Tab
            key={tab.path}
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {tab.label}
                {tab.path !== "/dashboard" && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents switching tabs when clicking the close icon
                      handleTabClose(tab.path);
                    }}
                    size="small"
                    sx={{ ml: 0.5 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            }
            sx={{
              minHeight: 32,
              height: 32,
              fontSize: 12,
              px: 1,
              textTransform: "none",
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default AppsBar;

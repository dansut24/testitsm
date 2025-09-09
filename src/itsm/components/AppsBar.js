// AppsBar.js — Chrome/Edge style tabs blending into content

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
  return (
    <Box
      position="fixed"
      sx={{
        top: 48, // Adjust if Navbar height changes
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: "background.paper", // match main content
        width: isMobile
          ? "100%"
          : `calc(100% - ${sidebarOpen ? sidebarWidth : collapsedWidth}px)`,
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 36,
          height: 36,
          "& .MuiTabs-indicator": {
            display: "none", // remove underline
          },
        }}
      >
        {tabs.map((tab, i) => (
          <Tab
            key={tab.path}
            disableRipple
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  pr: 1,
                }}
              >
                {tab.label}
                {tab.path !== "/dashboard" && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabClose(tab.path);
                    }}
                    size="small"
                    sx={{
                      ml: 0.5,
                      opacity: 0,
                      transition: "opacity 0.2s",
                      "&:hover": { opacity: 1 },
                    }}
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
              borderBottom: tabIndex === i ? "none" : "1px solid", // active merges with content
              bgcolor: tabIndex === i ? "background.paper" : "grey.100",
              zIndex: tabIndex === i ? 1 : 0, // lift active tab
              mr: -1, // overlap like Chrome
              "&:hover": {
                bgcolor: tabIndex === i ? "background.paper" : "grey.200",
              },
              "& .MuiBox-root": {
                "&:hover button": {
                  opacity: 1,
                },
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default AppsBar;

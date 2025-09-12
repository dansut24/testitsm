// AppsBar.js — Refined Chrome/Edge style tabs with always-visible close buttons

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
        top: 48, // aligns with Navbar
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        width: isMobile
          ? "100%"
          : `calc(100% - ${sidebarOpen ? sidebarWidth : collapsedWidth}px)`,
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile
        sx={{
          minHeight: 36,
          height: 36,
          "& .MuiTabs-indicator": {
            display: "none", // no underline
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
                  gap: 0.5,
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
                      p: 0.25,
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
              borderBottom: tabIndex === i ? "none" : "1px solid",
              bgcolor: tabIndex === i ? "background.paper" : "grey.100",
              zIndex: tabIndex === i ? 1 : 0,
              mr: -1, // Chrome-style overlap
              "&:hover": {
                bgcolor:
                  tabIndex === i ? "background.paper" : "grey.200",
              },
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default AppsBar;

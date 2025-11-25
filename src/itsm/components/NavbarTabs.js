import React from "react";
import { Box, Tabs, Tab, IconButton } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

export default function NavbarTabs({
  tabs,
  tabIndex,
  handleTabChange,
  handleTabClose,
  handleTabReorder,
  isMobile, // passed from Layout, but we'll also derive from theme just in case
}) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const mobile = isMobile ?? isXs;

  const handleTabsChange = (event, newIndex) => {
    // Last "tab" is the + button
    if (newIndex === tabs.length) {
      const newTabs = [
        ...tabs,
        { label: "New Tab", path: `/new-tab/${tabs.length + 1}` },
      ];
      if (handleTabReorder) {
        handleTabReorder(newTabs);
      }
      const createdIndex = newTabs.length - 1;
      const createdPath = newTabs[createdIndex].path;
      handleTabChange(event, createdIndex, createdPath);
    } else {
      const path = tabs[newIndex]?.path;
      handleTabChange(event, newIndex, path);
    }
  };

  const handleCloseClick = (e, tabPath) => {
    e.stopPropagation();
    handleTabClose(tabPath);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "background.paper",
        boxShadow: (t) => `inset 0 -1px 0 ${t.palette.divider}`,
        display: "flex",
        alignItems: "stretch",
        // 🔒 Ensure the tab strip itself never affects layout width
        overflow: "hidden",
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={handleTabsChange}
        // Let MUI handle scrolling inside the tab bar
        variant="scrollable"
        scrollButtons={mobile ? false : "auto"}
        allowScrollButtonsMobile={false}
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          minHeight: "100%",
          height: "100%",
          "& .MuiTabs-scrollableX": {
            // This is the internal scroll container – it scrolls instead of the page
            height: "100%",
          },
          "& .MuiTabs-flexContainer": {
            height: "100%",
            alignItems: "stretch",
          },
          "& .MuiTab-root": {
            minHeight: "100%",
            height: "100%",
            textTransform: "none",
            fontSize: 13,
            padding: "0 8px",
            color: "text.secondary",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "none",
            minWidth: 0,
          },
          "& .MuiTab-root.Mui-selected": {
            fontWeight: 600,
            color: "text.primary",
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.03)",
            boxShadow: `inset 0 -2px 0 ${theme.palette.primary.main}`,
          },
          "& .MuiTab-root:hover": {
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.02)"
                : "rgba(0,0,0,0.015)",
          },
        }}
      >
        {tabs.map((t, idx) => (
          <Tab
            key={t.path}
            disableRipple
            label={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  pl: 0.5,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    maxWidth: mobile ? 110 : 160,
                    fontSize: 13,
                  }}
                >
                  {t.label}
                </Box>
                {idx !== 0 && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleCloseClick(e, t.path)}
                    sx={{
                      p: 0,
                      ml: 0.5,
                      "& svg": {
                        fontSize: 14,
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </Box>
            }
          />
        ))}

        {/* + "tab" – always last, scrolls with tabs */}
        <Tab
          disableRipple
          value={tabs.length}
          label={
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 0.5,
              }}
            >
              <AddIcon sx={{ fontSize: 18 }} />
            </Box>
          }
        />
      </Tabs>
    </Box>
  );
}

// Layout.js
import React, { useState, useMemo } from "react";
import { Box, useTheme, useMediaQuery, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Collapse, IconButton, Tooltip } from "@mui/material";
import { ExpandLess, ExpandMore, Dashboard as DashboardIcon, Inventory2 as AssetsIcon, ListAlt as IncidentsIcon, Build as ServiceRequestsIcon, ChangeCircle as ChangesIcon, Report as ReportsIcon } from "@mui/icons-material";
import NavbarTabs from "./NavbarTabs";
import { Outlet, useNavigate } from "react-router-dom";

const drawerWidth = 200;
const collapsedWidth = 56;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { label: "Incidents", icon: <IncidentsIcon />, path: "/incidents" },
  { label: "Service Requests", icon: <ServiceRequestsIcon />, path: "/service-requests" },
  { label: "Changes", icon: <ChangesIcon />, path: "/changes" },
  { label: "Assets", icon: <AssetsIcon />, path: "/assets" },
  { label: "Reports", icon: <ReportsIcon />, path: "/reports" },
];

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabs, setTabs] = useState([{ label: "Dashboard", path: "/dashboard" }]);
  const [tabIndex, setTabIndex] = useState(0);

  const storedUser = useMemo(() => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : { username: "User", avatar_url: "" };
  }, []);

  const handleTabChange = (e, newIndex) => {
    setTabIndex(newIndex);
    navigate(tabs[newIndex].path);
  };

  const handleTabClose = (path) => {
    const index = tabs.findIndex((t) => t.path === path);
    if (index === -1) return;

    const newTabs = tabs.filter((t) => t.path !== path);
    setTabs(newTabs);
    if (tabIndex >= newTabs.length) setTabIndex(newTabs.length - 1);
  };

  const addTab = (tab) => {
    const exists = tabs.find((t) => t.path === tab.path);
    if (!exists) setTabs([...tabs, tab]);
    setTabIndex(tabs.findIndex((t) => t.path === tab.path) ?? tabs.length);
    navigate(tab.path);
  };

  return (
    <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh", overflow: "hidden" }}>
      {/* Sidebar */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: sidebarOpen ? drawerWidth : collapsedWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarOpen ? drawerWidth : collapsedWidth,
            boxSizing: "border-box",
            mt: "41.6px", // offset for NavbarTabs height (34.6 + 7px padding)
          },
        }}
      >
        <List>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => addTab(item)}
              sx={{ minHeight: 36, py: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
              {sidebarOpen && <ListItemText primary={item.label} />}
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: isMobile ? 0 : sidebarOpen ? `${drawerWidth}px` : `${collapsedWidth}px`,
          mt: "66.6px", // top offset = navbar + tabs (34.6 + 32)
          p: 1,
          overflowY: "auto",
        }}
      >
        <NavbarTabs
          sidebarOpen={sidebarOpen}
          sidebarWidth={drawerWidth}
          collapsedWidth={collapsedWidth}
          tabs={tabs}
          tabIndex={tabIndex}
          handleTabChange={handleTabChange}
          handleTabClose={handleTabClose}
          tabHistory={[]}
          openDrawer={() => {}}
          storedUser={storedUser}
          mode="light"
          setMode={() => {}}
          isMobile={isMobile}
        />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;

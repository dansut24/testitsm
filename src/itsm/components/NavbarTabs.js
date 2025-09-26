import React, { useRef, useState, useEffect } from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import DashboardIcon from "@mui/icons-material/Dashboard";
import BugReportIcon from "@mui/icons-material/BugReport";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import DevicesIcon from "@mui/icons-material/Devices";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import BarChartIcon from "@mui/icons-material/BarChart";
import ApprovalIcon from "@mui/icons-material/ThumbUp";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";

const REMOTE_FAVICONS = [
  "https://www.google.com/favicon.ico",
  "https://static.xx.fbcdn.net/rsrc.php/yo/r/iRmz9lCMBD2.ico",
  "https://www.bing.com/sa/simg/favicon-2x.ico",
  "https://github.githubassets.com/favicons/favicon.png",
];

const NAVBAR_HEIGHT = 48;
const SIDEBAR_WIDTH = 260;

const ROUTE_LABELS = {
  "/dashboard": { title: "Dashboard", icon: <DashboardIcon /> },
  "/incidents": { title: "Incidents", icon: <BugReportIcon /> },
  "/service-requests": { title: "Service Requests", icon: <AssignmentIcon /> },
  "/changes": { title: "Changes", icon: <ChangeCircleIcon /> },
  "/problems": { title: "Problems", icon: <ReportProblemIcon /> },
  "/assets": { title: "Assets", icon: <DevicesIcon /> },
  "/knowledge-base": { title: "Knowledge Base", icon: <MenuBookIcon /> },
  "/reports": { title: "Reports", icon: <BarChartIcon /> },
  "/approvals": { title: "Approvals", icon: <ApprovalIcon /> },
  "/profile": { title: "Profile", icon: <PersonIcon /> },
  "/settings": { title: "Settings", icon: <SettingsIcon /> },
};

const styles = `
  .navbar-container {
    width: 100%;
    position: relative;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    height: ${NAVBAR_HEIGHT}px;
  }
  .chrome-tabs-bottom-bar { display: none !important; }

  .ctn-bar { display:flex; align-items:center; width:100%; position:relative; height:100%; }
  .ctn-scroll { flex:1; overflow-x:auto; overflow-y:hidden; height:100%; }
  .ctn-scroll::-webkit-scrollbar { height:6px; }

  .chrome-tabs { background:transparent !important; height:100%; }
  .chrome-tab { background:transparent !important; height:100%; }

  .navbar-icons {
    position:absolute;
    right:8px;
    top:0;
    bottom:0;
    display:flex;
    align-items:center;
    gap:12px;
    padding:0 8px;
    z-index:5;
    background:#f8f9fa;
  }
  .navbar-logo {
    position:absolute;
    left:8px;
    top:0;
    bottom:0;
    display:flex;
    align-items:center;
    padding:0 8px;
    z-index:6;
    background:#f8f9fa;
    cursor: pointer;
  }
  .ctn-scroll { padding-right:160px; padding-left:60px; }
`;

let nextId = 1;

export default function ChromeTabsNavbar({ isMobile }) {
  const [darkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [tabs, setTabs] = useState([
    {
      id: "/dashboard",
      title: "Dashboard",
      active: true,
      favicon: REMOTE_FAVICONS[0],
      isCloseIconVisible: false,
    },
  ]);

  const scrollRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollElementIntoView = (el) => {
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const addTab = (
    title = `New Tab ${++nextId}`,
    favicon = REMOTE_FAVICONS[nextId % REMOTE_FAVICONS.length],
    id = `tab-${nextId}`
  ) => {
    setTabs((prev) => [
      ...prev.map((t) => ({ ...t, active: false })),
      { id, title, favicon, active: true },
    ]);
    requestAnimationFrame(() => {
      const newTab = scrollRef.current?.querySelector(".chrome-tab.chrome-tab-active");
      scrollElementIntoView(newTab);
    });
  };

  const openOrActivateTab = (title, id, favicon = REMOTE_FAVICONS[0]) => {
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === id);
      if (exists) return prev.map((t) => ({ ...t, active: t.id === id }));
      return [
        ...prev.map((t) => ({ ...t, active: false })),
        { id, title, favicon, active: true },
      ];
    });
    navigate(id);
  };

  const onTabActive = (id) => {
    setTabs((prev) => prev.map((t) => ({ ...t, active: t.id === id })));
    navigate(id);
  };

  const onTabClose = (id) => {
    setTabs((prev) => {
      const closing = prev.find((t) => t.id === id);
      if (closing?.isCloseIconVisible === false) return prev; // pinned
      const idx = prev.findIndex((t) => t.id === id);
      const filtered = prev.filter((t) => t.id !== id);
      if (closing?.active && filtered.length) {
        const neighbor = filtered[Math.max(0, idx - 1)];
        navigate(neighbor.id);
        return filtered.map((t) => ({ ...t, active: t.id === neighbor.id }));
      }
      return filtered;
    });
  };

  useEffect(() => {
    const path = location.pathname;
    const label = ROUTE_LABELS[path]?.title;
    if (!label) return;
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === path);
      if (exists) return prev.map((t) => ({ ...t, active: t.id === path }));
      return [
        ...prev.map((t) => ({ ...t, active: false })),
        {
          id: path,
          title: label,
          favicon: REMOTE_FAVICONS[Object.keys(ROUTE_LABELS).indexOf(path) % REMOTE_FAVICONS.length],
          active: true,
        },
      ];
    });
  }, [location.pathname]);

  return (
    <>
      <style>{styles}</style>
      <div className="navbar-container">
        {/* Left Logo triggers sidebar */}
        <div className="navbar-logo" onClick={() => setSidebarOpen(true)}>
          <img
            src="https://www.bing.com/sa/simg/favicon-2x.ico"
            alt="Logo"
            style={{ width: 28, height: 28 }}
          />
        </div>

        {/* Tabs */}
        <div className={"ctn-bar"} style={{ flex: 1 }}>
          <div ref={scrollRef} className="ctn-scroll">
            <Tabs darkMode={darkMode} onTabClose={onTabClose} onTabActive={onTabActive} tabs={tabs} />
          </div>
        </div>

        {/* Right Icons */}
        <div className="navbar-icons">
          <AddIcon
            onClick={() => addTab()}
            style={{ cursor: "pointer", fontSize: 28, fontWeight: "bold" }}
          />
          {!isMobile && (
            <>
              <SearchIcon style={{ cursor: "pointer" }} />
              <NotificationsIcon style={{ cursor: "pointer" }} />
              <AccountCircleIcon style={{ cursor: "pointer" }} />
            </>
          )}
        </div>
      </div>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{
          sx: {
            width: SIDEBAR_WIDTH,
            top: NAVBAR_HEIGHT,
          },
        }}
      >
        <List>
          {Object.entries(ROUTE_LABELS).map(([path, { title, icon }], i) => (
            <ListItemButton
              key={path}
              onClick={() => {
                openOrActivateTab(title, path, REMOTE_FAVICONS[i % REMOTE_FAVICONS.length]);
                if (isMobile) setSidebarOpen(false);
              }}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={title} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
}

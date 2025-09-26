import React, { useRef, useState } from "react";
import { Tabs } from "@sinm/react-chrome-tabs";
import "@sinm/react-chrome-tabs/css/chrome-tabs.css";
import "@sinm/react-chrome-tabs/css/chrome-tabs-dark-theme.css";

import { Menu, MenuItem, IconButton } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const REMOTE_FAVICONS = [
  "https://www.google.com/favicon.ico",
  "https://static.xx.fbcdn.net/rsrc.php/yo/r/iRmz9lCMBD2.ico",
  "https://www.bing.com/sa/simg/favicon-2x.ico",
  "https://github.githubassets.com/favicons/favicon.png",
];

const NAVBAR_HEIGHT = 48;

const styles = `
  .navbar-container {
    width: 100%;
    position: relative;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    height: ${NAVBAR_HEIGHT}px;
  }

  .navbar-container::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 4px;
    background: #ffffff;
    pointer-events: none;
    z-index: 999;
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
  }

  .ctn-scroll { padding-right:160px; padding-left:60px; }

  @media (max-width: 600px) {
    .ctn-scroll { 
      overflow-x:hidden; 
      padding-right:60px; 
      padding-left:50px; 
      display:flex; 
      justify-content:space-between; 
    }

    .chrome-tabs { display:flex !important; flex:1; }
    .chrome-tab { flex:1 1 auto !important; max-width:none !important; }
    .chrome-tab-title { font-size: 12px; text-align:center; overflow:hidden; text-overflow:ellipsis; }
  }
`;

let nextId = 1;

export default function ChromeTabsNavbar({ isMobile }) {
  const [darkMode] = useState(false);
  const [tabs, setTabs] = useState([
    { id: "/dashboard", title: "Dashboard", active: true, favicon: REMOTE_FAVICONS[0] },
  ]);

  const scrollRef = useRef(null);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const openMenu = (event) => setMenuAnchor(event.currentTarget);
  const closeMenu = () => setMenuAnchor(null);

  const scrollElementIntoView = (el, opts = { inline: "center" }) => {
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest", ...opts });
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
      const el = scrollRef.current;
      if (!el) return;
      const newTab = el.querySelector(".chrome-tab.chrome-tab-active");
      scrollElementIntoView(newTab, { inline: "center" });
    });
  };

  const openOrActivateTab = (title, id, favicon = REMOTE_FAVICONS[0]) => {
    setTabs((prev) => {
      const exists = prev.find((t) => t.id === id);
      if (exists) {
        return prev.map((t) => ({ ...t, active: t.id === id }));
      } else {
        return [
          ...prev.map((t) => ({ ...t, active: false })),
          { id, title, favicon, active: true },
        ];
      }
    });
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const activeTab = el.querySelector(".chrome-tab.chrome-tab-active");
      scrollElementIntoView(activeTab, { inline: "center" });
    });
  };

  const onTabActive = (id) => {
    setTabs((prev) => prev.map((t) => ({ ...t, active: t.id === id })));
  };

  const onTabClose = (id) => {
    setTabs((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const filtered = prev.filter((t) => t.id !== id);
      if (prev[idx]?.active && filtered.length) {
        const neighbor = filtered[Math.max(0, idx - 1)];
        return filtered.map((t) => ({ ...t, active: t.id === neighbor.id }));
      }
      return filtered;
    });
  };

  return (
    <>
      <style>{styles}</style>
      <div className="navbar-container">
        {/* Left Logo -> opens menu */}
        <div className="navbar-logo">
          <IconButton onClick={openMenu} size="small">
            <img
              src="https://www.bing.com/sa/simg/favicon-2x.ico"
              alt="Logo"
              style={{ width: 28, height: 28 }}
            />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
            {[
              { title: "Dashboard", id: "/dashboard" },
              { title: "Incidents", id: "/incidents" },
              { title: "Assets", id: "/assets" },
              { title: "Settings", id: "/settings" },
            ].map(({ title, id }, i) => (
              <MenuItem
                key={id}
                onClick={() => {
                  closeMenu();
                  openOrActivateTab(title, id, REMOTE_FAVICONS[i % REMOTE_FAVICONS.length]);
                }}
              >
                {title}
              </MenuItem>
            ))}
          </Menu>
        </div>

        {/* Tabs */}
        <div className={"ctn-bar" + (darkMode ? " dark" : "")} style={{ flex: 1 }}>
          <div ref={scrollRef} className="ctn-scroll">
            <Tabs
              darkMode={darkMode}
              onTabClose={onTabClose}
              onTabActive={onTabActive}
              tabs={tabs}
            />
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
    </>
  );
}

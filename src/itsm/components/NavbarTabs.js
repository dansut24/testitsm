{/* Close icon */}
{!tab.pinned && (
  <div
    style={{
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 16,
      height: 16,
      marginLeft: 4,
      borderRadius: "50%",
      cursor: "pointer",
      opacity: 0, // hidden by default
      transition: "opacity 0.2s ease, background 0.2s ease",
    }}
    className="tab-close-btn"
    onClick={(e) => {
      e.stopPropagation();
      handleTabClose(tab.path);
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "rgba(0,0,0,0.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
    }}
  >
    <CloseIcon style={{ fontSize: 12, pointerEvents: "none" }} />
  </div>
)}

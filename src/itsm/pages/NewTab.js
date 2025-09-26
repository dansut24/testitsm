// NewTab.js
import React from "react";
import { useParams } from "react-router-dom";

const NewTab = () => {
  const { id } = useParams();

  return (
    <div style={{ padding: 16 }}>
      <h2>New Tab {id}</h2>
      <p>This is a blank tab. You can add widgets, shortcuts, or content here.</p>
    </div>
  );
};

export default NewTab;

import React from "react";
import GameHeader from "./GameHeader";
import "./LayoutWrapper.css";

const LayoutWrapper = ({ children }) => {
  return (
    <div className="layout-container">
      <GameHeader />

      <div className="layout-content">
        {children}
      </div>
    </div>
  );
};

export default LayoutWrapper;

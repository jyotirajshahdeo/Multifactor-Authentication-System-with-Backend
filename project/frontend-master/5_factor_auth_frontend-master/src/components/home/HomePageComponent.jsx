import React from "react";
import Sidebar from "./SideNavBar";

const HomePageComponent = ({ children }) => {
  const styles = {
    container: {
      display: "grid",
      gridTemplateColumns: "1fr",
      minHeight: "100vh",
      position: "relative",
      width: "75%",
    },
    sidebarContainer: {
      gridColumn: "span 3",
      display: "none",
      borderRight: "1px solid #d1d5db",
    },
    contentContainer: {
      gridColumn: "span 12",
      display: "block",
    },
    rightContainer: {
      gridColumn: "span 3",
      display: "none",
      borderLeft: "1px solid #d1d5db",
    },
    // Responsive styles for grid
    "@media (min-width: 640px)": {
      sidebarContainer: {
        display: "block",
      },
      contentContainer: {
        gridColumn: "span 10",
      },
      rightContainer: {
        display: "block",
      },
    },
    "@media (min-width: 1024px)": {
      contentContainer: {
        gridColumn: "span 10",
      },
    },
    "@media (min-width: 1280px)": {
      sidebarContainer: {
        gridColumn: "span 3",
      },
      contentContainer: {
        gridColumn: "span 6",
      },
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebarContainer}>
        <Sidebar />
      </div>
      <div style={styles.contentContainer}>{children}</div>
      <div style={styles.rightContainer}></div>
    </div>
  );
};

export default HomePageComponent;

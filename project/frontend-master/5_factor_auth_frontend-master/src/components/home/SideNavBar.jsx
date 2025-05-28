import { FaHome, FaSearch, FaRegLightbulb } from "react-icons/fa";
import { MdOutlineExplore } from "react-icons/md";
import { AiOutlineMessage } from "react-icons/ai";
import { CiHeart, CiSquarePlus } from "react-icons/ci";
import { GiEgyptianProfile } from "react-icons/gi";
import { FaBarsStaggered } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [isSetting, setSetting] = useState(false);

  const toggleSlider = () => {
    setIsOpen(true);
  };

  const handlerOpen = () => {
    setSetting((prev) => !prev);
  };

  const styles = {
    sidebar: {
      width: "250px",
      height: "100vh",
      backgroundColor: "#fff",
      boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      padding: "20px",
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
    },
    logo: {
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "40px",
      textAlign: "center",
    },
    navList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    navItem: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "18px",
      color: "#374151",
      cursor: "pointer",
      transition: "color 0.2s",
      textDecoration: "none",
    },
    navItemActive: {
      color: "#4f46e5",
      fontWeight: "600",
    },
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>Logo Here</div>

      <ul style={styles.navList}>
        <NavLink
          to="/"
          style={({ isActive }) =>
            isActive
              ? { ...styles.navItem, ...styles.navItemActive }
              : styles.navItem
          }
        >
          <li style={styles.navItem}>
            <FaHome />
            <span>Home</span>
          </li>
        </NavLink>

        <li style={styles.navItem} onClick={toggleSlider}>
          <FaSearch />
          <span>Search</span>
        </li>

        <NavLink
          to="/facts"
          style={({ isActive }) =>
            isActive
              ? { ...styles.navItem, ...styles.navItemActive }
              : styles.navItem
          }
        >
          <li style={styles.navItem}>
            <FaRegLightbulb />
            <span>Facts</span>
          </li>
        </NavLink>

        <NavLink
          to="/explore"
          style={({ isActive }) =>
            isActive
              ? { ...styles.navItem, ...styles.navItemActive }
              : styles.navItem
          }
        >
          <li style={styles.navItem}>
            <MdOutlineExplore />
            <span>Explore</span>
          </li>
        </NavLink>

        <NavLink
          to="/messages"
          style={({ isActive }) =>
            isActive
              ? { ...styles.navItem, ...styles.navItemActive }
              : styles.navItem
          }
        >
          <li style={styles.navItem}>
            <AiOutlineMessage />
            <span>Messages</span>
          </li>
        </NavLink>

        <li style={styles.navItem}>
          <CiHeart />
          <span>Notifications</span>
        </li>

        <li style={styles.navItem} onClick={() => setIsCreate(!isCreate)}>
          <CiSquarePlus />
          <span>Create</span>
        </li>

        <NavLink
          to="/profile"
          style={({ isActive }) =>
            isActive
              ? { ...styles.navItem, ...styles.navItemActive }
              : styles.navItem
          }
        >
          <li style={styles.navItem}>
            <GiEgyptianProfile />
            <span>Profile</span>
          </li>
        </NavLink>

        <li style={styles.navItem} onClick={handlerOpen}>
          <FaBarsStaggered />
          <span>More</span>
        </li>
      </ul>
    </aside>
  );
}

import React from "react";
import { User } from "../../constant/Constdata";

const styles = {
  container: {
    display: "flex",
    gap: "16px",
    overflowX: "auto",
    padding: "16px 20px",
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE & Edge
  },
  storyWrapper: {
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "transform 0.3s ease-in-out",
  },
  gradientBorder: {
    borderRadius: "50%",
    width: "82px",
    height: "82px",
    background: "linear-gradient(to top right, #facc15, #ec4899, #ef4444)",
    padding: "2px",
    boxSizing: "border-box",
  },
  whiteCircle: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    padding: "2px",
    boxSizing: "border-box",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid white",
    display: "block",
  },
  username: {
    fontFamily: "Poppins, sans-serif",
    fontWeight: 500,
    color: "#000000",
    fontSize: "14px",
    marginTop: "8px",
    maxWidth: "80px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "center",
  },
};

const Story = () => {
  return (
    <div
      style={styles.container}
      className="no-scrollbar"
    >
      {User?.userStoryData?.map((story, i) => (
        <div
          key={i}
          style={styles.storyWrapper}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div style={styles.gradientBorder}>
            <div style={styles.whiteCircle}>
              <img
                src={`${story.image}`}
                alt={`${story.username}'s story`}
                style={styles.image}
              />
            </div>
          </div>
          <p style={styles.username}>{story.username}</p>
        </div>
      ))}
    </div>
  );
};

export default Story;

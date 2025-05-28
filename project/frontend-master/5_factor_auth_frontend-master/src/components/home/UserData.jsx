import React from "react";
import { FaHeart } from "react-icons/fa";
import { RiTelegram2Fill } from "react-icons/ri";
import { FaRegComment } from "react-icons/fa";
import { LuDownload } from "react-icons/lu";

const UserData = ({ item }) => {
  const styles = {
    container: {
      marginTop: 20,
      paddingLeft: 24,
      paddingRight: 24,
      fontFamily: "Poppins, sans-serif",
    },
    card: {
      borderBottom: "1px solid #94a3b8",
      padding: "20px 0",
    },
    header: {
      display: "flex",
      gap: 8,
      alignItems: "center"
    },
    avatar: {
      borderRadius: "50%",
      width: 54,
      height: 54,
    },
    info: {
      flex: 1,
    },
    name: {
      color: "#141619",
      fontSize: 14,
      fontWeight: "bold",
    },
    username: {
      color: "#687684",
      marginLeft: 4,
    },
    description: {
      color: "#141619",
      fontSize: 12,
      textAlign: "justify",
    },
    hashtag: {
      color: "#4c9eeb",
      marginLeft: 4,
    },
    imageWrapper: {
      margin: "10px 0",
    },
    image: {
      width: "100%",
      borderRadius: 21,
      border: "1px solid #d1d5db",
      objectFit: "cover",
    },
    iconRow: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: 5,
      paddingLeft: 15,
      paddingRight: 15,
      width:'200px'
    },
    icon: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 16,
      color:"#000000"
    },
    thread: {
      color: "#1da1f2",
      fontSize: 12,
      marginTop: 4,
      paddingLeft: 15,
      paddingRight: 15,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img src={item?.profileImage} alt="Profile" style={styles.avatar} />
          <div style={styles.info}>
            <p style={styles.name}>
              {item?.name}
              <span style={styles.username}>@{item?.usename}</span>
            </p>
            <p style={styles.description}>
              {item?.description}
              <span style={styles.hashtag}>{item?.hashTag}</span>
            </p>
          </div>
        </div>

        <div style={styles.iconRow}>
          <span style={styles.icon}>
            <FaHeart color="red" />
            {item?.like}
          </span>
          <span style={styles.icon}>
            <FaRegComment color="black" />
            {item?.comment}
          </span>
          <span style={styles.icon}>
            <RiTelegram2Fill color="black" />
            {item?.share}
          </span>
          <span style={styles.icon}>
            <LuDownload color="black" />
            {item?.download}
          </span>
        </div>

        {item?.thread && <p style={styles.thread}>{item?.thread}</p>}
      </div>
    </div>
  );
};

export default UserData;

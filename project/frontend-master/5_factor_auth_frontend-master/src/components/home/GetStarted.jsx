import React from "react";
import { CiImageOn } from "react-icons/ci";
import { MdOutlineGifBox } from "react-icons/md";
import { ImParagraphLeft } from "react-icons/im";
import { BsEmojiSmile } from "react-icons/bs";
import { RiCalendarScheduleLine } from "react-icons/ri";

const GetStarted = () => {
  const styles = {
    container: {
      textAlign: "center",
    },
    animationContainer: {
      width: "76px",
      height: "76.85px",
    },
    headingText: {
      fontSize: "20px",
      textAlign: "center",
      fontFamily: "Poppins, sans-serif",
      fontWeight: "600",
      paddingLeft: "8px",
      paddingRight: "8px",
      color: "#000000",
    },
    subheading: {
      fontSize: "13px",
      textAlign: "center",
      fontFamily: "Poppins, sans-serif",
      fontWeight: "500",
      color: "#000000",
    },
    selectContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "1.75rem",
      marginTop: "1rem",
      fontFamily: "Open Sans, sans-serif",
      fontSize: "14px",
    },
    select: {
      outline: "none",
      padding: "8px 10px",
      borderRadius: "8px",
      border: "1px solid #DDDDDD",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "center",
      gap: "1rem",
      marginTop: "1rem",
    },
    button: {
      padding: "8px 16px",
      fontFamily: "Poppins, sans-serif",
      fontWeight: "500",
      borderRadius: "6px",
      cursor: "pointer",
    },
    getStartedButton: {
      border: "1px solid #18181B",
      color: "#ffffff",
    },
    vibeButton: {
      backgroundColor: "#18181B",
      color: "white",
    },
    imageContainer: {
      width: "177px",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    userImageContainer: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      overflow: "hidden",
    },
    postButtonContainer: {
      backgroundColor: "#1DA1F2",
      borderRadius: "40px",
      width: "102.67px",
      height: "52px",
    },
    postButton: {
      fontSize: "20px",
      color: "white",
      textAlign: "center",
      padding: "7px 16px",
    },
    iconContainer: {
      display: "flex",
      gap: "1rem",
    },
    icon: {
      fontSize: "25px",
    },
  };

  return (
    <div style={styles.container}>
      <div className="flex justify-center items-center">
        <div style={styles.animationContainer}>
          <img
            src="/images/Home/Animation1739875943515.gif"
            alt=""
            className="h-full w-full"
          />
        </div>
      </div>
      <div>
        <p style={styles.headingText}>
          Your Newyear Holds Secrets!
          <br /> Let’s
        </p>
        <h1 style={styles.headingText}>Uncover Them</h1>
      </div>
      <div>
        <h1 style={styles.subheading}>
          Enter Your Date & Unlock Your Fame Connection!
        </h1>
      </div>
      <div style={styles.selectContainer}>
        <select name="date" id="date" style={styles.select}>
          <option value="date">1</option>
          <option value="date">2</option>
          <option value="date">3</option>
          <option value="date">4</option>
          <option value="date">5</option>
          <option value="date">6</option>
          <option value="date">7</option>
          <option value="date">8</option>
          <option value="date">9</option>
          <option value="date">10</option>
        </select>
        <select name="month" id="month" style={styles.select}>
          <option value="month">Jan</option>
          <option value="month">Feb</option>
          <option value="month">Mar</option>
          <option value="month">Apr</option>
          <option value="month">May</option>
          <option value="month">Jun</option>
          <option value="month">Jul</option>
          <option value="month">Aug</option>
          <option value="month">Sep</option>
          <option value="month">Oct</option>
          <option value="month">Nov</option>
          <option value="month">Dec</option>
        </select>
        <select name="year" id="year" style={styles.select}>
          <option value="year">2000</option>
          <option value="year">2001</option>
          <option value="year">2002</option>
          <option value="year">2003</option>
          <option value="year">2004</option>
          <option value="year">2005</option>
          <option value="year">2006</option>
          <option value="year">2007</option>
          <option value="year">2008</option>
          <option value="year">2009</option>
        </select>
      </div>
      <div style={styles.buttonContainer}>
        <button style={{ ...styles.button, ...styles.getStartedButton }}>
          Get Started
        </button>
        <button style={{ ...styles.button, ...styles.vibeButton }}>
          Match Your Vibe 🥰
        </button>
      </div>
      

      <div className="hidden px-6 border-b-[1px] border-gray-400 sm:block sm:mb-6">
        <div className="flex">
          <h1
            style={{
              color: "#000000",
            }}
          >
            What’s happening?
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "2.5rem",
            marginBottom: "0.75rem",
          }}
        >
          <div style={styles.iconContainer}>
            <span style={styles.icon}>
              <CiImageOn color="black" />
            </span>
            <span style={styles.icon}>
              <MdOutlineGifBox color="black"  />
            </span>
            <span style={styles.icon}>
              <ImParagraphLeft color="black"  />
            </span>
            <span style={styles.icon}>
              <BsEmojiSmile color="black"  />
            </span>
            <span style={styles.icon}>
              <RiCalendarScheduleLine color="black"  />
            </span>
          </div>
            <button style={styles.postButton}>Post</button>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;

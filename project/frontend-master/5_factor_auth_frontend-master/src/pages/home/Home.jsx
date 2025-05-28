import GetStarted from "../../components/home/GetStarted";
import HomePageComponent from "../../components/home/HomePageComponent";
import Story from "../../components/home/Story";
import UserPostData from "../../components/home/UserPostData";

const Home = () => {
  const styles = {
    container: {
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(to bottom right, #f3f4f6, #e5e7eb)",
      padding: "20px",
      boxSizing: "border-box",
      position: "absolute",
      top: 0,
      overflow: "hidden",
    },
  };
  return (
    <div style={styles.container}>
      <HomePageComponent>
        <div>
          <Story />
          <GetStarted />
          <UserPostData />
        </div>
      </HomePageComponent>
    </div>
  );
};

export default Home;

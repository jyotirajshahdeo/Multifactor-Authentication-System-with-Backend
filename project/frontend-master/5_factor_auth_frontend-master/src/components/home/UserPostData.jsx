import React from "react";
import { UserPostsData } from "../../constant/Constdata";

import UserData from "./UserData";

const UserPostData = () => {
  return (
    <>
      {UserPostsData.map((item, index) => (
        <div key={index}>
          <UserData item={item} />
        </div>
      ))}
    </>
  );
};

export default UserPostData;

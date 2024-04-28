import "./userInfo.css";
import { useUserStore } from "../../../lib/userStore";
import { auth } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import { useState } from "react";

const UserInfo = () => {
  const [visible, setVisible] = useState(true);
  const { currentUser } = useUserStore();
  const { resetChat } = useChatStore();

  const handleLogout = () => {
    auth.signOut();
    resetChat();
  };
  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        <button className="logout" onClick={handleLogout} disabled={visible}>
          Logout
        </button>
        <img src="./more.png" alt="" onClick={() => setVisible(!visible)} />
        <div className="notAllowed">
          <img src="./video.png" alt=""/>
        </div>
        <div className="notAllowed">
          <img src="./edit.png" alt=""/>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;

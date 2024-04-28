import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { CSSTransition } from 'react-transition-group';

const Chat = ({ setDetail, detail, setDisplayOff }) => {
  const [showAvatar, setShowAvatar] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  useEffect(() => {
    handleSend();
  }, [img]);

  const handleEmoji = (e) => {
    setText(text + e.emoji);
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (text === "" && img.file === null) return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file, setProgress);
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }

    setImg({
      file: null,
      url: "",
    });

    setText("");
  };
  
  const detailOpenHandle = () =>{
    setDetail(!detail)
    setDisplayOff(detail ? "chat": "detail")
  }
  const handleClick = () => {
    setShowAvatar(!showAvatar);
  };
  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" onClick={handleClick}/>
          
          <CSSTransition in={showAvatar} timeout={200} classNames="my-node" unmountOnExit>
            <img src={user?.avatar || "./avatar.png"}  className="showAvatar" onClick={handleClick}/>
          </CSSTransition>
          
          
          <div className="texts" onClick={()=>detailOpenHandle()} >
            <span>{user?.username}</span>
            <p>{user?.email}</p>
          </div>
        </div>
        <div className="icons">
          <div className="notAllowed">
            <img src="./phone.png" alt="" />
          </div>
          <div className="notAllowed">
            <img src="./video.png" alt="" />
          </div>
          <div className="Allowed">
            <img src="./info.png" alt="" onClick={()=>detailOpenHandle()} />
          </div>
          
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message.createdAt} >
            {console.log(message.createdAt)}
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              {message.text.trim().length > 0 && <p>{message.text}</p>}
              {new Date(message.createdAt.seconds * 1000).toLocaleString()}
            </div>
          </div>
        ))}
        <div className="progress">{progress > 0 && <p>Uploading: {progress}%</p>}</div>

        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" className="Allowed" />
          </label>
          <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />

          <div className="notAllowed">
            <img src="./camera.png" alt="" />
          </div>
          <div className="notAllowed">
            <img src="./mic.png" alt="" />
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You cannot write a message" : "Type message..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          />
          <div className="emoji">
            <img src="./emoji.png" alt="" onClick={() => setOpen(!open)} className="Allowed" />
            <div className="picker">
              <EmojiPicker open={open} onEmojiClick={handleEmoji} style={{width:"250px", height:"350px"}}/>
            </div>
          </div>
          <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

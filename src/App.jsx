import { useEffect, useState } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
//
import { LuPanelRightOpen } from "react-icons/lu";
import { LuPanelLeftOpen } from "react-icons/lu";
import { IoReturnDownBack } from "react-icons/io5";
//

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  
  
  
  const [displayOff, setDisplayOff] = useState('list')
  const [detail, setDetail] = useState(displayOff=="detail");
  const [list, setList] = useState(displayOff=="list");//ss
  
  

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading...</div>;
  
  
  const listHandle = (name) =>{
    setList(!list)
    setDisplayOff(name)
  }
  const listDetail = (name) =>{
    setDetail(!detail)
    setDisplayOff(name)
  }
  console.log(displayOff);
  return (
    <div className="container">
      {currentUser ? (
        <>
        <div className={ displayOff==="list" ?  'mainChat' : "displayOff"}>
          <List setDisplayOff={setDisplayOff}/>
        </div>
          { chatId &&
          <> 
            {!detail && <span className="closeModal">
              { list ? <LuPanelRightOpen className="dropCloseList" onClick={()=>listHandle('list')}/> : <LuPanelLeftOpen className="dropCloseList" onClick={()=>listHandle('chat')}/>}
            </span>}
            <div className={ displayOff==="chat" ?  ''  : "displayOff"}>
              <Chat setDetail={setDetail} detail={detail} setDisplayOff={setDisplayOff} />
            </div>
            
            {displayOff==="detail" && <IoReturnDownBack className="dropCloseList closeDetail" onClick={()=>listDetail('chat')}/>}
            
            <div className={ displayOff==="detail" ? 'mainDetail' :  "displayOff" }>
              { detail && <Detail/>}
            </div>
          </>
          }
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;


// исправить uploading чтобы после 100 оставался на жкаране и спустя пару секунд пропадал

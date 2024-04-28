import ChatList from './chatList/ChatList'
import './list.css'
import UserInfo from './userInfo/UserInfo'

const List = ({setDisplayOff}) => {
  return (
    <div className='list'>
      <UserInfo/>
      <ChatList setDisplayOff={setDisplayOff}/>
    </div>
  )
}

export default List
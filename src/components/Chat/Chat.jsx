import React, { useEffect, useState } from 'react';
import './Chat.css';
// import { IconButton } from '@material-ui/core';
// import MicNoneIcon from '@material-ui/icons/MicNone';
import Message from '../Message/Message';
// import { useSelector } from 'react-redux';
// import { selectUser } from '../../../features/userSlice';
// import { selectChatId, selectChatName } from '../../../features/chatSlice';
// import db from '../../../firebase/config';
// import firebase from 'firebase';
// import FlipMove from 'react-flip-move';

let exampleMessages = [{
  timestamp: new Date(),
  message: "Hello world",
  uid: "gptcha",
  photo: "",
  email: "",
  displayName: "",
}]

function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(exampleMessages);
  // const user = useSelector(selectUser);
  // const chatName = useSelector(selectChatName);
  // const chatId = useSelector(selectChatId);
  // console.log(user);
  useEffect(() => {
    // if (chatId) {
      // TODO: replace with call to get messages
      // db.collection('chats')
      //   .doc(chatId)
      //   .collection('messages')
      //   .orderBy('timestamp', 'asc')
      //   .onSnapshot((snapshot) =>
      //     setMessages(
      //       snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
      //     )
      //   );
    // }
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    // db.collection('chats').doc(chatId).collection('messages').add({
    //   timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    //   message: input,
    //   uid: user.uid,
    //   photo: user.photo,
    //   email: user.email,
    //   displayName: user.displayName,
    // });
    setInput('');
  };

  return (
    <div className="chat">
      <div className="chat__header">
        <h4>
          <span className="chat__name">{"GPTCHA"}</span>
        </h4>
        <strong>Details</strong>
      </div>

      {/* Chat  messages */}
      <div className="chat__messages">
          {messages.map(({ id, ...data }) => (
            <Message key={id} id={id} contents={data} />
          ))}
        {/* <FlipMove>
        </FlipMove> */}
      </div>

      {/* Chat  input*/}
      <div className="chat__input">
        <form>
          <input
            type="text"
            placeholder="iMessage"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={sendMessage}>Send Message</button>
        </form>
        {/* <IconButton>
          <MicNoneIcon />
        </IconButton> */}
      </div>
    </div>
  );
}

export default Chat;
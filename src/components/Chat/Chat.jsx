import React, { useEffect, useState } from 'react';
import './Chat.css';
// import { IconButton } from '@material-ui/core';
// import MicNoneIcon from '@material-ui/icons/MicNone';

import { ChatContainer, MessageList, Message } from '@chatscope/chat-ui-kit-react';
// import { useSelector } from 'react-redux';
// import { selectUser } from '../../../features/userSlice';
// import { selectChatId, selectChatName } from '../../../features/chatSlice';
// import db from '../../../firebase/config';
// import firebase from 'firebase';
// import FlipMove from 'react-flip-move';

let exampleMessages = [{
  timestamp: new Date(),
  text: "Hello world",
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
    <ChatContainer>
    <MessageList>
      <Message model={{
          message: "Hello world",
          sentTime: "just now",
          sender: "Joe"
        }} />
      {messages.map((message) => {
        <Message model={{
          ...message,
            message: message.text,
            sentTime: message.timestamp,
            sender: message.displayName
          }} />
      })}
    </MessageList>
    </ChatContainer>
  );
}

export default Chat;
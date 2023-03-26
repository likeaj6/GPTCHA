import React, { useEffect, useState } from 'react';
import './Chat.css';
// import { IconButton } from '@material-ui/core';
// import MicNoneIcon from '@material-ui/icons/MicNone';
import { ChatContainer, MessageList, Message, Avatar, MessageInput } from '@chatscope/chat-ui-kit-react';
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

// function Highlight({ children, highlightIndex, ...props }) {
//   let backgroundColorForText = children == "Andrew:" ? hexToRgbA(Colors.shadowColor, 0.2) : hexToRgbA(Colors.positiveGreenColor, 0.2);
//   // console.log("highlight children", children, props)
//   return (
//     <mark style={{
//       backgroundColor: backgroundColorForText,
//       fontSize: 14,
//       fontFamily: "Inter-SemiBold",
//       color: Colors.darkBlackColor,
//     }}>
//       <strong className="mark">
//         {children}
//       </strong>
//     </mark>
//   )
// };




function Chat(props) {
  const { messages, chatHeight } = props
  const [input, setInput] = useState('');
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

  const sendMessage = () => {
    // e.preventDefault();
    props.sendMessage(input)
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

  console.log("messages", messages)
  return (
    <ChatContainer>
      <MessageList style={{
        height: chatHeight ?? "33vh", overflow: "scroll", padding: 16, borderRadius: 8
      }}>
        {/* <Message model={{
            message: "Hello world",
            sentTime: "just now",
            sender: "Joe"
          }} /> */}
        {messages.map((message) => {
          if (!message || !message.text || !message.uid || !message.displayName) {
            return null
          }
          const { displayName, photo } = message
          return (<Message model={{
              ...message,
              message: message.text,
              sentTime: message.timestamp,
              sender: message.displayName
            }}>
              <Avatar src={photo} name={displayName} />
            </Message>)
        })}
      </MessageList>
      {process.env.NODE_ENV == "development" && props.showMessageInput && <MessageInput
        onChange={(innerHtml, textContent, value, nodes) => setInput(value)}
        onSend={sendMessage}
      />}
    </ChatContainer>
  );
}

export default Chat;
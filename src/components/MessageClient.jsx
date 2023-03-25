import React, { useState, useEffect } from 'react';
import Chat from './Chat/Chat';

import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
  import RecordView from './AudioRecorder/Recorder';
import { LoremIpsum } from "lorem-ipsum";

// import './Message.css';

let GPTLogo = "https://seeklogo.com/images/C/chatgpt-logo-02AFA704B5-seeklogo.com.png"
let roboIcon = "";
let exampleMessages = [{
  timestamp: new Date(),
  text: "Hello world",
  uid: "gptcha",
  photo: GPTLogo,
  email: "",
  displayName: "GPTCha",
}]

function MessageClient() {
  const [messages, setMessages] = useState(exampleMessages);

  const addMessage = (message) => {
    setMessages((messages) => [...messages, message]);
  }

  // useEffect(() => {
  //   setInterval(() => {
  //     const lorem = new LoremIpsum();
  //     addMessage({
  //       timestamp: new Date(),
  //       text: lorem.generateSentences(1),
  //       uid: "gptcha",
  //       photo: "",
  //       email: "",
  //       displayName: "",
  //     });
  //   }, 2000);
  // }, [])
  return (
    <div className="Message">
      <div style={{ position:"relative", height: "100%" }}>
        <RecordView onRecordStarted={() => {
          const lorem = new LoremIpsum();
          let isGPTMessage = Math.random() < 0.5
          let testMessage = {
            timestamp: new Date(),
            text: lorem.generateSentences(1),
            uid: isGPTMessage ? "robo-caller": "gptcha",
            photo: GPTLogo,
            email: "",
            displayName: isGPTMessage ? "GPTCha": "Robot Caller",
          }
          addMessage(testMessage);
          // setMessages([...messages, testMessage]);
        }} onUpload={() => {}}/>
        <MainContainer>
          <Chat messages={messages}/>
        </MainContainer>
      </div>
    </div>
  );
}

export default MessageClient
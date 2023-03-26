import React, { useState, useEffect } from 'react';
import Chat from './Chat/Chat';

import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
  import RecordView from './AudioRecorder/Recorder';
import { LoremIpsum } from "lorem-ipsum";
import chatApi from '../api/chat'
import { Button } from '@chakra-ui/react';

// import './Message.css';

let GPTLogo = "https://seeklogo.com/images/C/chatgpt-logo-02AFA704B5-seeklogo.com.png"
let roboIcon = "https://github.com/likeaj6/GPTCHA/blob/main/src/assets/robot.jpeg?raw=true";
let exampleMessages = [{
  timestamp: new Date(),
  text: "Hello, I'm GPTCha. Who are you calling?",
  uid: "gptcha",
  photo: GPTLogo,
  email: "",
  direction: "outgoing",
  displayName: "GPTCha",
}]

function MessageClient() {
  const [messages, setMessages] = useState(exampleMessages);
  const [messageIsStreaming, setMessageIsStreaming] = useState(false);

  const addMessage = (message) => {
    setMessages((messages) => [...messages, message]);
  }

  const generateNextRoboMessage = async (messages) => {
    setMessageIsStreaming(true)
    chatApi.generateRoboMessage().then((response) => {
      setMessageIsStreaming(false)
      addMessage(response.data.messages)
    })
  }

  const generateNextGuardianMessage = async (messages) => {
    setMessageIsStreaming(true)
    chatApi.generateGuardianMessage().then((response) => {
      setMessageIsStreaming(false)
      addMessage(response.data.messages)
    })
  }

  useEffect(() => {
    chatApi.generateRoboMessage().then((response) => {
      setMessageIsStreaming(false)
      let messages = response.data.messages
      if (messages.length > 0) {
        messages.map((message) => addMessage(response.data.messages))
      }
    })
  }, [])

  return (
    <div className="Message">
      <div style={{ position:"relative" }}>
        <RecordView onRecordStarted={() => {
          const lorem = new LoremIpsum();
          let isGPTMessage = Math.random() < 0.5
          let testMessage = {
            timestamp: new Date(),
            text: lorem.generateSentences(1),
            uid: isGPTMessage ? "robo-caller": "gptcha",
            direction: isGPTMessage ? "outgoing": "incoming",
            photo: isGPTMessage ? GPTLogo: roboIcon,
            email: "",
            displayName: isGPTMessage ? "GPTCha": "Robot Caller",
          }
          addMessage(testMessage);
          // setMessages([...messages, testMessage]);
        }} onUpload={() => {}}/>
        <MainContainer className='flex w-full my-8'>
          <Chat 
            messages={messages}
            messageIsStreaming={messageIsStreaming}
          />
        </MainContainer>
        <div className='align-center items-center'>
          <Button 
            loadingText='Loading'
            isLoading={messageIsStreaming} disabled={messageIsStreaming} onClick={async () => {
            generateNextRoboMessage(messages)
          }}>
            Generate next robo message
          </Button>
          <Button 
            colorScheme={"teal"}
            loadingText='Loading'
            isLoading={messageIsStreaming} disabled={messageIsStreaming} onClick={async () => {
            generateNextGuardianMessage(messages)
          }}>
            Generate next grandma message
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MessageClient
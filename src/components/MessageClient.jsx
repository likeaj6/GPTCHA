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
let exampleMessages = []
// let exampleMessages = [{
//   timestamp: new Date(),
//   text: "Hello, I'm GPTCha. Who are you calling?",
//   uid: "gptcha",
//   photo: GPTLogo,
//   email: "",
//   direction: "outgoing",
//   displayName: "GPTCha",
// }]

function MessageClient() {
  const [messages, setMessages] = useState(exampleMessages);
  const [messageIsStreaming, setMessageIsStreaming] = useState(false);

  const addMessage = (message) => {
    setMessages((messages) => [...messages, message]);
  }

  const generateNextRoboMessage = async (currentMessages) => {
    setMessageIsStreaming(true)
    chatApi.generateRoboMessage(currentMessages).then((response) => {
      setMessageIsStreaming(false)
      let newMessages = response.data.messages
      if (newMessages.length > 0) {
        // messages.map((message) => addMessage(message))
        setMessages(newMessages)
      }
      if (newMessages.length < 5) {
        setTimeout(() => {
          generateNextGuardianMessage(newMessages)
        }, 1000)
      }
    })
  }

  const generateNextGuardianMessage = async (currentMessages) => {
    setMessageIsStreaming(true)
    chatApi.generateGuardianMessage(currentMessages).then((response) => {
      setMessageIsStreaming(false)
        let newMessages = response.data.messages
        if (newMessages.length > 0) {
          setMessages(newMessages)
          // messages.map((message) => addMessage(message))
        }
        if (newMessages.length < 5) {
          setTimeout(() => {
            generateNextRoboMessage(newMessages)
          }, 1000)
        }

    })
  }

  useEffect(() => {
    // generate initial response upon picking up
    chatApi.generateGuardianMessage().then((response) => {
      setMessageIsStreaming(false)
      console.log("response", response)
        let newMessages = response.data.messages
      if (newMessages.length > 0) {
        // messages.map((message) => addMessage(message))
        setMessages(newMessages)
      }
      generateNextRoboMessage(newMessages)
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
        }} onUpload={() => {}}>

          <MainContainer className='flex w-full my-8 rounded-lg'>
            <Chat 
              messages={messages}
              messageIsStreaming={messageIsStreaming}
            />
          </MainContainer>
          <div className='flex w-full align-center items-center'>
            <Button 
              loadingText='Loading'
              className="mr-2"
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
        </RecordView>
      </div>
    </div>
  );
}

export default MessageClient
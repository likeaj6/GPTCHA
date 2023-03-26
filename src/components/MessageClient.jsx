import React, { useState, useEffect } from 'react';
import Chat from './Chat/Chat';

import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
  import RecordView from './AudioRecorder/Recorder';
import { LoremIpsum } from "lorem-ipsum";
import chatApi from '../api/chat'
import { Button, Text, Container } from '@chakra-ui/react';

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
    })
  }, [])

  let NUM_INITIAL_MESSAGES = 5

  useEffect(() => {
    console.log()
    if (messages.length > 0 && messages.length < NUM_INITIAL_MESSAGES && messages.slice(-1).pop().uid == "gptcha") {
      generateNextRoboMessage(messages)
    }
    if (messages.length > 0 && messages.length < NUM_INITIAL_MESSAGES && messages.slice(-1).pop().uid == "robo-caller") {
      generateNextGuardianMessage(messages)
    }
  }, [messages])

  let roboScore = Math.min(Math.round(Math.random()*100) + 50, 100)

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

          <MainContainer className='flex w-full my-8 rounded-lg border border-solid border-gray-100'>
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
          <Container className="border border-solid border-gray-300 rounded-lg p-4 my-8">
            <Text
              className='uppercase font-bold font-lg'
              style={{
                color: roboScore > 60 ? "red": "green"
              }}
            >Robo-score: {roboScore}</Text>
          </Container>
        </RecordView>
      </div>
    </div>
  );
}

export default MessageClient
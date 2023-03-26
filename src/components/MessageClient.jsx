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
let exampleThoughts = [{
  timestamp: new Date(),
  text: "GPTCHA's internal logic",
  uid: "gptcha",
  photo: GPTLogo,
  email: "",
  direction: "outgoing",
  displayName: "GPTCha",
}]

function MessageClient() {
  const [messages, setMessages] = useState(exampleMessages);
  const [thoughts, setThoughts] = useState(exampleThoughts);
  const [messageIsStreaming, setMessageIsStreaming] = useState(false);
  const [currentAudioStreamUrl, setCurrentAudioStreamUrl] = useState(null);
  const [currentAudioUser, setCurrentAudioUser] = useState("gptcha");
  const [audioQueue, setAudioQueue] = useState([]);
  const [allAudio, setAllAudio] = useState([]);
  const [playingAudio, setPlayingAudio] = useState(true);

  const addMessage = (message) => {
    setMessages((messages) => [...messages, message]);
  }
  const addThoughts = (message) => {
    setThoughts((messages) => [...messages, message]);
  }

  const generateNextRoboMessage = async (currentMessages) => {
    setMessageIsStreaming(true)
    chatApi.generateRoboMessage(currentMessages).then((response) => {
      setMessageIsStreaming(false)
      let newMessages = response.data.messages
      if (newMessages.length > 0) {
        // messages.map((message) => addMessage(message))
        setMessages(newMessages)
        generateAudioSynthesis(newMessages)
      }
    })
  }

  const generateNextGuardianMessage = async (currentMessages) => {
    setMessageIsStreaming(true)
    chatApi.generateGuardianMessage(currentMessages).then((response) => {
      setMessageIsStreaming(false)
        let newMessages = response.data.messages
        let newThoughts = response.data.thoughts
        if (newMessages.length > 0) {
          setMessages(newMessages)
          generateAudioSynthesis(newMessages)
          // messages.map((message) => addMessage(message))
        }
        console.log("newThoughts", newThoughts)
        if (newThoughts.length > 0) {
          setThoughts(newThoughts)
          // thoughts.map((message) => addThoughts(message))
        }
    })
  }

  const generateAudioSynthesis = async (currentMessages) => {
    let mostRecentMessage = currentMessages.slice(-1).pop()
    let isGPTMessage = mostRecentMessage.uid == "gptcha"
    let indian_male = "FeRac7RecyPzJ8JYNgQL"
    let american_female_old = "RgXs1J7z2juXOZc1xQ6t"
    let modelName = isGPTMessage ? american_female_old: indian_male
    // let modelName = isGPTMessage ? '21m00Tcm4TlvDq8ikWAM': 'TxGEqnHWrfWFTfGW9XjX'
    if (mostRecentMessage) {
      chatApi.generateSpeechFromText(mostRecentMessage.text, modelName).then((response) => {
        console.log("response", response)
        let audioBlob = response.data
        const blob = new Blob([audioBlob], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        console.log("audioUrl", audioUrl)
        if (audioQueue.length > 0) {
          setAudioQueue((audioQueue) => [...audioQueue, audioUrl])
        } else {
          setCurrentAudioStreamUrl(audioUrl)
          setCurrentAudioUser(mostRecentMessage.uid)
        }
        setAllAudio((allAudio) => [...allAudio, audioUrl])
        setPlayingAudio(true)
      })
    }
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
        generateAudioSynthesis(newMessages)
      }
    })
  }, [])

  const onStopPlaying = () => {
    if (audioQueue.length > 0) {
      let newAudioQueue = audioQueue.slice(1)
      setAudioQueue(newAudioQueue)
      setCurrentAudioStreamUrl(newAudioQueue[0])
    } else {
      setPlayingAudio(false)
      // setTimeout(() => {
      // }, 200)
    }
  }

  let NUM_INITIAL_MESSAGES = 4

  useEffect(() => {
    console.log("playingAudio", playingAudio)
    if (messages.length > 0 && messages.length < NUM_INITIAL_MESSAGES && messages.slice(-1).pop().uid == "gptcha" && !playingAudio) {
      generateNextRoboMessage(messages)
    }
    if (messages.length > 0 && messages.length < NUM_INITIAL_MESSAGES && messages.slice(-1).pop().uid == "robo-caller" && !playingAudio) {
      generateNextGuardianMessage(messages)
    }
  }, [messages, playingAudio])

  let roboScore = Math.min(Math.round(Math.random()*100) + 50, 100)

  return (
    <div className="">
      <div style={{ position:"relative" }}>
        <RecordView
          currentAudioUser={currentAudioUser}
          allAudio={allAudio}
          currentAudioStreamUrl={currentAudioStreamUrl}
          onStopPlaying={onStopPlaying}
          onRecordStarted={() => {
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
          // addMessage(testMessage);
          // setMessages([...messages, testMessage]);
        }} onUpload={() => {}}>
          <div className='flex flex-row'>
            <MainContainer className='flex w-full my-8 rounded-lg border border-solid border-gray-100'>
              <Chat 
                messages={messages}
                messageIsStreaming={messageIsStreaming}
                showMessageInput={true}
                sendMessage={(text) => {
                  let testMessage = {
                    timestamp: new Date(),
                    text: text,
                    uid: "robo-caller",
                    direction: "incoming",
                    photo: roboIcon,
                    email: "",
                    displayName: "Robot Caller",
                  }
                  addMessage(testMessage)
                  generateNextGuardianMessage([...messages, testMessage])
                }}
              />
            </MainContainer>
            <MainContainer className='absolute w-2/3 my-8 rounded-lg border border-solid border-gray-100' style={{
              position: "absolute", right: -400, top: 0
            }}>
              <Chat 
                chatHeight={"70vh"}
                messages={thoughts}
                messageIsStreaming={messageIsStreaming}
                // hideMessageInput={true}
                sendMessage={(text) => {
                  let testMessage = {
                    timestamp: new Date(),
                    text: text,
                    uid: "robo-caller",
                    direction: "incoming",
                    photo: roboIcon,
                    email: "",
                    displayName: "Robot Caller",
                  }
                  addMessage(testMessage)
                  generateNextGuardianMessage([...messages, testMessage])
                }}
              />
            </MainContainer>
          </div>
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
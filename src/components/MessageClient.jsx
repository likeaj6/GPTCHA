import React, { useState, useEffect, useRef } from 'react';
import Chat from './Chat/Chat';

import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
  import RecordView from './AudioRecorder/Recorder';
import { LoremIpsum } from "lorem-ipsum";
import chatApi, { generateGuardianMessage } from '../api/chat'
import { Button, Text, Container, Select, CircularProgress, CircularProgressLabel, Center } from '@chakra-ui/react';

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
  const [fraudTopic, setFraudTopic] = useState("bank account");
  const [messages, setMessages] = useState(exampleMessages);
  const [thoughts, setThoughts] = useState(exampleThoughts);
  const [messageIsStreaming, setMessageIsStreaming] = useState(false);
  const [currentAudioStreamUrl, setCurrentAudioStreamUrl] = useState(null);
  const [currentAudioUser, setCurrentAudioUser] = useState("gptcha");
  const [audioQueue, setAudioQueue] = useState([]);
  const [allAudio, setAllAudio] = useState([]);
  const [playingAudio, setPlayingAudio] = useState(true);
  const currentAudioStateRef = useRef();
  currentAudioStateRef.current = playingAudio

  const addMessage = (message) => {
    setMessages((messages) => [...messages, message]);
  }
  const addThoughts = (message) => {
    setThoughts((messages) => [...messages, message]);
  }

  const generateNextRoboMessage = async (currentMessages) => {
    setMessageIsStreaming(true)
    chatApi.generateRoboMessage(currentMessages, fraudTopic).then((response) => {
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
    chatApi.generateGuardianMessage(currentMessages, fraudTopic).then((response) => {
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

    let modelName = isGPTMessage ? process.env.REACT_APP_GPTCHA_VOICE_ID: process.env.REACT_APP_ROBOCALLER_VOICE_ID
    // let modelName = isGPTMessage ? '21m00Tcm4TlvDq8ikWAM': 'TxGEqnHWrfWFTfGW9XjX'
    if (mostRecentMessage) {
      chatApi.generateSpeechFromText(mostRecentMessage.text, modelName).then((response) => {
        // console.log("response", response)
        let audioBlob = response.data
        const blob = new Blob([audioBlob], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(blob);
        // console.log("audioUrl", audioUrl)
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

  const generateInitialGuardianMessage = async () => {
     chatApi.generateGuardianMessage([], fraudTopic).then((response) => {
      setMessageIsStreaming(false)
      console.log("response", response)
        let newMessages = response.data.messages
      if (newMessages.length > 0) {
        // messages.map((message) => addMessage(message))
        setMessages(newMessages)
        generateAudioSynthesis(newMessages)
      }
    })
  }


  useEffect(() => {
    // generate initial response upon picking up
   generateInitialGuardianMessage()
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

  let NUM_INITIAL_MESSAGES = 3

  useEffect(() => {
    console.log("playingAudio", playingAudio)
    if (messages.length > 0 && messages.length < NUM_INITIAL_MESSAGES && messages.slice(-1).pop().uid == "gptcha" && !currentAudioStateRef.current) {
      generateNextRoboMessage(messages)
      // setTimeout(() => {
      // }, 3000)
    }
    if (messages.length > 0 && messages.length < NUM_INITIAL_MESSAGES && messages.slice(-1).pop().uid == "robo-caller" && !currentAudioStateRef.current) {
      generateNextGuardianMessage(messages)
      // setTimeout(() => {
      // }, 3000)
    }
  }, [messages, playingAudio])

  let roboScore = Math.min(Math.round(Math.random()*60 * messages.length) + 50, 100)

  return (
    <div className="">
      <div style={{ position:"relative" }}>
      {<Container className="border border-solid border-gray-300 rounded-lg p-4 mb-8 containerWithShadow">
        <Text className="uppercase text-gray-600 font-bold font-base" style={{ fontSize: 12 }}>{'Live call'}</Text>
        {<Button colorScheme={"teal"} type="primary" isLoading={messages.length == 0} loadingText="Starting call" disabled={false} onClick={() => {
          setMessages([])
          setAllAudio([])
          generateInitialGuardianMessage([], fraudTopic)
        }}>{allAudio?.length >= 0 ? 'Restart': 'Starting'} Call</Button>}
        <Text className="text-xs text-center width-full">
          OR
        </Text>
        <Text className="uppercase text-gray-600 font-bold font-base" style={{ fontSize: 12 }}>{'Robo call fraud type'}</Text>
        <Select placeholder='Select option' defaultValue={'bank account'} value={fraudTopic} onChange={(e) => {
          let option = e.target.value
          setFraudTopic(option)
              // if (option == 'bank account') {
              //   setAllAudio(bankFraudAudio)
              // } else if (option == 'car insurance') {
              //   setAllAudio(carInsuranceAudio)
              // } else if (option == 'nigerian prince') {
              //   setAllAudio(nigerianPrinceAudio)
              // }
              // setPlayingAudio(true)
              // setCurrentAudioStreamUrl(allAudio[0])
              // setCurrentAudioUser("robo-caller")
            }}
          >
          <option value='bank account'>bank account</option>
          <option value='car insurance'>Car insurance</option>
          <option value='nigerian prince'>Nigerian prince</option>
        </Select>
      </Container>}
        <RecordView
          playingAudio={playingAudio}
          currentAudioUser={currentAudioUser}
          allAudio={allAudio}
          currentMessage={messages.slice().pop()}
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
              className='w-full uppercase font-bold font-lg text-left'
              style={{
                color: roboScore > 60 ? "red": "green"
              }}
            >Robo-score:</Text>
            <Center>
              <CircularProgress value={roboScore} color={roboScore > 60 ? 'red.400': roboScore < 50 ? 'green.400': 'yellow.400'}>
                <CircularProgressLabel>{`${roboScore}%`}</CircularProgressLabel>
              </CircularProgress>
              <Text>
                {roboScore > 60 ? 'Likely to be a robo call': roboScore > 80 ? 'High likely to be a robo call': roboScore > 95 ? 'Guaranteed  to be a robo call': 'Needs more information'}
              </Text>
            </Center>

          </Container>
        </RecordView>
      </div>
    </div>
  );
}

export default MessageClient
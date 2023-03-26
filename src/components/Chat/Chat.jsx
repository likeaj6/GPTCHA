import { MicrophoneIcon, PauseCircleIcon } from '@heroicons/react/24/solid'
import React, { useEffect, useState, useRef } from 'react';
import './Chat.css';
// import { IconButton } from '@material-ui/core';
// import MicNoneIcon from '@material-ui/icons/MicNone';
import { Button } from '@chakra-ui/react'
import { ChatContainer, MessageList, Message, Avatar, MessageInput } from '@chatscope/chat-ui-kit-react';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

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
   const { transcript, resetTranscript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [isListening, setIsListening] = useState(false);
  const microphoneRef = useRef(null);
  const inputRef = useRef(null);

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

  // const sendMessage = ;

  const handleListening = () => {
    setIsListening(true);
    // microphoneRef.current?.classList.add("listening");
    SpeechRecognition.startListening({
      continuous: true,
    });
  };
  const stopHandle = () => {
    setIsListening(false);
    // microphoneRef.current?.classList.remove("listening");
    SpeechRecognition.stopListening();
  };
  const handleReset = () => {
    stopHandle();
    resetTranscript();
  };

  console.log("live transcript", transcript)
  return (
    <ChatContainer>
      <MessageList style={{
        position: "relative",
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
        <div as={MessageInput} style={{
          display: "flex",
          flexDirection: "row",
          borderTop: "1px dashed #d1dbe4"
        }}>
        {props.showMessageInput && <Button className="m-2 z-10" onClick={() => {
          if (isListening) {
              stopHandle()
              return;
            } else {
              handleListening()
            }
        }} style={{
            fontSize: 12,
            position: "absolute",
            bottom: 48,
            left: 8
          }}>
            {isListening ? <PauseCircleIcon className={"h-6 w-6 text-red-500"}></PauseCircleIcon>: <MicrophoneIcon className={"h-6 w-6 text-teal-500"}></MicrophoneIcon>}
            {isListening ? "Stop" : "Record"}
          </Button>}
          {/* {transcript} */}
        {props.showMessageInput ? <MessageInput
          ref={inputRef}
          value={transcript ? transcript: input}
          onAttachClick={() => {
            
          }}
          sendDisabled={!transcript && !input}
          attachButton={false}
          onChange={(innerHtml, textContent, value, nodes) => setInput(value)}
          style={{
            flexGrow: 1,
            borderTop: 0,
            flexShrink: "initial"
          }}
          onSend={() => {
    // e.preventDefault();
            console.log("transcript", transcript)
            console.log("input", input)
            if (transcript != null && transcript.trim() != "") {
              console.log("sending transcript", transcript)
              props.sendMessage(transcript)
            } else if (input != null && input.trim() != "") {
              console.log("sending text input", transcript)
              props.sendMessage(input)
            }
            // db.collection('chats').doc(chatId).collection('messages').add({
            //   timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            //   message: input,
            //   uid: user.uid,
            //   photo: user.photo,
            //   email: user.email,
            //   displayName: user.displayName,
            // });
            setInput('');
            handleReset()
          }}
        />: null}
        </div>
      {/* {process.env.NODE_ENV == "development" && props.showMessageInput && <MessageInput
        value={transcript}
        onAttachClick={() => {
          
        }}
        attachButton={false}
        onChange={(innerHtml, textContent, value, nodes) => setInput(value)}
        onSend={sendMessage}
      />} */}
    </ChatContainer>
  );
}

export default Chat;
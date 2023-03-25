import React from 'react';
import Chat from './Chat/Chat';

import styles from '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput } from '@chatscope/chat-ui-kit-react';
    
// import './Message.css';

function MessageClient() {
  return (
    <div className="Message">
      <div style={{ position:"relative", height: "500px" }}>
        
        <MainContainer>
          <Chat/>
        </MainContainer>
      </div>
{/*       <Chat /> */}
    </div>
  );
}

export default MessageClient
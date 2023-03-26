import React, { useEffect, useState } from 'react';
import './App.css';
// import { useSelector } from 'react-redux';
import MessageClient from './components/MessageClient';
import { ChakraProvider, Container, Box, Heading, Divider, Button, useDisclosure, Center } from '@chakra-ui/react'
import AWS from 'aws-sdk';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react'
import Lottie from "lottie-react";
import phoneCallAnimation from "./assets/animations/96660-phone-call.json";

AWS.config.region = 'us-west-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:c4c04401-fca9-4c6f-af09-aa662d13c47d',
});

// import { useDispatch } from 'react-redux';

function App() {
  // const user = useSelector(selectUser);
  // const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [didAcceptCall, setDidAcceptCall] = useState(false);

  useEffect(() => {
    // auth.onAuthStateChanged((authUser) => {
    //   if (authUser) {
    //     console.log(authUser);
    //     dispatch(
    //       login({
    //         uid: authUser.uid,
    //         photo: authUser.photoURL,
    //         email: authUser.email,
    //         displayName: authUser.displayName,
    //       })
    //     );
    //   } else {
    //     dispatch(logout());
    //   }
    // });
  }, []);

  const onAcceptCallModal = () => {
    onClose();
    setDidAcceptCall(true);
  }
  return (<ChakraProvider>
      <Box bgGradient="linear(to-r, #8A2BE2, #87CEFA)" style={{
        height: '100vh', overflow: "scroll"
      }}>
      <Box bgGradient="radial(rgba(214, 180, 252, 0.7), rgba(169, 211, 171, 0.7), rgba(248, 248, 255, 0.7))" style={{
        height: '100vh', overflow: "scroll"
      }}>
      <div className="app p-8">
      <Container className="p-8" bg="whiteAlpha.600" boxShadow="lg" rounded="md">
        <Heading className='text-center'>
          GPTCHA
        </Heading>
          <>
          {!didAcceptCall && <Center className="my-8"><Button colorScheme={"teal"} onClick={onOpen}>Start demo</Button></Center>}
          <Modal onClose={onAcceptCallModal} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Incoming call</ModalHeader>
              <ModalBody>
                <Lottie animationData={phoneCallAnimation} loop={true} />
              </ModalBody>
              <ModalFooter>
                <Button colorScheme={"red"} onClick={onClose}>Decline</Button>
                <Button colorScheme={"green"} onClick={onAcceptCallModal}>Accept</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          </>
        {didAcceptCall && <Container className='containerWithShadow m-8 bg-white'>
          {<MessageClient />}
        </Container>}
      </Container>
      </div>
      </Box>
      </Box>
  </ChakraProvider>);
}

export default App;
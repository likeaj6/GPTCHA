import React, { useEffect } from 'react';
import './App.css';
// import { useSelector } from 'react-redux';
import MessageClient from './components/MessageClient';
import { ChakraProvider, Container, Heading, Divider } from '@chakra-ui/react'
import AWS from 'aws-sdk';

AWS.config.region = 'us-west-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:c4c04401-fca9-4c6f-af09-aa662d13c47d',
});

// import { useDispatch } from 'react-redux';

function App() {
  // const user = useSelector(selectUser);
  // const dispatch = useDispatch();

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
  return (<ChakraProvider>
      <div className="app">
      <Container>
        <Heading>
          GPTCHA
        </Heading>
        <Divider/>
        <Container className='containerWithShadow'>
          {<MessageClient />}
        </Container>
      </Container>
      </div>
  </ChakraProvider>);
}

export default App;
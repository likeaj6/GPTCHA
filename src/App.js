import React, { useEffect } from 'react';
import './App.css';
// import { useSelector } from 'react-redux';
import MessageClient from './components/MessageClient';
import { ChakraProvider } from '@chakra-ui/react'
import { Container, Heading } from '@chakra-ui/react'
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
        {<MessageClient />}
      </Container>
      </div>
  </ChakraProvider>);
}

export default App;
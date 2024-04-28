import React from 'react';
import Head from "next/head";
import { ChakraProvider } from '@chakra-ui/react';
import { Navbar } from '../components/navbar.js';

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Head>
        <title> ExploreSync </title>
      </Head>

      <Navbar user={pageProps.user} />
      <Component {...pageProps} style={{ marginTop: '64px'}}/>
    </ChakraProvider>
  );
}

export default MyApp
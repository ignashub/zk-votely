import '@rainbow-me/rainbowkit/styles.css';
import '@/app/styles/globals.css';

import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import { WagmiConfig } from 'wagmi';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { client, chains } from '@/app/libs/wagmi';
import { SkipToMain } from '@/components/SkipToMain';

import { Inter } from '@next/font/google';

import { ChakraProvider } from '@chakra-ui/react';

import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';

const apolloClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/ignashub/zkvotely4', // Replace with your actual GraphQL API endpoint
  cache: new InMemoryCache(),
});

// If loading a variable font, you don't need to specify the font weight
const inter = Inter();

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  return (
    <>
      <DefaultSeo
        defaultTitle={process.env.NEXT_PUBLIC_APP_NAME}
        titleTemplate={`%s | ${process.env.NEXT_PUBLIC_APP_NAME}`}
        canonical={process.env.NEXT_PUBLIC_APP_URL}
      />
      <ApolloProvider client={apolloClient}>
        <WagmiConfig client={client}>
          <RainbowKitProvider chains={chains}>
            <ChakraProvider>
              <div className={inter.className}></div>
              <SkipToMain />
              <Navbar />
              <Component {...pageProps} />
              <Footer />
            </ChakraProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ApolloProvider>
    </>
  );
};

export default App;

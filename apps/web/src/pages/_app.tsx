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

      <WagmiConfig client={client}>
        <RainbowKitProvider chains={chains}>
          <ChakraProvider>
            <div className={inter.className}></div>
            <SkipToMain />
            <Component {...pageProps} />
          </ChakraProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
};

export default App;

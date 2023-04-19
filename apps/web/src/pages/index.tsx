import type { NextPage } from 'next';
import { Text, Box, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

const Home: NextPage = () => {
  return (
    <>
      <main
        data-testid="Layout"
        id="maincontent"
        className={
          'relative flex flex-col flex-grow mt-4 mb-8 space-y-8 md:space-y-16 md:mt-8 md:mb-16'
        }
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
          }}
        >
          <Box boxSize="750px">
            <Box textAlign="center">
              <Text
                as="h1"
                fontSize={{ base: '3xl', md: '5xl' }}
                fontWeight="bold"
                color={useColorModeValue('gray.700', 'gray.200')}
              >
                ZK Votely
              </Text>
              <Text
                as="p"
                fontSize={{ base: 'lg', md: 'xl' }}
                color={useColorModeValue('gray.500', 'gray.300')}
                mt={3}
              >
                ZK Votely is a voting platform based on zero-knowledge proofs
                technology. It is built using Next.js, TypeScript, Semaphore
                Protocol and Solidity.
              </Text>
            </Box>
          </Box>
        </Box>
      </main>
    </>
  );
};

export default Home;

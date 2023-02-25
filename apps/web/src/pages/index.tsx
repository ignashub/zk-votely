import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  Text,
  Box,
  Heading,
  Button,
  Input,
  Flex,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useSigner } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Home: NextPage = () => {
  // const [signerAddress, setSignerAddress] = useState<
  //   `0x${string}` | undefined
  // >();
  const router = useRouter();
  // const { data: signer, isError, isLoading } = useSigner();

  // const fetchSignerAddress = async () => {
  //   const address = await signer.getAddress();
  //   setSignerAddress(`0x${address.slice(2)}`);
  //   console.log(address);
  // };

  // const goToCoordinatorPage = () => {
  //   router.push({
  //     pathname: '/coordinator',
  //     query: {
  //       walletSigner: signerAddress,
  //     },
  //   });
  // };

  const goToCoordinatorPage = () => {
    router.push('/coordinator');
  };

  const goToVoterPage = () => {
    router.push('/voter');
  };

  return (
    <>
      <main
        data-testid="Layout"
        id="maincontent"
        className={
          'relative flex flex-col flex-grow mt-4 mb-8 space-y-8 md:space-y-16 md:mt-8 md:mb-16'
        }
      >
        {/* <Section> */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
            // flexDirection: 'column',
          }}
        >
          <Box boxSize="750px">
            <Flex justifyContent="center" flexDirection="column">
              <ConnectButton />
              {/* <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={fetchSignerAddress}
                marginBottom="16px"
              >
                Set Signer
              </Button> */}
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={goToCoordinatorPage}
                marginBottom="16px"
              >
                Coordinator
              </Button>
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={goToVoterPage}
                marginBottom="16px"
              >
                Voter
              </Button>
            </Flex>

            <footer>
              <Text>Byont Ventures B.V. © {new Date().getFullYear()}</Text>
            </footer>
          </Box>
        </Box>
        {/* </Section> */}
      </main>
    </>
  );
};

export default Home;

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
import { BigNumber, utils, ethers } from 'ethers';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContract, useSigner } from 'wagmi';

const Coordinator: NextPage = () => {
  const router = useRouter();

  //   const {
  //     query: { walletSigner },
  //   } = router;

  //   const props = {
  //     walletSigner,
  //   };

  //SEMAPHORE STUFF
  //For creating pool
  const [pollId, setPollId] = useState<BigNumber | undefined>(
    BigNumber.from(0)
  );

  const [merkleTreeDepth, setMerkleTreeDepth] = useState<
    BigNumber | undefined
  >();

  //Alerts
  const [successfulAlert, setSuccessfulAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [loadingAlert, setLoadingAlert] = useState(false);

  //Signer
  const { data: signer, isError, isLoading } = useSigner();

  //SemaphoreVote Smart Contract
  const contract = useContract({
    address: '0x1FA7E5c89AC5C8d51f8FEFc88C9c667a53c950ad',
    abi: SemaphoreVotingAbi,
    signerOrProvider: signer,
  });

  const goToHomePage = () => {
    router.push('/');
  };

  const createBallot = async () => {
    if (!contract) {
      console.error('Smart contract is not loaded');
      return;
    }

    // if (!pollId || !merkleTreeDepth) {
    //   console.error('Poll ID or Merkle tree depth is missing');
    //   return;
    // }

    setLoadingAlert(true);

    // console.log(pollId);
    // console.log(pollId.toNumber());
    // console.log(BigInt(pollId));

    console.log(`pollID on Creating Ballot: ${pollId}`);

    try {
      const coordinator = signer?.getAddress();
      const myGasLimit = BigNumber.from(5000000);
      console.log(coordinator);
      let result = await contract.createPoll(
        pollId,
        coordinator,
        merkleTreeDepth,
        {
          gasLimit: myGasLimit,
        }
      );

      const receipt = await result.wait();

      if (receipt.status === 1) {
        setLoadingAlert(false);
        setSuccessfulAlert(true);
        setTimeout(() => {
          setSuccessfulAlert(false);
        }, 5000);
        // const group1 = new Group(pollId.toNumber(), merkleTreeDepth.toNumber());
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      setLoadingAlert(false);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
    }
  };

  const startBallot = async () => {
    console.log(`pollID on Starting Ballot: ${pollId}`);
    setLoadingAlert(true);
    try {
      const myGasLimit = BigNumber.from(5000000);
      const encryptionKey = BigNumber.from(123456789);
      let result = await contract.startPoll(pollId, encryptionKey, {
        gasLimit: myGasLimit,
      });

      const receipt = await result.wait();
      if (receipt.status === 1) {
        setLoadingAlert(false);
        setSuccessfulAlert(true);
        setTimeout(() => {
          setSuccessfulAlert(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error starting poll:', error);
      setLoadingAlert(false);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
    }
  };

  const stopBallot = async () => {
    setLoadingAlert(true);
    try {
      const myGasLimit = BigNumber.from(5000000);
      const encryptionKey = BigNumber.from(123456789);
      let result = await contract.endPoll(pollId, encryptionKey, {
        gasLimit: myGasLimit,
      });

      const receipt = await result.wait();
      if (receipt.status === 1) {
        setLoadingAlert(false);
        setSuccessfulAlert(true);
        setTimeout(() => {
          setSuccessfulAlert(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error ending poll:', error);
      setLoadingAlert(false);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
    }
  };

  return (
    <main
      data-testid="Layout"
      id="maincontent"
      className="flex flex-col items-center justify-center flex-grow mt-4 mb-8 space-y-8 md:space-y-16 md:mt-8 md:mb-16"
    >
      <Box maxW="xl" w="full" p="6" rounded="lg" shadow="md">
        <Flex flexDir="column" alignItems="center">
          <Button
            variant="solid"
            bg="black"
            _hover={{ bg: 'gray.600' }}
            color="white"
            onClick={goToHomePage}
            mb="4"
            alignSelf="flex-start" // Added to align the button to the left
          >
            Back
          </Button>
          <Heading size="xl" mt="8" mb="4">
            Create a Ballot
          </Heading>
          <Input
            placeholder="Set Ballot Id (do not use the same one)"
            type="number"
            onChange={(e) => setPollId(BigNumber.from(e.target.value))}
            errorBorderColor="red.300"
            mb="4"
          />
          <Input
            placeholder="Set Merkle Tree Depth"
            type="number"
            onChange={(e) => setMerkleTreeDepth(BigNumber.from(e.target.value))}
            errorBorderColor="red.300"
            mb="4"
          />
          <Flex flexDir={['column', 'row']} mb="4">
            <Button
              variant="solid"
              bg="black"
              _hover={{ bg: 'gray.600' }}
              color="white"
              onClick={createBallot}
              mr={[0, '4']}
              mb={['4', 0]}
              w={['full', 'auto']}
            >
              Create a Ballot
            </Button>
            <Button
              variant="solid"
              bg="black"
              _hover={{ bg: 'gray.600' }}
              color="white"
              onClick={startBallot}
              mr={[0, '4']}
              mb={['4', 0]}
              w={['full', 'auto']}
            >
              Start a Ballot
            </Button>
            <Button
              variant="solid"
              bg="black"
              _hover={{ bg: 'gray.600' }}
              color="white"
              onClick={stopBallot}
              w={['full', 'auto']}
            >
              Stop a Ballot
            </Button>
          </Flex>
          {successfulAlert && (
            <Alert status="success" variant="subtle" w="full" mb="4">
              <AlertIcon />
              <AlertDescription>Successful Transaction!</AlertDescription>
            </Alert>
          )}
          {errorAlert && (
            <Alert status="error" variant="subtle" w="full" mb="4">
              <AlertIcon />
              <AlertDescription>Failed Transaction!</AlertDescription>
            </Alert>
          )}
          {loadingAlert && <Spinner mt="4" />}
        </Flex>
      </Box>
    </main>
  );
};

export default Coordinator;

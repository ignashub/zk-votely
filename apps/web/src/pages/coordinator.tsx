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
    address: '0x55b41f5bE0Eeb48B9618a8E1C8fa1f6Db4870BE4',
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
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={goToHomePage}
                marginBottom="16px"
              >
                Back
              </Button>
              <Heading size={'xl'} marginTop="50px" marginBottom="20px">
                Create a Ballot
              </Heading>
              <Input
                id="outlined-basic"
                placeholder="Set Ballot Id dont use the same one"
                type="number"
                onChange={(e) => setPollId(BigNumber.from(e.target.value))}
                errorBorderColor="red.300"
                style={{ marginBottom: '8px' }}
              />
              <Input
                id="outlined-basic"
                placeholder="Set Merkle Tree Depth"
                type="number"
                onChange={(e) =>
                  setMerkleTreeDepth(BigNumber.from(e.target.value))
                }
                errorBorderColor="red.300"
                style={{ marginBottom: '8px' }}
              />
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={createBallot}
                marginBottom="16px"
              >
                Create a Ballot
              </Button>
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={startBallot}
                marginBottom="16px"
              >
                Start a Ballot
              </Button>
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={stopBallot}
                marginBottom="16px"
              >
                Stop a Ballot
              </Button>

              {successfulAlert && (
                <Alert status="success" variant="subtle">
                  <AlertIcon />
                  <AlertDescription>Successful Transaction!</AlertDescription>
                </Alert>
              )}
              {errorAlert && (
                <Alert status="error" variant="subtle">
                  <AlertIcon />
                  <AlertDescription>Failed Transaction!</AlertDescription>
                </Alert>
              )}
              {loadingAlert && <Spinner />}
            </Flex>
          </Box>
        </Box>
        {/* </Section> */}
      </main>
    </>
  );
};

export default Coordinator;

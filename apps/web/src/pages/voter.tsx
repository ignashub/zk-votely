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
import { useContract, useSigner } from 'wagmi';
import { BigNumber, utils, ethers } from 'ethers';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Identity } from '@semaphore-protocol/identity';

const Voter: NextPage = () => {
  const router = useRouter();
  //SEMAPHORE STUFF
  const [identity, setIdentity] = useState<Identity>();
  const [vote, setVote] = useState<BigNumber | undefined>(BigNumber.from(0));
  //For creating pool
  const [pollId, setPollId] = useState<BigNumber | undefined>(
    BigNumber.from(0)
  );

  //Alerts
  const [successfulAlert, setSuccessfulAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [loadingAlert, setLoadingAlert] = useState(false);

  //Signer
  const { data: signer, isError, isLoading } = useSigner();

  //SemaphoreVote Smart Contract
  const contract = useContract({
    address: '0x41A1B6E666267e7C67A79cdFcD1a3Dcb976Ee8E5',
    abi: SemaphoreVotingAbi,
    signerOrProvider: signer,
  });

  const goToHomePage = () => {
    router.push('/');
  };

  const createIdentity = () => {
    const _identity = new Identity();
    setIdentity(_identity);
    console.log(_identity.commitment);
  };

  const joinBallout = async () => {
    if (!contract) {
      console.error('Smart contract is not loaded');
      return;
    }

    if (!pollId) {
      console.error('Poll ID is missing');
      return;
    }

    setLoadingAlert(true);

    try {
      const coordinator = signer?.getAddress();
      const myGasLimit = BigNumber.from(5000000);
      console.log(coordinator);
      let result = await contract.addVoter(pollId, identity?.commitment, {
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
      console.error('Error joining poll:', error);
      setLoadingAlert(false);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
    }
  };

  const postVote = async () => {
    if (!contract) {
      console.error('Smart contract is not loaded');
      return;
    }

    if (!pollId) {
      console.error('Poll ID is missing');
      return;
    }

    setLoadingAlert(true);

    try {
      const coordinator = signer?.getAddress();
      const myGasLimit = BigNumber.from(5000000);
      console.log(coordinator);
      let result = await contract.castVote(
        vote,
        pollId,
        identity?.nullifier,
        proof,
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
      }
    } catch (error) {
      console.error('Error joining poll:', error);
      setLoadingAlert(false);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
    }
  };

  // const joinGroup = () => {
  //   console.log(group.members);
  //   const newGroup = new Group(1);
  //   newGroup.addMember(identity.commitment);
  //   setGroup(newGroup);
  // };

  // const greeting = utils.formatBytes32String('Hello World');

  // const fullProof = async () => {
  //   const result = await generateProof(
  //     identity,
  //     group,
  //     externalNullifier,
  //     greeting
  // {
  //   wasmFilePath: `${snarkArtifactsPath}/semaphore.wasm`,
  //   zkeyFilePath: `${snarkArtifactsPath}/semaphore.zkey`,
  // }
  //   );

  //   const verified = await verifyMember(result, 20);
  //   console.log(verified);
  // };

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
              <ConnectButton />
              <Heading size={'xl'} marginTop="50px" marginBottom="20px">
                Create an Identity
              </Heading>
              {identity ? (
                <Box py="6" whiteSpace="nowrap">
                  <Box
                    p="5"
                    borderWidth={1}
                    borderColor="gray.500"
                    borderRadius="4px"
                  >
                    <Text textOverflow="ellipsis" overflow="hidden">
                      Trapdoor: {identity.trapdoor.toString()}
                    </Text>
                    <Text textOverflow="ellipsis" overflow="hidden">
                      Nullifier: {identity.nullifier.toString()}
                    </Text>
                    <Text textOverflow="ellipsis" overflow="hidden">
                      Commitment: {identity.commitment.toString()}
                    </Text>
                  </Box>
                </Box>
              ) : (
                <div></div>
              )}
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={createIdentity}
                marginBottom="16px"
              >
                Create an Identity
              </Button>
              <Input
                id="outlined-basic"
                placeholder="Set Ballot Id dont use the same one"
                type="number"
                onChange={(e) => setPollId(BigNumber.from(e.target.value))}
                errorBorderColor="red.300"
                style={{ marginBottom: '8px' }}
              />
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={joinBallout}
                marginBottom="16px"
              >
                Join a Ballout
              </Button>
              <Input
                id="outlined-basic"
                placeholder="Enter Your Vote"
                type="number"
                // onChange={(e) => setPollId(BigNumber.from(e.target.value))}
                errorBorderColor="red.300"
                style={{ marginBottom: '8px' }}
              />
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                // onClick={fullProof}
                marginBottom="16px"
              >
                Vote
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

export default Voter;

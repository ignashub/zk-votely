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
  const [title, setTitle] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [votingOptions, setVotingOptions] = useState<string | undefined>('');

  //Input Validation
  const [inputErrors, setInputErrors] = useState({
    pollId: false,
    merkleTreeDepth: false,
    title: false,
    description: false,
    votingOptions: false,
  });

  //Alerts
  const [successfulAlert, setSuccessfulAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [loadingAlert, setLoadingAlert] = useState(false);

  //Signer
  const { data: signer, isError, isLoading } = useSigner();

  //SemaphoreVote Smart Contract
  const contract = useContract({
    address: '0x4cfED314eadD3Dd6bAF7888BA289a2FE8F1A87fC',
    abi: SemaphoreVotingAbi,
    signerOrProvider: signer,
  });

  const goToHomePage = () => {
    router.push('/');
  };

  function isValidInput(value) {
    // You can also add more validation rules depending on your requirements
    return value.trim() !== '';
  }

  const convertVotingOptions = (optionsString: string) => {
    const optionsArray = optionsString
      .split(',')
      .map((option) => option.trim());
    return optionsArray;
  };

  const handlePollIdChange = (e) => {
    const value = e.target.value;
    setInputErrors((prev) => ({ ...prev, pollId: !isValidInput(value) }));
    setPollId(BigNumber.from(value));
  };

  const handleMerkleTreeDepthChange = (e) => {
    const value = e.target.value;
    setInputErrors((prev) => ({
      ...prev,
      merkleTreeDepth: !isValidInput(value),
    }));
    setMerkleTreeDepth(BigNumber.from(value));
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setInputErrors((prev) => ({ ...prev, title: !isValidInput(value) }));
    setTitle(value);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setInputErrors((prev) => ({ ...prev, description: !isValidInput(value) }));
    setDescription(value);
  };

  const handleVotingOptionsChange = (e) => {
    const value = e.target.value;
    setInputErrors((prev) => ({
      ...prev,
      votingOptions: !isValidInput(value),
    }));
    setVotingOptions(value);
    console.log(votingOptions);
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

    console.log(`Title: ${title}`);
    console.log(`Description: ${description}`);
    console.log(`Voting Options: ${votingOptions}`);
    console.log(votingOptions);
    console.log(votingOptions.split(',').map((option) => option.trim()));

    console.log(`pollID on Creating Ballot: ${pollId}`);

    try {
      const optionsArray = convertVotingOptions(votingOptions);
      const coordinator = await signer?.getAddress();
      const myGasLimit = BigNumber.from(5000000);
      console.log(coordinator);
      let result = await contract.createPoll(
        pollId,
        coordinator,
        merkleTreeDepth,
        title,
        description,
        optionsArray,
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
            onChange={handlePollIdChange}
            errorBorderColor="red.300"
            mb="4"
            isInvalid={inputErrors.pollId}
          />
          <Input
            placeholder="Set Merkle Tree Depth"
            type="number"
            onChange={handleMerkleTreeDepthChange}
            errorBorderColor="red.300"
            mb="4"
            isInvalid={inputErrors.merkleTreeDepth}
          />
          <Input
            placeholder="Title"
            type="text"
            onChange={handleTitleChange}
            errorBorderColor="red.300"
            mb="4"
            isInvalid={inputErrors.title}
          />
          <Input
            placeholder="Description"
            type="text"
            onChange={handleDescriptionChange}
            errorBorderColor="red.300"
            mb="4"
            isInvalid={inputErrors.description}
          />
          <Input
            placeholder="Voting Options (comma-separated)"
            onChange={handleVotingOptionsChange}
            errorBorderColor="red.300"
            mb="4"
            isInvalid={inputErrors.votingOptions}
          />
          <Flex flexDir={['column', 'row']} mb="4">
            <Button
              variant="solid"
              bg="black"
              _hover={{ bg: 'gray.600' }}
              color="white"
              onClick={signer ? createBallot : undefined}
              mr={[0, '4']}
              mb={['4', 0]}
              w={['full', 'auto']}
              isDisabled={!signer}
            >
              Create a Ballot
            </Button>

            <Button
              variant="solid"
              bg="black"
              _hover={{ bg: 'gray.600' }}
              color="white"
              onClick={signer ? startBallot : undefined}
              mr={[0, '4']}
              mb={['4', 0]}
              w={['full', 'auto']}
              isDisabled={!signer}
            >
              Start a Ballot
            </Button>
            <Button
              variant="solid"
              bg="black"
              _hover={{ bg: 'gray.600' }}
              color="white"
              onClick={signer ? stopBallot : undefined}
              w={['full', 'auto']}
              isDisabled={!signer}
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

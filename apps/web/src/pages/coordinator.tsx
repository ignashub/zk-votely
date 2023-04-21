import type { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Button,
  Input,
  Flex,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  Textarea,
  SimpleGrid,
} from '@chakra-ui/react';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { BigNumber } from 'ethers';
import { useCreateBallot } from '../hooks/useCreateBallot';
import { PollCard } from '../components/PollCard';
import { useSigner } from 'wagmi';
import { POLLS_QUERY } from '../queries/polls';

interface Poll {
  id: string;
  title: string;
  description: string;
  votingOptions: string[];
  merkleTreeDepth: number;
  state: string;
}

const Coordinator: NextPage = () => {
  const router = useRouter();
  const [pollId, setPollId] = useState<BigNumber | undefined>(
    BigNumber.from(0)
  );
  const [merkleTreeDepth] = useState<BigNumber | undefined>(BigNumber.from(20));
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [votingOptions, setVotingOptions] = useState<string[]>([]);
  const [createButtonPressed, setCreateButtonPressed] = useState(false);
  const [pollsList, setPollsList] = useState<Poll[]>([]);

  const {
    data: pollData,
    loading: pollDataLoading,
    error: pollDataError,
    refetch: pollDataRefetch,
  } = useQuery(POLLS_QUERY);

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
  const [loadingAlert] = useState(false);
  const [signerAddress, setSignerAddress] = useState<string | undefined>();
  //Signer
  const { data: signer, isError, isLoading } = useSigner();

  useEffect(() => {
    const updateSignerAddress = async () => {
      if (signer) {
        const address = await signer.getAddress();
        setSignerAddress(address);
      }
    };

    updateSignerAddress();
  }, [signer]);

  const goToHomePage = () => {
    router.push('/');
  };

  useEffect(() => {
    generatePollId();
  }, []);

  useEffect(() => {
    if (pollData) {
      setPollsList(pollData.polls);
    }
  }, [pollData]);

  const generatePollId = () => {
    const newPollId = BigNumber.from(Math.floor(Math.random() * 10000) + 1);
    setPollId(newPollId);
  };

  const convertVotingOptions = (optionsString: string) => {
    const optionsArray = optionsString
      .split(',')
      .map((option) => option.trim());
    return optionsArray;
  };

  function isValidInput(value: string) {
    return value.trim() !== '';
  }

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputErrors((prev) => ({ ...prev, title: !isValidInput(value) }));
    setTitle(value);
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputErrors((prev) => ({ ...prev, description: !isValidInput(value) }));
    setDescription(value);
  };

  const handleVotingOptionsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const optionsArray = convertVotingOptions(value);
    setInputErrors((prev) => ({
      ...prev,
      votingOptions: optionsArray.length === 0,
    }));
    setVotingOptions(optionsArray);
  };

  const { createBallot, loading: createBallotLoading } = useCreateBallot(
    (pollId ?? BigNumber.from(0)).toString(),
    signerAddress
      ? `0x${signerAddress}`
      : '0x0000000000000000000000000000000000000000',
    merkleTreeDepth,
    title,
    description,
    votingOptions
  );

  const handleCreateBallot = async () => {
    if (!signer) {
      console.error('Signer is not available');
      return;
    }

    setCreateButtonPressed(true);

    if (pollId === BigNumber.from(0)) {
      await generatePollId(); // Call generatePollId() if pollId is undefined
    }

    if (createBallotLoading) return;

    try {
      await createBallot();
      setSuccessfulAlert(true); // set the successful alert only if the transaction was successful
      setTimeout(() => {
        setSuccessfulAlert(false);
      }, 5000);
      await pollDataRefetch();
      setCreateButtonPressed(false); // set this to false, not true
    } catch (error) {
      console.error('Error creating ballot:', error);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
      setCreateButtonPressed(false); // set this to false
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error :(</p>;

  if (pollDataLoading) return <p>Loading...</p>;
  if (pollDataError) return <p>Error :(</p>;

  return (
    <main
      data-testid="Layout"
      id="maincontent"
      className="flex flex-col items-center justify-center flex-grow mt-4 mb-8 space-y-8 md:space-y-16 md:mt-8 md:mb-16"
    >
      <Box maxW="xl" w="full" p="6" rounded="lg" boxShadow="dark-lg">
        <Flex flexDir="column" alignItems="center">
          <Button
            variant="solid"
            bg="black"
            _hover={{ bg: 'gray.600' }}
            color="white"
            onClick={goToHomePage}
            alignSelf="flex-start"
            mb="4"
          >
            Back
          </Button>
          <Heading size="xl" mb="10">
            Create a Ballot
          </Heading>
          <Input
            placeholder="Title"
            type="text"
            onChange={handleTitleChange}
            errorBorderColor="red.300"
            mb="4"
            isInvalid={inputErrors.title}
          />
          <Textarea
            placeholder="Description"
            onChange={handleDescriptionChange}
            errorBorderColor="red.300"
            mb="4"
            isInvalid={inputErrors.description}
            resize="vertical"
          />
          <Input
            placeholder="Voting Options (comma-separated)"
            onChange={handleVotingOptionsChange}
            errorBorderColor="red.300"
            mb="9"
            isInvalid={inputErrors.votingOptions}
          />
          <Flex flexDir={['column', 'row']} mb="4">
            <Button
              variant="solid"
              bg="black"
              _hover={{ bg: 'gray.600' }}
              color="white"
              onClick={signer ? handleCreateBallot : undefined}
              mr={[0, '4']}
              mb={['4', 0]}
              w={['full', 'auto']}
              isLoading={createButtonPressed}
              isDisabled={!signer}
            >
              Create a Ballot
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
      <SimpleGrid columns={[1, 2, 3]} spacing="8">
        {pollsList.map((poll) => {
          const modifiedVotingOptions = poll.votingOptions.map(
            (option, index) => ({
              id: index,
              value: option,
              voteCounts: 0, // Set the initial vote count to 0 or fetch the actual vote counts from your data source
            })
          );
          return (
            <PollCard
              key={poll.id}
              title={poll.title}
              description={poll.description}
              votingOptions={modifiedVotingOptions}
              pollId={poll.id}
              identity={undefined}
              merkleTreeDepth={poll.merkleTreeDepth.toString()}
              state={poll.state}
              userType="coordinator"
            />
          );
        })}
      </SimpleGrid>
    </main>
  );
};

export default Coordinator;

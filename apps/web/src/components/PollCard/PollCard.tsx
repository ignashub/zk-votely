import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  Box,
  VStack,
  Text,
  RadioGroup,
  Radio,
  Button,
  Tag,
  useDisclosure,
} from '@chakra-ui/react';
import { useJoinBallot } from '../../hooks/useJoinBallot';
import { useVoteBallot } from '../../hooks/useVoteBallot';
import { BigNumber } from 'ethers';
import { Group } from '@semaphore-protocol/group';
import { FullProof, generateProof } from '@semaphore-protocol/proof';
import { useSigner } from 'wagmi';
import { useQuery } from '@apollo/client';
import { GET_VOTE_COUNTS_BY_POLL_ID } from '../../queries/polls';
import { Modal } from '../Modal';

interface PollCardProps {
  title: string;
  description: string;
  votingOptions: string[];
  pollId: string;
  identity: string;
  merkleTreeDepth: string;
  state: string;
}

export const PollCard: React.FC<PollCardProps> = ({
  title,
  description,
  votingOptions,
  identity,
  pollId,
  merkleTreeDepth,
  state,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [group, setGroup] = useState<Group | undefined>();
  const [fullProof, setFullProof] = useState<FullProof>();
  const [proofArray, setProofArray] = useState<BigNumber[]>();
  const { data: signer, isError, isLoading } = useSigner();
  const [successfulAlert, setSuccessfulAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [readyToVote, setReadyToVote] = useState(false);
  const [joinedBallot, setJoinedBallot] = useState(false);
  const [voteProofLoading, setVoteProofLoading] = useState(false);
  const [showVoteButton, setShowVoteButton] = useState(false);
  const [voteButtonPressed, setVoteButtonPressed] = useState(false);
  const [joinButtonPressed, setJoinButtonPressed] = useState(false);
  const [joinTransactionCompleted, setJoinTransactionCompleted] =
    useState(false);
  const [voteTransactionCompleted, setVoteTransactionCompleted] =
    useState(false);
  const [inputErrors, setInputErrors] = useState({
    pollId: false,
    merkleTreeDepth: false,
    title: false,
    description: false,
    votingOptions: false,
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groups, setGroups] = useState<{ [key: string]: Group }>({});

  const { loading, error, data, refetch } = useQuery(
    GET_VOTE_COUNTS_BY_POLL_ID,
    {
      variables: { pollId },
    }
  );

  const createNewGroup = async () => {
    const existingGroup = groups[pollId];

    if (existingGroup) {
      console.log('using existing group for poll:', pollId);
      setGroup(existingGroup);
      return existingGroup;
    }

    const newGroup = new Group(parseInt(pollId), parseInt(merkleTreeDepth));
    setGroups({ ...groups, [pollId]: newGroup });
    setGroup(newGroup);

    console.log('new group created for poll:', pollId);

    return newGroup;
  };

  const makeVoteProof = async () => {
    console.log('making vote proof');
    setVoteProofLoading(true);
    group?.addMember(identity.commitment);

    if (!group) {
      console.log('group is undefined');
      setVoteProofLoading(false);
      return;
    }

    const proof = await generateProof(identity, group, pollId, selectedOption);
    console.log('proof:', proof);
    console.log('proof:', proof.proof);

    setFullProof(proof);
    setProofArray(proof.proof);

    console.log('proof was created');
    setVoteProofLoading(false);
    setShowVoteButton(true);
  };

  const handleChange = (value: string) => {
    setSelectedOption(parseInt(value));
  };

  const {
    joinBallot,
    loading: joinBallotLoading,
    error: joinBallotError,
  } = useJoinBallot(pollId.toString(), identity.commitment.toString());

  const {
    voteBallot,
    loading: voteBallotLoading,
    error: voteBallotError,
  } = useVoteBallot(
    selectedOption !== null ? selectedOption.toString() : '',
    fullProof ? fullProof.nullifierHash.toString() : '0',
    pollId.toString() == undefined ? '' : pollId.toString(),
    proofArray || [],
    group?.root?.toString() || '0x0', // provide default value '0x0' if group or group.root is undefined
    {
      gasLimit: BigNumber.from(5000000),
    }
  );

  useEffect(() => {
    if (joinBallotError) {
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
    }
  }, [joinBallotError]);

  useEffect(() => {
    if (voteBallotError) {
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
    }
  }, [voteBallotError]);

  useEffect(() => {
    if (fullProof && proofArray && group?.root) {
      setReadyToVote(true);
    } else {
      setReadyToVote(false);
    }
  }, [fullProof, proofArray, group]);

  useEffect(() => {
    if (selectedOption !== null) {
      makeVoteProof();
    }
  }, [selectedOption]);

  const handleJoinBallot = async () => {
    console.log(pollId, identity.commitment);

    if (joinBallotLoading) return;

    setJoinButtonPressed(true); // Set to true when the button is pressed

    await createNewGroup();
    await joinBallot()
      .then(() => {
        setSuccessfulAlert(true);
        setTimeout(() => {
          setSuccessfulAlert(false);
        }, 5000);

        setJoinedBallot(true);
        setJoinTransactionCompleted(true); // Set to true if the transaction is successful
      })
      .catch(() => {
        setErrorAlert(true);
        setTimeout(() => {
          setErrorAlert(false);
        }, 5000);
        setJoinButtonPressed(false); // Set to false if the transaction fails
      });
  };

  const handleVoteBallot = async () => {
    if (selectedOption === null) {
      alert('Please select an option before voting.');
      return;
    }

    if (voteBallotLoading) return;

    setVoteButtonPressed(true);

    try {
      await voteBallot();
      setSuccessfulAlert(true);
      setTimeout(() => {
        setSuccessfulAlert(false);
      }, 5000);
      refetch();
      setShowVoteButton(false);
      setVoteTransactionCompleted(true); // Add this line
    } catch (error) {
      console.error('Error voting:', error);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
      setVoteButtonPressed(false);
      setShowVoteButton(true);
    }
  };

  // if (loading) return <Spinner />;
  // if (error) return <p>Error :(</p>;

  if (loading || !description) {
    return <Spinner />;
  }

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      padding="12"
      m="5"
      boxShadow="dark-lg"
    >
      <VStack align="start">
        <Box
          borderWidth="1px"
          borderRadius="lg"
          padding="4"
          display="flex"
          justifyContent="space-between"
        >
          <Button
            variant="solid"
            bg="black"
            _hover={{ bg: 'gray.600' }}
            color="white"
            onClick={handleJoinBallot}
            mr={[0, '4']}
            mb={['4', 0]}
            w={['full', 'auto']}
            isDisabled={
              !signer ||
              joinedBallot ||
              joinButtonPressed ||
              state === 'CREATED' ||
              state === 'ENDED'
            }
            alignSelf="flex-start"
          >
            {joinButtonPressed && !joinTransactionCompleted ? (
              <Spinner />
            ) : (
              'Join a Ballot'
            )}
          </Button>
          <Text
            fontSize="md"
            color={state === 'CREATED' ? 'black' : 'white'}
            bg={
              state === 'CREATED'
                ? 'yellow.400'
                : state === 'ENDED'
                ? 'red.400'
                : 'green.400'
            }
            borderRadius="full"
            px={2}
            py={1}
            fontWeight="bold"
            display="inline-block"
            alignSelf="flex-end"
          >
            {state === 'CREATED' ? 'NOT STARTED' : state}
          </Text>
        </Box>
        <Text fontSize="2xl" fontWeight="bold">
          {title}
        </Text>
        <Button
          variant="solid"
          bg="black"
          _hover={{ bg: 'gray.600' }}
          color="white"
          onClick={onOpen}
          mr={[0, '4']}
          mb={['4', 4]}
          w={['full', 'auto']}
          isDisabled={!signer}
        >
          View Description
        </Button>
        <Modal
          title={
            <Text fontSize="2xl" fontWeight="bold">
              {title}
            </Text>
          }
          isOpen={isOpen}
          onClose={onClose}
          content={description}
        />

        <Text fontSize="lg" fontWeight="bold">
          Voting Options
        </Text>

        <RadioGroup
          value={selectedOption?.toString() || ''}
          onChange={handleChange}
        >
          {votingOptions.map((option, index) => {
            const voteCount = data.voteCounts.find(
              (voteCount) => parseInt(voteCount.option) === index
            )?.count;
            return (
              <div key={index}>
                <Radio value={index.toString()} colorScheme="teal" mr={2}>
                  {option}
                </Radio>
                <Tag bg="teal.300" borderRadius="full">
                  {parseInt(voteCount) || 0}
                </Tag>
              </div>
            );
          })}
        </RadioGroup>

        <Button
          variant="solid"
          bg="black"
          _hover={{ bg: 'gray.600' }}
          color="white"
          onClick={handleVoteBallot}
          mr={[0, '4']}
          mb={['4', 0]}
          w={['full', 'auto']}
          isDisabled={
            !signer ||
            !group ||
            !joinedBallot ||
            !readyToVote ||
            voteButtonPressed ||
            voteTransactionCompleted
          }
        >
          {voteButtonPressed || voteProofLoading ? (
            voteTransactionCompleted ? (
              'Vote'
            ) : (
              <Spinner />
            )
          ) : (
            'Vote'
          )}
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
      </VStack>
    </Box>
  );
};

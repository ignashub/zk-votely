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
  Button,
} from '@chakra-ui/react';
import { useJoinBallot } from '../../hooks/useJoinBallot';
import { useVoteBallot } from '../../hooks/useVoteBallot';
import { BigNumber } from 'ethers';
import { Group } from '@semaphore-protocol/group';
import { FullProof, generateProof } from '@semaphore-protocol/proof';
import { useSigner } from 'wagmi';
import { useQuery } from '@apollo/client';
import { GET_VOTE_COUNTS_BY_POLL_ID } from '../../queries/polls';

interface PollCardProps {
  title: string;
  description: string;
  votingOptions: string[];
  pollId: string;
  identity: string;
  merkleTreeDepth: string;
}

export const PollCard: React.FC<PollCardProps> = ({
  title,
  description,
  votingOptions,
  identity,
  pollId,
  merkleTreeDepth,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [group, setGroup] = useState<Group | undefined>();
  const [fullProof, setFullProof] = useState<FullProof>();
  const [proofArray, setProofArray] = useState<BigNumber[]>();

  //Smart Contract Signer
  const { data: signer, isError, isLoading } = useSigner();

  const [successfulAlert, setSuccessfulAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [loadingAlert, setLoadingAlert] = useState(false);

  const [readyToVote, setReadyToVote] = useState(false);

  const [joinedBallot, setJoinedBallot] = useState(false);

  const [groups, setGroups] = useState<{ [key: string]: Group }>({});

  const { loading, error, data } = useQuery(GET_VOTE_COUNTS_BY_POLL_ID, {
    variables: { pollId },
  });

  useEffect(() => {
    console.log('PollId:', pollId);
    console.log('Data:', data);
  }, [data]);

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
    group?.addMember(identity.commitment);

    if (!group) {
      console.log('group is undefined');
      return;
    }

    const proof = await generateProof(identity, group, pollId, selectedOption);
    console.log('proof:', proof);
    console.log('proof:', proof.proof);

    setFullProof(proof);
    setProofArray(proof.proof);

    console.log('proof was created');
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
      setLoadingAlert(false);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
    }
  }, [joinBallotError]);

  useEffect(() => {
    if (voteBallotError) {
      setLoadingAlert(false);
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

    setLoadingAlert(true);

    await createNewGroup();
    await joinBallot().then(() => {
      setLoadingAlert(false);
      setSuccessfulAlert(true);
      setTimeout(() => {
        setSuccessfulAlert(false);
      }, 5000);

      setJoinedBallot(true);
    });
  };

  const handleVoteBallot = async () => {
    if (selectedOption === null) {
      alert('Please select an option before voting.');
      return;
    }

    if (voteBallotLoading) return;

    setLoadingAlert(true);

    try {
      await voteBallot();
      setLoadingAlert(false);
      setSuccessfulAlert(true);
      setTimeout(() => {
        setSuccessfulAlert(false);
      }, 5000);
    } catch (error) {
      console.error('Error voting:', error);
      setLoadingAlert(false);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <Box borderWidth="1px" borderRadius="lg" padding="4">
      <VStack align="start">
        <Button
          variant="solid"
          bg="black"
          _hover={{ bg: 'gray.600' }}
          color="white"
          onClick={handleJoinBallot}
          mr={[0, '4']}
          mb={['4', 0]}
          w={['full', 'auto']}
          isDisabled={!signer}
        >
          Join a Ballot
        </Button>
        <Text fontSize="2xl" fontWeight="bold">
          {title}
        </Text>
        <Text fontSize="md">{description}</Text>
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
                <span>
                  Option {index + 1}: {option}
                </span>
                <span>Vote count: {parseInt(voteCount) || 0}</span>
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
          isDisabled={!signer || !group || !joinedBallot || !readyToVote}
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
        {joinBallotLoading || voteBallotLoading ? <Spinner /> : null}
      </VStack>
    </Box>
  );
};

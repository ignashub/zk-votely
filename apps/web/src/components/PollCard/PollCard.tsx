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
  HStack,
  Spacer,
  Flex,
} from '@chakra-ui/react';
import { useJoinBallot } from '../../hooks/useJoinBallot';
import { useVoteBallot } from '../../hooks/useVoteBallot';
import { useStartBallot } from '../../hooks/useStartBallot';
import { useEndBallot } from '../../hooks/useEndBallot';
import { BigNumber } from 'ethers';
import { Group } from '@semaphore-protocol/group';
import { FullProof, generateProof } from '@semaphore-protocol/proof';
import { useSigner } from 'wagmi';
import { useQuery } from '@apollo/client';
import { GET_VOTE_COUNTS_BY_POLL_ID } from '../../queries/polls';
import { POLLS_QUERY } from '../../queries/polls';
import { Modal } from '../Modal';
import { Identity } from '@semaphore-protocol/identity';

interface PollCardProps {
  title: string;
  description: string;
  votingOptions: Array<{ id: number; value: string; voteCounts: number }>;
  pollId: string;
  identity?: Identity;
  merkleTreeDepth: string;
  state: string;
  userType: 'voter' | 'coordinator';
}

interface VoteCount {
  option: string;
  count: number;
}

export const PollCard: React.FC<PollCardProps> = ({
  title,
  description,
  votingOptions,
  identity,
  pollId,
  merkleTreeDepth,
  state,
  userType,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [group, setGroup] = useState<Group | undefined>();
  const [fullProof, setFullProof] = useState<FullProof>();
  const [proofArray, setProofArray] = useState<BigNumber[]>();
  const { data: signer } = useSigner();
  const [successfulAlert, setSuccessfulAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState(false);
  const [readyToVote, setReadyToVote] = useState(false);
  const [joinedBallot, setJoinedBallot] = useState(false);
  const [voteProofLoading, setVoteProofLoading] = useState(false);
  // const [setShowVoteButton] = useState(false);
  const [voteButtonPressed, setVoteButtonPressed] = useState(false);
  const [joinButtonPressed, setJoinButtonPressed] = useState(false);
  const [startButtonPressed, setStartButtonPressed] = useState(false);
  const [endButtonPressed, setEndButtonPressed] = useState(false);
  const [joinTransactionCompleted, setJoinTransactionCompleted] =
    useState(false);
  const [voteTransactionCompleted, setVoteTransactionCompleted] =
    useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groups, setGroups] = useState<{ [key: string]: Group }>({});

  const { loading, data, refetch } = useQuery(GET_VOTE_COUNTS_BY_POLL_ID, {
    variables: { pollId },
  });

  const { refetch: pollDataRefetch } = useQuery(POLLS_QUERY);

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
    group?.addMember(identity?.commitment ?? '');

    if (!group) {
      console.log('group is undefined');
      setVoteProofLoading(false);
      return;
    }

    if (selectedOption !== null) {
      const proof = await generateProof(
        identity!,
        group,
        pollId,
        selectedOption
      );
      console.log('proof:', proof);
      console.log('proof:', proof.proof);
      setFullProof(proof);
      const proofArray: BigNumber[] = proof.proof.map((value) =>
        BigNumber.from(value)
      );
      setProofArray(proofArray);

      console.log('proof was created');
      setVoteProofLoading(false);
    } else {
      console.log('error');
    }
  };

  const handleChange = (value: string) => {
    setSelectedOption(parseInt(value));
  };

  const {
    joinBallot,
    loading: joinBallotLoading,
    error: joinBallotError,
  } = useJoinBallot(
    pollId?.toString() ?? '',
    identity?.commitment?.toString() ?? ''
  );

  const {
    voteBallot,
    loading: voteBallotLoading,
    error: voteBallotError,
  } = useVoteBallot(
    selectedOption !== null ? selectedOption.toString() : '',
    fullProof ? fullProof.nullifierHash.toString() : '0',
    pollId.toString() == undefined ? '' : pollId.toString(),
    proofArray || [],
    group?.root?.toString() || '0x0'
    // {
    //   gasLimit: BigNumber.from(5000000),
    // }
  );

  const { startBallot, loading: startBallotLoading } = useStartBallot(
    pollId?.toString() ?? '',
    BigNumber.from(5000000)
  );

  const { endBallot, loading: endBallotLoading } = useEndBallot(
    pollId?.toString() ?? '',
    BigNumber.from(5000000)
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
    console.log(pollId, identity?.commitment);

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

    console.log(selectedOption);
    // console.log(fullProof.nullifierHash.toString());
    console.log(pollId);
    console.log(proofArray);
    // console.log(group.root.toString());

    try {
      await voteBallot();
      setSuccessfulAlert(true);
      setTimeout(() => {
        setSuccessfulAlert(false);
      }, 5000);
      refetch();
      // setShowVoteButton(false);
      setVoteTransactionCompleted(true); // Add this line
    } catch (error) {
      console.error('Error voting:', error);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
      setVoteButtonPressed(false);
      // setShowVoteButton(true);
    }
  };

  const handleStartBallot = async () => {
    if (startBallotLoading) return;

    setStartButtonPressed(true);

    try {
      await startBallot();
      setSuccessfulAlert(true);
      setTimeout(() => {
        setSuccessfulAlert(false);
      }, 5000);
      pollDataRefetch();
      setStartButtonPressed(false);
    } catch (error) {
      console.error('Error starting ballot:', error);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
      setStartButtonPressed(false);
    }
  };

  const handleEndBallot = async () => {
    if (endBallotLoading) return;

    setEndButtonPressed(true);

    try {
      await endBallot();
      setSuccessfulAlert(true);
      setTimeout(() => {
        setSuccessfulAlert(false);
      }, 5000);
      pollDataRefetch();
      setEndButtonPressed(false);
    } catch (error) {
      console.error('Error ending ballot:', error);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
      setEndButtonPressed(false);
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
      <VStack align="start" spacing={6}>
        <HStack alignItems="center">
          {userType === 'voter' && (
            <Button
              variant="solid"
              bg="black"
              _hover={{ bg: 'gray.600' }}
              color="white"
              onClick={handleJoinBallot}
              isDisabled={
                !signer ||
                joinedBallot ||
                joinButtonPressed ||
                state === 'CREATED' ||
                state === 'ENDED'
              }
            >
              {joinButtonPressed && !joinTransactionCompleted ? (
                <Spinner />
              ) : (
                'Join a Ballot'
              )}
            </Button>
          )}
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
          >
            {state === 'CREATED' ? 'NOT STARTED' : state}
          </Text>
          <Text
            fontSize="md"
            borderRadius="full"
            px={2}
            py={1}
            fontWeight="bold"
            display="inline-block"
          >
            ID: {pollId}
          </Text>
        </HStack>
        <Text fontSize="2xl" fontWeight="bold">
          {title}
        </Text>
        <Flex direction="column" flex="1">
          <Spacer />
          <Button
            variant="solid"
            bg="black"
            _hover={{ bg: 'gray.600' }}
            color="white"
            onClick={onOpen}
            mb={['4', 4]}
            w={['full', 'auto']}
            isDisabled={!signer}
          >
            View Description
          </Button>
          <Modal
            title={title}
            isOpen={isOpen}
            onClose={onClose}
            content={description}
          />
          {userType === 'voter' && (
            <Text fontSize="lg" fontWeight="bold" mb={['4', 4]}>
              Voting Options
            </Text>
          )}
          <VStack spacing={6}>
            {userType === 'voter' ? (
              <>
                <Box alignSelf="start">
                  <RadioGroup
                    value={selectedOption?.toString() || ''}
                    onChange={handleChange}
                    mb={['4', 4]}
                  >
                    {votingOptions.map((option, index) => {
                      const voteCount: VoteCount | undefined =
                        data.voteCounts.find(
                          (voteCount: VoteCount) =>
                            parseInt(voteCount.option) === index
                        );
                      const count = voteCount?.count || 0;
                      return (
                        <div key={index}>
                          <Radio value={index.toString()} mr={2}>
                            {option.value}
                          </Radio>
                          <Tag borderRadius="full">{count}</Tag>
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
                </Box>
              </>
            ) : (
              userType === 'coordinator' && (
                <>
                  <Box alignSelf="start">
                    <Text fontSize="lg" fontWeight="bold" mb={['4', 4]}>
                      Voting Options
                    </Text>
                    {votingOptions.map((option, index) => {
                      const voteCount: VoteCount | undefined =
                        data.voteCounts.find(
                          (voteCount: VoteCount) =>
                            parseInt(voteCount.option) === index
                        );
                      const count = voteCount?.count || 0;
                      return (
                        <div key={index}>
                          <Radio value={index.toString()} mr={2}>
                            {option.value}
                          </Radio>
                          <Tag borderRadius="full">{count}</Tag>
                        </div>
                      );
                    })}
                  </Box>
                  <HStack spacing={4}>
                    <Button
                      colorScheme="green"
                      onClick={handleStartBallot}
                      mr={[0, '4']}
                      mb={['4', 0]}
                      w={['full', 'auto']}
                      isLoading={startButtonPressed}
                      isDisabled={
                        !signer || state === 'ONGOING' || state === 'ENDED'
                      }
                    >
                      Start a Ballot
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={handleEndBallot}
                      mr={[0, '4']}
                      mb={['4', 0]}
                      w={['full', 'auto']}
                      isLoading={endButtonPressed}
                      isDisabled={
                        !signer || state === 'CREATED' || state === 'ENDED'
                      }
                    >
                      Stop a Ballot
                    </Button>
                  </HStack>
                </>
              )
            )}
          </VStack>
        </Flex>

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

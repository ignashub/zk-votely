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
} from '@chakra-ui/react';
import { useJoinBallot } from '../../hooks/useJoinBallot';
import { useVoteBallot } from '../../hooks/useVoteBallot';
import { BigNumber } from 'ethers';
import { Group } from '@semaphore-protocol/group';
import { FullProof, generateProof } from '@semaphore-protocol/proof';
import { useSigner } from 'wagmi';

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

  const createNewGroup = async () => {
    const newGroup = new Group(parseInt(pollId), parseInt(merkleTreeDepth));
    setGroup(newGroup);
    console.log('group was created');
    // return newGroup;
  };

  const makeVoteProof = async () => {
    group.addMember(identity.commitment);

    const proof = await generateProof(identity, group, pollId, selectedOption);
    setFullProof(proof);
    console.log(`Group members: ${group.members}`);
    console.log(`Vote option: ${selectedOption}`);
    console.log(`Proof NullifierHash: ${proof.nullifierHash}`);
    console.log(`Poll ID: ${pollId}`);
    console.log(`Proof Array ${proof.proof}`);
    console.log(`Group Root: ${group.root}`);
    setProofArray(proof.proof);
    return proof.proof;
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
    pollId.toString(),
    proofArray || [],
    group.root.toString(),
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

  const handleJoinBallot = async () => {
    console.log(pollId, identity.commitment);

    if (joinBallotLoading) return;

    setLoadingAlert(true);
    await joinBallot().then(() => {
      setLoadingAlert(false);
      setSuccessfulAlert(true);
      setTimeout(() => {
        setSuccessfulAlert(false);
      }, 5000);
    });
  };

  // const handleCreateProof = async () => {
  //   const newGroup = await createNewGroup();
  //   const proof = await makeVoteProof(newGroup);
  //   await makeProofArray(proof);
  // };

  const handleVoteBallot = async () => {
    console.log(`Group members: ${group.members}`);
    console.log(`Vote option: ${selectedOption}`);
    console.log(`Proof NullifierHash: ${fullProof.nullifierHash}`);
    console.log(`Poll ID: ${pollId}`);
    console.log(`Proof Array ${fullProof.proof}`);
    console.log(`Group Root: ${group.root}`);
    if (selectedOption === null) {
      alert('Please select an option before voting.');
      return;
    }

    if (voteBallotLoading) return;

    setLoadingAlert(true);

    await createNewGroup();
    await makeVoteProof();

    await voteBallot().then(() => {
      setLoadingAlert(false);
      setSuccessfulAlert(true);
      setTimeout(() => {
        setSuccessfulAlert(false);
      }, 5000);
    });
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" padding="4">
      <VStack align="start">
        <Text fontSize="2xl" fontWeight="bold">
          {title}
        </Text>
        <Text fontSize="md">{description}</Text>
        <RadioGroup
          value={selectedOption?.toString() || ''}
          onChange={handleChange}
        >
          {votingOptions.map((option, index) => {
            return (
              <Radio key={`${pollId}-${index}`} value={index.toString()}>
                <Text>{option}</Text>
              </Radio>
            );
          })}
        </RadioGroup>
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
        <Button
          variant="solid"
          bg="black"
          _hover={{ bg: 'gray.600' }}
          color="white"
          onClick={createNewGroup}
          mr={[0, '4']}
          mb={['4', 0]}
          w={['full', 'auto']}
          isDisabled={!signer}
        >
          Create Group
        </Button>
        <Button
          variant="solid"
          bg="black"
          _hover={{ bg: 'gray.600' }}
          color="white"
          onClick={makeVoteProof}
          mr={[0, '4']}
          mb={['4', 0]}
          w={['full', 'auto']}
          isDisabled={!signer}
        >
          Create Proof
        </Button>
        {/* <Button
          variant="solid"
          bg="black"
          _hover={{ bg: 'gray.600' }}
          color="white"
          onClick={makeProofArray}
          mr={[0, '4']}
          mb={['4', 0]}
          w={['full', 'auto']}
          isDisabled={!signer}
        >
          Create ProofArray
        </Button> */}
        <Button
          variant="solid"
          bg="black"
          _hover={{ bg: 'gray.600' }}
          color="white"
          onClick={handleVoteBallot}
          mr={[0, '4']}
          mb={['4', 0]}
          w={['full', 'auto']}
          isDisabled={!signer}
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
        {joinBallotLoading && <Spinner />}
      </VStack>
    </Box>
  );
};

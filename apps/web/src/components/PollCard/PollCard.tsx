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
    return newGroup;
  };

  const makeVoteProof = async (newGroup) => {
    newGroup.addMember(identity.commitment);

    const proof = await generateProof(
      identity,
      newGroup,
      pollId,
      selectedOption
    );
    setFullProof(proof);
    console.log(proof);
    return proof;
  };

  const handleChange = (value: string) => {
    setSelectedOption(parseInt(value));
  };

  const makeProofArray = async (proof) => {
    const proofArray = proof.proof.map(
      (value: BigNumber | string | number | null | undefined | BN) => value
    );
    setProofArray(proofArray);
    console.log(proofArray);
    return proofArray;
  };

  const {
    joinBallot,
    loading: joinBallotLoading,
    error: joinBallotError,
  } = useJoinBallot(pollId.toString(), identity.commitment.toString());

  const { voteBallot } = useVoteBallot(
    selectedOption,
    fullProof ? fullProof.nullifierHash.toString() : '',
    pollId.toString(),
    proofArray || [],
    merkleTreeDepth.toString()
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

  const handleCreateProof = async () => {
    const newGroup = await createNewGroup();
    const proof = await makeVoteProof(newGroup);
    const test = await makeProofArray(proof);
  };

  const handleVoteBallot = async () => {
    if (selectedOption === null) {
      alert('Please select an option before voting.');
      return;
    }
    await voteBallot();
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
          onClick={handleCreateProof}
          mr={[0, '4']}
          mb={['4', 0]}
          w={['full', 'auto']}
          isDisabled={!signer}
        >
          Create Proof
        </Button>
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

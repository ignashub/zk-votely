import type { NextPage } from 'next';
import {
  Text,
  Box,
  Heading,
  Button,
  Input,
  Flex,
  RadioGroup,
  Radio,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import {
  usePrepareContractWrite,
  useContractWrite,
  useContract,
  useProvider,
  useSigner,
} from 'wagmi';
import { BigNumber, utils, ethers } from 'ethers';
import { VoteYesVerifierAbi } from '../abis/VoteYesVerifier';
import { VoteNoVerifierAbi } from '../abis/VoteNoVerifier';
import { SemaphoreVotingAbi } from '../abis/SemaphoreVoting';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Identity } from '@semaphore-protocol/identity';
import {
  generateProof,
  verifyProof as verifyMember,
} from '@semaphore-protocol/proof';
import { Group } from '@semaphore-protocol/group';
import { formatBytes32String } from 'ethers/lib/utils';
import {
  makeProof,
  verifyProof,
  makePlonkProof,
  verifyPlonkProof,
  voteToBinary,
} from '../utils/utils';

import snarkjs = require('snarkjs');

const Home: NextPage = () => {
  //Example with groth16
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [proof, setProof] = useState('');
  const [signals, setSignals] = useState('');
  const [isValid, setIsValid] = useState(false);

  const wasmFile =
    'http://localhost:8000/groth16/example/example_js/example.wasm';
  const zkeyFile = 'http://localhost:8000/groth16/example/example_final.zkey';
  const verificationKey =
    'http://localhost:8000/groth16/example/verification_key.json';

  const runProofs = () => {
    const proofInput = { a, b, c };
    console.log(proofInput);

    makeProof(proofInput, wasmFile, zkeyFile).then(
      ({ proof: _proof, publicSignals: _signals }) => {
        setProof(JSON.stringify(_proof, null, 2));
        setSignals(JSON.stringify(_signals, null, 2));
        verifyProof(verificationKey, _signals, _proof).then((_isValid) => {
          setIsValid(_isValid);
        });
      }
    );
  };

  //Example with plonk
  const wasmFilePlonk =
    'http://localhost:8000/plonk/example/example_js/example.wasm';
  const zkeyFilePlonk =
    'http://localhost:8000/plonk/example/example_final.zkey';
  const verificationKeyPlonk =
    'http://localhost:8000/plonk/example/verification_key.json';

  const runPlonkProofs = () => {
    const proofInput = { a, b, c };
    console.log(proofInput);

    makePlonkProof(proofInput, wasmFilePlonk, zkeyFilePlonk).then(
      ({ proof: _proof, publicSignals: _signals }) => {
        setProof(JSON.stringify(_proof, null, 2));
        setSignals(JSON.stringify(_signals, null, 2));
        verifyPlonkProof(verificationKeyPlonk, _signals, _proof).then(
          (_isValid) => {
            setIsValid(_isValid);
          }
        );
      }
    );
  };

  //Vote verification via PLONK
  const [voteString, setVoteString] = useState('');
  const [voteProof, setVoteProof] = useState('');
  const [voteSignals, setVoteSignals] = useState('');
  const [isVoteValid, setIsVoteValid] = useState(false);
  const [voteProofSC1, setVoteProofSC1] = useState<`0x${string}` | undefined>();
  const [voteProofSC2, setVoteProofSC2] = useState<BigNumber | undefined>('');
  const [yesResponse, setYesResponse] = useState(Boolean);

  const wasmFileVoteYes =
    'http://localhost:8000/plonk/votecheck/yes_vote_check/yes_vote_check_js/yes_vote_check.wasm';
  const zkeyFileVoteYes =
    'http://localhost:8000/plonk/votecheck/yes_vote_check/yes_vote_check_final.zkey';
  const verificationKeyVoteYes =
    'http://localhost:8000/plonk/votecheck/yes_vote_check/verification_key.json';

  const wasmFileVoteNo =
    'http://localhost:8000/plonk/votecheck/no_vote_check/no_vote_check_js/no_vote_check.wasm';
  const zkeyFileVoteNo =
    'http://localhost:8000/plonk/votecheck/no_vote_check/no_vote_check_final.zkey';
  const verificationKeyVoteNo =
    'http://localhost:8000/plonk/votecheck/no_vote_check/verification_key.json';

  const { config: yesVoteConfig } = usePrepareContractWrite({
    address: '0x090494f3c0e5ef54D25Faac8b881A29D04A6E82f',
    abi: VoteYesVerifierAbi,
    functionName: 'verifyProof',
    args: [voteProofSC1, voteProofSC2],
    // onSuccess(data) {
    //   console.log('Success', data);
    // },
  });

  const { write: voteYesWrite } = useContractWrite(yesVoteConfig);

  // const { data: useWaitForTransactionData, isSuccess } = useWaitForTransaction({
  //   hash: useContractWriteData?.hash,
  // });

  // const { data: yesResponseSC } = useContractRead({
  //   address: '0x090494f3c0e5ef54D25Faac8b881A29D04A6E82f',
  //   abi: VoteYesVerifierAbi,
  //   functionName: 'verifyProof',
  //   args: [voteProofSC1, voteProofSC2],
  // });

  // useEffect(() => {
  //   if (yesResponseSC) {
  //     let temp = yesResponseSC;
  //     console.log(temp);
  //     setYesResponse(temp);
  //   }
  // }, [voteProofSC2]);

  // const { read: voteYesWrite } = useContractWrite(yesVoteReadConfig);

  // useContractEvent({
  //   address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  //   abi: VoteYesVerifierAbi,
  //   eventName: 'VerifySuccess',
  //   listener(message) {
  //     console.log(message);
  //   },
  // });

  const { config: noVoteConfig } = usePrepareContractWrite({
    address: '0xd0EC3784eF33060483b00939Ea499307d9D7072c',
    abi: VoteNoVerifierAbi,
    functionName: 'verifyProof',
    args: [voteProofSC1, voteProofSC2],
  });

  const { write: voteNoWrite } = useContractWrite(noVoteConfig);

  const makeVoteCallData = async (_proofInput, _wasm, _zkey) => {
    const { proof, publicSignals } = await snarkjs.plonk.fullProve(
      _proofInput,
      _wasm,
      _zkey
    );
    const callData = await snarkjs.plonk.exportSolidityCallData(
      proof,
      publicSignals
    );
    console.log(callData.split(',')[0]);
    console.log(JSON.parse(callData.slice(callData.indexOf(',') + 1)));
    setVoteProofSC1(callData.split(',')[0]);
    setVoteProofSC2(JSON.parse(callData.slice(callData.indexOf(',') + 1)));
  };

  const runVoteYesProofs = () => {
    const vote = voteToBinary(voteString).length;
    console.log(voteToBinary(voteString));
    const proofInput = { vote };
    console.log(proofInput);

    makePlonkProof(proofInput, wasmFileVoteYes, zkeyFileVoteYes).then(
      ({ proof: _proof, publicSignals: _signals }) => {
        setVoteProof(JSON.stringify(_proof, null, 2));
        setVoteSignals(JSON.stringify(_signals, null, 2));
        verifyPlonkProof(verificationKeyVoteYes, _signals, _proof).then(
          (_isValid) => {
            setIsVoteValid(_isValid);
          }
        );
        makeVoteCallData(proofInput, wasmFileVoteYes, zkeyFileVoteYes);
      }
    );
  };

  const runVoteNoProofs = () => {
    const vote = voteToBinary(voteString).length;
    console.log(voteToBinary(voteString));
    const proofInput = { vote };
    console.log(proofInput);

    makePlonkProof(proofInput, wasmFileVoteNo, zkeyFileVoteNo).then(
      ({ proof: _proof, publicSignals: _signals }) => {
        setVoteProof(JSON.stringify(_proof, null, 2));
        setVoteSignals(JSON.stringify(_signals, null, 2));
        verifyPlonkProof(verificationKeyVoteNo, _signals, _proof).then(
          (_isValid) => {
            setIsVoteValid(_isValid);
          }
        );
        makeVoteCallData(proofInput, wasmFileVoteNo, zkeyFileVoteNo);
      }
    );
  };

  //SEMAPHORE STUFF
  const [identity, setIdentity] = useState<Identity>();
  const [group, setGroup] = useState<Group>(new Group(1));

  const [semaphoreProof, setSemaphoreProof] = useState('');

  const externalNullifier = utils.formatBytes32String('Topic');
  const snarkArtifactsPath = 'zkproof/../../artifacts/snark';

  //for creating pool
  const [pollId, setPollId] = useState<BigNumber | undefined>();
  const [coordinator, setCoordinator] = useState<`0x${string}` | undefined>();
  const [merkleTreeDepth, setMerkleTreeDepth] = useState<
    BigNumber | undefined
  >();

  const { data: signer, isError, isLoading } = useSigner();

  const contract = useContract({
    address: '0x5b7fAb089fAEbd3f98c96487Cb1ce04a7c44cE44',
    abi: SemaphoreVotingAbi,
    signerOrProvider: signer,
  });

  const setCoordinatorAddress = async () => {
    const address = await signer.getAddress();
    setCoordinator(`0x${address.slice(2)}`);
    console.log(coordinator);
  };

  const createBallout = async () => {
    console.log(pollId);
    console.log(coordinator);
    console.log(merkleTreeDepth);

    const myGasLimit = BigNumber.from(5000000);

    await contract.createPoll(pollId, coordinator, merkleTreeDepth, {
      gasLimit: myGasLimit,
    });
  };

  //for adding voter
  // const [identityCommitment, setIdentityCommitment] = useState('');

  // const { config: addVoterConfig } = usePrepareContractWrite({
  //   address: '0x89490c95eD199D980Cdb4FF8Bac9977EDb41A7E7 ',
  //   abi: SemaphoreVotingAbi,
  //   functionName: 'addVoter',
  //   args: [pollId, identityCommitment],
  // });

  // const { write: addVoter } = useContractWrite(addVoterConfig);

  //for start pool
  // const [encryptionKey, setEncryptionKey] = useState('');

  // const { config: startPollConfig } = usePrepareContractWrite({
  //   address: '0x89490c95eD199D980Cdb4FF8Bac9977EDb41A7E7 ',
  //   abi: SemaphoreVotingAbi,
  //   functionName: 'startPoll',
  //   args: [pollId, encryptionKey],
  // });

  // const { write: startPoll } = useContractWrite(startPollConfig);

  //for cast vote
  // const [semaphoreVote, setSemaphoreVote] = useState('');
  // const [nullifierHash, setNullifierHash] = useState('');

  // const { config: castVoteConfig } = usePrepareContractWrite({
  //   address: '0x89490c95eD199D980Cdb4FF8Bac9977EDb41A7E7 ',
  //   abi: SemaphoreVotingAbi,
  //   functionName: 'startPoll',
  //   args: [identityCommitment],
  // });

  // const { write: castVote } = useContractWrite(castVoteConfig);

  const createIdentity = () => {
    const _identity = new Identity();
    setIdentity(_identity);
    console.log(_identity.commitment);
  };

  const joinGroup = () => {
    console.log(group.members);
    const newGroup = new Group(1);
    newGroup.addMember(identity.commitment);
    setGroup(newGroup);
  };

  const greeting = utils.formatBytes32String('Hello World');

  const fullProof = async () => {
    const result = await generateProof(
      identity,
      group,
      externalNullifier,
      greeting
      // {
      //   wasmFilePath: `${snarkArtifactsPath}/semaphore.wasm`,
      //   zkeyFilePath: `${snarkArtifactsPath}/semaphore.zkey`,
      // }
    );

    const verified = await verifyMember(result, 20);
    console.log(verified);
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
                placeholder="Set Ballot Id"
                type="number"
                label="BallotId"
                onChange={(e) => setPollId(BigNumber.from(e.target.value))}
                errorBorderColor="red.300"
                style={{ marginBottom: '8px' }}
              />
              {/* <Input
                id="outlined-basic"
                placeholder="Coordinator"
                type="text"
                label="Coordinator"
                onChange={(e) => setCoordinator(`0x${e.target.value}`)}
                errorBorderColor="red.300"
                style={{ marginBottom: '8px' }}
              /> */}
              <Input
                id="outlined-basic"
                placeholder="Ballot Size"
                type="number"
                label="Ballot Size"
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
                onClick={createBallout}
                marginBottom="16px"
              >
                Create a Ballout
              </Button>
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={setCoordinatorAddress}
                marginBottom="16px"
              >
                Set a Coordinator Address
              </Button>
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={joinGroup}
                marginBottom="16px"
              >
                Join a Ballout
              </Button>
              <Button
                variant="solid"
                bg="black"
                _hover={{ bg: 'gray.600' }}
                color="white"
                onClick={fullProof}
                marginBottom="16px"
              >
                Create a full proof
              </Button>
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

export default Home;

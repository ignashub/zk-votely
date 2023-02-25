import type { NextPage } from 'next';
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
import {
  generateProof,
  verifyProof as verifyMember,
} from '@semaphore-protocol/proof';
import { Group } from '@semaphore-protocol/group';

const Home: NextPage = () => {
  //SEMAPHORE STUFF
  const [identity, setIdentity] = useState<Identity>();
  const [group, setGroup] = useState<Group>(new Group(1));

  const [semaphoreProof, setSemaphoreProof] = useState('');

  const externalNullifier = utils.formatBytes32String('Topic');
  const snarkArtifactsPath = 'zkproof/../../artifacts/snark';

  //For creating pool
  const [pollId, setPollId] = useState<BigNumber | undefined>();
  const [coordinator, setCoordinator] = useState<`0x${string}` | undefined>();
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
    const myGasLimit = BigNumber.from(5000000);
    setLoadingAlert(true);

    try {
      let result = await contract.createPoll(
        pollId,
        coordinator,
        merkleTreeDepth,
        {
          gasLimit: myGasLimit,
        }
      );
      const receipt = await result.wait();
      // Check the status of the transaction
      if (receipt.status === 1) {
        // Transaction succeeded
        setLoadingAlert(false);
        setSuccessfulAlert(true);
        setTimeout(() => {
          setSuccessfulAlert(false);
        }, 5000);
      }
    } catch (error: any) {
      // Transaction failed
      setLoadingAlert(false);
      setErrorAlert(true);
      setTimeout(() => {
        setErrorAlert(false);
      }, 5000);
    }
  };

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
                placeholder="Set Ballot Id dont use the same one"
                type="number"
                label="BallotId"
                onChange={(e) => setPollId(BigNumber.from(e.target.value))}
                errorBorderColor="red.300"
                style={{ marginBottom: '8px' }}
              />
              <Input
                id="outlined-basic"
                placeholder="Ballot Size Minimum 16"
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

export default Home;

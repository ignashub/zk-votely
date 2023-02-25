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

    try {
      let result = await contract.createPoll(
        pollId,
        coordinator,
        merkleTreeDepth,
        {
          gasLimit: myGasLimit,
        }
      );
      console.log(`${coordinator} and ballout id ${pollId}`);
    } catch (error: any) {
      console.error('Error fetching data', error);
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

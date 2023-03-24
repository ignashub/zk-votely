import type { NextPage } from 'next';
import { useQuery, gql } from '@apollo/client';
import { SimpleGrid } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Text, Box, Heading, Button, Flex } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useSigner } from 'wagmi';
import { Identity } from '@semaphore-protocol/identity';
import { PollCard } from '../components/PollCard';

const POLLS_QUERY = gql`
  query GetAllPolls {
    polls {
      id
      title
      description
      merkleTreeDepth
      votingOptions {
        id
        value
      }
    }
  }
`;
const Voter: NextPage = () => {
  const router = useRouter();
  //SEMAPHORE STUFF
  const [identity, setIdentity] = useState<Identity>();

  //Get all polls
  const { data: pollData, loading, error } = useQuery(POLLS_QUERY);

  //Smart Contract Signer
  const { data: signer, isError, isLoading } = useSigner();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const { polls } = pollData;

  const goToHomePage = () => {
    router.push('/');
  };

  const createIdentity = async () => {
    try {
      const _identity = new Identity();
      setIdentity(_identity);
      console.log(_identity.commitment);
    } catch (error) {
      console.error('Error creating identity:', error);
    }
  };

  // const postVote = async () => {
  //   if (!contract) {
  //     console.error('Smart contract is not loaded');
  //     return;
  //   }
  //   if (!pollId) {
  //     console.error('Poll ID is missing');
  //     return;
  //   }
  //   setLoadingAlert(true);

  //   const newGroup = await createNewGroup();
  //   const fullProof = await makeVoteProof(newGroup);

  //   const proofArray = fullProof.proof.map(
  //     (value: BigNumber | string | number | null | undefined | BN) => value
  //   );
  //   console.log(proofArray);

  //   console.log(`vote on postVote: ${vote}`);
  //   console.log(`pollID on postVote: ${pollId}`);
  //   console.log(`Group root on postVote: ${newGroup.root}`);

  //   try {
  //     const myGasLimit = BigNumber.from(5000000);
  //     const nullifierHash = BigNumber.from(fullProof.nullifierHash);
  //     console.log(nullifierHash);
  //     let result = await contract.castVote(
  //       vote,
  //       nullifierHash,
  //       pollId,
  //       proofArray,
  //       newGroup.root,
  //       {
  //         gasLimit: myGasLimit,
  //       }
  //     );
  //     const receipt = await result.wait();
  //     if (receipt.status === 1) {
  //       setLoadingAlert(false);
  //       setSuccessfulAlert(true);
  //       setTimeout(() => {
  //         setSuccessfulAlert(false);
  //       }, 5000);
  //     }
  //   } catch (error) {
  //     console.error('Error voting:', error);
  //     setLoadingAlert(false);
  //     setErrorAlert(true);
  //     setTimeout(() => {
  //       setErrorAlert(false);
  //     }, 5000);
  //   }
  // };

  return (
    <>
      <main
        data-testid="Layout"
        id="maincontent"
        className="flex flex-col items-center justify-center flex-grow mt-4 mb-8 space-y-8 md:space-y-16 md:mt-8 md:mb-16"
      >
        {/* <Section> */}
        <Box maxW="xl" w="full" p="6" rounded="lg" shadow="md">
          <Flex flexDir="column" alignItems="center">
            <Button
              variant="solid"
              bg="black"
              _hover={{ bg: 'gray.600' }}
              color="white"
              onClick={goToHomePage}
              mb="4"
              alignSelf="flex-start"
            >
              Back
            </Button>
            <Heading size="xl" mt="8" mb="4">
              Create an Identity
            </Heading>
            {identity ? (
              <Box py="6">
                <Box
                  p="5"
                  borderWidth={1}
                  borderColor="gray.500"
                  borderRadius="4px"
                >
                  <Heading size="lg" lineHeight="tall">
                    <Text>Your Public Identity:</Text>
                    <Text
                      as="span"
                      px="2"
                      py="1"
                      borderRadius="full"
                      bg="teal.300"
                      fontWeight="bold"
                      wordBreak="break-word"
                      fontSize="xl"
                    >
                      {identity.commitment.toString()}
                    </Text>
                  </Heading>
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
              mr={[0, '4']}
              mb={['4', 4]}
              w={['full', 'auto']}
              isDisabled={!signer}
            >
              Create an Identity
            </Button>
          </Flex>
        </Box>
        <Heading size="xl" mt="8" mb="4">
          Ballots to vote on
        </Heading>
        <SimpleGrid columns={[1, 2, 3]} spacing="8">
          {polls.map(
            (poll) =>
              identity && (
                <PollCard
                  key={poll.id}
                  title={poll.title}
                  description={poll.description}
                  votingOptions={poll.votingOptions}
                  pollId={poll.id}
                  identity={identity}
                  merkleTreeDepth={poll.merkleTreeDepth}
                />
              )
          )}
        </SimpleGrid>
        {/* </Section> */}
      </main>
    </>
  );
};

export default Voter;

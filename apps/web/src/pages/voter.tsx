import type { NextPage } from 'next';
import { useQuery, gql } from '@apollo/client';
import { SimpleGrid } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Text, Box, Heading, Button, Flex } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useSigner } from 'wagmi';
import { Identity } from '@semaphore-protocol/identity';
import { PollCard } from '../components/PollCard';
import { POLLS_QUERY } from '../queries/polls';

const Voter: NextPage = () => {
  const router = useRouter();
  //SEMAPHORE STUFF
  const [identity, setIdentity] = useState<Identity>();

  //Get all polls
  const { data: pollData, loading, error } = useQuery(POLLS_QUERY);

  //Smart Contract Signer
  const { data: signer, isError, isLoading } = useSigner();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

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

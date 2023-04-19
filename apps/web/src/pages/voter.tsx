import type { NextPage } from 'next';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import {
  Text,
  Box,
  Heading,
  Button,
  Flex,
  SimpleGrid,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { useSigner } from 'wagmi';
import { Identity } from '@semaphore-protocol/identity';
import { PollCard } from '../components/PollCard';
import { Modal } from '../components/Modal';
import { POLLS_QUERY } from '../queries/polls';
import { BigNumber } from 'ethers';

const Voter: NextPage = () => {
  const router = useRouter();
  const [identity, setIdentity] = useState<Identity>();
  const { data: pollData, loading, error } = useQuery(POLLS_QUERY);
  const { data: signer } = useSigner();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const goToHomePage = () => {
    router.push('/');
  };

  const createIdentity = async () => {
    console.log(BigNumber.from(123456789));
    try {
      const _identity = new Identity();
      setIdentity(_identity);
      console.log(_identity);
      console.log(_identity.commitment);
    } catch (error) {
      console.error('Error creating identity:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const { polls } = pollData;

  return (
    <>
      <main
        data-testid="Layout"
        id="maincontent"
        className="flex flex-col items-center justify-center flex-grow mt-4 mb-8 space-y-8 md:space-y-16 md:mt-8 md:mb-16"
      >
        <Box maxW="xl" w="full" p="6" rounded="lg" boxShadow="dark-lg">
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
            <Heading size="xl" mb="10">
              Create an Identity
            </Heading>
            {identity ? (
              <>
                <Button
                  variant="solid"
                  bg="black"
                  _hover={{ bg: 'gray.600' }}
                  color="white"
                  onClick={onOpen}
                  mr={[0, '4']}
                  mb={['4', 4]}
                  w={['full', 'auto']}
                >
                  View Your Public Identity
                </Button>
                <Modal
                  title="Public Identity"
                  isOpen={isOpen}
                  onClose={onClose}
                  content={
                    <Text
                      as="span"
                      px="2"
                      py="1"
                      borderRadius="full"
                      fontWeight="bold"
                      wordBreak="break-word"
                      fontSize="xl"
                    >
                      {identity.commitment.toString()}
                    </Text>
                  }
                />
              </>
            ) : (
              <></>
            )}
            {!identity && (
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
            )}
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
                  state={poll.state}
                  userType="voter"
                />
              )
          )}
        </SimpleGrid>
      </main>
    </>
  );
};

export default Voter;

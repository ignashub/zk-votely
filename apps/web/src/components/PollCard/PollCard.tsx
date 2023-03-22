import React, { useState } from 'react';
import { Box, VStack, Text, RadioGroup, Radio, Button } from '@chakra-ui/react';
import { useJoinBallot } from '../../hooks/useJoinBallot';

interface PollCardProps {
  title: string;
  description: string;
  votingOptions: string[];
  pollId: string;
  identityCommitment: string;
}

export const PollCard: React.FC<PollCardProps> = ({
  title,
  description,
  votingOptions,
  pollId,
  identityCommitment,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleChange = (value: string) => {
    setSelectedOption(parseInt(value));
  };

  // Use the custom hook
  const { castVote, error } = useJoinBallot(
    pollId.toString(),
    identityCommitment.toString()
  );

  // Update the handleJoinBallot function to call castVote
  const handleJoinBallot = async () => {
    await castVote();
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
        >
          Join a Ballot
        </Button>
        <Button
          variant="solid"
          bg="black"
          _hover={{ bg: 'gray.600' }}
          color="white"
          // onClick={postVote}
          mr={[0, '4']}
          mb={['4', 0]}
          w={['full', 'auto']}
        >
          Vote
        </Button>
      </VStack>
    </Box>
  );
};

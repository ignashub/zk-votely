import { React } from 'react';
import { Box, VStack, Text, RadioGroup, Radio } from '@chakra-ui/react';

interface PollCardProps {
  title: string;
  description: string;
  votingOptions: string[];
  pollId: string;
}

export const PollCard: React.FC<PollCardProps> = ({
  title,
  description,
  votingOptions,
  pollId,
}) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" padding="4">
      <VStack align="start">
        <Text fontSize="2xl" fontWeight="bold">
          {title}
        </Text>
        <Text fontSize="md">{description}</Text>
        <RadioGroup>
          {votingOptions.map((option, index) => (
            <Radio key={`${pollId}-${index}`} value={index.toString()}>
              {option}
            </Radio>
          ))}
        </RadioGroup>
      </VStack>
    </Box>
  );
};

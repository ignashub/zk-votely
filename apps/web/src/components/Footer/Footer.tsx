import {
  Box,
  Stack,
  IconButton,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaGithub } from 'react-icons/fa';

export const Footer: React.FC<> = () => {
  return (
    <Box
      as="footer"
      role="contentinfo"
      mx="auto"
      maxW="7xl"
      py="12"
      px={{ base: '4', md: '8' }}
    >
      <Stack direction="row" spacing="4" align="center" justify="space-between">
        <Box>
          <Text
            as="p"
            fontSize={{ base: 'lg', md: 'xl' }}
            color={useColorModeValue('gray.500', 'gray.300')}
            mt={3}
          >
            Byont Ventures B.V. © 2023
          </Text>
        </Box>
        <Box>
          <Stack direction="row" spacing="6">
            <IconButton
              as="a"
              href="https://github.com/Byont-Ventures/poc-zk-snarks-voting-template"
              target="_blank"
              aria-label="Github"
              icon={<FaGithub fontSize="20px" />}
              variant="ghost"
            />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

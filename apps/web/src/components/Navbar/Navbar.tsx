import { Box, Flex, Link, useColorModeValue, Icon } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { FiUsers, FiCheckSquare } from 'react-icons/fi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Navbar: React.FC<> = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.900', 'white');
  const router = useRouter();

  const isActiveLink = (href: string) => router.asPath === href;

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      paddingY={2}
      paddingX={4}
      bg={bgColor}
      color={color}
      boxShadow="sm"
    >
      <Flex align="center" mr={5}>
        <Box fontWeight="bold" fontSize="3xl">
          <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
            ZK VOTELY
          </Link>
        </Box>
      </Flex>
      <Box
        display={{ base: 'none', md: 'flex' }}
        alignItems="center"
        flexGrow={1}
        justifyContent="flex-end"
      >
        <Link
          as={NextLink}
          mr={5}
          color={isActiveLink('/coordinator') ? 'black' : 'gray.400'}
          fontWeight="bold"
          href="/coordinator"
          _hover={{
            textDecoration: 'none',
            color: 'black',
            fontWeight: 'bold',
          }}
          display="flex"
          alignItems="center"
          fontSize="2xl"
        >
          <Icon as={FiUsers} mr={1} />
          Coordinator
        </Link>
        <Link
          as={NextLink}
          mr={5}
          color={isActiveLink('/voter') ? 'black' : 'gray.400'}
          fontWeight="bold"
          href="/voter"
          _hover={{
            textDecoration: 'none',
            color: 'black',
            fontWeight: 'bold',
          }}
          display="flex"
          alignItems="center"
          fontSize="2xl"
        >
          <Icon as={FiCheckSquare} mr={1} />
          Voter
        </Link>
        <ConnectButton />
      </Box>
    </Flex>
  );
};

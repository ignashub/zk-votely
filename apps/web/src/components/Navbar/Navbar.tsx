import { Box, Flex, Link, useColorMode, Icon } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { FiUsers, FiCheckSquare, FiMoon, FiSun } from 'react-icons/fi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Navbar: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = { light: 'white', dark: 'gray.800' };
  const color = { light: 'gray.900', dark: 'white' };
  const activeColor = { light: 'black', dark: 'white' };
  const activeColorSwitcher = { light: 'black', dark: 'white' };
  const inactiveColor = { light: 'gray.500', dark: 'gray.500' };
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
      bg={bgColor[colorMode]}
      color={color[colorMode]}
      boxShadow="sm"
    >
      <Flex align="center" mr={5}>
        <Box fontWeight="bold" fontSize="3xl">
          <Link
            as={NextLink}
            href="/"
            _hover={{ textDecoration: 'none' }}
            onClick={() => {
              // Close any mobile menu when the home link is clicked
              const mobileMenu = document.getElementById('mobile-menu');
              if (mobileMenu) {
                mobileMenu.classList.remove('show');
              }
            }}
          >
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
          color={
            isActiveLink('/coordinator')
              ? activeColor[colorMode]
              : inactiveColor[colorMode]
          }
          fontWeight="bold"
          href="/coordinator"
          _hover={{
            textDecoration: 'underline',
            color: activeColor[colorMode],
            fontWeight: 'bold',
          }}
          display="flex"
          alignItems="center"
          fontSize="2xl"
          textDecoration={isActiveLink('/coordinator') ? 'underline' : 'none'}
        >
          <Icon as={FiUsers} mr={1} />
          Coordinator
        </Link>
        <Link
          as={NextLink}
          mr={5}
          color={
            isActiveLink('/voter')
              ? activeColor[colorMode]
              : inactiveColor[colorMode]
          }
          fontWeight="bold"
          href="/voter"
          _hover={{
            textDecoration: 'underline',
            color: activeColor[colorMode],
            fontWeight: 'bold',
          }}
          display="flex"
          alignItems="center"
          fontSize="2xl"
          textDecoration={isActiveLink('/voter') ? 'underline' : 'none'}
        >
          <Icon as={FiCheckSquare} mr={1} />
          Voter
        </Link>
        <Icon
          as={colorMode === 'light' ? FiMoon : FiSun}
          fontSize="2xl"
          cursor="pointer"
          onClick={toggleColorMode}
          mr={5}
          color="gray.500"
          _hover={{
            color: activeColorSwitcher[colorMode],
          }}
        />
        <ConnectButton />
      </Box>
    </Flex>
  );
};

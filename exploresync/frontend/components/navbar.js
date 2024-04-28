// navbar implementation was inspired by chakra navbar templates: https://chakra-templates.dev/navigation/navbar

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Link,
  Flex,
  Avatar,
  HStack,
  Center,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorMode,
  useColorModeValue,
  Stack,
  Icon
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { MdHome } from "react-icons/md";
import { ThemeToggle } from './themeToggle';
import { TwoFAButton } from './twoFAButton';
import { logout } from "../api/api.mjs";

// Insert the page name along with the url here
// const Pages = {'Dashboard': './main' };

export function Navbar(props) {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const { user } = props;

  async function logoutUser() {
    logout().then(res => {
      if (res.success) {
        router.push({ pathname: '/'});
      }
    })
  }

  function returnToHome() {
    router.push({ pathname: '/main'});
  }

  return ( 
    <> 
      { user != null ?
        <Box bg={colorMode === 'dark' ? 'gray.900' : 'gray.100'} px={4} h={16} position='fixed' w='full' zIndex={1002}>
          <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
            <IconButton size={'md'} onClick={returnToHome} icon={<Icon as={MdHome} boxSize={6} />} />
            {/* <IconButton
              size={'md'}
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              display={{ md: 'none' }}
              onClick={isOpen ? onClose : onOpen}
            /> */}
            
            <HStack spacing={8} alignItems={'center'}>
              <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
                {/* { Object.entries(Pages).map(([page_name, url], index) => {
                  return <Link key={index} mx={2} href={url} fontWeight="semibold"> {page_name} </Link>
                })} */}
              </HStack>
            </HStack>

            <Flex alignItems={'center'}>
              <ThemeToggle />
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  minW={0}>
                  <Avatar name={user.username} size={'sm'} />
                </MenuButton>
                <MenuList alignItems={'center'}>
                  <Center>
                    <p> Logged in as {user.username} </p>
                  </Center>
                  <MenuDivider />
                  <TwoFAButton user={user}/> 
                  <MenuItem onClick={logoutUser}>Logout</MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          </Flex>

          {isOpen ? (
            <Box pb={4} display={{ md: 'none' }} position='fixed' w='full'>
              {/* <Stack as={'nav'} spacing={4}>
                { Object.entries(Pages).map(([page_name, url], index) => {
                  return <Link key={index} mx={2} href={url} fontWeight="semibold"> {page_name} </Link>
                })}
              </Stack> */}
            </Box>
          ) : null}
        </Box> 
        :
        <ThemeToggle />
      }
    </>
  )
}

export default Navbar
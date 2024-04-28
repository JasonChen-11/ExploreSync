// sidebar implementation was inspired by chakra sidebar templates: https://chakra-templates.dev/navigation/sidebar

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic  from 'next/dynamic';

import { getGroup } from "../api/api.mjs"  ;
import { getUser, redirectLogin } from "../utils/utils.js";
import { CalendarIcon } from '@chakra-ui/icons'
import { GrMapLocation } from "react-icons/gr";
import { FaListUl } from "react-icons/fa";
import {
  IconButton,
  Icon,
  Box,
  Flex,
  useColorModeValue,
  Text,
  Button,
  VStack,
  Divider,
  CircularProgress,
} from '@chakra-ui/react'
import { ChatBox } from "../components/chatBox";
import { EventsContainer } from "../components/eventsContainer";
import { Notification } from '../components/notification.js';
import { io } from 'socket.io-client';
import { EventsCalendar } from "../components/eventsCalendar.js";
import { getGroupMembers } from '../api/api.mjs';

export async function getServerSideProps(context) {
  const propsData = await getUser(context);
  if (!propsData) {
    return redirectLogin();
  }
  const { group_id } = context.query;
  const groups = await getGroupMembers(group_id, context.req.headers.cookie);
  if (!groups || !groups.includes(propsData.props.user.username)) {
    return redirectLogin();
  }
  return propsData;
}

export default function Group({ user }) {
  const router = useRouter();
  const { group_id } = router.query;
  const [group, setGroup] = useState({});
  const [selectedComponent, setSelectedComponent] = useState();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {   
    
    socketRef.current = io(`${process.env.NEXT_PUBLIC_BACKEND}`);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', user.username, group_id);
    });

    setSelectedComponent(Components[0].content);
    getGroup(group_id).then(setGroup)
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Home page
  const Home = () => {
    return (
      <>  
        {/* <Heading mb={5} textAlign={{ base: 'center', md: 'start'}}> {group.title} </Heading> */}
        <Flex h={{ base:'auto', md: '80vh' }} flexDir={{ base: 'column', md: 'row' }}>
          <DynamicMap groupMembers={group.members} username={user.username} groupId={group_id} socket={socketRef.current}/>
          {/* <EventsContainer username={user.username} groupId={group_id} /> */}
        </Flex>
      </>
    );
  }

  const DynamicMap = dynamic(() => import('../components/Map/Map'), {
    loading: () => {
      return <Flex flex='1' h='100%' bg='gray.100' justify='center' alignItems='center'>
                <CircularProgress isIndeterminate size='100px'/>
             </Flex>
    },
    ssr: false,
  });

  const Events = () => <EventsContainer username={user.username} groupId={group_id} socket={socketRef.current} />

  const Calender = () => <EventsCalendar username={user.username} groupId={group_id} />

  // All components
  const Components = [
    { title: 'Home', content: Home, icon: GrMapLocation },
    { title: 'Events', content: Events, icon: FaListUl },
    { title: 'Calendar', content: Calender, icon: CalendarIcon },
  ]

  return (
    <Flex flexDirection={{ base: 'column', md: 'row' }} pt={16}>
      {/* sidebar */}
      <VStack h='93vh' 
              w='220px'
              p={6} 
              pt={6}
              borderRight='1px' 
              borderColor={useColorModeValue('gray.200', 'gray.600')}
              display={{ base: "none", md: "flex" }} 
              spacing={6}
              position="fixed"
              zIndex={1001}
              >
        <Flex w="full" justifyContent="space-between">
          <Text fontSize="xl" fontWeight="bold" w="75%" style={{textWrap: 'wrap'}}> {group.title} </Text>
          <Notification group_id={group_id} username={user.username} socket={socketRef.current}/>
        </Flex>
        <Divider />

        { Components.map((component, index) => {
          return <Button 
                      bg={useColorModeValue(index === selectedIndex ? 'gray.200' : 'none', index === selectedIndex ? 'gray.600' : 'none')}
                      isDisabled={index === selectedIndex}
                      key={index}
                      w="full"
                      h="50px"
                      fontWeight='semibold' 
                      fontSize='md'
                      borderRadius="lg"
                      cursor="pointer"
                      justifyContent="flex-start"
                      _hover={{ bg: useColorModeValue(index === selectedIndex ? 'gray.200' : 'gray.100', index === selectedIndex ? 'gray.600' : 'gray.700') }}
                      _disabled={{
                        opacity: 1,
                        cursor: 'not-allowed',
                        boxShadow: 'none',
                      }}
                      onClick={() => {setSelectedComponent(component.content); setSelectedIndex(index);}}
                  > 

                  <Icon as={component.icon} boxSize={4} mr={6}/>
                  <Text> {component.title} </Text>
                </Button>
        })}
      </VStack>

      {/* Mobile sidebar */}
      <Flex zIndex={999} px={4} py={2} borderBottom='1px' borderColor={useColorModeValue('gray.200', 'gray')} display={{ base: "flex", md: "none" }} alignItems='center'>
        <Flex w="100%" justifyContent="space-between">
          <Box>
            { Components.map((component, index) => {
              return <IconButton key={index} 
                                isDisabled={index === selectedIndex}
                                variant='outline' 
                                border='none' 
                                mr={2} 
                                onClick={() => {setSelectedComponent(component.content); setSelectedIndex(index);}}
                                icon={<Icon as={component.icon} boxSize={4} />} />
            })}
          </Box>
          <Notification group_id={group_id} username={user.username} socket={socketRef.current} />
          </Flex>
      </Flex>
      
      <Text fontSize="xl" fontWeight="bold" w='full' textAlign='center' my={3} display={{ base: 'block', md: 'none' }}> {group.title} </Text>
      <Box ml={{ base: 0, md: '220px' }} flex='1' py={{ base: 3, md: 6 }}  px={{ base: 4, md: 6 }}>{selectedComponent}</Box>
      <ChatBox username={user.username} group_id={group_id} socket={socketRef.current}/>
    </Flex>
  );
}


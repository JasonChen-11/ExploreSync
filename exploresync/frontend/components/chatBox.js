import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  Textarea,
  VStack,
  useColorModeValue,
  Flex,
  Avatar,
  AvatarBadge,
  Divider,
  Stack,
  Badge
} from '@chakra-ui/react';
import { MdSend } from "react-icons/md";
import { getGroupMembers } from "../api/api.mjs";
import { Message } from "./message";

/* Prompt: How do I set up sockets for a chat room using Socket.io and React?
  Response:

  React App:
  useEffect(() => {
    // Listen for incoming messages
    socket.on('chat message', (message) => {
      setMessages([...messages, message]);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [messages]);

  const sendMessage = () => {
    // Emit a message to the server
    socket.emit('chat message', newMessage);
    setNewMessage('');
  };
*/

export function ChatBox(props) {
  const { username, group_id, socket } = props;
  const [messages, setMessages] = useState([]);
  const [counter, setCounter] = useState(10);
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const messageRef = useRef(null);
  const chatRef = useRef(null);
  
  useEffect(() => {
    getGroupMembers(group_id).then(setAllUsers);
    if (socket) {
  
      socket.on('updateUsers', (users) => {
        if (users) {
          setOnlineUsers(users.onlineUsers);
          setAllUsers((prevUsers) => {
            const index = prevUsers.findIndex(user => user === users.newUser);
    
            if (index === -1) {
              prevUsers.push(users.newUser)
            }
            return [...prevUsers];
          });
        }
      });
  
      socket.on('get messages', (messages) => {
        if (messages) {
          setMessages(messages);
        }
      });
  
      socket.on('new message', (newMessage) => {
        if (newMessage) {
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          socket.emit('update chat notification count', { group_id, username });
        }
      });

      socket.on('get chat notification count', (newCount) => {
        if (newCount !== null) {
          setUnreadMessages(newCount);
        }
      })
    }
    return () => {
      if (socket) {
        socket.off('updateUsers');
        socket.off('get messages');
        socket.off('new message');
        socket.off('get chat notification count');
      }
    };
  }, [socket]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
    if (isChatOpen) {
      socket.emit('chat read', { group_id, username });
    }
  }, [messages, isChatOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const content = messageRef.current.value;
    socket.emit('add message', { username, content, group_id });
    messageRef.current.value = '';
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleScroll = () => {
    if (chatRef.current && chatRef.current.scrollTop === 0) {
      const oldHeight = chatRef.current.scrollHeight;
      const newCounter = counter + 10;
      setCounter(newCounter);
      setTimeout(() => {
        chatRef.current.scrollTop = chatRef.current.scrollHeight - oldHeight;
      }, 0);
    }
  };

  const sortedUsers = allUsers.sort((a, b) => {
    const aOnline = onlineUsers.includes(a);
    const bOnline = onlineUsers.includes(b);
  
    if (aOnline && !bOnline) {
      return -1;
    } else if (!aOnline && bOnline) {
      return 1;
    }
  
    return a.localeCompare(b);
  });

  return (
    <>
      <Box
        position="fixed"
        bottom="0"
        right="0"
        width={{ base: '100%', sm: '400px' }}
        overflow="hidden"
        zIndex={1001}
        bg={useColorModeValue('white', 'gray.700')}
        borderRadius="0"
        borderTopLeftRadius="xl"
        borderTopRightRadius="xl"
        boxShadow={useColorModeValue("0px 10px 10px lightgray", "0px 10px 10px black")}
      >
        <Button
          onClick={toggleChat}
          colorScheme="blue"
          size="md"
          width="100%"
          borderRadius="0"
          borderTopLeftRadius="xl"
          borderTopRightRadius="xl"
        >
          {isChatOpen ? "Minimize Chat" : "Open Chat"}
          {!isChatOpen 
            && unreadMessages !== 0 
            && unreadMessages !== undefined 
            && unreadMessages > 0 
            &&
            <Flex
            fontSize="xs"
              borderRadius="full"
              h="20px"
              w="20px"
              color="white"
              bottom="-6px"
              right="-6px"
              bg="red.600"
              alignItems="center"
              justifyContent="center"
              ml={2}
            >
                  {unreadMessages}
            </Flex>
          }
        </Button>
        <Flex
          height={isChatOpen ? "550px" : "0px"}
          maxH="calc(100vh - 100px)"
          transition="height 0.3s ease"
          flexDirection="column"
        >
          <Stack direction='row' p={2} overflowX='auto'>
            {sortedUsers.map((username, index) => (
              <Avatar boxSize='1.8em' key={index} name={username}>
                {onlineUsers.includes(username) ? (
                  <AvatarBadge boxSize='0.8em' bg='green.500' />
                ) : (
                  <AvatarBadge boxSize='0.8em' bg='gray.500' />
                )}
              </Avatar>
            ))}
          </Stack>

          <Divider />

          <VStack py={2} px={4} align="stretch" overflowY="auto" flex="1" ref={chatRef} onScroll={handleScroll}>
            {messages.length > 0 &&
              messages.slice(messages.length - (messages.length > counter ? counter : messages.length)).map((message) => (
                <Message key={message._id} message={message} isOwnMessage={message.author === username} />
              ))}
          </VStack>

          <Divider />

          <form onSubmit={handleSubmit}>
            <Flex px={6} py={4}>
              <FormControl>
                <Textarea
                  minH={0}
                  placeholder="Write a message..."
                  ref={messageRef}
                  resize="none"
                  focusBorderColor="blue.500"
                  borderColor={useColorModeValue('gray.200', 'gray')}
                  borderRadius="0"
                  borderTopLeftRadius="md"
                  borderBottomLeftRadius="md"
                  required
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      handleSubmit(e);
                    }
                  }}
                />
              </FormControl>
              <Flex alignItems="stretch">
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="sm"
                  borderRadius="0"
                  borderTopLeftRadius="0"
                  borderBottomLeftRadius="0"
                  borderTopRightRadius="md"
                  borderBottomRightRadius="md"
                  h="100%"
                >
                  <MdSend />
                </Button>
              </Flex>
            </Flex>
          </form>
        </Flex>
      </Box>
    </>
  );
}


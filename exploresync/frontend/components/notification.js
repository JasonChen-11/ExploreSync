import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Popover,
  PopoverTrigger,
  PopoverHeader,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  Flex,
  Divider
} from '@chakra-ui/react'
import { BellIcon } from '@chakra-ui/icons';
import { displayTimeStamp } from '../utils/utils';
export function Notification(props) {
  const { group_id, username, socket } = props;
  const [notifications, setNotifications] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on('get group notifications', (notifications) => {
        if (notifications) {
          setNotifications(notifications);
        }
      })

      socket.on('new group notification', (newNotification) => {
        if (newNotification) {
          setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
          socket.emit('update group notification count', { group_id, username });
        }
      });
  
      socket.on('get group notification count', (newCount) => {
        if (newCount !== null) {
          setUnreadNotifications(newCount);
        }
      })
    }
  }, [socket])

  useEffect(() => {
    if (isNotificationOpen) {
      socket.emit('group notification read', { group_id, username });
    }
  }, [notifications, isNotificationOpen]);

  return (
    <Popover
      placement="left-start"
      w="100%"
      isOpen={isNotificationOpen}
      onOpen={() => setIsNotificationOpen(true)}
      onClose={() => setIsNotificationOpen(false)}
    >
      <PopoverTrigger>
        <Button>
          <Flex
            alignItems="center"
            justifyContent="center"
            w={1}
            h={1}
          >
            <BellIcon w={6} h={6} />
          </Flex>
          {!isNotificationOpen 
            && unreadNotifications !== null
            && unreadNotifications !== undefined
            && unreadNotifications > 0
            &&
            <Flex
              fontSize="xs"
              borderRadius="full"
              h="20px"
              w="20px"
              color="white"
              position="absolute"
              bottom="-6px"
              right="-6px"
              bg="red.600"
              alignItems="center"
              justifyContent="center"
            >
                  {unreadNotifications}
            </Flex>
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent ml={4} minH="100px" maxH="400px" width={{ base:"300px", sm: "400px", md: "700px"}}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontSize="lg" >Notifications</PopoverHeader>
        <PopoverBody overflowY="scroll">
          {notifications && notifications.length ? notifications.map((notification, index) => (
            <Box key={notification._id}>
              <Box py={index == 0 ? 0 : 2} pb={2}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Box>
                    {notification.title}
                  </Box>
                  <Box color="gray.500" fontSize="sm">
                    {displayTimeStamp(notification.createdAt)}
                  </Box>
                </Flex>
                <Box>
                  {notification.description}
                </Box>
              </Box>
              <Divider />
            </Box>
          )) : 
            <Box>
              No notifications
            </Box>
          }
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
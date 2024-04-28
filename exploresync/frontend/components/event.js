import  React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import {
  Box,
  Text,
  Flex,
  VStack,
  Heading,
  Divider,
  Avatar,
  Icon,
  AvatarGroup,
  Button,
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  AccordionIcon,
  useToast,
} from '@chakra-ui/react'
import { FaLocationDot, FaRegClock  } from "react-icons/fa6";
import { FaCheck } from 'react-icons/fa';
import { RxCross2 } from "react-icons/rx";
import { MdOutlineQuestionMark } from "react-icons/md";
import { CiCircleMinus } from "react-icons/ci";
import { showToast } from "../utils/utils";
import { Review } from "../components/review";

export function Event(props) {
  const { username, event, updateResponse, allowEdit, allowDelete, deleteEvent, groupId, socket } = props;
  const toast = useToast();

  function sortAttendees(attendees) {
    const sortededAttendees = attendees.sort((a, b) => {
      const responseOrder = { 'Going': 1, 'Not Going': 2, 'Maybe': 3, 'Not Responded': 4 };
      return responseOrder[a.response] - responseOrder[b.response];
    })
    return sortededAttendees;
  }

  function emitResponse(updated_response) {
    socket.emit('add group notification', 
      {
        username: username,
        group_id: groupId,
        title: "New Response for an Event",
        description: 
          username + " has changed the response to '" + 
          updated_response + "'."
      }
    );
    showToast(toast, true, 'Response has been updated.')
  }

  /*
  Query:
  javascript how to obtain an object with a specific key-value pair from an array?

  Response:
  const array = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
  ];

  const keyToFind = 'id';
  const valueToFind = 2;

  const foundObject = array.find(item => item[keyToFind] === valueToFind);

  console.log(foundObject);
  */
  function isSameResponse(response) {
    const user = event.attendees.find(attendee => attendee.user === username);
    return user.response === response;
  }

  return (
    <AccordionItem border='none'>
      <AccordionButton justifyContent='space-between'>
        <Box>
          <Flex alignItems='center'>
            <VStack px={2}>
              <Heading fontSize={{ base:'2xl', md:'3xl' }}> {moment(event.date).format('MMM')} </Heading>
              <Heading fontSize={{ base:'3xl', md:'4xl' }}> {moment(event.date).format('DD')} </Heading>
            </VStack>

            <VStack ml={5} alignItems='flex-start'>
              <Flex alignItems="center">
                <Icon as={FaRegClock} mr={2} />
                <Text textAlign='left'> {moment(event.date).format('hh:mm A')} </Text>
              </Flex>

              <Flex alignItems="center">
                <Icon as={FaLocationDot} mr={2} />
                <Text textAlign='left'> {event.location}</Text>
              </Flex>

              <Text fontWeight='semibold' fontSize={{ base:'lg', md:'xl' }} textAlign='left'> {event.title} </Text>
            </VStack>
          </Flex>
        </Box>
        <AccordionIcon style={{height: '30px', width: '30px'}} />
      </AccordionButton>

      <AccordionPanel px={4}>
        <Divider mb={3} />

        <Text> {event.description} </Text>

        <Flex w={{ base: 'full', md: '400px' }} justify='space-between' alignItems='center'>
          { event.price && <Text> {event.price} </Text>}
          { event.rating && <Review rating={event.rating} review_count={event.review_count} popup={false} />}
        </Flex>
        
        {/* <Text fontWeight="semibold"> Created by {event.creator} </Text> */}
        <Flex flexWrap='wrap' mt={3}>
          <Flex alignItems="center" pl={1} minH={10} w='50%' maxW='600px'>
            <FaCheck size={20} style={{color: 'green'}} />
            <Text display={{ base: 'none', md: 'block' }} ml={2}>Going</Text>

            <AvatarGroup ml={3}>
              {sortAttendees(event.attendees)
                .filter((attendee) => attendee.response === "Going")
                .map((goingAttendee) => (
                  <Avatar key={goingAttendee.user} size="sm" name={goingAttendee.user} />
                ))}
            </AvatarGroup>
          </Flex>

          <Flex alignItems="center" minH={10} w='50%' maxW='600px'>
            <RxCross2 size={25} color="red.500" style={{color: 'red'}} />
            <Text display={{ base: 'none', md: 'block' }} ml={2}>Not going</Text>

            <AvatarGroup ml={3}>
              {sortAttendees(event.attendees)
                .filter((attendee) => attendee.response === "Not Going")
                .map((notGoingAttendee) => (
                  <Avatar key={notGoingAttendee.user} size="sm" name={notGoingAttendee.user} />
                ))}
            </AvatarGroup>
          </Flex>

          <Flex alignItems="center" minH={10} w='50%' maxW='600px'>
            <MdOutlineQuestionMark size={23} style={{color: 'orange'}} />
            <Text display={{ base: 'none', md: 'block' }} ml={2}>Maybe</Text>

            <AvatarGroup ml={3}>
              {sortAttendees(event.attendees)
                .filter((attendee) => attendee.response === "Maybe")
                .map((maybeAttendee) => (
                  <Avatar key={maybeAttendee.user} size="sm" name={maybeAttendee.user} />
                ))}
            </AvatarGroup>
          </Flex>

          <Flex alignItems="center" minH={10} w='50%' maxW='600px'>
            <CiCircleMinus size={25} style={{color: 'gray'}} />
            <Text display={{ base: 'none', md: 'block' }} ml={2}>Not responded</Text>

            <AvatarGroup ml={3}>
              {sortAttendees(event.attendees)
                .filter((attendee) => attendee.response === "Not Responded")
                .map((notRespondedAttendee) => (
                  <Avatar key={notRespondedAttendee.user} size="sm" name={notRespondedAttendee.user} />
                ))}
            </AvatarGroup>
          </Flex>
        </Flex>

        <Flex justify='flex-end' mt={5}>
          { allowEdit && 
            <Menu>
              <MenuButton as={Button} isTruncated> Change Response </MenuButton>
              <MenuList>
                <MenuItem onClick={() => updateResponse(event._id, "Going").then(emitResponse("Going"))} isDisabled={isSameResponse("Going")}>Going</MenuItem>
                <MenuItem onClick={() => updateResponse(event._id, "Not Going").then(emitResponse("Not Going"))} isDisabled={isSameResponse("Not Going")}>Not Going</MenuItem>
                <MenuItem onClick={() => updateResponse(event._id, "Maybe").then(emitResponse("Maybe"))} isDisabled={isSameResponse("Maybe")}>Maybe</MenuItem>
                <MenuItem onClick={() => updateResponse(event._id, "Not Responded").then(emitResponse("Not Responded"))} isDisabled={isSameResponse("Not Responded")}>Not Responded</MenuItem>
              </MenuList>
            </Menu>
          }
          { allowDelete && 
          <Button colorScheme='red' 
            ml={5} 
            onClick={() => 
                deleteEvent(event._id)
                .then(() => {
                  socket.emit('add group notification', 
                    {
                      username: username,
                      group_id: groupId,
                      title: "Event Deleted",
                      description: 
                        event.creator + " has deleted the event " + 
                        event.title + "."
                    }
                  );
                  showToast(toast, true, 'Event has been successfully deleted.')
                })
              }> Delete 
            </Button>
          }
        </Flex>
      </AccordionPanel>
    </AccordionItem>
  );
}

export default Event

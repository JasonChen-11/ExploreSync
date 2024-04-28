import  React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import {
  Box,
  VStack,
  Heading,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  AccordionIcon,
  Textarea,
  Text,
  Divider,
  useToast,
} from '@chakra-ui/react'
import { SmallAddIcon } from '@chakra-ui/icons';
import { getEvents, createEvent, updateResponse, deleteEvent } from "../api/api.mjs";
import { Event } from "../components/event";
import { showToast } from "../utils/utils";

export function EventsContainer(props) {
  const { username, groupId, socket } = props;
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invalidDateError, setInvalidDateError] = useState("");
  const titleRef = useRef(null);
  const locationRef = useRef(null);
  const descriptionRef = useRef(null);
  const dateRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (!groupId) return
    updateEvents();
  }, [groupId])

  function updateEvents() {
    getEvents(groupId).then(events => {
      if (events) {
        setUpcomingEvents(events.filter(event => !isPastDate(event.date)))
        setPastEvents(events.filter(event => isPastDate(event.date)))
      }
    })
  }

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const title = titleRef.current.value;
    const location = locationRef.current.value;
    const description = descriptionRef.current.value;
    const selected_date = moment(dateRef.current.value).toDate();
    if (isPastDate(selected_date)) {
      return setInvalidDateError('Must select date and time in the future');
    }
    createEvent(title, location, description, selected_date, groupId).then(res => {
      socket.emit('add group notification', 
        {
          username: username,
          group_id: groupId,
          title: "Event Created",
          description: 
            username + " created a new event for " + 
            title + " at " + 
            location + " on " + 
            moment(selected_date).format('MM/DD/YYYY h:mm A') + "."
        }
      );
      showToast(toast, true, 'Successfully added event ' + res.event.title);
      updateEvents();
    });

    e.target.reset();
    closeModal();
  };

  function isPastDate(date) {
    const today = moment();
    return moment(date).isBefore(today);
  }

  return (
    <VStack alignItems={{ base: "center", md: "flex-start"}}>
      <Button colorScheme="green" mb={5} onClick={openModal} size='md'> 
        Create an event 
        <SmallAddIcon boxSize={5} ml={2}/> 
      </Button>
      <Accordion w="full" allowMultiple defaultIndex={[0]} >
        <AccordionItem border='none' boxShadow="md" p={5} align='flex-start' mb={10}>
          <AccordionButton justifyContent='space-between' _hover={{bg: 'none'}}>
            <Heading fontSize='2xl' mb={3}> Upcoming Events </Heading>
            <AccordionIcon w='40px' h='40px'/>
          </AccordionButton>

          <AccordionPanel px={4}>
            <Accordion w="full" allowMultiple>
            { upcomingEvents.length > 0 ? upcomingEvents.sort((a, b) => moment(a.date).isBefore(moment(b.date)) ? -1 : 1).map((event) => (
                <Box key={event._id} mb={4} borderWidth="1px" borderRadius="lg" w='full'>
                  <Event 
                    username={username}
                    event={event} 
                    groupId={groupId}
                    socket={socket}
                    allowEdit={!isPastDate(event.date)}
                    allowDelete={event.creator === username} 
                    updateResponse={(eventId, response) => updateResponse(eventId, response).then(updateEvents)}
                    deleteEvent={(eventId) => deleteEvent(eventId).then(updateEvents)} ></Event>
                </Box>                                                       
            ))
            :
            <Box>
              <Divider />
              <Text fontSize="lg" fontWeight='semibold' mt={5}> None </Text>
            </Box>
            // <Text fontSize="lg" fontWeight='semibold'> None </Text>
            }
            </Accordion>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem border='none' boxShadow="md" p={5} align='flex-start'>
          <AccordionButton justifyContent='space-between' _hover={{bg: 'none'}}>
            <Heading fontSize='2xl' mb={3}> Past Events </Heading>
            <AccordionIcon w='40px' h='40px' />
          </AccordionButton>

          <AccordionPanel px={4}>                                              
            <Accordion w="full" allowMultiple>
            { pastEvents.length > 0 ? pastEvents.sort((a, b) => moment(a.date).isAfter(moment(b.date)) ? -1 : 1).map((event) => (
                <Box key={event._id} mb={4} borderWidth="1px" borderRadius="lg" w='full'>
                  <Event 
                    username={username}
                    event={event} 
                    groupId={groupId}
                    socket={socket}
                    allowDelete={event.creator === username} 
                    updateResponse={(eventId, response) => updateResponse(eventId, response).then(updateEvents)}
                    deleteEvent={(eventId) => deleteEvent(eventId).then(updateEvents)} ></Event>
                </Box>                                                       
            ))
            :
            <Box>
              <Divider />
              <Text fontSize="lg" fontWeight='semibold' mt={5}> None </Text>
            </Box>
            }
            </Accordion>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create an event</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
                <FormControl mb={4}>
                  <FormLabel>Title</FormLabel>
                  <Input
                    type="text"
                    ref={titleRef}
                    required
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Location</FormLabel>
                  <Input
                    type="text"
                    ref={locationRef}
                    required
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    resize="none"
                    ref={descriptionRef}
                    required
                  />   
                </FormControl>                                              

                <FormControl mb={4} isInvalid={invalidDateError}>
                  <FormLabel>Select date and time</FormLabel>
                  <Input
                    type="datetime-local"
                    ref={dateRef}
                    required
                  />
                  <FormErrorMessage> {invalidDateError} </FormErrorMessage>
                </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} type="submit">
                Submit
              </Button>
              <Button onClick={closeModal}>Close</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </VStack>
  );
}

export default EventsContainer
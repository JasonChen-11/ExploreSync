import  React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Text,
    Flex,
    VStack,
    Badge,
    Heading,
    Divider,
    Avatar,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Icon,
    AvatarGroup,
    HStack,
    Button,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody,
    useMediaQuery 
  } from '@chakra-ui/react'
  import { getEvents } from "../api/api.mjs";
  import FullCalendar from '@fullcalendar/react'
  import dayGridPlugin from '@fullcalendar/daygrid'
  import moment from 'moment';
  import { FaLocationDot, FaRegClock  } from "react-icons/fa6";

  export function EventsCalendar(props) {
    const { username, groupId } = props;
    const [events, setEvents] = useState([]);
    const [isMobile] = useMediaQuery("(max-width: 48em)");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [attendees, setAttendees] = useState([]);

    useEffect(() => {
      if (!groupId) return
      updateEvents();
    }, [groupId])
  
    function updateEvents() {
      getEvents(groupId).then(res => {
        if (res) setEvents(res);
      })
    }

    function openModal(eventInfo, attendees) {
      setIsModalOpen(true);
      setTitle(eventInfo.event.title);
      setTime(moment(eventInfo.event.start).format('LLLL'));
      setLocation(eventInfo.event.extendedProps.location);
      setAttendees(attendees);
    }
  
    function closeModal() {
      setIsModalOpen(false);
    }

    function renderEventContent(eventInfo) {
      const attendees = eventInfo.event.extendedProps.attendees
      .filter((attendee) => attendee.response === "Going")
      .map ((attendee) => attendee.user);
      return (
        <Button colorScheme='green'
                w='full' 
                h='full' 
                isTruncated 
                style={{ textWrap: 'wrap' }} 
                py={1}
                fontSize={{ base: 'xs', md: 'sm'}}
                onClick={() => openModal(eventInfo, attendees)}> 
          { isMobile ? 
            moment(eventInfo.event.start).format('h:mm A') : 
            eventInfo.event.title + ' @ ' + moment(eventInfo.event.start).format('h:mm A') 
          }
        </Button>
      )
    }

    return (
      <Box p={4} w='full'>
        <FullCalendar 
            plugins={[dayGridPlugin]}
            initialView='dayGridMonth'
            weekends={true}
            events={events}
            eventContent={renderEventContent}        
        />

        <Modal isOpen={isModalOpen} onClose={closeModal} size="md">
          <ModalOverlay />
          <ModalContent mt='auto' mb='auto'>
            <ModalHeader>{title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="start">
                <HStack>
                  <Icon as={FaRegClock} />
                  <Text>{time}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaLocationDot} />
                  <Text>{location}</Text>
                </HStack>
                <Divider />
                <Text fontWeight='semibold'> Attending: </Text>
                {attendees && attendees.length ?
                <AvatarGroup>
                  {attendees.map((attendee) => {
                    return <Avatar key={attendee.user} name={attendee} size="md" />
                  })}
                </AvatarGroup>
                : <Box>
                    None
                  </Box>
                }
                {/* <VStack align="start" spacing={2}>
                  {attendees.map((attendee, index) => (
                    <Text key={index}>{attendee}</Text>
                  ))}
                </VStack> */}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={closeModal}>
                Close
              </Button>
              {/* Add additional buttons or actions as needed */}
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  }


  export default EventsCalendar;
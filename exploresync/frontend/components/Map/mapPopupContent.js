import  React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import {
  Box,
  Text,
  Flex,
  Link,
  Button,
  Icon,
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
  useToast,
  TimePicker
} from '@chakra-ui/react';
import { PhoneIcon, InfoIcon } from '@chakra-ui/icons'
import { FaLocationDot } from "react-icons/fa6";
import { showToast } from "../../utils/utils";
import { Review } from "../../components/review";

import { createRestaurantEvent } from "../../api/api.mjs";

export function MapPopupContent(props) {
  const { username, place, groupId, socket } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invalidDateError, setInvalidDateError] = useState("");
  const toast = useToast();
  const dateRef = useRef(null);

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const today = moment();
    const selected_date = moment(dateRef.current.value).toDate();
    if (moment(selected_date).isBefore(today)) {
      return setInvalidDateError('Must select date and time in the future');
    }
    createRestaurantEvent(place, selected_date, groupId)
      .then(res => {
        socket.emit('add group notification', 
          {
            username: username,
            group_id: groupId,
            title: "Event Created",
            description: 
              username + " created a new event for " + 
              place.name + " at " + 
              place.location.address1 + " on " + 
              moment(selected_date).format('MM/DD/YYYY h:mm A') + "."
          }
        );
        showToast(toast, true, 'Successfully added event ' + res.event.title)
      });

    e.target.reset();
    closeModal();
  };

  return (
    <>
      <Flex align='center'>
        <Link fontSize="sm" href={place.url} isExternal mr={3}> {place.name} </Link>
        {place.price && <Text fontSize="xs" as="div" my={2} transform="translateY(1px)"> {place.price} </Text>}
      </Flex>
      <Flex align='center' mt={3}> 
        <Icon as={InfoIcon} mr={2} /> 
        <Text fontSize="xs" isTruncated as="div" my={2} transform="translateY(1px)"> {place.categories.map(category => category.title).join(', ')} </Text>
      </Flex>
      <Flex align='center'> 
        <Icon as={FaLocationDot} mr={2} /> 
        <Text fontSize="xs" as="div" my={2} transform="translateY(1px)"> {place.location.address1} </Text> 
      </Flex>
      { place.display_phone && 
        <Flex align='center'> 
          <PhoneIcon mr={2} /> 
          <Text fontSize="xs" as="div" my={2} transform="translateY(1px)"> {place.display_phone} </Text> 
        </Flex> 
      }
      <Review rating={place.rating} review_count={place.review_count} popup={true} />

      <Flex justify="center" mt={5}>
        <Button size="xs" p={4} colorScheme='green' onClick={openModal}> Add to events </Button>
      </Flex>

      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create an event</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
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
    </>
  );
}

export default MapPopupContent

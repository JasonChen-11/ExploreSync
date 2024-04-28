import  React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Flex,
  useColorModeValue,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons'

export function CreateGroupForm(props) {
  const { createGroup } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const titleRef = useRef(null);

  const handleCreate = (e) => {
    e.preventDefault();
    createGroup(titleRef.current.value).then(() => {
        closeModal();
      }
    );
  }

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  return (
    <>
      <Flex
        maxW={{ base: 'none', md: '350px' }}
        w={{ base: '100%', md: 'full' }}
        h={'260px'}
        px={6}
        py={4}
        mr={{ base: 0, md: 5}}
        boxShadow="md" 
        rounded={'lg'}
        borderColor='dark'
        borderWidth={useColorModeValue('0', '2px')}
        _hover={{ transform: 'translateY(-3px)', 
                  boxShadow: 'lg', 
                  cursor: 'pointer'}}
        align="center"
        justify="center"
        onClick={openModal}>
        <AddIcon boxSize={8} />
      </Flex>

      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader> Create a group </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleCreate}>
              <Flex justify="space-evenly" mb={4}>
                <Input
                  placeholder="Enter a title"
                  ref={titleRef}
                  required
                />
                <Button type="submit" colorScheme="green" ml={4}>
                  Create
                </Button>
              </Flex>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
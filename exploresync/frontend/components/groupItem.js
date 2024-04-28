import  React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  List,
  ListItem,
  Divider,
  Avatar,
  AvatarGroup,
  useToast,
} from '@chakra-ui/react';
import { inviteToGroup, getInvitationCode } from "../api/api.mjs";
import { showToast } from '../utils/utils';

export function GroupItem(props) {
  const toast = useToast();
  const { username, group, deleteGroup, leaveGroup, removeFromGroup } = props;
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invitationCode, setinvitationCode] = useState("");

  useEffect(() => {    
    if (group.host === username) {
      getInvitationCode(group._id).then(invitation => {
        if (invitation) {
          setinvitationCode(invitation.code);
        }
      })
    }
  }, []);

  function directToGroup() {
    // routing inspired by https://nextjs.org/docs/pages/building-your-application/routing/linking-and-navigating#injecting-the-router
    router.push({
      pathname: '/group',
      query: {group_id: group._id}
    });
  };

  function openModal() {
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function invite() {
    if (!invitationCode) {
      inviteToGroup(group._id).then(code => {
        setinvitationCode(code);
        showToast(toast, true, 'New invite code generated (expires in 10 mins)');
      })
    }
  }

  return (
    <>
      <Box
        flexDir="column"
        justify='space-between'
        maxW={{ base: 'none', md: '350px' }}
        w={{ base: '100%', md: 'full' }}
        h={'260px'}
        px={6}
        py={4}
        mr={{ base: 0, md: 5}}
        mb={5}
        boxShadow="md" 
        rounded={'lg'}
        borderColor='dark'
        borderWidth={useColorModeValue('0', '2px')}>

        <Box mb={2}>
          <Heading size='md' mb={3} isTruncated> { group.title } </Heading>
          <Divider my={1} />
          <Text my={2} isTruncated>
            <Text as="span" fontWeight="semibold"> Host: </Text> {group.host}
          </Text>

          <Text isTruncated> 
            <Text as="span" fontWeight="semibold"> Members: </Text>
            {group.members.toString().replace(/,/g, ', ')}  
          </Text>
        </Box>

        <AvatarGroup>
          {group.members.map((member) => <Avatar key={member} name={member} size="md" />)}
        </AvatarGroup>

        <Flex justify="space-evenly" mt={6}>
          <Button onClick={openModal}> View Details </Button>
          <Button onClick={directToGroup}> Go to Group </Button>
        </Flex>
      </Box>

      <Modal isOpen={isModalOpen} onClose={closeModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{group.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text as="span" fontWeight="semibold"> Members </Text>
            <Divider />
            <List spacing={3} mt={4} mb={8}>
              {group.members.map((member) => (
                <ListItem key={member} display="flex" alignItems="center" justifyContent="space-between">
                  <Flex alignItems="center"> <Avatar name={member} size="sm" mr={3}/> {member} </Flex>
                  {
                    group.host === member ? (
                      <Text fontWeight="semibold" pr={5}>Host</Text>
                    ) : group.host === username && group.host !== member ? (
                      <Button size="sm" onClick={() => removeFromGroup(group._id, member)}>
                        Remove
                      </Button>
                    ) : (
                      <Text pr={5}>Member</Text>
                    )
                  }
                </ListItem>
              ))}
            </List>
            
            { group.host === username ?
              <Flex my={3} alignItems="center" justify="space-between">
                { invitationCode ?
                  <Text> <Text as="span" fontWeight="semibold"> Invitation Code: </Text> {invitationCode} </Text>
                  :
                  <Button colorScheme="green" onClick={() => invite()} disabled={invitationCode}> Invite Member </Button>
                }
                <Button float="right" 
                        colorScheme="red"
                        onClick={() => deleteGroup(group._id).then(closeModal)}> Delete Group </Button>
              </Flex>
              :
              <Button float="right" 
                      colorScheme="red" 
                      my={3}
                      onClick={() => leaveGroup(group._id, username).then(closeModal)}> Leave Group </Button>
            }
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
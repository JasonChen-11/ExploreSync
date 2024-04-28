
import React, { useState, useEffect, useRef } from 'react';
import { Flex, 
         Text, 
         Box,
         NumberInput, 
         NumberInputField, 
         Button, 
         FormControl, 
         FormLabel, 
         FormErrorMessage,
         useToast,
         HStack, } from '@chakra-ui/react';
import { GroupItem } from "../components/groupItem";
import { CreateGroupForm } from "../components/createGroupForm";
import { createGroup,
         deleteGroup,
         getGroupsForMember,
         joinGroup,
         leaveGroup,
         removeFromGroup } from "../api/api.mjs";
import { getUser, redirectLogin, showToast } from "../utils/utils.js";
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
import Cookies from 'js-cookie';

export async function getServerSideProps(context) {
  const propsData = await getUser(context);
  if (!propsData) {
    return redirectLogin();
  } else {
    return propsData;
  }
}

export default function Main({ user }) {
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [sortedGroups, setSortedGroups] = useState([]);
  const [isInvalid, setIsInvalid] = useState(false);
  const [sortOrders, setSortOrders] = useState({});
  const codeRef = useRef(null);
  
  useEffect(() => {
    updateGroups();
    getSortOrdersCookie();
  }, []);

  const getSortOrdersCookie = () => {
    try {
      const sortOrdersCookie = Cookies.get('sortOrders');
      setSortOrders(JSON.parse(sortOrdersCookie));
    } catch {
      setSortOrders({
        alphabetical: '',
        members: '',
        creationDate: 'asc',
      });
    }
  }

  const updateGroups = async () => {
    getGroupsForMember(user.username)
      .then(groups => {
        setGroups(groups);
      });
  };

  useEffect(() => {
    if (!groups) {
      return;
    }

    // sorting inspired by: https://owlcation.com/stem/creating-a-sortable-list-in-react-js

    const sortedGroups = groups.slice().sort((a, b) => {
      if (sortOrders.alphabetical) {
        if (sortOrders.alphabetical === 'asc') {
          return a.title.localeCompare(b.title);
        } else {
          return b.title.localeCompare(a.title);
        }
      } else if (sortOrders.members) {
        if (sortOrders.members === 'asc') {
          return a.members.length - b.members.length;
        } else {
          return b.members.length - a.members.length;
        }
      } else if (sortOrders.creationDate) {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
    
        if (sortOrders.creationDate === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      }
    
      return 0;
    });

    setSortedGroups(sortedGroups);
  }, [groups, sortOrders])
  
  const handleSort = (sortType) => {
    if (!sortOrders) {
      return;
    }
  
    const newSortOrders = {};
    
    Object.keys(sortOrders).forEach((key) => {
      if (key === sortType) {
        if (sortOrders[key] === 'asc') {
          newSortOrders[key] = 'desc';
        } else {
          newSortOrders[key] = 'asc';
        }
      } else {
        newSortOrders[key] = '';
      }
    });
  
    setSortOrders(newSortOrders);
    Cookies.set('sortOrders', JSON.stringify(newSortOrders));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = codeRef.current.value;
    joinGroup(code).then(res => {
      if (res) {
        updateGroups();
        setIsInvalid(false);
        showToast(toast, true, 'Successfully joined ' + res.title + ' hosted by ' + res.host);
      } else {
        updateGroups();
        setIsInvalid(true);
      }
      e.target.reset();
    })
  }

  return (
    <Box pt={16}>
      <form onSubmit={handleSubmit}>
        <FormControl my={5} isInvalid={isInvalid} px={5}>
          <FormLabel fontSize='xl'> Enter a code to join a group </FormLabel>
          <Flex>
            <NumberInput w={{ base: '100%', md: 'inherit' }}>
              <NumberInputField placeholder='Enter a code' maxW={{ base: 'none', md: '170px' }}  ref={codeRef} required/>
              <FormErrorMessage mx={1} mt={1}> Invalid Code </FormErrorMessage>
            </NumberInput>
            <Button type="submit" colorScheme="green" ml={3}> Enter </Button>
          </Flex>
        </FormControl>
      </form>
      
      <HStack spacing={2} p={5} pt={0} alignItems="flex-start" flexDirection={{ base: 'column', md: 'row' }} w={{ base: '100%', md: 'auto' }}>
        <Button
          colorScheme="blue"
          onClick={() => handleSort('creationDate')}
          w={{ base: '100%', md: 'inherit' }}
        >
          Sort by Creation Date&nbsp;
          {sortOrders.creationDate === 'asc' && <AiOutlineArrowUp />}
          {sortOrders.creationDate === 'desc' && <AiOutlineArrowDown />}
        </Button>
        <Button
          colorScheme="blue"
          onClick={() => handleSort('alphabetical')}
          w={{ base: '100%', md: 'inherit' }}
        >
          Sort Alphabetically&nbsp;
          {sortOrders.alphabetical === 'asc' && <AiOutlineArrowUp />}
          {sortOrders.alphabetical === 'desc' && <AiOutlineArrowDown />}
        </Button>
        <Button
          colorScheme="blue"
          onClick={() => handleSort('members')}
          w={{ base: '100%', md: 'inherit' }}
        >
          Sort by Members&nbsp;
          {sortOrders.members === 'asc' && <AiOutlineArrowUp />}
          {sortOrders.members === 'desc' && <AiOutlineArrowDown />}
        </Button>
      </HStack>

      <Flex px={5} wrap="wrap">
        {sortedGroups.length > 0 &&
          sortedGroups.map((group) => (
            <GroupItem
              key={group._id}
              username={user.username}
              group={group}
              deleteGroup={(groupId) => deleteGroup(groupId).then(updateGroups)}
              leaveGroup={(groupId, username) => leaveGroup(groupId, username).then(updateGroups)}
              removeFromGroup={(groupId, username) => removeFromGroup(groupId, username).then(updateGroups)}
            />
          ))}
        <CreateGroupForm createGroup={(title) => createGroup(title).then(updateGroups)} />
      </Flex>
    </Box>
    
  );
}

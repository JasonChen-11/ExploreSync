import  React, { useState, useEffect, useRef } from 'react';
import { getCenter } from 'geolib';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Box,
  FormControl,
  FormLabel,
  HStack,
  Switch,
  Tabs, 
  Tab, 
  TabList,
  Tooltip, 
  useColorMode,
} from '@chakra-ui/react'
import { SearchBar } from "./searchBar";
import { FaQuestionCircle } from 'react-icons/fa';

export function MapControlPanel(props) {
  const { onUserClick, userLocations, returnResults,
          onManualLocationToggle, manualLocationToggle } = props;
  const { colorMode } = useColorMode();

  return (
    <Accordion defaultIndex={[0]} allowToggle width="full">
      <AccordionItem border='none'>
        <h2>
          <AccordionButton>
            <Box as="h5" flex="1" textAlign="left" fontWeight="semibold"> Explore </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Tabs pb={4} overflowX='auto'>
            <TabList w='full' borderBottom="0px" borderColor="inherit">
              {userLocations && userLocations.map((user) => (
                <Tab fontWeight="semibold"
                     key={user.username} 
                     onClick={() => onUserClick(user.coordinates)} 
                     style={{color: colorMode === 'dark' ? 'white' : '#2C5282'}} 
                     borderBottom="2px solid"
                     borderColor="inherit"
                     px={6}
                >
                  {user.username}
                </Tab>
              ))}
            </TabList>
          </Tabs>
          
          <FormControl alignItems='center' mb={3}>
            <HStack>
              <FormLabel htmlFor='manual-location' mb={0} mr={0}>
                Toggle Manual Location
              </FormLabel>
              <Tooltip
                label='Click the map to manually set your location after enabling'
                placement='top'
              >
                <Box>
                  <FaQuestionCircle />
                </Box>
              </Tooltip>
              <Switch
                ml={2}
                id='manual-location'
                isChecked={manualLocationToggle}
                onChange={onManualLocationToggle}
                colorScheme="blue"
              />
            </HStack>
          </FormControl>
          
          <SearchBar userLocations={userLocations} returnResults={returnResults} />

        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

export default MapControlPanel
import  React, { useState, useEffect, useRef } from 'react';
import { getCenter } from 'geolib';
import { Button, Flex, Text, Box, Select, Input, Tooltip, FormControl, FormLabel, Switch } from '@chakra-ui/react';
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';
import { searchYelp } from '../../api/api.mjs';

export function SearchBar(props) {
  const { userLocations, returnResults } = props;
  const [place, setPlace] = useState("restaurants");
  const [origin, setOrigin] = useState(-1);
  const [distance, setDistance] = useState(5);
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(-1);
  const searchRef = useRef(null);

  function search(page_num) {
    let coordinates;
    if (origin === -1) {
      coordinates = getMidpoint();
    } else {
      coordinates = { latitude: userLocations[origin].coordinates[0], longitude: userLocations[origin].coordinates[1] }
    }
    searchYelp(searchRef.current.value + ' ' + place, coordinates.latitude, coordinates.longitude, distance, page_num).then(res => {
      if (res) {
        setTotalPages(Math.ceil(res.total / 20));
        returnResults(res.businesses);
      } else {
        console.log('Out of searches...')
      }
    })
  }

  // get the midpoint of all users' locations
  function getMidpoint() {
    const coordinatesArray = userLocations.map(location => {
      return { latitude: location.coordinates[0], longitude: location.coordinates[1] };
    });
    return getCenter(coordinatesArray);
  }

  function handlePlaceChange(e) {
    setPlace(e.target.value);
  }

  function handleOriginChange(e) {
    setOrigin(e.target.value);
  }

  function handleDistanceChange(e) {
    setDistance(e.target.value);
  }

  function handlePageChange(new_page_num) {
    setPageNum(new_page_num);
    search(new_page_num);
  }

  function handleSearch() {
    setPageNum(1);
    search(1);
  }

  return (
    <Flex direction={{ base: 'column', md: 'row' }} justifyContent="space-between">
      <Flex w={{ base: '100%', md: '75%' }} direction={{ base: 'column', md: 'row' }} align='center' flexWrap='wrap'>
        <Input p={3} placeholder="Enter keywords" ref={searchRef} flex='3'></Input> 

        <Select mt={{ base: 3, md: 0 }} value={place} fontWeight="semibold" flex='2' onChange={handlePlaceChange} mx={{ base: 0, md: 3 }}>
          <option value='restaurants'> Restaurants </option>
          <option value='hotel'> Hotels </option>
        </Select>

        <Select mt={{ base: 3, md: 0 }} value={origin} fontWeight="semibold" flex='2' onChange={handleOriginChange}>
          <option value='-1'> From Everyone </option>
          { userLocations.map((user, index) => {
            return <option key={user.username} value={index}> {user.username} </option>        
          })}
        </Select>

        <Select mt={{ base: 3, md: 0 }} value={distance} fontWeight="semibold" flex='1' onChange={handleDistanceChange} mx={{ base: 0, md: 3 }}>
          <option value='5'> 5km </option>
          <option value='10'> 10km </option>
          <option value='20'> 20km </option>
          <option value='40'> 40km </option>
        </Select>

        <Button mt={{ base: 3, md: 0 }} colorScheme="blue" onClick={handleSearch}> Search </Button>

      </Flex>
      {totalPages !== -1 && 
        <Flex mx={4} align="center" justify="space-between" flex='1' mt={{ base: 3, md: 0 }}>
          <Button onClick={() => handlePageChange(pageNum - 1)} isDisabled={pageNum === 1} bg="none">
            <ArrowLeftIcon />
          </Button>

          <Text w='full' align='center' mx={2} minW='100px'>Page {totalPages === 0 ? 0 : pageNum} of {totalPages}</Text>
          <Button onClick={() => handlePageChange(pageNum + 1)} isDisabled={pageNum >= totalPages} bg='none'>
            <ArrowRightIcon />
          </Button>
        </Flex>
      }
    </Flex>
  );
}

export default SearchBar
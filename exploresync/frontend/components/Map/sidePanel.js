import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Text,
  Spinner,
  Image,
  Flex,
  Badge,
  Divider,
  Stack,
  Center,
  Icon,
  useColorModeValue,
  Button,
} from '@chakra-ui/react';
import { AiFillClockCircle } from 'react-icons/ai';
import { getWeather } from '../../api/api.mjs';
import { getDistance } from 'geolib';

export function SidePanel({ username, coordinates, userLocations }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fail, setFail] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastApiCallTime, setLastApiCallTime] = useState(null);
  const [hasApiBeenCalled, setHasApiBeenCalled] = useState(false);
  const autoRefreshIntervalRef = useRef(null);

  const calculateDistanceToOtherUsers = () => {
    if (!coordinates || coordinates.length === 0 || !userLocations || userLocations.length === 0) {
      return [];
    }

    const currentUserCoordinates = { latitude: coordinates[0], longitude: coordinates[1] };

    return userLocations
      .filter(user => user.username !== username)
      .map(otherUser => {
        const otherUserCoordinates = { latitude: otherUser.coordinates[0], longitude: otherUser.coordinates[1] };
        const distance = getDistance(currentUserCoordinates, otherUserCoordinates) / 1000;
        return { username: otherUser.username, distance: distance.toFixed(2) };
      });
  };

  const fetchData = async () => {
    try {
      if (coordinates && coordinates.length) {
        const weatherData = await getWeather(coordinates);
        if (weatherData) {
          setWeatherData(weatherData);
          setLastApiCallTime(new Date());
          setHasApiBeenCalled(true);
        } else {
          setFail(true);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching weather data: ', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    if (!hasApiBeenCalled) {
      fetchData();
    }

    return () => clearInterval(interval);
  }, [coordinates]);

  useEffect(() => {
    autoRefreshIntervalRef.current = setInterval(() => {
      fetchData();
    }, 10 * 60 * 1000);

    return () => clearInterval(autoRefreshIntervalRef.current);
  }, [hasApiBeenCalled]);

  const handleManualRefresh = () => {
    if (fail) {
      setLoading(true);
    } else {
      clearInterval(autoRefreshIntervalRef.current);
  
      autoRefreshIntervalRef.current = setInterval(() => {
        fetchData();
      }, 10 * 60 * 1000);
    }

    fetchData();
  };

  /*
  Query:
  In JavaScript, can you help me create a helper function that calculates the time until the next refresh?
  It will be 10 minutes from a Date object called lastApiCallTime that I already have defined.

  Response:
  function calculateTimeUntilRefresh(lastApiCallTime) {
    // Set the refresh interval in minutes
    const refreshInterval = 10;

    // Calculate the time until the next refresh in milliseconds
    const nextRefreshTime = lastApiCallTime.getTime() + refreshInterval * 60000;

    // Get the current time
    const currentTime = new Date().getTime();

    // Calculate the time difference in milliseconds
    const timeDifference = nextRefreshTime - currentTime;

    // Convert the time difference to minutes and seconds
    const minutesUntilRefresh = Math.floor(timeDifference / 60000);
    const secondsUntilRefresh = Math.floor((timeDifference % 60000) / 1000);

    return {
      minutes: minutesUntilRefresh,
      seconds: secondsUntilRefresh,
    };
  }
  */


  const calculateTimeUntilNextRefresh = () => {
    const nextRefreshTime = new Date(lastApiCallTime.getTime() + 10 * 60 * 1000);
    const timeDiff = nextRefreshTime - new Date();
    const minutesUntilNextRefresh = Math.ceil(timeDiff / (60 * 1000));
    return minutesUntilNextRefresh;
  }

  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('black', 'white');
  const distanceContainerColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      bg={bgColor}
      color={textColor}
      p={10}
      borderRadius="lg"
      boxShadow="2xl"
      textAlign="center"
      overflowY="auto"
    >
      <Center>
        <Icon as={AiFillClockCircle} boxSize={8} />
        <Text fontSize="2xl" ml="3">
          {currentTime.toLocaleTimeString()}
        </Text>
      </Center>

      <Box mt={6}>
        {loading && (
          <Flex align="center" justify="center" direction="column">
            <Spinner size="lg" />
            <Text mt="2">Loading weather...</Text>
          </Flex>
        )}
        <Stack spacing={2} mt={4}>
          {!loading && !fail && (
            <>
              <Text fontSize="2xl">
                {weatherData.name}, {weatherData.sys.country}
              </Text>
              <Text fontSize="sm">
                {weatherData.weather[0].description.toUpperCase()}
              </Text>
              <Flex align="center" justify="center" direction="column">
                <Image
                  src={`http://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`}
                  alt={weatherData.weather[0].description}
                  boxSize='50px'
                />{' '}
                <Text mt="2">Temperature: {weatherData.main.temp}°C</Text>
                <Text mt="2">Feels Like: {weatherData.main.feels_like}°C</Text>
                <Text mt="2">Humidity: {weatherData.main.humidity}%</Text>
                <Text mt="2">Wind Speed: {weatherData.wind.speed} m/s</Text>
              </Flex>

              <Stack my={2} direction="row" justify={{ base: "center", md: "space-between" }}>
                <Badge colorScheme="teal">Pressure: {weatherData.main.pressure} hPa</Badge>
                <Badge colorScheme="orange">Visibility: {weatherData.visibility / 1000} km</Badge>
              </Stack>

              <Button fontSize="sm" onClick={handleManualRefresh}>
                Refresh Weather
              </Button>
              <Box fontSize="sm" color="gray.500">
                {lastApiCallTime && (
                  <>
                    <Text>Last refresh: {lastApiCallTime.toLocaleTimeString()}</Text>
                    <Text>Next auto-refresh in: {calculateTimeUntilNextRefresh()} minutes</Text>
                  </>
                )}
              </Box>
            </>
          )}
          
          {fail && (
            <>
              <Text>Failed to load weather</Text>
              <Button mb={2} fontSize="sm" onClick={handleManualRefresh}>
                Try Again
              </Button>
            </>
          )}

          <Divider my={2} />

          <Text mb={2} fontSize="2xl">Distance Information</Text>

          {userLocations && userLocations.length > 1 ? (
            <Stack spacing={2}>
              {calculateDistanceToOtherUsers().map((userDistance) => (
                <Flex
                  key={userDistance.username}
                  justify="space-between"
                  align="center"
                  py={2}
                  px={4}
                  bgColor={distanceContainerColor}
                  borderRadius="md"
                >
                  <Text isTruncated>{userDistance.username}</Text>
                  <Text>{userDistance.distance} km</Text>
                </Flex>
              ))}
            </Stack>
          ) : (
            <Text>No other user locations found</Text>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

export default SidePanel;

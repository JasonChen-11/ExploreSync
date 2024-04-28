import React, { useState, useEffect, useRef } from 'react';
import "./Map.css";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Flex, 
         useColorMode, 
         VStack, 
         Text, 
         CircularProgress} from '@chakra-ui/react';
import { MapPopupContent } from "./mapPopupContent"; 
import { MapControlPanel } from "./mapControlPanel";
import { getCenter } from 'geolib';
import { SidePanel } from './sidePanel.js';
import { getAllUserLocations,
         getLocationSetting,
         updateLocationSetting } from '../../api/api.mjs';
import { MapEvent } from './mapEvent';

const ownMarker = new L.divIcon({
  className: 'own-marker',
  backgroundColor: 'red',
  iconSize: [20, 20], 
})

const userMarker = new L.divIcon({
  className: 'user-marker',
  iconSize: [20, 20], 
});

const placeMarker = new L.divIcon({
  className: 'place-marker',
  iconSize: [20, 20], 
});

/* Referenced:
  https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition
  for getting user geolocation

  Referenced: 
  https://medium.com/@timndichu/getting-started-with-leaflet-js-and-react-rendering-a-simple-map-ef9ee0498202
  for leaflet map, and dynamic loading of map
*/

const Map = ({ groupMembers, username, groupId, socket }) => {
    const [center, setCenter] = useState ([]);
    const [userLocations, setUserLocations] = useState([]);
    const [places, setPlaces] = useState([]);
    const mapRef = useRef(null);
    const { colorMode } = useColorMode();
    const [fetchedManualLocation, setFetchedManualLocation] = useState(false);
    const [manualLocationToggle, setManualLocationToggle] = useState(false);

    const getUserLocation = () => {
      const userCoordinates = userLocations.filter(user => user.username === username);
      if (!userCoordinates.length) {
        return [];
      }
      return userCoordinates[0].coordinates;
    };

    const fetchNewLocation = () => {
      socket.on('new location', (updatedLocation) => {
        setUserLocations((prevLocations) => {
          const index = prevLocations.findIndex((loc) => loc.username === updatedLocation.username);
  
          if (index !== -1) {
            prevLocations[index] = updatedLocation;
          }
          else {
            prevLocations.push(updatedLocation);
          }
          return [...prevLocations];
        });
      });
    };

    // Logged in user's location
    const updateUserLocation = (coordinates) => {
      socket.emit('update location', {username, coordinates, groupId});
    };

    // Changes the map's zoom level to fit all items on the map
    const autoZoom = (items) => {
      const latitudes = [];
      const longitudes = [];
      items.map(item => {
        if (Array.isArray(item.coordinates)) {
          latitudes.push(item.coordinates[0]);
          longitudes.push(item.coordinates[1]);
        } else {
          latitudes.push(item.coordinates.latitude);
          longitudes.push(item.coordinates.longitude);
        }
      });
      
      /*
        Query:
        // Example array
        const numbers = [5, 3, 8, 2, 10, 1];

        // Calculate the minimum and maximum values
        const minValue = Math.min(...numbers);
        const maxValue = Math.max(...numbers);

        console.log("Minimum value:", minValue);
        console.log("Maximum value:", maxValue);
      */
      const bounds = [
        [Math.min(...latitudes), Math.min(...longitudes)],
        [Math.max(...latitudes), Math.max(...longitudes)],
      ];
      mapRef.current.fitBounds(bounds);
    }

    useEffect(() => {
      getAllUserLocations(groupId).then((locations) => {
        const filteredLocations = locations.filter((location) => location !== null);
        setUserLocations(filteredLocations);
      })

      getLocationSetting(username).then((locationSetting) => {
        if (locationSetting !== null) {
          setManualLocationToggle(locationSetting.isManual);
        }
        setFetchedManualLocation(true);
      })

    }, [])

    useEffect(() => {
      if (socket) {
        fetchNewLocation();
      }

      const watchId = (fetchedManualLocation &&
                       !manualLocationToggle) ? 
        navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const userCoords = [latitude, longitude];
            updateUserLocation(userCoords);
          },
          (error) => {
            console.error('Error getting user location:', error);
          }
        ) : null;

      return () => {
        if (socket) {
          socket.off('new location');
        }

        if (watchId) navigator.geolocation.clearWatch(watchId);
      };
    }, [groupId, groupMembers, socket, fetchedManualLocation, manualLocationToggle]); 

    useEffect(() => {
      if (!userLocations.length) return;
      userLocations.map(location => {
        const [latitude, longitude] = location.coordinates;
        if (location.username === username) {
          setCenter([latitude, longitude]);
        }
      });
    }, [userLocations])

    useEffect(() => {
      if (!places.length) return;
      autoZoom(places);
    }, [places])

    const onUserClick = (coordinates) => {
      const [latitude, longitude] = coordinates;
      if (mapRef.current) mapRef.current.flyTo({ lat: latitude, lng: longitude });
    };

    const onManualLocationToggle = () => {
      updateLocationSetting(username, !manualLocationToggle).then(() => {
        setManualLocationToggle(!manualLocationToggle);
      })
    }
  
    return (
      <>
        <VStack flex="2" boxShadow="md" borderColor='dark' spacing='0' style={{borderWidth: colorMode === 'dark' ? '2px' : '0px'}}>
          <MapControlPanel onUserClick={(coordinates) => onUserClick(coordinates)}
                          userLocations={userLocations} 
                          returnResults={(results) => {
                            setPlaces(results);
                          }}
                          manualLocationToggle={manualLocationToggle}
                          onManualLocationToggle={onManualLocationToggle}
                          />

          { center.length ? 
          <MapContainer style={{ width: '100%', height: '100%', minHeight: '300px'}} center={center} zoom={16} scrollWheelZoom={true} ref={mapRef}>            
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {userLocations && userLocations.map((userLocation) => (
                <Marker key={userLocation._id} position={userLocation.coordinates} icon={userLocation.username === username ? ownMarker : userMarker}>
                  <Popup style={{maxWidth: 400}}> 
                    <Text m={0}>{userLocation.username}</Text> 
                  </Popup>
                </Marker>
              ))}

              {places && places.map((place, index) => (
                <Marker key={index} position={[place.coordinates.latitude, place.coordinates.longitude]} icon={placeMarker}>
                  <Popup style={{maxWidth: 400}}>
                    <MapPopupContent key={index} username={username} place={place} groupId={groupId} socket={socket}/>
                  </Popup>
                </Marker>
              ))}
              <MapEvent 
                manualLocationToggle={manualLocationToggle} 
                updateUserLocation={updateUserLocation}
              />
            </MapContainer>
            :
            <Flex h='100%' w='100%' bg='gray.100' justify='center' alignItems='center'>
              <CircularProgress isIndeterminate size='100px'/>
            </Flex>
          }
        </VStack>
        <SidePanel username={username} coordinates={getUserLocation()} userLocations={userLocations}/>
      </>
    );
  };

export default Map;

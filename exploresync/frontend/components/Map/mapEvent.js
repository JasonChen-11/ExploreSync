import { useMapEvents } from 'react-leaflet'; 

// Referenced: https://stackoverflow.com/questions/70392715/how-to-get-coordinates-of-current-mouse-click-in-leaflet-react-js for useMapEvents
export function MapEvent(props) {
    const { manualLocationToggle, updateUserLocation } = props
    const map = useMapEvents({
        click(e) {
            if (manualLocationToggle) {
                updateUserLocation([e.latlng.lat, e.latlng.lng]);
            }
          },
      })
    return (<></>)
}

export default MapEvent;
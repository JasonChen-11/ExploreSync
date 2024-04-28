import Location from '../models/Location.mjs';
import User from '../models/User.mjs';
import Group from '../models/Group.mjs';

export const getAllUserLocations = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findOne({ _id : groupId});
        const usernames = group.members;
        if (!usernames || !Array.isArray(usernames) || 
            usernames.length === 0){
            console.log("Users not found");
            return null;
        }
        
        const coordinatesList = await Promise.all(usernames.map
            (async (username) => {
            const locationDoc = await Location.findOne({ username });
            
            return locationDoc ? { _id: locationDoc._id, username, coordinates: locationDoc.location.coordinates } : null;
          }));
        return res.json(coordinatesList);

    } catch (err) {
        console.log(err);
        return null;
    }
}


export const updateLocation = async (location) => {
    try {
        const { username, coordinates, groupId } = location;

        const user = await User.findOne({ _id : username});
        if (!user) {
            console.log("User Not Found");
            return null;
        }
        const group = await Group.findOne({ _id: groupId });
        if (!group) {
            console.log("No Group Found");
            return null;
        }
        
        const updatedLocationDoc = await Location.findOneAndUpdate(
          { username },
          { $set: { location: { type: 'Point', coordinates } } },
          { new: true, upsert: true }
        );

        const updatedLocation = { 
            _id: updatedLocationDoc._id,
            username, 
            coordinates: updatedLocationDoc.location.coordinates,
            group_id: groupId
        }
        return updatedLocation;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export const getLocationSetting = async (req, res) => {
    try {
        const { username } = req.params;
        const locationDoc = await Location.findOne({ username });
        if (!locationDoc){
            return res.json(null);
        }         
        return res.json( {isManual: locationDoc.isManual});

    } catch (err) {
        return res.status(500).json(err);
    }
}

export const updateLocationSetting = async (req, res) => {
    try {
        const { username, isManual } = req.body;
        
        const locationDoc = await Location.findOne({ username });
        if (!locationDoc){
            return res.status(404).end('No location data for user');
        }         

        const updatedLocationDoc = await Location.findOneAndUpdate(
            { username },
            { $set: { isManual } },
            { new: true }
        );

        return res.json(updatedLocationDoc);
        
    } catch (err) {
        return res.status(500).json(err);
    }
}


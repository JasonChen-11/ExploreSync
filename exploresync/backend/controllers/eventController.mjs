import Event from '../models/Event.mjs';
import Group from '../models/Group.mjs'

export const getEvents = async (req, res) => {
  const { groupId } = req.params;
  
  try {
    const group = await Group.find({ _id: groupId });
    if (!group) {
      return res.status(404).end('Group not found');
    }

    const events = await Event.find({ group_id: groupId });
    if (!events) {
      return res.status(404).end('No event for the group');
    }
    return res.json(events);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const createEvent = async (req, res) => {
  const { title, location, description, date, group_id } = req.body;
  const creator = req.session.username;

  try {
    const group = await Group.findOne({ _id: group_id });
    if (!group) {
      return res.status(404).end('Group not found');
    }

    const filteredMembers = group.members.filter(member => member !== creator);

    const newEvent = new Event({
      group_id: group_id,
      title: title,
      creator: creator,
      location: location,
      description: description,
      date: date,
      attendees: [
        {
          user: creator,
          response: 'Going'
        },
        ...filteredMembers.map(user => ({ user: user, response: 'Not Responded' }))
      ]
    });

    await newEvent.save();
    return res.json({ event: newEvent });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const createRestaurantEvent = async (req, res) => {
  const { title, location, description, price, rating, review_count, date, group_id } = req.body;
  const creator = req.session.username;

  try {
    const group = await Group.findOne({ _id: group_id });
    if (!group) {
      return res.status(404).end('Group not found');
    }

    const filteredMembers = group.members.filter(member => member !== creator);

    const newEvent = new Event({
      group_id: group_id,
      title: title,
      creator: creator,
      location: location,
      description: description,
      price: price,
      rating: rating,
      review_count: review_count,
      date: date,
      attendees: [
        {
          user: creator,
          response: 'Going'
        },
        ...filteredMembers.map(user => ({ user: user, response: 'Not Responded' }))
      ]
    });

    await newEvent.save();
    return res.json({ event: newEvent });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const deleteEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findOne({ _id: eventId });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    await Event.deleteOne({ _id: eventId });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const updateResponse = async (req, res) => {
  const { eventId } = req.params;
  const { attending } = req.body;

  try {
    const event = await Event.findOne({ _id: eventId });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const attendeeIndex = event.attendees.findIndex(attendee => attendee.user === req.session.username);

    if (attendeeIndex === -1) {
      return res.status(404).json({ message: 'User not found in attendees' });
    }

    event.attendees[attendeeIndex].response = attending;
    await event.save();

    return res.json(event);
  } catch (err) {
    return res.status(500).json(err);
  }
};

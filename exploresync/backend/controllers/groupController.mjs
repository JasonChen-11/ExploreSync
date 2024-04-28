import Group from '../models/Group.mjs';
import Event from '../models/Event.mjs';
import Invitation from '../models/Invitation.mjs';
import Message from '../models/Message.mjs';
import NotificationCounter from '../models/NotificationCounter.mjs';

export const createGroup = async (req, res) => {
  const { title } = req.body;
  const host = req.session.username;

  try {
    const newGroup = new Group({
      title: title,
      host: host,
      members: [ host ]
    });

    await newGroup.save();

    // initialize notification counter
    const newNotificationCounter = new NotificationCounter({
      username: host,
      group_id: newGroup._id,
      chat_count: 0,
      group_count: 0
    });

    await newNotificationCounter.save();

    return res.json(newGroup);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const getGroup = async (req, res) => {
  const group_id = req.params.groupId;

  try {
    const group = await Group.findOne({ _id: group_id });
    
    if (!group) {
      return res.status(404).end('Group not found');
    }
    return res.json(group);

  } catch (err) {
    return res.status(500).json(err);
  }
};

export const deleteGroup = async (req, res) => {
  const group_id = req.params.groupId;

  try {
    const group = await Group.findOne({ _id: group_id });
    
    if (!group) {
      return res.status(404).end('Group not found');
    }

    // delete all events within the group
    await Event.deleteMany({ group_id: group_id });

    // delete all notification counters within the group
    await NotificationCounter.deleteMany({ group_id: group_id });

    // delete all messages within the group
    await Message.deleteMany({ group_id: group_id });

    await Group.deleteOne({ _id: group_id });
    
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const getGroupMembers = async (req, res) => {
  const group_id = req.params.groupId;

  try {
    const group = await Group.findOne({ _id: group_id });
    
    if (!group) {
      return res.status(404).end('Group not found');
    }
    
    return res.json(group.members);
  } catch (err) {
    return res.status(500).json(err);
  }
};

export const getGroupsForMember = async (req, res) => {
  const username = req.params.username;

  try {
    const groups = await Group.find({ members: { $in:[username] } });
    
    if (!groups) {
      return res.status(404).end('Group not found');
    }
    return res.json(groups);

  } catch (err) {
    return res.status(500).json(err);
  }
};

/*
  Query:
  mongodb is it possible to create a a document that will be deleted after 10 minutes?

  Response:
  // Assume you have a collection named "yourCollection"

  // Create a TTL index on a field named "expiryDate" with a expireAfterSeconds value of 600 (10 minutes)
  db.yourCollection.createIndex({ "expiryDate": 1 }, { expireAfterSeconds: 600 });

  // Insert a document with an expiry date 10 minutes from the current time
  db.yourCollection.insertOne({
    "data": "yourData",
    "expiryDate": new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  });
*/
export const inviteToGroup = async (req, res) => {
  const { group_id } = req.body;

  try {
    const group = await Group.findOne({ _id: group_id });
    if (!group) return res.status(404).end('Group not found');

    // ensure there does not already exist an invitation
    let invitation = await Invitation.findOne({ group_id: group_id });
    if (invitation) return res.status(409).json(`An invitation to the group already exists`);

    const code = await generateInvitationCode();
    const newInvitation = new Invitation({
      group_id: group_id,
      code: code,
      expiresAfter: Date.now() + 1000 * 60 * 10,
    });
    await newInvitation.save();
    return res.json(code);
  } catch (err) {
    return res.status(500).json(err);
  }
}

/*
  Query:
  mongodb how to update a document by adding a string to an array field?

  Response:
  db.yourCollection.update(
    { "_id": 1 }, // Your query to identify the document
    { $push: { "yourArrayField": "newValue" } }
  )
*/
export const joinGroup = async (req, res) => {
  const { code } = req.body;
  const username = req.session.username;

  try {
    const invitation = await Invitation.findOne({ code: code });
    if (!invitation) return res.status(404).end('Invalid code');

    let group = await Group.findOne({_id: invitation.group_id });
    if (!group) return res.status(404).end('Group not found');
    if (group.members.includes(username)) return res.status(403).end('User is already in the group');

    // add user to events
    const event = await Event.findOne({ group_id: invitation.group_id });

    if (event) {
      await Event.updateMany(
        { group_id: invitation.group_id },
        { $push: {attendees: { user: req.session.username, response: 'Not Responded' } }}
      )
    }

    // create notification counter for new user
    const newNotificationCounter = new NotificationCounter({
      username: username,
      group_id: invitation.group_id,
      chat_count: 0,
      group_count: 0
    });

    await newNotificationCounter.save();

    await Group.updateOne({ _id: invitation.group_id }, { $push: {members : username} });
    return res.json({ title: group.title, host: group.host });
  } catch (err) {
    return res.status(500).json(err);
  }
}

/*
  Query:
  mongodb how to update a document by removing a given string from an array field?

  Response:
  db.yourCollection.updateOne(
    { "_id": 1 },
    { $pull: { "yourArrayField": { $in: ["value2", "value3"] } } }
  )
*/
export const removeFromGroup = async (req, res) => {
  const { group_id, username } = req.body;

  try {
    let group = await Group.findOne({ _id: group_id, members: {$in: [username]} });
    if (!group) return res.status(404).end('Group not found');

    // remove user from events
    const event = await Event.findOne({ group_id: group_id });

    if (event) {
      await Event.updateMany(
        { group_id: group_id },
        { $pull: { attendees: { user: username }}}
      )
    }

    // remove user from notification counter
    await NotificationCounter.deleteOne({ group_id: group_id, username: username });

    group = await Group.updateOne({ _id: group_id }, { $pull: {members : username} });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json(err);
  }
}

export const getInvitationCode = async (req, res) => {
  const group_id = req.params.groupId;
  try {
    const invitation = await Invitation.findOne({ group_id: group_id });
    if (!invitation) return res.json(null);
    return res.json(invitation);
  } catch (err) {
    return res.status(500).json(err);
  }
}

// generate a 6-digits code

/*
  Query:
  how to generate a 6 digit code using javascript?

  Response:
    function generateSixDigitCode() {
    // Generate a random number between 100000 and 999999
    const sixDigitCode = Math.floor(100000 + Math.random() * 900000);
    return sixDigitCode.toString(); // Convert to string to ensure it's always 6 digits
  }

  // Example usage
  const code = generateSixDigitCode();
  console.log(code);
*/
async function generateInvitationCode() {
  let code;
  let invitation;
  do {
    code = Math.floor(100000 + Math.random() * 900000);
    invitation = await Invitation.findOne({ code: code });
  } while (invitation);
  return code;
}
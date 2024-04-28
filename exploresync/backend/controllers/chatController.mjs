import Message from '../models/Message.mjs';
import Group from '../models/Group.mjs';

export const addMessage = async (message) => {
  const { username, content, group_id }  = message;

  try {
    // ensure the group exists
    const group = await Group.findOne({ _id: group_id });
    if (!group) {
      return null;
    }

    const newMessage = new Message({
      author: username,
      content: content,
      group_id: group_id
    });

    await newMessage.save();

    return newMessage;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const getMessages = async (group_id) => {
  try {
    const messages = await Message.find({ group_id: group_id });

    if (!messages) {
      return null;
    }
    
    return messages
  } catch (err) {
    console.log(err);
    return null;
  }
}
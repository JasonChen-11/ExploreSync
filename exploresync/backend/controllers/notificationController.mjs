import Notification from "../models/Notification.mjs";
import Group from "../models/Group.mjs";

export const addNotification = async (notification) => {
  const { group_id, title, description }  = notification;

  try {
    // ensure the group exists
    const group = await Group.findOne({ _id: group_id });
    if (!group) {
      return null;
    }

    const newNotification = new Notification({
      group_id: group_id,
      title: title,
      description: description
    });
    await newNotification.save();

    return newNotification;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const getNotifications = async (group_id) => {
  try {
    const notifications = await Notification.find({ group_id: group_id }).sort({ createdAt: -1 });
    if (!notifications) {
      return null;
    }
    return notifications;
  } catch (err) {
    console.log(err);
    return null;
  }
}

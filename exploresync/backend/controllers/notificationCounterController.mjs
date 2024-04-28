import NotificationCounter from '../models/NotificationCounter.mjs';

export const getCount = async (userInfo, countType) => {
  try {
    const { group_id, username } = userInfo
    const notificationCounter = await NotificationCounter.findOne({ group_id: group_id, username: username });
    if (!notificationCounter) {
      return null;
    }
    return notificationCounter[countType];
  } catch (err) {
    console.log(err);
    return null;
  }
}

export const clearCount = async (userInfo, countType) => {
  try {
    const { group_id, username } = userInfo
    const notificationCounter = await NotificationCounter.findOne({ group_id: group_id, username: username });
    if (!notificationCounter) {
      return null;
    }

    notificationCounter[countType] = 0;
    await notificationCounter.save();
    return 0
  } catch (err) {
    console.log(err);
    return null;
  }
}

export const addCount = async (group_id, username, countType) => {
  try {
    await NotificationCounter.updateMany(
      { group_id: group_id, username: { $ne: username } },
      { $inc: { [countType]: 1 } }
    );
  } catch (err) {
    console.log(err);
    return null;
  }
}

import mongoose from 'mongoose';

const notificationCounterSchema = new mongoose.Schema({
  group_id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    default: null,
    required: true,
  },
  chat_count: {
    type: Number,
    required: true,
    default: 0
  },
  group_count: {
    type: Number,
    required: true,
    default: 0
  }
});

export default mongoose.model('NotificationCounter', notificationCounterSchema);
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  group_id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, {timestamps: true});

export default mongoose.model('Notification', notificationSchema);
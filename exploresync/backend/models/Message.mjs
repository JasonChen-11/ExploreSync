import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  group_id: {
    type: String,
    required: true
  }
}, {timestamps: true});

export default mongoose.model('Message', messageSchema);
import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  group_id: {
    type: String,
    required: true
  },
  code: {
    type: Number,
    unique: true,
    required: true
  },
  expiresAfter: {
    type: Date,
    required: true,
    default: Date.now() + 10 * 60,
  }
});

export default mongoose.model('Invitation', invitationSchema);
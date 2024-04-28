import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  host: {
    type: String,
    required: true
  },
  members: {
    type: Array,
    required: true
  }
}, {timestamps: true});;

export default mongoose.model('Group', groupSchema);
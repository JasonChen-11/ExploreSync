import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    }
  },
  isManual: {
    type: Boolean,
    default : false
  }
}, {timestamps: true});

export default mongoose.model('Location', locationSchema);
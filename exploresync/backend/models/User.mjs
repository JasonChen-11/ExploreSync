import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: String,
  hash: {
    type: String,
    required: true
  },
  tempSecret: {
    type: String,
    default: null
  },
  secret: {
    type: String,
    default: null
  }
});

export default mongoose.model('User', userSchema);
import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  group_id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: String,
  },
  rating: {
    type: Number, 
  },
  review_count: {
    type: Number,
  },
  creator: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  attendees: [
    {
      user: {
        type: String,
        required: true,
      },
      response: {
        type: String,
        enum: ['Going', 'Not Going', 'Maybe', 'Not Responded'],
        default: 'Not Responded',
      },
    },
  ],
});

export default mongoose.model('Event', eventSchema);

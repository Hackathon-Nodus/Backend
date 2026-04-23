import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['client', 'solver'], default: 'client' },
  
  // For matching algorithm
  skills: [{ type: String }],
  repScore: { type: Number, default: 0 },
  rating: {
    avg: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  completedProblems: { type: Number, default: 0 },
  
  // Portfolio
  portfolio: [{
    title: String,
    description: String,
    link: String
  }],
  
  earnings: { type: Number, default: 0 },
  badges: [{ type: String }],
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
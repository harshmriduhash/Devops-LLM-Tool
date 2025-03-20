// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: false,
  },
  username: String,
  displayName: String,
  profileUrl: String,
  photos: [String],

  // Add this field so the token is saved to MongoDB
  githubToken: String,
});

module.exports = mongoose.model('User', UserSchema);

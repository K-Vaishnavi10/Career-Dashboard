const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true }, // e.g. "google_12345"
    provider: { type: String, required: true, enum: ['google', 'github'] },
    providerId: { type: String, required: true },
    name: { type: String },
    email: { type: String },
    avatarUrl: { type: String },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

// One account per (provider, providerId) pair
userSchema.index({ provider: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

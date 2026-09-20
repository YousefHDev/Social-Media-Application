import mongoose from 'mongoose';

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Follower user ID is required'],
      index: true
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Following user ID is required'],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate follows and optimize query lookups
followSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follow = mongoose.models.Follow || mongoose.model('Follow', followSchema);
export default Follow;

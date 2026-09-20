import mongoose from 'mongoose';

const storyViewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    viewedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const storyReactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['like', 'haha', 'sad', 'angry', 'wow'],
      required: true
    },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const storySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    caption: { type: String, trim: true, maxlength: 280, default: '' },
    expiresAt: { type: Date, required: true },
    views: { type: [storyViewSchema], default: [] },
    reactions: { type: [storyReactionSchema], default: [] }
  },
  { timestamps: true }
);

storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Story = mongoose.models.Story || mongoose.model('Story', storySchema);
export default Story;

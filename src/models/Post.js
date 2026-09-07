import mongoose from 'mongoose';
import Comment from './Comment.js';

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required']
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [2000, 'Content cannot exceed 2000 characters']
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    isFrozen: {
      type: Boolean,
      default: false
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    likeCount: {
      type: Number,
      default: 0
    },
    commentCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Mongoose Virtual Populate for dynamic comments relation
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  justOne: false,
  options: { sort: { createdAt: -1 } }
});

// Pre-delete hook: automatically remove associated comments when a post is deleted
postSchema.pre(['findOneAndDelete', 'deleteOne'], async function (next) {
  try {
    const filter = this.getFilter();
    let postId = filter._id;

    if (!postId && filter) {
      const docToClean = await this.model.findOne(filter);
      if (docToClean) postId = docToClean._id;
    }

    if (postId) {
      await Comment.deleteMany({ post: postId });
    }
    next();
  } catch (error) {
    next(error);
  }
});

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
export default Post;

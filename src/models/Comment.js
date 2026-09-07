import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post reference is required'],
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment author is required']
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// Helper function to update comment count on Post
async function updatePostCommentCount(postId) {
  if (!postId) return;
  const PostModel = mongoose.model('Post');
  const count = await mongoose.model('Comment').countDocuments({ post: postId });
  await PostModel.findByIdAndUpdate(postId, { commentCount: count });
}

// Post-save hook to increment/update post comment count
commentSchema.post('save', async function () {
  await updatePostCommentCount(this.post);
});

// Post-remove/findOneAndDelete hook to decrement/update post comment count
commentSchema.post(['findOneAndDelete', 'deleteOne'], async function (doc) {
  if (doc && doc.post) {
    await updatePostCommentCount(doc.post);
  }
});

export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
export default Comment;

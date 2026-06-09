const express = require('express');
const router = express.Router();
const { createPost, getFeed, getExplorePosts, getPost, reactToPost, addComment, deleteComment, savePost, deletePost, getSavedPosts } = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { uploadPost } = require('../config/cloudinary');

router.get('/feed', protect, getFeed);
router.get('/explore', protect, getExplorePosts);
router.get('/saved', protect, getSavedPosts);
router.post('/', protect, uploadPost.single('media'), createPost);
router.get('/:id', protect, getPost);
router.delete('/:id', protect, deletePost);
router.post('/:id/react', protect, reactToPost);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);
router.post('/:id/save', protect, savePost);

module.exports = router;

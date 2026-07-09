const express = require('express');
const router = express.Router();
const { createPost, getFeed, toggleLike, addComment, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createPost);
router.get('/', getFeed);
router.patch('/:id/like', toggleLike);
router.post('/:id/comments', addComment);
router.delete('/:id', deletePost);

module.exports = router;

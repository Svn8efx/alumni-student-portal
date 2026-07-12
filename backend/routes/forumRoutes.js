const express = require('express');
const router = express.Router();
const { createThread, getThreads, getThreadById, addReply, deleteThread, deleteReply } = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createThread);
router.get('/', getThreads);
router.get('/:id', getThreadById);
router.post('/:id/replies', addReply);
router.delete('/:id/replies/:replyId', deleteReply);
router.delete('/:id', deleteThread);

module.exports = router;
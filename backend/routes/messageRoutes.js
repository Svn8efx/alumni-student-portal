const express = require('express');
const router = express.Router();
const {
  sendMessage,
  deleteMessage,
  getConversation,
  getInbox,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', sendMessage);
router.get('/', getInbox);
router.get('/:userId', getConversation);
router.delete('/:id', deleteMessage);

module.exports = router;
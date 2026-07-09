const express = require('express');
const router = express.Router();
const {
  sendConnectionRequest,
  respondToConnectionRequest,
  getMyConnections,
} = require('../controllers/connectionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', sendConnectionRequest);
router.get('/', getMyConnections);
router.patch('/:id', respondToConnectionRequest);

module.exports = router;

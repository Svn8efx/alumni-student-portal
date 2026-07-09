const express = require('express');
const router = express.Router();
const {
  updateMyProfile,
  getUserById,
  getDirectory,
  adminGetAllUsers,
  adminUpdateUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // every route below requires authentication

router.get('/', getDirectory);
router.put('/me', updateMyProfile);
router.get('/admin/all', authorize('admin'), adminGetAllUsers);
router.patch('/admin/:id', authorize('admin'), adminUpdateUser);
router.get('/:id', getUserById);

module.exports = router;

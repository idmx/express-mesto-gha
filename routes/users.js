const router = require('express').Router();
const {
  getUsers,
  getUser,
  updateUser,
  updateUserAvatar,
  getUserInfo
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getUserInfo);
router.get('/:userId', getUser);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateUserAvatar);

module.exports = router;

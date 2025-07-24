const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.get('/', usersController.getAllUsers);
router.get('/:id/clubs', usersController.getUserClubs);
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);
router.post('/:id/change-password', usersController.changePassword);

module.exports = router;
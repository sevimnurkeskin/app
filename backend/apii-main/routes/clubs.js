const express = require('express');
const router = express.Router();
const controller = require('../controllers/clubsController');

router.get('/', controller.getAllClubs);
router.get('/:id', controller.getClubById);
router.post('/', controller.createClub);
router.put('/:id', controller.updateClub);
router.delete('/:id', controller.deleteClub);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventsController');

// Özel GET route'lar önce gelmeli
router.get('/locations', controller.getLocations);
router.get('/joined', controller.getJoinedEvents);
router.get('/saved', controller.getSavedEvents);

// Temel event işlemleri
router.get('/', controller.getAllEvents);
router.post('/', controller.createEvent);

// Tekil event işlemleri
router.get('/:id', controller.getEventById);
router.put('/:id', controller.updateEvent);
router.delete('/:id', controller.deleteEvent);

// Katılım ve kaydetme işlemleri
router.post('/:id/join', controller.joinEvent);
router.delete('/:id/join', controller.leaveEvent);
router.post('/:id/save', controller.saveEvent);
router.delete('/:id/save', controller.unsaveEvent);

module.exports = router;

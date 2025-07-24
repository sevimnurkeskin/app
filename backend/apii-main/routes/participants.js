const express = require('express');
const router = express.Router();
const controller = require('../controllers/participantsController');

// Tüm katılımcılar
router.get('/', controller.getAllParticipants);

// Belirli bir etkinliğin katılımcıları
router.get('/event/:eventId', controller.getParticipantsByEvent);

// Yeni katılımcı ekle
router.post('/', controller.addParticipant);

// Katılım durumunu güncelle
router.put('/:id', controller.updateParticipantStatus);

// Katılımı sil
router.delete('/:id', controller.deleteParticipant);

module.exports = router;

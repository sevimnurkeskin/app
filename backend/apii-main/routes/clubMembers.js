const express = require('express');
const router = express.Router();

// Controller'ı doğru şekilde import ediyorsun
const controller = require('../controllers/clubMembersController');

// Tüm üyelikler
router.get('/', controller.getAllClubMembers);

// Belirli bir kulübün üyeleri
router.get('/club/:clubId', controller.getMembersByClubId);

// Kulübe katıl (POST)
router.post('/', controller.joinClub);

// Üyelik durumunu güncelle (onay, reddet vs.)
router.put('/:id', controller.updateMembershipStatus);

// Üyeliği sil (kulüpten çıkar)
router.delete('/:id', controller.deleteMembership);

module.exports = router;

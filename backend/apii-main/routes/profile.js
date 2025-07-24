const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');

router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: `Hoşgeldin, kullanıcı ID: ${req.user.id}` });
});

module.exports = router;
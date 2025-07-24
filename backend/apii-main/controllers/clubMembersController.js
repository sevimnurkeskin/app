const pool = require('../db/pool');

// Tüm kulüp üyeliklerini getir
exports.getAllClubMembers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, club_id, user_id, role, status, joined_at 
      FROM club_members
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Kulüp üyeleri alınamadı:', error);
    res.status(500).json({ error: 'Kulüp üyeleri alınamadı' });
  }
};

// Belirli bir kulübün üyelerini getir
exports.getMembersByClubId = async (req, res) => {
  const clubId = req.params.clubId;
  try {
    const result = await pool.query(
      'SELECT * FROM club_members WHERE club_id = $1',
      [clubId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Kulüp üyeleri getirilemedi' });
  }
};

// Üye ekle (kulübe katılma isteği)
exports.joinClub = async (req, res) => {
  const { club_id, user_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO club_members (club_id, user_id, role, status, joined_at)
       VALUES ($1, $2, 'member', 'approved', NOW())
       RETURNING *`,
      [club_id, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Zaten bu kulübe üyesiniz.' });
    }
    res.status(500).json({ error: 'Katılım başarısız', detail: error.message });
  }
};

// Üyelik durumunu güncelle (admin onay vs.)
exports.updateMembershipStatus = async (req, res) => {
  const { id } = req.params;
  const { status, role } = req.body;
  try {
    const result = await pool.query(
      `UPDATE club_members
       SET status = $1, role = $2
       WHERE id = $3
       RETURNING *`,
      [status, role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Üyelik bulunamadı' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Üyelik güncellenemedi:', error);
    res.status(500).json({ error: 'Güncelleme başarısız' });
  }
};

// Üyeliği sil (kulüpten çık / at)
exports.deleteMembership = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM club_members WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Üyelik bulunamadı' });
    }
    res.json({ message: 'Üyelik silindi', id: result.rows[0].id });
  } catch (error) {
    console.error('Üyelik silinemedi:', error);
    res.status(500).json({ error: 'Silme başarısız' });
  }
};
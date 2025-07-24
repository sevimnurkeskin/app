const pool = require('../db/pool');
const bcrypt = require('bcrypt');

// 1. Tüm kullanıcıları getir
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, city, interests, profile_image, created_at FROM users'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Kullanıcılar alınamadı:', error);
    res.status(500).json({ error: 'Kullanıcılar getirilemedi' });
  }
};



// 3. Kullanıcıyı güncelle
exports.updateUser = async (req, res) => {
  const id = req.params.id;
  const { name, city, interests, profile_image } = req.body;

  try {
    const interestsJson = interests ? JSON.stringify(interests) : null;

    const result = await pool.query(
      `UPDATE users
       SET name = $1, city = $2, interests = $3::jsonb, profile_image = $4
       WHERE id = $5
       RETURNING id, name, email, city, interests, profile_image, created_at`,
      [name, city, interestsJson, profile_image, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Kullanıcı güncellenemedi:', error);
    res.status(500).json({ error: 'Kullanıcı güncellenemedi' });
  }
};


// 4. Kullanıcıyı sil
exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    res.json({ message: 'Kullanıcı silindi', id: result.rows[0].id });
  } catch (error) {
    console.error('Kullanıcı silinemedi:', error);
    res.status(500).json({ error: 'Kullanıcı silinemedi' });
  }
};

// 2. Kullanıcıyı id ile getir
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, name, email, city, interests, profile_image, created_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Kullanıcı getirilemedi:', error);
    res.status(500).json({ error: 'Kullanıcı getirilemedi' });
  }
};

// Kullanıcının oluşturduğu ve katıldığı kulüpleri getir (tekrarsız ve üyelik bilgisiyle, UNION ile)
exports.getUserClubs = async (req, res) => {
  const userId = req.params.id || req.params.userId;
  try {
    const result = await pool.query(`
      SELECT c.*, m.role as member_role, m.status as member_status
      FROM clubs c
      JOIN club_members m ON c.id = m.club_id
      WHERE m.user_id = $1
      UNION
      SELECT c.*, NULL as member_role, NULL as member_status
      FROM clubs c
      WHERE c.creator_id = $1 AND c.id NOT IN (
        SELECT club_id FROM club_members WHERE user_id = $1
      )
    `, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Kulüpler getirilemedi' });
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  try {
    // Kullanıcıyı bul
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }
    const user = result.rows[0];

    // Mevcut şifreyi kontrol et
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış.' });
    }

    // Yeni şifreyi hashle ve kaydet
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

    res.json({ message: 'Şifre başarıyla değiştirildi.' });
  } catch (error) {
    console.error('Şifre değiştirilemedi:', error);
    res.status(500).json({ message: 'Şifre değiştirilemedi.' });
  }
};
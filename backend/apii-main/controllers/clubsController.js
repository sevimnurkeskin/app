const pool = require('../db/pool');

// Tüm kulüpleri getir
exports.getAllClubs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, city, category, creator_id, cover_image, is_approval_needed, created_at 
      FROM clubs
      ORDER BY created_at DESC
    `);
    res.json(result.rows); // creator_id burada var
  } catch (error) {
    console.error('Kulüpler alınamadı:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

// Tek kulübü getir (etkinliklerle birlikte)
exports.getClubById = async (req, res) => {
  const { id } = req.params;
  const userId = req.query.user_id;
  try {
    const clubResult = await pool.query('SELECT * FROM clubs WHERE id = $1', [id]);
    if (clubResult.rows.length === 0)
      return res.status(404).json({ error: 'Kulüp bulunamadı' });
    const club = clubResult.rows[0];
    // Etkinlikleri getir
    const eventsResult = await pool.query('SELECT * FROM events WHERE club_id = $1 ORDER BY date DESC', [id]);
    club.events = eventsResult.rows;
    // Kullanıcı üyeliği kontrolü
    if (userId) {
      const memberResult = await pool.query('SELECT 1 FROM club_members WHERE club_id = $1 AND user_id = $2', [id, userId]);
      club.isMember = memberResult.rows.length > 0;
    }
    // Üye sayısı
    const countResult = await pool.query('SELECT COUNT(*) FROM club_members WHERE club_id = $1', [id]);
    club.memberCount = parseInt(countResult.rows[0].count, 10);
    res.json(club);
  } catch (error) {
    console.error('Kulüp getirilemedi:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

// Yeni kulüp oluştur
exports.createClub = async (req, res) => {
  const { name, description, city, category, creator_id, cover_image, is_approval_needed } = req.body;

  try {
    // 1. Kulübü oluştur
    const result = await pool.query(
      `INSERT INTO clubs (name, description, city, category, creator_id, cover_image, is_approval_needed, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [name, description, city, category, creator_id, cover_image, is_approval_needed]
    );
    const club = result.rows[0];

    // 2. Kurucuyu otomatik üye olarak ekle
    await pool.query(
      `INSERT INTO club_members (club_id, user_id, role, status, joined_at)
       VALUES ($1, $2, 'owner', 'member', NOW())`,
      [club.id, creator_id]
    );

    res.status(201).json(club);
  } catch (error) {
    console.error('Kulüp oluşturulamadı:', error);
    res.status(500).json({ error: 'Veritabanı hatası', detail: error.message });
  }
};

// Kulüp güncelle (PUT /clubs/:id) - Kulüp bilgilerini günceller
exports.updateClub = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    city,
    category,
    cover_image,
    is_approval_needed
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE clubs 
       SET name = $1, description = $2, city = $3, category = $4, cover_image = $5, is_approval_needed = $6
       WHERE id = $7
       RETURNING *`,
      [name, description, city, category, cover_image, is_approval_needed, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Kulüp bulunamadı' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Kulüp güncellenemedi:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

// Kulüp silme fonksiyonu
exports.deleteClub = async (req, res) => {
  const clubId = req.params.id;
  try {
    // Önce events tablosundan sil
    await pool.query('DELETE FROM events WHERE club_id = $1', [clubId]);
    // Sonra club_members tablosundan sil
    await pool.query('DELETE FROM club_members WHERE club_id = $1', [clubId]);
    // En son kulübü sil
    await pool.query('DELETE FROM clubs WHERE id = $1', [clubId]);
    res.status(200).json({ message: 'Kulüp silindi' });
  } catch (error) {
    console.error('Kulüp silinemedi:', error);
    res.status(500).json({ error: 'Kulüp silinemedi' });
  }
};

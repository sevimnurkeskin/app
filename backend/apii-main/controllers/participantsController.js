const pool = require('../db/pool');

// Tüm katılımcıları getir
exports.getAllParticipants = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM event_participants ORDER BY joined_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Katılımcılar alınamadı:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

// Belirli bir etkinliğin katılımcılarını getir
exports.getParticipantsByEvent = async (req, res) => {
  const { eventId } = req.params;
  try {
    const result = await pool.query(`
      SELECT ep.*, u.name, u.profile_image
      FROM event_participants ep
      JOIN users u ON ep.user_id = u.id
      WHERE ep.event_id = $1
    `, [eventId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Etkinlik katılımcıları alınamadı:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

// Katılım oluştur (katılımcı ekle)
exports.addParticipant = async (req, res) => {
  const { event_id, user_id, status } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO event_participants (event_id, user_id, status, joined_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `, [event_id, user_id, status]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Katılımcı eklenemedi:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

// Katılım durumunu güncelle
exports.updateParticipantStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(`
      UPDATE event_participants
      SET status = $1
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Katılım bulunamadı' });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Katılım durumu güncellenemedi:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

// Katılımı sil
exports.deleteParticipant = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      DELETE FROM event_participants WHERE id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Katılım bulunamadı' });

    res.json({ message: 'Katılım silindi', deleted: result.rows[0] });
  } catch (error) {
    console.error('Katılım silinemedi:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

const pool = require('../db/pool');
const cities = require('../data/cities.json'); // Şehir verileri

// Tüm etkinlikleri getir
exports.getAllEvents = async (req, res) => {
  try {
    const eventsResult = await pool.query('SELECT * FROM events ORDER BY date ASC, time ASC');
    const events = eventsResult.rows;

    // Her etkinlik için katılımcıları ekle
    for (const event of events) {
      const participantsResult = await pool.query(
        'SELECT * FROM event_participants WHERE event_id = $1',
        [event.id]
      );
      event.participants = participantsResult.rows;
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

// Tek etkinlik getir
exports.getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Etkinlik bulunamadı' });
    const event = result.rows[0];

    // Katılımcıları ekle
    const participantsResult = await pool.query(
      'SELECT * FROM event_participants WHERE event_id = $1',
      [id]
    );
    event.participants = participantsResult.rows;

    res.json(event);
  } catch (error) {
    console.error('Etkinlik getirilemedi:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

// Yeni etkinlik oluştur
exports.createEvent = async (req, res) => {
  console.log('GELEN EVENT BODY:', req.body);
  const {
    club_id, title, description, date, time, location_name, location_map,
    quota, city, district, category, image_url, creator_id
  } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO events (club_id, title, description, date, time, location_name, location_map, quota, city, district, category, image_url, creator_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      RETURNING *
    `, [
      club_id, title, description, date, time, location_name, location_map || null,
      quota, city, district, category, image_url, creator_id
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Etkinlik oluşturulurken backend hatası:', error, error.stack);
    res.status(500).json({ error: error.message, detail: error.stack });
  }
};

// Etkinliği güncelle
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    date,
    time,
    location_name,
    location_map,
    quota,
    city,
    district,
    category,
    image_url
  } = req.body;

  try {
    const result = await pool.query(`
      UPDATE events
      SET title = $1, description = $2, date = $3, time = $4, location_name = $5, location_map = $6, quota = $7, city = $8, district = $9, category = $10, image_url = $11
      WHERE id = $12
      RETURNING *
    `, [title, description, date, time, location_name, location_map || null, quota, city, district, category, image_url, id]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Etkinlik bulunamadı' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Etkinlik güncellenemedi:', error);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
};

// Etkinliği sil (sadece sahibi silebilir)
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  let userId;
  // userId'yi JWT'den veya req.body'den alabilirsin. Burada örnek olarak req.user.id ve req.body.user_id kontrolü ekliyorum.
  if (req.user && req.user.id) {
    userId = req.user.id;
  } else if (req.body && req.body.user_id) {
    userId = req.body.user_id;
  } else {
    return res.status(401).json({ error: 'Kullanıcı kimliği bulunamadı' });
  }

  // Etkinliği bul
  const event = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
  if (!event.rows.length) return res.status(404).json({ error: 'Etkinlik bulunamadı' });

  // Sadece sahibi silebilir
  if (String(event.rows[0].creator_id) !== String(userId)) {
    return res.status(403).json({ error: 'Sadece kendi oluşturduğun etkinliği silebilirsin' });
  }

  await pool.query('DELETE FROM events WHERE id = $1', [id]);
  res.json({ message: 'Etkinlik silindi' });
};

// Lokasyonlar (şehir/ilçe)
exports.getLocations = async (req, res) => {
  try {
    res.json({
      cities: Object.keys(cities).sort(),
      districtsByCity: cities
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Etkinliğe katıl
exports.joinEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.body.user_id;
  try {
    // Önce var mı kontrol et
    const exists = await pool.query(
      'SELECT 1 FROM event_participants WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Zaten bu etkinliğe katıldınız.' });
    }
    const result = await pool.query(
      `INSERT INTO event_participants (event_id, user_id, status, joined_at)
       VALUES ($1, $2, 'joined', NOW()) RETURNING *`,
      [eventId, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Etkinliğe katılım hatası:', error);
    res.status(500).json({ error: 'Etkinliğe katılım başarısız' });
  }
};

// Etkinlikten ayrıl
exports.leaveEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.body.user_id;
  console.log('leaveEvent:', { eventId, userId, body: req.body });
  try {
    const result = await pool.query(
      'DELETE FROM event_participants WHERE event_id = $1 AND user_id = $2 RETURNING *',
      [eventId, userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Katılım bulunamadı' });
    res.json({ message: 'Etkinlikten ayrıldınız', deleted: result.rows[0] });
  } catch (error) {
    console.error('Etkinlikten ayrılma hatası:', error);
    res.status(500).json({ error: 'Etkinlikten ayrılma başarısız' });
  }
};

// Etkinliği kaydet
exports.saveEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.body.user_id;
  try {
    const result = await pool.query(
      `INSERT INTO saved_events (event_id, user_id, saved_at)
       VALUES ($1, $2, NOW()) RETURNING *`,
      [eventId, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Etkinlik kaydetme hatası:', error);
    res.status(500).json({ error: 'Etkinlik kaydedilemedi' });
  }
};

// Etkinlik kaydını kaldır
exports.unsaveEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.body.user_id;
  try {
    const result = await pool.query(
      'DELETE FROM saved_events WHERE event_id = $1 AND user_id = $2 RETURNING *',
      [eventId, userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Kayıt bulunamadı' });
    res.json({ message: 'Etkinlik kaydı kaldırıldı', deleted: result.rows[0] });
  } catch (error) {
    console.error('Etkinlik kaydı kaldırma hatası:', error);
    res.status(500).json({ error: 'Etkinlik kaydı kaldırılamadı' });
  }
};

// Kullanıcının katıldığı etkinlikler
exports.getJoinedEvents = async (req, res) => {
  const userId = req.query.user_id;
  if (!userId) {
    return res.status(400).json({ error: "user_id zorunludur" });
  }
  try {
    const result = await pool.query(
      `SELECT e.* FROM events e
       JOIN event_participants ep ON e.id = ep.event_id
       WHERE ep.user_id = $1 AND ep.status = 'joined'`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Katıldığı etkinlikler alınamadı:', error);
    res.status(500).json({ error: 'Katıldığı etkinlikler alınamadı' });
  }
};

// Kullanıcının kaydettiği etkinlikler
exports.getSavedEvents = async (req, res) => {
  const userId = req.query.user_id;
  try {
    const result = await pool.query(
      `SELECT e.* FROM events e
       JOIN saved_events se ON e.id = se.event_id
       WHERE se.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Kaydedilen etkinlikler alınamadı:', error);
    res.status(500).json({ error: 'Kaydedilen etkinlikler alınamadı' });
  }
};

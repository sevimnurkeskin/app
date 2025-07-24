const pool = require('../db/pool');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Kayıt olma
exports.register = async (req, res) => {
  console.log('✅ Register endpoint tetiklendi');
  try {
    const { name, email, password, city, district } = req.body;

    if (!name || !email || !password || !city || !district) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email zaten kayıtlı' });
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, city, district, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, name, email, city, district`,
      [name, email, hashedPassword, city, district]
    );

    const user = result.rows[0];

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.status(201).json({ user, token });

  } catch (error) {
    console.error('❌ Kayıt olurken hata:', error.message);
    return res.status(500).json({ error: 'Kayıt yapılamadı' });
  }
};

// Giriş yapma
exports.login = async (req, res) => {
  console.log('🔐 Login endpoint tetiklendi');
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        district: user.district,
      },
      token,
    });
  } catch (error) {
    console.error('❌ Giriş hatası:', error.message);
    return res.status(500).json({ error: 'Giriş yapılamadı' });
  }
};

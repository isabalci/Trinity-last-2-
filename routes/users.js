const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Gerekli alanları kontrol et
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tüm alanlar gereklidir' });
    }
    
    // Kullanıcı adı veya email zaten var mı kontrol et
    const existingUsers = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUsers.rows.length > 0) {
      return res.status(400).json({ error: 'Kullanıcı adı veya email zaten kullanımda' });
    }
    
    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Kullanıcıyı veritabanına ekle
    const result = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );
    
    // Kullanıcı tercihleri tablosunu oluştur
    await db.query(
      'INSERT INTO user_preferences (user_id, language) VALUES ($1, $2)',
      [result.rows[0].id, 'tr']
    );
    
    // JWT token oluştur
    const token = jwt.sign(
      { id: result.rows[0].id, username, email },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      token,
      user: { id: result.rows[0].id, username, email }
    });
  } catch (error) {
    console.error('Kullanıcı kaydı sırasında hata:', error);
    res.status(500).json({ error: 'Kullanıcı kaydı sırasında bir hata oluştu' });
  }
});

// Kullanıcı girişi
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Gerekli alanları kontrol et
    if (!username || !password) {
      return res.status(400).json({ error: 'Tüm alanlar gereklidir' });
    }
    
    // Kullanıcıyı bul
    const users = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (users.rows.length === 0) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }
    
    const user = users.rows[0];
    
    // Şifreyi kontrol et
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }
    
    // Kullanıcı tercihlerini getir
    const preferences = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [user.id]
    );
    
    // JWT token oluştur
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        language: preferences.rows.length > 0 ? preferences.rows[0].language : 'tr'
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1d' }
    );
    
    res.json({
      message: 'Giriş başarılı',
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        language: preferences.rows.length > 0 ? preferences.rows[0].language : 'tr'
      }
    });
  } catch (error) {
    console.error('Kullanıcı girişi sırasında hata:', error);
    res.status(500).json({ error: 'Kullanıcı girişi sırasında bir hata oluştu' });
  }
});

// Dil tercihini güncelle
router.put('/preferences/language', authenticate, async (req, res) => {
  try {
    const { language } = req.body;
    const userId = req.user.id;
    
    if (!language || !['tr', 'en'].includes(language)) {
      return res.status(400).json({ error: 'Geçerli bir dil belirtilmelidir (tr veya en)' });
    }
    
    // Kullanıcı tercihleri varsa güncelle, yoksa oluştur
    const preferences = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );
    
    if (preferences.rows.length > 0) {
      await db.query(
        'UPDATE user_preferences SET language = $1 WHERE user_id = $2',
        [language, userId]
      );
    } else {
      await db.query(
        'INSERT INTO user_preferences (user_id, language) VALUES ($1, $2)',
        [userId, language]
      );
    }
    
    res.json({
      message: 'Dil tercihi güncellendi',
      language
    });
  } catch (error) {
    console.error('Dil tercihi güncellenirken hata:', error);
    res.status(500).json({ error: 'Dil tercihi güncellenirken bir hata oluştu' });
  }
});

// Watchlist oluştur
router.post('/watchlists', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    
    if (!name) {
      return res.status(400).json({ error: 'Watchlist adı gereklidir' });
    }
    
    const result = await db.query(
      'INSERT INTO watchlists (user_id, name) VALUES ($1, $2) RETURNING id',
      [userId, name]
    );
    
    res.status(201).json({
      id: result.rows[0].id,
      name,
      user_id: userId,
      message: 'Watchlist başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Watchlist oluşturulurken hata:', error);
    res.status(500).json({ error: 'Watchlist oluşturulurken bir hata oluştu' });
  }
});

// Kimlik doğrulama middleware'i
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Erişim reddedildi. Token gerekli.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
}

module.exports = router; 
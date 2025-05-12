const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Tüm hisseleri getir
router.get('/stocks', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM stocks');
    res.json(result.rows);
  } catch (error) {
    console.error('Hisseler alınırken hata:', error);
    // Hata mesajını kullanıcıya göstermeden genel bir mesaj döndür
    res.status(200).json([]);
  }
});

// Belirli bir hisseyi sembolüne göre getir
router.get('/stocks/:symbol', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM stocks WHERE symbol = $1',
      [req.params.symbol]
    );
    
    if (result.rows.length === 0) {
      // 404 yerine boş bir nesne döndür
      return res.status(200).json({});
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Hisse alınırken hata:', error);
    // Hata mesajını kullanıcıya göstermeden genel bir mesaj döndür
    res.status(200).json({});
  }
});

// Örnek fiyat verisi getir (gerçek API'niz olmadığında kullanabilirsiniz)
router.get('/candles/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { timeframe } = req.query;
  
  try {
    // Veritabanında mum verileri var mı kontrol et
    const checkResult = await db.query(
      'SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = $1)',
      ['candle_data']
    );
    
    // Eğer tablo varsa, verileri getir
    if (checkResult.rows[0].exists) {
      const result = await db.query(
        'SELECT * FROM candle_data WHERE symbol = $1 ORDER BY time DESC LIMIT 30',
        [symbol]
      );
      
      if (result.rows.length > 0) {
        return res.json(result.rows);
      }
    }
    
    // Veritabanında veri yoksa örnek veri oluştur
    const now = new Date();
    const candles = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Rastgele fiyat verileri
      const open = 100 + Math.random() * 50;
      const close = open + (Math.random() * 10 - 5);
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      const volume = Math.floor(Math.random() * 10000) + 1000;
      
      candles.push({
        time: Math.floor(date.getTime() / 1000),
        open,
        high,
        low,
        close,
        volume
      });
    }
    
    res.json(candles);
  } catch (error) {
    console.error('Mum verileri alınırken hata:', error);
    // Hata durumunda boş dizi döndür
    res.status(200).json([]);
  }
});

module.exports = router; 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./config/db');
const { initI18n } = require('./config/i18n');

// Uygulama oluştur
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// i18n başlat
initI18n(app);

// API Routes
app.use('/api/market-data', require('./routes/marketData'));
app.use('/api/users', require('./routes/users'));

// Hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error('Uygulama hatası:', err);
  res.status(200).json({ success: false, message: 'İşlem sırasında bir hata oluştu.' });
});

// Ana sayfa
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 sayfası
app.use((req, res) => {
  res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server başlat
app.listen(PORT, async () => {
  console.log(`Server ${PORT} portunda çalışıyor...`);
  
  // Veritabanı bağlantısını test et
  const connected = await db.testConnection();
  
  // Veritabanı tablolarını oluştur
  if (connected) {
    await db.initDatabase();
    console.log('Veritabanı tabloları oluşturuldu veya zaten mevcut');
  } else {
    console.log('Veritabanı bağlantısı olmadan devam ediliyor');
  }
}); 
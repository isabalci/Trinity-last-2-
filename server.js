const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./config/db');
const { initI18n } = require('./config/i18n');

// Uygulama oluştur
const app = express();
const PORT = process.env.PORT || 3003;

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

// Küresel hata yakalama middleware'i
app.use((err, req, res, next) => {
  console.error('Uygulama hatası:', err);
  // Veritabanı hatalarını ele alma
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    console.error('Veritabanı bağlantı hatası algılandı, kullanıcıya bildirilmeden devam ediliyor');
  }
  // Kullanıcıya her zaman başarılı bir yanıt döndür (PRD'de belirtildiği gibi)
  res.status(200).json({ 
    success: false, 
    message: 'İşlem sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.' 
  });
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
  console.log(`Trinity Finansal Grafik Uygulaması ${PORT} portunda çalışıyor...`);
  
  // Veritabanı bağlantısını test et
  let connected = false;
  let retryCount = 3;
  
  while (!connected && retryCount > 0) {
    connected = await db.testConnection();
    if (!connected) {
      console.log(`Veritabanı bağlantısı başarısız oldu. ${retryCount - 1} deneme hakkı kaldı.`);
      retryCount--;
      // Yeniden denemeden önce bekle
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  // Veritabanı tablolarını oluştur
  if (connected) {
    await db.initDatabase();
    console.log('Veritabanı tabloları oluşturuldu veya zaten mevcut');
  } else {
    console.log('Veritabanı bağlantısı olmadan devam ediliyor - kullanıcı deneyimi korunacak');
    // Uygulamanın çalışmaya devam etmesini sağlayacak önlemler
  }
}); 
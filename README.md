# Trinity TradingView Clone

TradingView benzeri finansal grafik analiz platformu.

## 🌟 Özellikler

- 📊 Gelişmiş finansal grafikler (mum, çizgi, alan)
- 📈 Gerçek zamanlı veri güncellemeleri 
- 📉 Birden fazla hisse senedi/kripto para takibi
- 🔍 Teknik göstergeler (SMA, EMA, RSI, MACD, Bollinger Bandları)
- 📰 Piyasa haberleri
- 🔔 Fiyat alarmları
- 👥 Kullanıcı hesapları (kayıt, giriş)
- 📋 Kişiselleştirilmiş izleme listeleri
- 🎨 Koyu/Açık mod tema seçenekleri
- 🌐 Çoklu dil desteği (Türkçe, İngilizce)
- 📱 Mobil uyumlu tasarım

## 🚀 Kurulum

### Ön Koşullar

- Node.js (v14 veya üzeri)
- PostgreSQL veritabanı

### Adımlar

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/kullanici/tradingview-clone.git
   cd tradingview-clone
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. `.env` dosyasını oluşturun (örnek olarak `env.example` dosyasını kullanabilirsiniz):
   ```
   PORT=3003
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=trinity123
   DB_NAME=trinity
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret
   ```

4. Veritabanını başlatın ve tabloları oluşturun:
   ```bash
   npm run db:init
   ```

5. Uygulamayı başlatın:
   ```bash
   npm start
   ```

6. Tarayıcınızda şu adresi açın: `http://localhost:3003`

## 💻 Teknolojiler

### Frontend
- HTML5, CSS3, JavaScript
- Lightweight Charts (TradingView'in açık kaynak grafik kütüphanesi)
- i18next (çoklu dil desteği)

### Backend
- Node.js & Express.js
- PostgreSQL (veri depolama)
- WebSockets (gerçek zamanlı veri akışı)
- JWT (kimlik doğrulama)

## 📝 API Endpoints

### Kullanıcı İşlemleri
- `POST /api/users/register` - Yeni kullanıcı kaydı
- `POST /api/users/login` - Kullanıcı girişi
- `GET /api/users/watchlists` - Kullanıcının izleme listelerini getir
- `POST /api/users/watchlists` - Yeni izleme listesi oluştur

### Market Verileri
- `GET /api/market-data/stocks` - Tüm hisseleri listele
- `GET /api/market-data/stocks/:symbol` - Belirli bir hissenin detaylarını getir
- `GET /api/market-data/candles/:symbol` - Mum verilerini getir
- `GET /api/market-data/news` - Piyasa haberlerini getir

## 🔄 Gerçek Zamanlı Veri

Uygulama, WebSocket bağlantısı üzerinden gerçek zamanlı veri güncellemeleri sunar:

- `/ws/market-data/:symbol` - Belirli bir sembol için gerçek zamanlı veri akışı

## 📊 Teknik Göstergeler

Uygulama çeşitli teknik göstergeleri destekler:

- **Hareketli Ortalamalar**
  - Basit Hareketli Ortalama (SMA)
  - Üssel Hareketli Ortalama (EMA)
  
- **Osilatörler**
  - Göreceli Güç Endeksi (RSI)
  - MACD (Moving Average Convergence Divergence)
  
- **Volatilite Göstergeleri**
  - Bollinger Bantları

- **Hacim Göstergeleri**
  - Hacim (Volume)

## 📱 Ekran Görüntüleri

[Buraya ekran görüntüleri eklenecek]

## 🤝 Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz! Lütfen şu adımları izleyin:

1. Bu depoyu çatallayın (fork)
2. Yeni bir dal (branch) oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi kaydedin (`git commit -m 'Add some amazing feature'`)
4. Dalınıza itin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

## 🙏 Teşekkürler

- [TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts) - Grafik kütüphanesi
- [Express.js](https://expressjs.com/) - Web framework
- [PostgreSQL](https://www.postgresql.org/) - Veritabanı
- [i18next](https://www.i18next.com/) - Çoklu dil desteği 
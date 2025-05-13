# TradingView Benzeri Web Uygulaması

Bu proje, finansal grafikleri görüntülemek ve analiz etmek için TradingView benzeri bir web uygulamasıdır.

## Özellikler

- Finansal grafik görüntüleme
- PostgreSQL veritabanı bağlantısı
- Kullanıcı hesapları
- Çoklu dil desteği (Türkçe, İngilizce)
- Temel teknik analiz araçları
- Responsive tasarım

## Teknolojiler

- Node.js ve Express
- PostgreSQL
- JWT kimlik doğrulama
- Lightweight Charts (TradingView tarafından geliştirilmiş)
- HTML, CSS, JavaScript
- i18next (çoklu dil desteği)

## Kurulum

1. Projeyi klonlayın:
   ```
   git clone https://github.com/username/Trinity-last-2.git
   cd Trinity-last-2
   ```

2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

3. `.env` dosyasını oluşturun:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=postgres123
   DB_NAME=tradingview_clone
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret_key
   ```

4. PostgreSQL veritabanını oluşturun:
   ```
   createdb tradingview_clone
   ```

5. Uygulamayı başlatın:
   ```
   npm start
   ```

## Klasör Yapısı

- `config/`: Yapılandırma dosyaları
- `public/`: Statik dosyalar (HTML, CSS, JavaScript)
- `routes/`: API endpoint'leri
- `locales/`: Çeviri dosyaları
- `server.js`: Ana uygulama dosyası

## Ekran Görüntüleri

(Ekran görüntüleri eklenecek)

## Katkıda Bulunma

1. Bu projenin bir fork'unu oluşturun
2. Özelliğiniz için yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request açın 
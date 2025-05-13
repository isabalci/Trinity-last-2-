# Trinity Finansal Grafik Uygulaması - Ürün Gereksinimleri Belgesi (PRD)

## 1. Ürün Tanımı ve Hedefi

Trinity Finansal Grafik Uygulaması, finansal pazarlardaki hisse senetleri, kripto para birimleri ve diğer varlıkların fiyat hareketlerini gerçek zamanlı olarak görselleştiren bir web tabanlı platformdur. Bu uygulama, TradingView benzeri profesyonel grafik araçları sunarak yatırımcıların piyasa trendlerini daha iyi analiz etmelerini sağlar.

### Hedef Kitle
- Bireysel yatırımcılar
- Günlük işlem yapanlar (Day traders)
- Finans öğrencileri ve akademisyenler
- Piyasa analistleri ve profesyoneller

### Temel Proje Prensipleri
1. Veritabanı: pgAdmin 4 kullanılarak oluşturulan "Trinity DB server" (şifre: postgres123)
2. Kod Versiyonlama: GitHub'da "Trinity-last-2-" deposunda tutulacak
3. Geliştirme: Adım adım ilerlenecek, her adım belgelenecek
4. Hata Yönetimi: Site açılışında ve kullanımda kullanıcıya hata ekranı gösterilmeyecek
5. Dil: Arayüz Türkçe ve İngilizce dil desteğine sahip olacak
6. Referans: TradingView benzeri bir arayüz ve işlevsellik hedeflenecek
7. GitHub Güncellemeleri: Kod değişiklikleri sadece kullanıcı tarafından istenmesi durumunda GitHub'a yüklenecek
8. MySQL'den PostgreSQL'e Geçiş: Daha önce MySQL kullanılan sistemin PostgreSQL'e sorunsuz geçişi sağlanacak

## 2. Ana Özellikler

### 2.1 Kullanıcı Yönetimi
- Kayıt ve giriş sistemi
- Şifre sıfırlama özelliği
- Kullanıcı profili özelleştirme
- Tercih ayarları (grafik tipleri, dil, tema vs.)

### 2.2 Grafik Görselleştirme
- Çeşitli grafik tipleri (mum, çizgi, OHLC)
- Zaman dilimi değiştirme (1d, 1h, 15m, 5m, 1m)
- Teknik göstergeler (hareketli ortalamalar, RSI, MACD vb.)
- Çizim araçları (trend çizgileri, Fibonacci seviyeleri)

### 2.3 Watchlist (İzleme Listesi)
- Kullanıcı tanımlı sembol listeleri oluşturma
- Çoklu watchlist desteği
- Fiyat alarmları ve bildirimler

### 2.4 Veri İntegrasyonu
- Gerçek zamanlı piyasa verileri
- Geçmiş veriler ve grafikler
- Temel analiz verileri

### 2.5 Çoklu Dil Desteği
- Türkçe (varsayılan)
- İngilizce
- Dil seçeneği kullanıcı ayarlarında saklanacak

### 2.6 Tema Desteği
- Açık ve koyu tema
- Kullanıcı tanımlı renkler ve stilleme

## 3. Teknik Gereksinimler

### 3.1 Mimari
- RESTful API ile client-server mimarisi
- JWT tabanlı kimlik doğrulama ve yetkilendirme
- PostgreSQL veritabanı bağlantısı

### 3.2 Frontend
- HTML, CSS, JavaScript kullanımı
- TradingView'ın Lightweight Charts kütüphanesi
- Responsive tasarım (mobil, tablet ve masaüstü uyumlu)
- i18next ile çoklu dil desteği

### 3.3 Backend
- Node.js ve Express.js
- PostgreSQL veritabanı (pgAdmin 4 ile yönetilecek)
- "Trinity DB server" adlı server kullanılacak (şifre: postgres123)
- Gerçek zamanlı veri işleme kapasitesi

### 3.4 Veritabanı Yapısı
- users tablosu (kullanıcı bilgileri ve kimlik doğrulama)
- stocks tablosu (sembol verileri)
- watchlists tablosu (kullanıcı izleme listeleri)
- watchlist_items tablosu (izleme listesi öğeleri)
- user_preferences tablosu (kullanıcı tercihleri ve ayarları)

### 3.5 Performans Gereksinimleri
- Sayfa yükleme süresi: < 3 saniye
- Grafik render süresi: < 1 saniye
- API tepki süresi: < 500ms
- Eşzamanlı kullanıcı desteği: 1000+
- Veritabanı bağlantı hatalarının kullanıcıya gösterilmemesi

### 3.6 Hata Yönetimi
- Tüm hataların arka planda yakalanması ve loglanması
- Kullanıcıya dost hata mesajlarının gösterilmesi
- Veritabanı bağlantı hatalarında otomatik yeniden bağlanma mekanizması
- Hiçbir durumda ham hata ekranının son kullanıcıya gösterilmemesi
- MySQL bağlantı hatalarının (örn: ER_ACCESS_DENIED_ERROR) ele alınması ve PostgreSQL bağlantısına düzgün geçiş

## 4. Kullanıcı Deneyimi

### 4.1 Kullanıcı Arayüzü Akışı
1. Karşılama sayfası ve giriş/kayıt
2. Ana ekran (grafik, watchlist, navigasyon)
3. Sembol arama ve seçme
4. Grafik analizi ve özelleştirme
5. Watchlist yönetimi

### 4.2 Mobil Deneyim
- Duyarlı tasarım
- Dokunmatik ekranlara optimize edilmiş kontroller
- Dikey ve yatay görünüm desteği

## 5. Geliştirme ve Dağıtım Süreci

### 5.1 Adım Adım İlerleme Yaklaşımı
1. Veritabanı bağlantısının kurulması (PostgreSQL - Trinity DB server)
2. Temel kullanıcı arayüzünün oluşturulması
3. Grafik kütüphanesinin entegrasyonu (Lightweight Charts)
4. Kullanıcı yönetimi sisteminin implementasyonu
5. Çoklu dil desteğinin eklenmesi (Türkçe/İngilizce)
6. Watchlist özelliğinin geliştirilmesi
7. Tema desteğinin eklenmesi
8. Hata yönetiminin iyileştirilmesi
9. Performans optimizasyonu

### 5.2 GitHub Entegrasyonu
- Kod değişiklikleri düzenli olarak "Trinity-last-2-" deposuna yüklenecek
- Her önemli özellik için ayrı commit yapılacak
- node_modules klasörü GitHub'a yüklenmeyecek (.gitignore ile)
- **ÖNEMLİ:** GitHub'a yükleme işlemleri sadece kullanıcı tarafından açıkça talep edildiğinde gerçekleştirilecek

## 6. Güvenlik Gereksinimleri
- HTTPS bağlantı zorunluluğu
- Güvenli şifre politikaları
- Rate limiting ve DoS koruması
- Düzenli güvenlik denetimi

## 7. Uyumluluk ve Yasal Gereksinimler
- GDPR veri koruma uyumluluğu
- Finansal verilerin doğru ve zamanında sunulması
- Kullanıcı verileri için gizlilik politikası

## 8. Lansmanla İlgili Bilgiler
- Alfa ve Beta test aşamaları planı
- Kapalı test grubu oluşturma
- Kademeli özellik devreye alma planı

## 9. Metrikler ve Başarı Kriterleri
- Aktif kullanıcı sayısı
- Kullanıcı tutma oranı
- Ortalama oturum süresi
- Hata oranları ve performans metrikleri

## 10. Risk Analizi
- Veri kaynağı kesintileri için yedekleme planı
- Yüksek trafik durumları için ölçeklendirme stratejisi
- Güvenlik ihlali senaryoları ve yanıt planları
- Veritabanı bağlantı sorunları için çözüm stratejileri

---

*Bu PRD yaşayan bir belgedir ve proje ilerledikçe güncellenmesi beklenir.*

*Son güncelleme: 20 Eylül 2023* 
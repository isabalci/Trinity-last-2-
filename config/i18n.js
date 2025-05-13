const i18next = require('i18next');
const middleware = require('i18next-http-middleware');
const fs = require('fs');
const path = require('path');

// Dil dosyalarını yükle
const loadLocales = () => {
  const locales = {};
  const localesDir = path.join(__dirname, '../locales');
  
  try {
    // locales dizininin var olup olmadığını kontrol et
    if (!fs.existsSync(localesDir)) {
      fs.mkdirSync(localesDir, { recursive: true });
    }
    
    // Her dil için dizini kontrol et
    ['tr', 'en'].forEach(lang => {
      const langDir = path.join(localesDir, lang);
      
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }
      
      const translationFile = path.join(langDir, 'translation.json');
      
      // Çeviri dosyasının var olup olmadığını kontrol et
      if (fs.existsSync(translationFile)) {
        const content = fs.readFileSync(translationFile, 'utf8');
        locales[lang] = { translation: JSON.parse(content) };
      } else {
        // Varsayılan boş çeviri dosyası oluştur
        locales[lang] = { translation: {} };
        fs.writeFileSync(translationFile, JSON.stringify({}, null, 2), 'utf8');
      }
    });
    
    return locales;
  } catch (error) {
    console.error('Dil dosyaları yüklenirken hata:', error);
    // Hata durumunda varsayılan boş çeviriler ile devam et
    return {
      tr: { translation: {} },
      en: { translation: {} }
    };
  }
};

// i18next yapılandırması
const initI18n = (app) => {
  try {
    const locales = loadLocales();
    
    i18next
      .init({
        resources: locales,
        lng: 'tr', // Varsayılan dil
        fallbackLng: 'tr',
        supportedLngs: ['tr', 'en'],
        preload: ['tr', 'en'],
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
          escapeValue: false // React ile kullanım için escape işlemini devre dışı bırak
        }
      });
    
    // i18next middleware'ini Express uygulamasına ekle
    app.use(middleware.handle(i18next));
    
    // API isteklerinde dil değiştirmek için middleware
    app.use((req, res, next) => {
      const lang = req.query.lang || req.headers['accept-language'];
      
      if (lang && ['tr', 'en'].includes(lang)) {
        req.i18n.changeLanguage(lang);
      }
      
      next();
    });
    
    console.log('i18next başarıyla yapılandırıldı');
  } catch (error) {
    console.error('i18next yapılandırılırken hata:', error);
    // Hata durumunda sessizce devam et
  }
};

module.exports = { initI18n }; 
/**
 * Dil Yönetimi
 * Frontend için çoklu dil desteği sağlayan fonksiyonlar
 */

// Çeviriler
const translations = {
  tr: {
    "header.search": "Sembol ara...",
    "header.login": "Giriş Yap",
    "header.register": "Kaydol",
    "header.account": "Hesabım",
    "header.logout": "Çıkış Yap",
    
    "chart.intervals.1d": "1 gün",
    "chart.intervals.1h": "1 saat",
    "chart.intervals.4h": "4 saat",
    "chart.intervals.1w": "1 hafta",
    
    "marketInfo.title": "Piyasa Bilgisi",
    "marketInfo.price": "Fiyat:",
    "marketInfo.change": "Değişim:",
    "marketInfo.high": "24s Yüksek:",
    "marketInfo.low": "24s Düşük:",
    "marketInfo.volume": "Hacim:",
    
    "watchlist.title": "İzleme Listesi",
    
    "auth.username": "Kullanıcı Adı",
    "auth.email": "E-posta",
    "auth.password": "Şifre",
    "auth.loginTitle": "Giriş Yap",
    "auth.registerTitle": "Kaydol",
    "auth.loginButton": "Giriş Yap",
    "auth.registerButton": "Kaydol"
  },
  en: {
    "header.search": "Search symbol...",
    "header.login": "Login",
    "header.register": "Register",
    "header.account": "My Account",
    "header.logout": "Logout",
    
    "chart.intervals.1d": "1 day",
    "chart.intervals.1h": "1 hour",
    "chart.intervals.4h": "4 hours",
    "chart.intervals.1w": "1 week",
    
    "marketInfo.title": "Market Information",
    "marketInfo.price": "Price:",
    "marketInfo.change": "Change:",
    "marketInfo.high": "24h High:",
    "marketInfo.low": "24h Low:",
    "marketInfo.volume": "Volume:",
    
    "watchlist.title": "Watchlist",
    
    "auth.username": "Username",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.loginTitle": "Login",
    "auth.registerTitle": "Register",
    "auth.loginButton": "Login",
    "auth.registerButton": "Register"
  }
};

class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'tr';
    this.initialize();
  }
  
  initialize() {
    this.updateLanguageButtons();
    this.translatePage();
    this.setupEventListeners();
  }
  
  updateLanguageButtons() {
    document.querySelectorAll('.language-btn').forEach(btn => {
      if (btn.dataset.lang === this.currentLanguage) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
  
  translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (key && translations[this.currentLanguage] && translations[this.currentLanguage][key]) {
        // Placeholders için ekstra işlem
        if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
          element.placeholder = translations[this.currentLanguage][key];
        } else {
          element.textContent = translations[this.currentLanguage][key];
        }
      }
    });
  }
  
  setupEventListeners() {
    document.querySelectorAll('.language-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang && translations[lang]) {
          this.changeLanguage(lang);
        }
      });
    });
  }
  
  changeLanguage(lang) {
    if (lang && translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      this.updateLanguageButtons();
      this.translatePage();
      
      // Kullanıcı oturumu açmışsa, dil tercihini sunucuya kaydet
      const token = localStorage.getItem('authToken');
      if (token) {
        // API isteği yap
        fetch('/api/users/preferences/language', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ language: lang })
        }).catch(error => console.error('Dil tercihi kaydedilirken hata:', error));
      }
      
      // Dil değişimi olayını yayınla
      const event = new CustomEvent('languageChanged', { detail: { language: lang } });
      document.dispatchEvent(event);
      
      this.showNotification(
        lang === 'tr' ? 'Dil Türkçe olarak değiştirildi' : 'Language changed to English',
        'info'
      );
    }
  }
  
  showNotification(message, type = 'info') {
    // Eski bildirimleri kaldır
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
      oldNotification.remove();
    }
    
    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animasyon için setTimeout kullan
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Bildirimi otomatik kapat
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
  
  translate(key) {
    if (translations[this.currentLanguage] && translations[this.currentLanguage][key]) {
      return translations[this.currentLanguage][key];
    }
    return key;
  }
}

// Sayfa yüklendiğinde I18n'i başlat
document.addEventListener('DOMContentLoaded', () => {
  window.i18n = new I18n();
}); 
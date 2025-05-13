/**
 * API Servisi
 * Backend ile iletişim kurmak için kullanılan fonksiyonlar
 */

const API_URL = 'http://localhost:3000/api';
const USE_DEMO_DATA = true; // API bağlantısı olmadığında demo veri kullanmak için

class ApiService {
  /**
   * Tüm hisse senetlerini getir
   */
  static async getAllStocks() {
    // Demo modu aktifse test verileri döndür
    if (USE_DEMO_DATA) {
      return ApiService.getDemoStocks();
    }
    
    try {
      const response = await fetch(`${API_URL}/market-data/stocks`);
      
      if (!response.ok) {
        throw new Error('Hisseler alınırken bir hata oluştu');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API hatası:', error);
      // Hata durumunda demo verileri göster
      return ApiService.getDemoStocks();
    }
  }

  /**
   * Belirli bir sembolün mum verilerini getir
   * @param {string} symbol - Hisse sembolü
   * @param {string} timeframe - Zaman dilimi (1m, 5m, 15m, 1h, vb.)
   */
  static async getCandleData(symbol, timeframe = '1d') {
    // Demo modu aktifse test verileri döndür
    if (USE_DEMO_DATA) {
      return ApiService.generateDemoCandleData(symbol, timeframe);
    }
    
    try {
      const response = await fetch(`${API_URL}/market-data/candles/${symbol}?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error('Mum verileri alınırken bir hata oluştu');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API hatası:', error);
      // Hata durumunda demo verileri göster
      return ApiService.generateDemoCandleData(symbol, timeframe);
    }
  }

  /**
   * Kullanıcı kaydı yap
   * @param {Object} userData - Kullanıcı bilgileri
   */
  static async register(userData) {
    // Demo modu aktifse sahte cevap döndür
    if (USE_DEMO_DATA) {
      console.log('Demo mod: Kayıt işlemi simüle ediliyor', userData);
      return {
        user: {
          id: 'demo123',
          username: userData.username,
          email: userData.email
        },
        token: 'demo_token_123456789'
      };
    }
    
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Kayıt olurken bir hata oluştu');
      }
      
      return data;
    } catch (error) {
      console.error('API hatası:', error);
      throw error;
    }
  }

  /**
   * Kullanıcı girişi yap
   * @param {Object} credentials - Kullanıcı adı ve şifre
   */
  static async login(credentials) {
    // Demo modu aktifse sahte cevap döndür
    if (USE_DEMO_DATA) {
      console.log('Demo mod: Giriş işlemi simüle ediliyor', credentials);
      return {
        user: {
          id: 'demo123',
          username: credentials.username,
          email: 'demo@example.com'
        },
        token: 'demo_token_123456789'
      };
    }
    
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Giriş yaparken bir hata oluştu');
      }
      
      return data;
    } catch (error) {
      console.error('API hatası:', error);
      throw error;
    }
  }

  /**
   * Kullanıcının watchlist'ini oluştur
   * @param {string} name - Watchlist adı
   * @param {string} token - JWT token
   */
  static async createWatchlist(name, token) {
    // Demo modu aktifse sahte cevap döndür
    if (USE_DEMO_DATA) {
      console.log('Demo mod: Watchlist oluşturma simüle ediliyor', { name, token });
      return {
        id: 'watchlist_demo_123',
        name: name,
        symbols: []
      };
    }
    
    try {
      const response = await fetch(`${API_URL}/users/watchlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Watchlist oluşturulurken bir hata oluştu');
      }
      
      return data;
    } catch (error) {
      console.error('API hatası:', error);
      throw error;
    }
  }
  
  /**
   * Demo hisseleri oluştur
   * @returns {Array} - Demo hisse listesi
   */
  static getDemoStocks() {
    return [
      { symbol: 'BTCUSDT', name: 'Bitcoin', price: 45678.90, change: 2.34 },
      { symbol: 'ETHUSDT', name: 'Ethereum', price: 3156.23, change: 1.23 },
      { symbol: 'XRPUSDT', name: 'Ripple', price: 0.4782, change: -0.45 },
      { symbol: 'DOGEUSDT', name: 'Dogecoin', price: 0.1253, change: 0.87 },
      { symbol: 'ADAUSDT', name: 'Cardano', price: 0.5372, change: -1.23 },
      { symbol: 'BNBUSDT', name: 'Binance Coin', price: 421.56, change: 0.56 },
      { symbol: 'SOLUSDT', name: 'Solana', price: 112.45, change: 3.45 },
      { symbol: 'AVAXUSDT', name: 'Avalanche', price: 28.67, change: -0.23 }
    ];
  }
  
  /**
   * Belirtilen sembol için rastgele mum verileri oluştur
   * @param {string} symbol - Hisse sembolü
   * @param {string} timeframe - Zaman dilimi (1m, 5m, 15m, 1h, vb.)
   * @returns {Array} - Mum verileri
   */
  static generateDemoCandleData(symbol, timeframe) {
    // Özel semboller için başlangıç fiyatı ve dalgalanma seviyesi belirle
    let startPrice = 100;
    let volatility = 1;
    let trend = 0.1; // Pozitif değer yükselen trend, negatif değer düşen trend
    
    if (symbol === 'BTCUSDT') {
      startPrice = 45000;
      volatility = 500;
      trend = 0.2;
    } else if (symbol === 'ETHUSDT') {
      startPrice = 3000;
      volatility = 100;
      trend = 0.15;
    } else if (symbol === 'AAPL') {
      startPrice = 190;
      volatility = 2;
      trend = 0.05;
    } else if (symbol === 'NASDAQ') {
      startPrice = 20000;
      volatility = 50;
      trend = 0.1;
    }
    
    // Zaman dilimine göre veri noktası sayısını belirle
    let dataPoints = 200;
    let timeIncrement = 24 * 60 * 60; // 1 gün (saniye cinsinden)
    
    switch (timeframe) {
      case '1m':
        dataPoints = 60;
        timeIncrement = 60; // 1 dakika
        break;
      case '5m':
        dataPoints = 60;
        timeIncrement = 5 * 60; // 5 dakika
        break;
      case '15m':
        dataPoints = 60;
        timeIncrement = 15 * 60; // 15 dakika
        break;
      case '1h':
        dataPoints = 60;
        timeIncrement = 60 * 60; // 1 saat
        break;
      case '4h':
        dataPoints = 60;
        timeIncrement = 4 * 60 * 60; // 4 saat
        break;
      case '1d':
        dataPoints = 90;
        timeIncrement = 24 * 60 * 60; // 1 gün
        break;
      case '1w':
        dataPoints = 52;
        timeIncrement = 7 * 24 * 60 * 60; // 1 hafta
        break;
    }
    
    // Şimdiki zaman
    const now = new Date();
    
    // Verileri oluştur
    const data = [];
    
    for (let i = 0; i < dataPoints; i++) {
      // Zaman
      const time = Math.floor(now.getTime() / 1000) - (dataPoints - i) * timeIncrement;
      
      // Rastgele değerler oluştur
      const open = startPrice + Math.random() * volatility * trend;
      const close = open + Math.random() * volatility * 0.5;
      const high = Math.max(open, close) + Math.random() * volatility * 0.3;
      const low = Math.min(open, close) - Math.random() * volatility * 0.3;
      const volume = 10000 + Math.random() * 50000;
      
      data.push({
        time,
        open,
        high,
        low,
        close,
        volume
      });
    }
    
    return data;
  }

  /**
   * Real-time veri güncellemelerini al
   * @param {string} symbol - Hisse sembolü
   * @param {function} callback - Güncellemeleri işleyecek callback fonksiyonu
   * @returns {Object} - Bağlantıyı kapatmak için kullanılacak nesne
   */
  static subscribeToRealTimeData(symbol, callback) {
    // Demo modu aktifse sahte veri akışı oluştur
    if (USE_DEMO_DATA) {
      console.log(`Demo mod: ${symbol} için gerçek zamanlı veri akışı başlatılıyor`);
      
      // Demo websocket bağlantısı
      const lastCandle = ApiService.generateDemoCandleData(symbol, '1m').pop();
      let lastPrice = lastCandle ? lastCandle.close : 45000;
      
      // Her 3 saniyede bir yeni fiyat güncelleme
      const interval = setInterval(() => {
        // Fiyat değişimi (küçük dalgalanmalar)
        const priceChange = lastPrice * (0.0005 * (Math.random() - 0.5));
        lastPrice += priceChange;
        
        // Yüksek ve düşük değerler
        const high = lastPrice + lastPrice * 0.0001 * Math.random();
        const low = lastPrice - lastPrice * 0.0001 * Math.random();
        
        // Volume (işlem hacmi)
        const volume = 100 + Math.random() * 500;
        
        // Veri paketi
        const updateData = {
          symbol,
          price: lastPrice,
          high,
          low,
          volume,
          timestamp: Date.now()
        };
        
        // Callback'i çağır
        callback(updateData);
      }, 3000);
      
      // Bağlantıyı sonlandırmak için
      return {
        unsubscribe: () => {
          clearInterval(interval);
          console.log(`Demo mod: ${symbol} için gerçek zamanlı veri akışı durduruldu`);
        }
      };
    }
    
    try {
      // WebSocket bağlantısı kur (gerçek API ile)
      const ws = new WebSocket(`ws://localhost:3000/ws/market-data/${symbol}`);
      
      ws.onopen = () => {
        console.log(`WebSocket bağlantısı kuruldu: ${symbol}`);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          callback(data);
        } catch (err) {
          console.error('WebSocket verisi işlenirken hata:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket hatası:', error);
      };
      
      ws.onclose = () => {
        console.log(`WebSocket bağlantısı kapatıldı: ${symbol}`);
      };
      
      // Bağlantıyı sonlandırmak için
      return {
        unsubscribe: () => {
          ws.close();
        }
      };
    } catch (error) {
      console.error('WebSocket bağlantısı kurulamadı:', error);
      return { unsubscribe: () => {} };
    }
  }

  /**
   * Piyasa haberlerini getir
   * @param {string} symbol - İsteğe bağlı olarak belirli bir sembol için haberler
   * @returns {Array} - Haberler listesi
   */
  static async getMarketNews(symbol = null) {
    // Demo modu aktifse sahte haberler döndür
    if (USE_DEMO_DATA) {
      return ApiService.generateDemoNews(symbol);
    }
    
    try {
      const url = symbol 
        ? `${API_URL}/market-data/news?symbol=${symbol}`
        : `${API_URL}/market-data/news`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Haberler alınırken bir hata oluştu');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API hatası:', error);
      // Hata durumunda demo haberler göster
      return ApiService.generateDemoNews(symbol);
    }
  }
  
  /**
   * Demo haberler oluştur
   * @param {string} symbol - İsteğe bağlı olarak belirli bir sembol için haberler
   * @returns {Array} - Haberler listesi
   */
  static generateDemoNews(symbol = null) {
    const allNews = [
      {
        id: 1,
        title: 'Bitcoin 50,000 Doları Aştı',
        summary: 'Bitcoin, son yükselişle birlikte 50,000 dolar seviyesini geçti.',
        source: 'CryptoNews',
        url: '#',
        publishedAt: '2023-06-15T10:30:00Z',
        relatedSymbols: ['BTCUSDT']
      },
      {
        id: 2,
        title: 'Ethereum 2.0 Güncellemesi Ertelendi',
        summary: 'Ethereum geliştiricileri, beklenen 2.0 güncellemesinin tarihini erteledi.',
        source: 'ETH Daily',
        url: '#',
        publishedAt: '2023-06-14T08:45:00Z',
        relatedSymbols: ['ETHUSDT']
      },
      {
        id: 3,
        title: 'Ripple Davası Sonuçlandı',
        summary: 'SEC ile Ripple arasındaki dava sonuçlandı, XRP fiyatında hareketlilik bekleniyor.',
        source: 'Crypto Insider',
        url: '#',
        publishedAt: '2023-06-13T14:20:00Z',
        relatedSymbols: ['XRPUSDT']
      },
      {
        id: 4,
        title: 'Binance Yeni Hizmetlerini Duyurdu',
        summary: 'Binance, kullanıcılarına sunduğu yeni hizmetleri ve ürünleri duyurdu.',
        source: 'Binance Blog',
        url: '#',
        publishedAt: '2023-06-12T11:10:00Z',
        relatedSymbols: ['BNBUSDT']
      },
      {
        id: 5,
        title: 'Cardano Ekosistemi Büyümeye Devam Ediyor',
        summary: 'Cardano üzerinde geliştirilen projelerin sayısı artmaya devam ediyor.',
        source: 'ADA News',
        url: '#',
        publishedAt: '2023-06-11T09:30:00Z',
        relatedSymbols: ['ADAUSDT']
      },
      {
        id: 6,
        title: 'Kripto Para Piyasası Yeşile Döndü',
        summary: 'Son düzeltmeden sonra kripto para piyasası tekrar yükselişe geçti.',
        source: 'Market Watch',
        url: '#',
        publishedAt: '2023-06-10T16:40:00Z',
        relatedSymbols: []
      },
      {
        id: 7,
        title: 'Dogecoin 0.15 Dolar Direncini Test Ediyor',
        summary: 'Dogecoin, son rallisiyle birlikte 0.15 dolar direncini test etmeye başladı.',
        source: 'Doge Daily',
        url: '#',
        publishedAt: '2023-06-09T13:25:00Z',
        relatedSymbols: ['DOGEUSDT']
      },
      {
        id: 8,
        title: 'Solana Ağında Rekor İşlem Sayısı',
        summary: 'Solana ağı, dün rekor sayıda işlemi başarıyla işledi.',
        source: 'SOL News',
        url: '#',
        publishedAt: '2023-06-08T10:15:00Z',
        relatedSymbols: ['SOLUSDT']
      }
    ];
    
    // Belirli bir sembol için filtreleme
    if (symbol) {
      return allNews.filter(news => 
        news.relatedSymbols.length === 0 || 
        news.relatedSymbols.includes(symbol)
      );
    }
    
    return allNews;
  }
}

// Global olarak kullanılabilir
window.ApiService = ApiService; 
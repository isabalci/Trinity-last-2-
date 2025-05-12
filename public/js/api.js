/**
 * API Servisi
 * Backend ile iletişim kurmak için kullanılan fonksiyonlar
 */

const API_URL = 'http://localhost:3000/api';

class ApiService {
  /**
   * Tüm hisse senetlerini getir
   */
  static async getAllStocks() {
    try {
      const response = await fetch(`${API_URL}/market-data/stocks`);
      
      if (!response.ok) {
        throw new Error('Hisseler alınırken bir hata oluştu');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API hatası:', error);
      return [];
    }
  }

  /**
   * Belirli bir sembolün mum verilerini getir
   * @param {string} symbol - Hisse sembolü
   * @param {string} timeframe - Zaman dilimi (1m, 5m, 15m, 1h, vb.)
   */
  static async getCandleData(symbol, timeframe = '1d') {
    try {
      const response = await fetch(`${API_URL}/market-data/candles/${symbol}?timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error('Mum verileri alınırken bir hata oluştu');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API hatası:', error);
      return [];
    }
  }

  /**
   * Kullanıcı kaydı yap
   * @param {Object} userData - Kullanıcı bilgileri
   */
  static async register(userData) {
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
}

// Global olarak kullanılabilir
window.ApiService = ApiService; 
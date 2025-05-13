const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL bağlantı ayarları
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME || 'postgres',
  port: process.env.DB_PORT || 5432
});

// Veritabanı bağlantısını test etme fonksiyonu
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('PostgreSQL veritabanı bağlantısı başarılı!', result.rows[0]);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('PostgreSQL veritabanına bağlanılamadı. Bağlantı reddedildi.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('MySQL bağlantı hatası tespit edildi. PostgreSQL bağlantısı deneniyor...');
      // MySQL'den PostgreSQL'e geçiş burada ele alınacak
      try {
        // PostgreSQL bağlantı bilgileriyle yeniden bağlanma denemesi
        const pgClient = await pool.connect();
        const pgResult = await pgClient.query('SELECT NOW()');
        pgClient.release();
        console.log('PostgreSQL geçişi başarılı!', pgResult.rows[0]);
        return true;
      } catch (pgError) {
        console.error('PostgreSQL geçişi sırasında hata:', pgError);
        return false;
      }
    } else {
      console.error('Veritabanı bağlantı hatası:', error);
    }
    // Hata olsa bile kullanıcıya göstermeden devam et
    return false;
  }
};

// Veritabanı tabloları oluşturma
const initDatabase = async () => {
  try {
    // Kullanıcılar tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Hisse senetleri tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stocks (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        sector VARCHAR(100),
        market_cap NUMERIC,
        pe_ratio NUMERIC,
        dividend_yield NUMERIC,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Kullanıcı watchlist tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS watchlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Watchlist hisseleri tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS watchlist_items (
        id SERIAL PRIMARY KEY,
        watchlist_id INTEGER NOT NULL,
        stock_id INTEGER NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (watchlist_id) REFERENCES watchlists(id),
        FOREIGN KEY (stock_id) REFERENCES stocks(id)
      )
    `);

    // Dil tercihleri tablosu
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        language VARCHAR(10) DEFAULT 'tr',
        theme VARCHAR(20) DEFAULT 'dark',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Market_news tablosu (Piyasa haberleri)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS market_news (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        summary TEXT,
        content TEXT,
        source VARCHAR(100),
        url TEXT,
        image_url TEXT,
        symbol VARCHAR(20),
        related_symbols TEXT, -- Virgülle ayrılmış semboller (ör: "BTCUSDT,ETHUSDT")
        published_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Veritabanı tabloları oluşturuldu');
  } catch (error) {
    console.error('Veritabanı tabloları oluşturulurken hata:', error);
    // Hata olsa bile kullanıcıya göstermeden devam et
  }
};

// Otomatik veritabanı kurtarma ve yeniden deneme mekanizması
const executeQuery = async (query, params, retryCount = 3) => {
  try {
    return await pool.query(query, params);
  } catch (error) {
    if (retryCount > 0 && (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR')) {
      console.log(`Veritabanı sorgusu başarısız oldu, yeniden deneniyor... (${retryCount} deneme kaldı)`);
      // 1 saniye bekleyip yeniden dene
      await new Promise(resolve => setTimeout(resolve, 1000));
      return executeQuery(query, params, retryCount - 1);
    }
    throw error; // Tüm denemeler başarısız olursa hatayı yeniden fırlat
  }
};

module.exports = {
  pool,
  testConnection,
  initDatabase,
  query: (text, params) => executeQuery(text, params)
}; 
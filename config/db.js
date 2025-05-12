const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL bağlantı ayarları
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME || 'tradingview_clone',
  port: process.env.DB_PORT || 5432
});

// Veritabanı bağlantısını test etme fonksiyonu
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Veritabanı bağlantısı başarılı!', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
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
        last_price DECIMAL(10, 2),
        change_percent DECIMAL(5, 2),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    console.log('Veritabanı tabloları oluşturuldu');
  } catch (error) {
    console.error('Veritabanı tabloları oluşturulurken hata:', error);
    // Hata olsa bile kullanıcıya göstermeden devam et
  }
};

module.exports = {
  pool,
  testConnection,
  initDatabase,
  query: (text, params) => pool.query(text, params)
}; 
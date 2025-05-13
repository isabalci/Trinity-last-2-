const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Tüm hisseleri getir
router.get('/stocks', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM stocks');
    res.json(result.rows);
  } catch (error) {
    console.error('Hisseler alınırken hata:', error);
    // Hata mesajını kullanıcıya göstermeden genel bir mesaj döndür
    res.status(200).json([]);
  }
});

// Belirli bir hisseyi sembolüne göre getir
router.get('/stocks/:symbol', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM stocks WHERE symbol = $1',
      [req.params.symbol]
    );
    
    if (result.rows.length === 0) {
      // 404 yerine boş bir nesne döndür
      return res.status(200).json({});
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Hisse alınırken hata:', error);
    // Hata mesajını kullanıcıya göstermeden genel bir mesaj döndür
    res.status(200).json({});
  }
});

// Piyasa haberlerini getir
router.get('/news', async (req, res) => {
  try {
    const { symbol } = req.query;
    let query = 'SELECT * FROM market_news ORDER BY published_at DESC LIMIT 100';
    let params = [];
    
    // Eğer sembol belirtilmişse, o sembole ilişkin haberleri filtrele
    if (symbol) {
      query = `
        SELECT * FROM market_news 
        WHERE symbol = $1 OR symbol IS NULL 
        ORDER BY published_at DESC 
        LIMIT 50
      `;
      params = [symbol];
    }

    // Veritabanında news tablosu var mı kontrol et
    const checkResult = await db.query(
      'SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = $1)',
      ['market_news']
    );
    
    // Tablo varsa, verileri getir
    if (checkResult.rows[0].exists) {
      const result = await db.query(query, params);
      
      // Verileri API formatına dönüştür
      const news = result.rows.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        source: item.source,
        url: item.url,
        publishedAt: item.published_at,
        relatedSymbols: item.related_symbols ? item.related_symbols.split(',') : []
      }));
      
      return res.json(news);
    }
    
    // Tablo yoksa demo haberler döndür
    return res.json(generateDemoNews(symbol));
  } catch (error) {
    console.error('Haberler alınırken hata:', error);
    // Hata durumunda demo haberler döndür
    res.status(200).json(generateDemoNews());
  }
});

// Demo haberler üret
function generateDemoNews(symbol = null) {
  const allNews = [
    {
      id: 1,
      title: 'Bitcoin 50,000 Doları Aştı',
      summary: 'Bitcoin, son yükselişle birlikte 50,000 dolar seviyesini geçti. Kripto para piyasasında bu seviye önemli bir psikolojik direnç olarak görülüyordu.',
      source: 'CryptoNews',
      url: '#',
      publishedAt: '2023-06-15T10:30:00Z',
      relatedSymbols: ['BTCUSDT']
    },
    {
      id: 2,
      title: 'Ethereum 2.0 Güncellemesi Ertelendi',
      summary: 'Ethereum geliştiricileri, beklenen 2.0 güncellemesinin tarihini erteledi. Geliştiriciler, güvenlik testlerinin tamamlanması için daha fazla zamana ihtiyaç duyduklarını açıkladı.',
      source: 'ETH Daily',
      url: '#',
      publishedAt: '2023-06-14T08:45:00Z',
      relatedSymbols: ['ETHUSDT']
    },
    {
      id: 3,
      title: 'Ripple Davası Sonuçlandı',
      summary: 'SEC ile Ripple arasındaki dava sonuçlandı, XRP fiyatında hareketlilik bekleniyor. Piyasa uzmanları, davanın sonucunun tüm kripto para piyasasını etkileyebileceğini belirtiyor.',
      source: 'Crypto Insider',
      url: '#',
      publishedAt: '2023-06-13T14:20:00Z',
      relatedSymbols: ['XRPUSDT']
    },
    {
      id: 4,
      title: 'Binance Yeni Hizmetlerini Duyurdu',
      summary: 'Binance, kullanıcılarına sunduğu yeni hizmetleri ve ürünleri duyurdu. Yeni hizmetler arasında DeFi staking ve gelişmiş türev ürünleri bulunuyor.',
      source: 'Binance Blog',
      url: '#',
      publishedAt: '2023-06-12T11:10:00Z',
      relatedSymbols: ['BNBUSDT']
    },
    {
      id: 5,
      title: 'Cardano Ekosistemi Büyümeye Devam Ediyor',
      summary: 'Cardano üzerinde geliştirilen projelerin sayısı artmaya devam ediyor. Ekosistem, DeFi ve NFT projelerinin artmasıyla birlikte genişliyor.',
      source: 'ADA News',
      url: '#',
      publishedAt: '2023-06-11T09:30:00Z',
      relatedSymbols: ['ADAUSDT']
    },
    {
      id: 6,
      title: 'Kripto Para Piyasası Yeşile Döndü',
      summary: 'Son düzeltmeden sonra kripto para piyasası tekrar yükselişe geçti. Piyasa değeri son 24 saatte %5 artış gösterdi.',
      source: 'Market Watch',
      url: '#',
      publishedAt: '2023-06-10T16:40:00Z',
      relatedSymbols: []
    },
    {
      id: 7,
      title: 'Dogecoin 0.15 Dolar Direncini Test Ediyor',
      summary: 'Dogecoin, son rallisiyle birlikte 0.15 dolar direncini test etmeye başladı. Meme coin kategorisindeki bu artış, sosyal medya etkisi ile gerçekleşiyor.',
      source: 'Doge Daily',
      url: '#',
      publishedAt: '2023-06-09T13:25:00Z',
      relatedSymbols: ['DOGEUSDT']
    },
    {
      id: 8,
      title: 'Solana Ağında Rekor İşlem Sayısı',
      summary: 'Solana ağı, dün rekor sayıda işlemi başarıyla işledi. Bu durum, Solana\'nın ölçeklenebilirlik konusundaki başarısını gösteriyor.',
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

// Örnek fiyat verisi getir (gerçek API'niz olmadığında kullanabilirsiniz)
router.get('/candles/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const { timeframe } = req.query;
  
  try {
    // Veritabanında mum verileri var mı kontrol et
    const checkResult = await db.query(
      'SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = $1)',
      ['candle_data']
    );
    
    // Eğer tablo varsa, verileri getir
    if (checkResult.rows[0].exists) {
      const result = await db.query(
        'SELECT * FROM candle_data WHERE symbol = $1 ORDER BY time DESC LIMIT 30',
        [symbol]
      );
      
      if (result.rows.length > 0) {
        return res.json(result.rows);
      }
    }
    
    // Veritabanında veri yoksa örnek veri oluştur
    const now = new Date();
    const candles = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Rastgele fiyat verileri
      const open = 100 + Math.random() * 50;
      const close = open + (Math.random() * 10 - 5);
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      const volume = Math.floor(Math.random() * 10000) + 1000;
      
      candles.push({
        time: Math.floor(date.getTime() / 1000),
        open,
        high,
        low,
        close,
        volume
      });
    }
    
    res.json(candles);
  } catch (error) {
    console.error('Mum verileri alınırken hata:', error);
    // Hata durumunda boş dizi döndür
    res.status(200).json([]);
  }
});

module.exports = router; 
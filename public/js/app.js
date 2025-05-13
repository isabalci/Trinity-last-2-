/**
 * Ana Uygulama
 * Uygulamanın başlatılması ve UI event'lerinin yönetimi
 */

document.addEventListener('DOMContentLoaded', function() {
  // Chart Manager'ı başlat
  const chartManager = new ChartManager();
  
  // Auth managment
  let currentUser = null;
  let authToken = localStorage.getItem('authToken');
  
  // UI elementleri
  const loginBtn = document.getElementById('loginBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const loginModal = document.getElementById('loginModal');
  const settingsModal = document.getElementById('settingsModal');
  const loginForm = document.getElementById('loginForm');
  const closeButtons = document.querySelectorAll('.close');
  const timeframeButtons = document.querySelectorAll('.timeframe');
  const watchlistEl = document.getElementById('watchlist');
  const languageSelector = document.getElementById('languageSelector');
  
  // Market Summary Elementleri
  const marketIndices = document.querySelectorAll('.market-index');
  const indexTabs = document.querySelectorAll('.index-tab');
  const featuredChartEl = document.getElementById('featuredChart');
  const timeButtons = document.querySelectorAll('.time-btn');
  const selectedIndexName = document.getElementById('selectedIndexName');
  const selectedIndexPrice = document.getElementById('selectedIndexPrice');
  const selectedIndexChange = document.getElementById('selectedIndexChange');
  
  // Featured Chart için Chart Manager
  const featuredChartManager = new ChartManager();
  
  // Aktif indeks ve timeframe
  let activeIndex = 'sp500';
  let activeTimeframe = '1D';
  
  // Grafikleri Yükle
  initializeCharts();
  
  // Event Listeners
  addEventListeners();
  
  /**
   * Grafiklerin Başlatılması
   */
  function initializeCharts() {
    // Ana grafik
    chartManager.initializeChart();
    
    // Featured indeks grafiği
    if (featuredChartEl) {
      loadFeaturedChart(activeIndex, activeTimeframe);
    }
  }
  
  /**
   * Featured Grafik Yükleme
   * @param {string} indexId - Yüklenecek indeks ID'si
   * @param {string} timeframe - Zaman aralığı
   */
  function loadFeaturedChart(indexId, timeframe) {
    // Yükleniyor göstergesi eklenebilir
    featuredChartEl.innerHTML = '<div class="loading-spinner"></div>';
    
    // Simüle edilmiş veri oluştur (gerçek bir API çağrısı olmalı)
    createIndexChartData(indexId, timeframe)
      .then(data => {
        // Chart oluştur
        featuredChartManager.createChart(featuredChartEl, {
          height: featuredChartEl.clientHeight,
          width: featuredChartEl.clientWidth,
          layout: {
            background: { color: '#1e222d' },
            textColor: '#e0e3eb',
          },
          grid: {
            vertLines: { color: '#2a2e3955' },
            horzLines: { color: '#2a2e3955' },
          },
          timeScale: {
            timeVisible: timeframe === '1D',
            secondsVisible: false,
          },
        });
        
        // Veriyi ekle
        featuredChartManager.addAreaSeries('index', data, {
          lineColor: '#2962FF',
          topColor: 'rgba(41, 98, 255, 0.3)',
          bottomColor: 'rgba(41, 98, 255, 0.05)',
        });
        
        // Aktif indeks bilgilerini güncelle
        updateIndexInfo(indexId);
      })
      .catch(error => {
        console.error('Grafik yüklenirken hata oluştu:', error);
        featuredChartEl.innerHTML = 'Grafik yüklenirken bir sorun oluştu.';
      });
  }
  
  /**
   * Simüle Edilmiş İndeks Grafiği Verileri Oluştur
   * @param {string} indexId - İndeks ID
   * @param {string} timeframe - Zaman aralığı
   * @returns {Promise} - Grafik verisi
   */
  function createIndexChartData(indexId, timeframe) {
    return new Promise((resolve) => {
      const data = [];
      let baseValue;
      let volatility;
      let time = new Date();
      time.setUTCHours(0, 0, 0, 0);
      
      // İndeks bazında farklı başlangıç değerleri ve volatilite
      switch(indexId) {
        case 'sp500':
          baseValue = 5844;
          volatility = 0.5;
          break;
        case 'nasdaq':
          baseValue = 20868;
          volatility = 0.8;
          break;
        case 'dow':
          baseValue = 42410;
          volatility = 0.4;
          break;
        case 'japan':
          baseValue = 38183;
          volatility = 0.6;
          break;
        case 'ftse':
          baseValue = 8602;
          volatility = 0.3;
          break;
        default:
          baseValue = 5000;
          volatility = 0.5;
      }
      
      // Farklı zaman dilimleri için farklı nokta sayısı ve zaman aralığı
      let dataPoints = 100;
      let timeIncrement = 24 * 60 * 60 * 1000; // 1 gün
      
      switch(timeframe) {
        case '1D':
          dataPoints = 390; // 6.5 saat, dakikada bir
          timeIncrement = 60 * 1000; // 1 dakika
          time = new Date();
          time.setHours(9, 30, 0, 0); // Piyasa açılış
          break;
        case '1M':
          dataPoints = 23; // Yaklaşık 1 ay iş günü
          break;
        case '3M':
          dataPoints = 66; // Yaklaşık 3 ay iş günü
          break;
        case '1Y':
          dataPoints = 253; // Yaklaşık 1 yıl iş günü
          break;
        case '5Y':
          dataPoints = 253 * 5; // Yaklaşık 5 yıl iş günü
          break;
        case 'ALL':
          dataPoints = 253 * 10; // 10 yıl
          break;
      }
      
      // Zaman diliminin ilk noktasına geri git
      time = new Date(time.getTime() - timeIncrement * dataPoints);
      
      // Veri oluştur
      for (let i = 0; i < dataPoints; i++) {
        // Gerçekçi fiyat hareketi simülasyonu
        const change = (Math.random() * 2 - 1) * volatility;
        baseValue = baseValue * (1 + change / 100);
        
        time = new Date(time.getTime() + timeIncrement);
        
        // Haftasonlarını atla
        if (timeframe !== '1D' && (time.getDay() === 0 || time.getDay() === 6)) {
          continue;
        }
        
        // Bu noktayı ekle
        data.push({
          time: time.getTime() / 1000,
          value: baseValue,
        });
      }
      
      setTimeout(() => resolve(data), 300); // Gerçek bir API gecikmesini simüle et
    });
  }
  
  /**
   * İndeks Bilgilerini Güncelle
   * @param {string} indexId - İndeks ID
   */
  function updateIndexInfo(indexId) {
    let name, price, change, changeClass;
    
    // İndeks bazında farklı isim, fiyat ve değişim
    switch(indexId) {
      case 'sp500':
        name = 'S&P 500';
        price = '5,844.20';
        change = '+3.26%';
        changeClass = 'up';
        break;
      case 'nasdaq':
        name = 'Nasdaq 100';
        price = '20,868.15';
        change = '+4.02%';
        changeClass = 'up';
        break;
      case 'dow':
        name = 'Dow 30';
        price = '42,410.11';
        change = '+2.81%';
        changeClass = 'up';
        break;
      case 'japan':
        name = 'Japan 225';
        price = '38,183.04';
        change = '+1.43%';
        changeClass = 'up';
        break;
      case 'ftse':
        name = 'FTSE 100';
        price = '8,602.92';
        change = '-0.02%';
        changeClass = 'down';
        break;
      default:
        name = 'S&P 500';
        price = '5,844.20';
        change = '+3.26%';
        changeClass = 'up';
    }
    
    // DOM'u güncelle
    selectedIndexName.textContent = name;
    selectedIndexPrice.textContent = price;
    selectedIndexChange.textContent = change;
    selectedIndexChange.className = changeClass;
    
    // Aktif indeks butonunu vurgula
    marketIndices.forEach(index => {
      if (index.dataset.index === indexId) {
        index.classList.add('active');
      } else {
        index.classList.remove('active');
      }
    });
  }
  
  /**
   * Event Listener'ları Ekle
   */
  function addEventListeners() {
    // Giriş modal açma
    if (loginBtn) {
      loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'block';
      });
    }
    
    // Ayarlar modal açma
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        settingsModal.style.display = 'block';
      });
    }
    
    // Modal kapatma
    closeButtons.forEach(button => {
      button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        modal.style.display = 'none';
      });
    });
    
    // Dışarı tıklayınca modalları kapat
    window.addEventListener('click', function(e) {
      if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
      }
    });
    
    // Zaman Dilimi Seçimi
    timeframeButtons.forEach(button => {
      button.addEventListener('click', function() {
        timeframeButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        chartManager.changeTimeframe(this.dataset.timeframe);
      });
    });
    
    // Dil Değiştirme
    if (languageSelector) {
      languageSelector.addEventListener('change', function() {
        i18next.changeLanguage(this.value).then(() => {
          updateLanguage();
        });
      });
      
      // Mevcut dili ayarla
      const currentLanguage = i18next.language || 'tr';
      languageSelector.value = currentLanguage;
    }
    
    // Market İndeksleri Tıklama
    marketIndices.forEach(indexEl => {
      indexEl.addEventListener('click', function() {
        activeIndex = this.dataset.index;
        loadFeaturedChart(activeIndex, activeTimeframe);
      });
    });
    
    // İndeks Sekme Tıklama
    indexTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        indexTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      });
    });
    
    // Zaman Butonu Tıklama
    timeButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        timeButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeTimeframe = this.dataset.timeframe;
        loadFeaturedChart(activeIndex, activeTimeframe);
      });
    });
  }
  
  /**
   * Dili Güncelle
   */
  function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = i18next.t(key);
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = i18next.t(key);
    });
  }
  
  // Watchlist ve Piyasa Datası API'den Alımı Burada Olabilir
  
});

/**
 * ChartManager Sınıfı
 * TradingView Lightweight Charts API'si kullanılarak grafik yönetimi
 */
class ChartManager {
  constructor() {
    this.chart = null;
    this.series = {};
    this.timeframe = '1d';
    this.currentSymbol = 'AAPL';
    this.container = null;
  }
  
  /**
   * Grafiği başlat
   * @param {HTMLElement} container - Grafik container elementi
   * @param {Object} options - Chart ayarları
   */
  initializeChart(container = document.getElementById('chart'), options = {}) {
    if (!container) return;
    
    this.container = container;
    
    const defaultOptions = {
      height: container.clientHeight,
      width: container.clientWidth,
      layout: {
        background: { color: '#131722' },
        textColor: '#e0e3eb',
      },
      grid: {
        vertLines: { color: '#2a2e3930' },
        horzLines: { color: '#2a2e3930' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
      },
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: true,
      },
    };
    
    // Özel ayarları birleştir
    const chartOptions = { ...defaultOptions, ...options };
    
    // Mevcut grafik varsa temizle
    if (this.chart) {
      this.chart.remove();
      this.series = {};
    }
    
    // Yeni grafik oluştur
    this.chart = LightweightCharts.createChart(container, chartOptions);
    
    // Responsiveness için resize listener ekle
    this.handleResize();
    
    return this.chart;
  }
  
  /**
   * Yeni Çizim Oluştur (createChart)
   * @param {HTMLElement} container - Grafik container elementi
   * @param {Object} options - Chart ayarları
   */
  createChart(container, options = {}) {
    if (!container) return null;
    
    this.container = container;
    
    // Mevcut grafik varsa temizle
    if (this.chart) {
      this.chart.remove();
      this.series = {};
    }
    
    // Yeni grafik oluştur
    this.chart = LightweightCharts.createChart(container, options);
    
    // Responsive için resize listener ekle
    this.handleResize();
    
    return this.chart;
  }
  
  /**
   * Candlestick Grafik Serisi Ekle
   * @param {string} id - Seri ID'si
   * @param {Array} data - OHLC veri dizisi
   * @param {Object} options - Seri seçenekleri
   */
  addCandlestickSeries(id, data, options = {}) {
    if (!this.chart) return;
    
    const defaultOptions = {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    };
    
    const seriesOptions = { ...defaultOptions, ...options };
    this.series[id] = this.chart.addCandlestickSeries(seriesOptions);
    this.series[id].setData(data);
    
    return this.series[id];
  }
  
  /**
   * Alan Grafik Serisi Ekle
   * @param {string} id - Seri ID'si
   * @param {Array} data - Alan grafik verisi
   * @param {Object} options - Seri seçenekleri
   */
  addAreaSeries(id, data, options = {}) {
    if (!this.chart) return;
    
    const defaultOptions = {
      topColor: 'rgba(38, 166, 154, 0.56)',
      bottomColor: 'rgba(38, 166, 154, 0.04)',
      lineColor: 'rgba(38, 166, 154, 1)',
      lineWidth: 2,
    };
    
    const seriesOptions = { ...defaultOptions, ...options };
    this.series[id] = this.chart.addAreaSeries(seriesOptions);
    this.series[id].setData(data);
    
    return this.series[id];
  }
  
  /**
   * Çizgi Grafik Serisi Ekle
   * @param {string} id - Seri ID'si 
   * @param {Array} data - Çizgi grafik verisi
   * @param {Object} options - Seri seçenekleri
   */
  addLineSeries(id, data, options = {}) {
    if (!this.chart) return;
    
    const defaultOptions = {
      color: '#2962FF',
      lineWidth: 2,
    };
    
    const seriesOptions = { ...defaultOptions, ...options };
    this.series[id] = this.chart.addLineSeries(seriesOptions);
    this.series[id].setData(data);
    
    return this.series[id];
  }
  
  /**
   * Zaman Dilimi Değiştir
   * @param {string} timeframe - Timeframe (1m, 5m, 15m, 1h, 4h, 1d, 1w)
   */
  changeTimeframe(timeframe) {
    this.timeframe = timeframe;
    // Burada API'yi çağırıp yeni timeframe için veri getirilebilir
    // Bu uygulamada sadece simüle edeceğiz
    console.log(`Timeframe changed to ${timeframe}`);
  }
  
  /**
   * Sembol Değiştir
   * @param {string} symbol - Yeni sembol
   */
  changeSymbol(symbol) {
    this.currentSymbol = symbol;
    // Yeni sembol için veri getir
    console.log(`Symbol changed to ${symbol}`);
  }
  
  /**
   * Responsiveness İçin Resize Yönetimi
   */
  handleResize() {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        this.chart.applyOptions({ width, height });
        this.chart.timeScale().fitContent();
      }
    });
    
    resizeObserver.observe(this.container);
  }
  
  /**
   * Gösterge Ekle
   * @param {string} type - Gösterge tipi (ma, rsi, bb)
   * @param {Object} options - Gösterge ayarları
   */
  addIndicator(type, options = {}) {
    // Bu, gösterge eklemek için sadece bir şablondur
    // Gerçek uygulamada daha karmaşık bir mantık gerekebilir
    console.log(`Adding indicator ${type} with options:`, options);
  }
} 
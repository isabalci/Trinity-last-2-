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
  const registerBtn = document.getElementById('registerBtn');
  const loginModal = document.getElementById('loginModal');
  const registerModal = document.getElementById('registerModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const closeButtons = document.querySelectorAll('.close');
  const timeframeButtons = document.querySelectorAll('.timeframe');
  const watchlistEl = document.getElementById('watchlist');
  const watchlistFilter = document.querySelector('.watchlist-filter input');
  const navTabs = document.querySelectorAll('.nav-tab');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const rangeButtons = document.querySelectorAll('.range-btn');
  const toolButtons = document.querySelectorAll('.tool-btn');
  const symbolSearchInput = document.getElementById('symbolSearch');
  
  // Comparison UI Elements
  const addComparisonBtn = document.getElementById('addComparison');
  const comparisonDropdown = document.getElementById('comparisonDropdown');
  const comparisonSearch = document.getElementById('comparisonSearch');
  const comparisonSuggestions = document.getElementById('comparisonSuggestions');
  
  // Export UI Elements
  const exportChartBtn = document.getElementById('exportChart');
  const exportDropdown = document.getElementById('exportDropdown');
  const exportItems = document.querySelectorAll('.export-item');
  
  // Chart Settings Elements
  const settingsChartBtn = document.getElementById('settingsChart');
  const chartSettingsModal = document.getElementById('chartSettingsModal');
  const chartSettingsForm = document.getElementById('chartSettingsForm');
  const resetSettingsBtn = document.getElementById('resetSettings');
  
  // Indicators UI Elements
  const indicatorsBtn = document.getElementById('indicatorsBtn');
  const indicatorsDropdown = document.getElementById('indicatorsDropdown');
  const indicatorItems = document.querySelectorAll('.indicator-item');
  
  // Market News Elements
  const newsContainer = document.getElementById('marketNews');
  const newsTabBtn = document.getElementById('newsTabBtn');
  const loadMoreNewsBtn = document.getElementById('loadMoreNews');
  
  // Market Özeti Elementleri
  const marketCategories = document.querySelectorAll('.market-category');
  const marketScrollBtn = document.querySelector('.market-scroll-btn');
  const timeButtons = document.querySelectorAll('.time-btn');
  const featuredChartEl = document.getElementById('featuredChart');
  
  // Haberler için değişkenler
  let currentNewsPage = 1;
  const newsPerPage = 5;
  let allNews = [];
  
  // Comparison colors
  const comparisonColors = [
    '#2962FF', // Blue
    '#FF6D00', // Orange
    '#2E7D32', // Green
    '#D32F2F', // Red
    '#7B1FA2', // Purple
    '#00796B', // Teal
    '#FFC107', // Amber
    '#607D8B'  // Blue Grey
  ];
  
  // İndikatör renkleri
  const indicatorColors = {
    ma: '#2962FF',
    bb: '#7B1FA2',
    rsi: '#FF6D00',
    macd: '#2E7D32',
    volume: '#607D8B'
  };
  
  // Örnek hisseler (gerçek verilerle değiştirilmelidir)
  const demoStocks = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', price: 45678.90, change: 2.34 },
    { symbol: 'ETHUSDT', name: 'Ethereum', price: 3156.23, change: 1.23 },
    { symbol: 'XRPUSDT', name: 'Ripple', price: 0.4782, change: -0.45 },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', price: 0.1253, change: 0.87 },
    { symbol: 'ADAUSDT', name: 'Cardano', price: 0.5372, change: -1.23 },
    { symbol: 'BNBUSDT', name: 'Binance Coin', price: 421.56, change: 0.56 },
    { symbol: 'SOLUSDT', name: 'Solana', price: 112.45, change: 3.45 },
    { symbol: 'AVAXUSDT', name: 'Avalanche', price: 28.67, change: -0.23 }
  ];

  // Watchlist'i örnek verilerle doldur
  function populateWatchlist(stocks = demoStocks) {
    watchlistEl.innerHTML = '';
    
    stocks.forEach(stock => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="stock-symbol">${stock.symbol}</span>
        <span class="stock-price">
          <span>$${stock.price.toFixed(2)}</span>
          <span class="${stock.change >= 0 ? 'up' : 'down'}">${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%</span>
        </span>
      `;
      
      // İlk sıradaki hisseyi aktif yap
      if (stock.symbol === 'BTCUSDT') {
        li.classList.add('active');
      }
      
      // Hisseye tıklandığında grafiği değiştir
      li.addEventListener('click', function() {
        // Önceki aktif öğeyi temizle
        const activeItem = watchlistEl.querySelector('li.active');
        if (activeItem) {
          activeItem.classList.remove('active');
        }
        
        // Tıklanan öğeyi aktif yap
        li.classList.add('active');
        
        // Grafik sembolünü güncelle
        document.getElementById('chartSymbol').textContent = stock.symbol;
        
        // Sol paneldeki piyasa bilgilerini güncelle
        document.getElementById('currentPrice').textContent = `$${stock.price.toFixed(2)}`;
        document.getElementById('priceChange').textContent = `${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%`;
        document.getElementById('priceChange').className = `value ${stock.change >= 0 ? 'up' : 'down'}`;
        
        // Grafiği değiştir
        chartManager.changeSymbol(stock.symbol);
      });
      
      watchlistEl.appendChild(li);
    });
  }

  // İzleme listesi filtreleme işlevi
  if (watchlistFilter) {
    watchlistFilter.addEventListener('input', function() {
      const searchText = this.value.toUpperCase();
      
      if (searchText === '') {
        populateWatchlist(); // Filtre boşsa tüm listeyi göster
        return;
      }
      
      // Arama kriterine göre hisseleri filtrele
      const filteredStocks = demoStocks.filter(stock => 
        stock.symbol.toUpperCase().includes(searchText) || 
        stock.name.toUpperCase().includes(searchText)
      );
      
      populateWatchlist(filteredStocks);
    });
  }

  // Sembol arama
  if (symbolSearchInput) {
    symbolSearchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const searchText = this.value.toUpperCase();
        
        if (searchText === '') return;
        
        // Sembolü ara
        const foundStock = demoStocks.find(stock => 
          stock.symbol.toUpperCase().includes(searchText) || 
          stock.name.toUpperCase().includes(searchText)
        );
        
        if (foundStock) {
          // İzleme listesinde bulunursa, o sembolü seç
          const listItems = watchlistEl.querySelectorAll('li');
          listItems.forEach(item => {
            if (item.querySelector('.stock-symbol').textContent === foundStock.symbol) {
              item.click();
              // İzleme listesini bu öğeye kaydır
              item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
        }
        
        // Arama kutusunu temizle
        this.value = '';
      }
    });
  }

  // Navigasyon sekmeleri arası geçiş
  navTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Aktif sekmeyi kaldır
      navTabs.forEach(t => t.classList.remove('active'));
      
      // Tıklanan sekmeyi aktif yap
      this.classList.add('active');
    });
  });

  // Kategori butonları arası geçiş
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Aktif kategoriyi kaldır
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      
      // Tıklanan kategoriyi aktif yap
      this.classList.add('active');
    });
  });

  // Zaman aralığı butonları arası geçiş
  rangeButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Aktif zaman aralığını kaldır
      rangeButtons.forEach(btn => btn.classList.remove('active'));
      
      // Tıklanan zaman aralığını aktif yap
      this.classList.add('active');
    });
  });

  // Grafik araçları butonları için işlevsellik
  toolButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Butonun aktif durumunu değiştir
      this.classList.toggle('active');
    });
  });

  // Modal'ları aç/kapat
  function openModal(modal) {
    modal.style.display = 'block';
  }
  
  function closeModal(modal) {
    modal.style.display = 'none';
  }
  
  // Close butonları için event listener'ları ekle
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      closeModal(modal);
    });
  });
  
  // Modalın dışına tıklandığında modalı kapat
  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      closeModal(event.target);
    }
  });
  
  // Login butonu
  loginBtn.addEventListener('click', function() {
    openModal(loginModal);
  });
  
  // Register butonu
  registerBtn.addEventListener('click', function() {
    openModal(registerModal);
  });
  
  // Login formu submit
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
      const response = await ApiService.login({ username, password });
      
      // Token'ı kaydet
      authToken = response.token;
      localStorage.setItem('authToken', authToken);
      
      // Kullanıcı bilgilerini kaydet
      currentUser = response.user;
      
      // UI'ı güncelle
      updateUIForLoggedInUser();
      
      // Modalı kapat
      closeModal(loginModal);
      
      // Formu temizle
      loginForm.reset();
    } catch (error) {
      alert(`Giriş başarısız: ${error.message}`);
    }
  });
  
  // Register formu submit
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
      const response = await ApiService.register({ username, email, password });
      
      // Token'ı kaydet
      authToken = response.token;
      localStorage.setItem('authToken', authToken);
      
      // Kullanıcı bilgilerini kaydet
      currentUser = response.user;
      
      // UI'ı güncelle
      updateUIForLoggedInUser();
      
      // Modalı kapat
      closeModal(registerModal);
      
      // Formu temizle
      registerForm.reset();
    } catch (error) {
      alert(`Kayıt başarısız: ${error.message}`);
    }
  });
  
  // Giriş yapmış kullanıcı için UI güncelleme
  function updateUIForLoggedInUser() {
    if (currentUser) {
      loginBtn.textContent = 'Hesabım';
      registerBtn.textContent = 'Çıkış Yap';
      
      // Event listener'ları güncelle
      loginBtn.removeEventListener('click', loginClickHandler);
      registerBtn.removeEventListener('click', registerClickHandler);
      
      loginBtn.addEventListener('click', accountClickHandler);
      registerBtn.addEventListener('click', logoutClickHandler);
    }
  }
  
  // Timeframe butonları için event listener'lar
  timeframeButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Aktif sınıfını kaldır
      timeframeButtons.forEach(btn => btn.classList.remove('active'));
      
      // Tıklanan butonu aktif yap
      this.classList.add('active');
      
      // Timeframe'i güncelle
      const timeframe = this.getAttribute('data-timeframe');
      chartManager.changeTimeframe(timeframe);
    });
  });

  // Comparison dropdown handling
  if (addComparisonBtn && comparisonDropdown) {
    // Toggle dropdown
    addComparisonBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      comparisonDropdown.classList.toggle('show');
      if (comparisonDropdown.classList.contains('show')) {
        comparisonSearch.focus();
        populateComparisonSuggestions();
      }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!comparisonDropdown.contains(e.target) && e.target !== addComparisonBtn) {
        comparisonDropdown.classList.remove('show');
      }
    });
    
    // Search functionality
    if (comparisonSearch) {
      comparisonSearch.addEventListener('input', function() {
        populateComparisonSuggestions(this.value);
      });
    }
  }
  
  // Populate comparison suggestions
  function populateComparisonSuggestions(searchText = '') {
    if (!comparisonSuggestions) return;
    
    comparisonSuggestions.innerHTML = '';
    
    // Filter stocks based on search
    const filteredStocks = demoStocks.filter(stock => {
      if (stock.symbol === chartManager.symbol) return false; // Don't include current symbol
      if (chartManager.activeComparisons.includes(stock.symbol)) return false; // Don't include already compared symbols
      
      if (searchText) {
        return stock.symbol.toUpperCase().includes(searchText.toUpperCase()) || 
               stock.name.toUpperCase().includes(searchText.toUpperCase());
      }
      return true;
    });
    
    // Limit to top 10 suggestions
    const limitedStocks = filteredStocks.slice(0, 10);
    
    limitedStocks.forEach(stock => {
      const suggestion = document.createElement('div');
      suggestion.className = 'comparison-suggestion';
      
      const symbolInfo = document.createElement('div');
      symbolInfo.innerHTML = `
        <div class="suggestion-symbol">${stock.symbol}</div>
        <div class="suggestion-name">${stock.name}</div>
      `;
      
      suggestion.appendChild(symbolInfo);
      
      suggestion.addEventListener('click', function() {
        // Get next available color
        const colorIndex = chartManager.activeComparisons.length % comparisonColors.length;
        const color = comparisonColors[colorIndex];
        
        // Add comparison to chart
        chartManager.addComparison(stock.symbol, color);
        
        // Close dropdown
        comparisonDropdown.classList.remove('show');
        comparisonSearch.value = '';
      });
      
      comparisonSuggestions.appendChild(suggestion);
    });
    
    // If no suggestions
    if (limitedStocks.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'comparison-no-results';
      noResults.textContent = 'Sonuç bulunamadı';
      comparisonSuggestions.appendChild(noResults);
    }
  }

  // Export dropdown handling
  if (exportChartBtn && exportDropdown) {
    // Toggle dropdown
    exportChartBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      exportDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!exportDropdown.contains(e.target) && e.target !== exportChartBtn) {
        exportDropdown.classList.remove('show');
      }
    });
    
    // Handle export format selection
    exportItems.forEach(item => {
      item.addEventListener('click', function() {
        const format = this.getAttribute('data-format');
        chartManager.downloadChartData(format);
        exportDropdown.classList.remove('show');
      });
    });
  }

  // Chart Settings Modal
  if (settingsChartBtn && chartSettingsModal) {
    // Open settings modal
    settingsChartBtn.addEventListener('click', function() {
      // Load current settings into form
      loadSettingsIntoForm();
      
      // Open modal
      chartSettingsModal.style.display = 'block';
    });
    
    // Close modal when clicking on X
    chartSettingsModal.querySelector('.close').addEventListener('click', function() {
      chartSettingsModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
      if (e.target === chartSettingsModal) {
        chartSettingsModal.style.display = 'none';
      }
    });
    
    // Reset to default settings
    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener('click', function() {
        // Reset settings to defaults
        chartManager.resetSettings();
        
        // Reload settings into form
        loadSettingsIntoForm();
      });
    }
    
    // Form submit
    if (chartSettingsForm) {
      chartSettingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get settings from form
        const newSettings = {
          appearance: {
            backgroundColor: document.getElementById('chartBackground').value,
            gridColor: document.getElementById('gridColor').value,
            textColor: document.getElementById('textColor').value
          },
          candlestick: {
            upColor: document.getElementById('upColor').value,
            downColor: document.getElementById('downColor').value,
            wickVisible: document.getElementById('wickVisible').checked,
            borderVisible: document.getElementById('borderVisible').checked
          },
          volume: {
            visible: document.getElementById('volumeVisible').checked,
            upColor: document.getElementById('volumeUpColor').value,
            downColor: document.getElementById('volumeDownColor').value
          },
          timeScale: {
            timeVisible: document.getElementById('timeVisible').checked,
            timeFormat: document.getElementById('timeFormat').value
          }
        };
        
        // Update chart settings
        chartManager.updateSettings(newSettings);
        
        // Close modal
        chartSettingsModal.style.display = 'none';
      });
    }
  }
  
  // Load chart settings into the form
  function loadSettingsIntoForm() {
    const settings = chartManager.settings;
    
    // Appearance
    document.getElementById('chartBackground').value = settings.appearance.backgroundColor;
    document.getElementById('gridColor').value = settings.appearance.gridColor;
    document.getElementById('textColor').value = settings.appearance.textColor;
    
    // Candlestick
    document.getElementById('upColor').value = settings.candlestick.upColor;
    document.getElementById('downColor').value = settings.candlestick.downColor;
    document.getElementById('wickVisible').checked = settings.candlestick.wickVisible;
    document.getElementById('borderVisible').checked = settings.candlestick.borderVisible;
    
    // Volume
    document.getElementById('volumeVisible').checked = settings.volume.visible;
    document.getElementById('volumeUpColor').value = settings.volume.upColor;
    document.getElementById('volumeDownColor').value = settings.volume.downColor;
    
    // Time Scale
    document.getElementById('timeVisible').checked = settings.timeScale.timeVisible;
    document.getElementById('timeFormat').value = settings.timeScale.timeFormat || 'yyyy-MM-dd';
  }

  // Teknik göstergeler dropdown'ı
  if (indicatorsBtn && indicatorsDropdown) {
    // Toggle dropdown
    indicatorsBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      indicatorsDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!indicatorsDropdown.contains(e.target) && e.target !== indicatorsBtn) {
        indicatorsDropdown.classList.remove('show');
      }
    });
    
    // Indicator seçimleri
    if (indicatorItems) {
      indicatorItems.forEach(item => {
        item.addEventListener('click', function() {
          const type = this.getAttribute('data-type');
          openIndicatorModal(type);
          indicatorsDropdown.classList.remove('show');
        });
      });
    }
  }
  
  /**
   * Gösterge ayar penceresini aç
   * @param {string} type - Gösterge tipi
   */
  function openIndicatorModal(type) {
    // Mevcut modalı kapat
    const existingModal = document.getElementById('indicatorModal');
    if (existingModal) {
      document.body.removeChild(existingModal);
    }
    
    // Modal şablonu
    let modalHTML = `
      <div id="indicatorModal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2>${getIndicatorTitle(type)}</h2>
          <form id="indicatorForm">
            <input type="hidden" name="indicatorType" value="${type}">
    `;
    
    // Gösterge tipine göre form alanlarını ekle
    switch (type) {
      case 'ma':
        modalHTML += `
          <div class="form-group">
            <label>Tip:</label>
            <select name="maType">
              <option value="sma">Basit Hareketli Ortalama (SMA)</option>
              <option value="ema">Üssel Hareketli Ortalama (EMA)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Periyot:</label>
            <input type="number" name="period" value="20" min="1" max="500">
          </div>
        `;
        break;
        
      case 'bb':
        modalHTML += `
          <div class="form-group">
            <label>Periyot:</label>
            <input type="number" name="period" value="20" min="1" max="500">
          </div>
          <div class="form-group">
            <label>Standart Sapma:</label>
            <input type="number" name="stdDev" value="2" min="0.1" max="10" step="0.1">
          </div>
        `;
        break;
        
      case 'rsi':
        modalHTML += `
          <div class="form-group">
            <label>Periyot:</label>
            <input type="number" name="period" value="14" min="1" max="500">
          </div>
        `;
        break;
        
      case 'macd':
        modalHTML += `
          <div class="form-group">
            <label>Hızlı Periyot:</label>
            <input type="number" name="fastPeriod" value="12" min="1" max="500">
          </div>
          <div class="form-group">
            <label>Yavaş Periyot:</label>
            <input type="number" name="slowPeriod" value="26" min="1" max="500">
          </div>
          <div class="form-group">
            <label>Sinyal Periyodu:</label>
            <input type="number" name="signalPeriod" value="9" min="1" max="500">
          </div>
        `;
        break;
        
      case 'volume':
        // Hacim göstergesi için extra parametre gerekmiyor
        break;
    }
    
    // Renk seçimi (volume hariç diğer göstergeler için)
    if (type !== 'volume') {
      modalHTML += `
        <div class="form-group">
          <label>Renk:</label>
          <input type="color" name="color" value="${indicatorColors[type]}">
        </div>
      `;
    }
    
    // Form submit butonu
    modalHTML += `
          <div class="form-actions">
            <button type="submit" class="btn-primary">Ekle</button>
            <button type="button" class="btn-secondary" id="cancelIndicator">İptal</button>
          </div>
        </form>
      </div>
    </div>
    `;
    
    // Modal'ı DOM'a ekle
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    document.body.appendChild(modalDiv.firstChild);
    
    // Modal'ı göster
    const modal = document.getElementById('indicatorModal');
    modal.style.display = 'block';
    
    // Modal'ı kapatma işlevselliği
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancelIndicator');
    
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.removeChild(modal);
    });
    
    cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.removeChild(modal);
    });
    
    // Dışarı tıklanınca kapat
    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
        document.body.removeChild(modal);
      }
    });
    
    // Form gönderildiğinde göstergeyi ekle
    const form = document.getElementById('indicatorForm');
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Form verilerini al
      const formData = new FormData(form);
      const indicatorType = formData.get('indicatorType');
      
      // Gösterge tipine göre parametreleri ayarla
      const options = {};
      
      switch (indicatorType) {
        case 'ma':
          options.maType = formData.get('maType');
          options.period = parseInt(formData.get('period'));
          options.color = formData.get('color');
          break;
          
        case 'bb':
          options.period = parseInt(formData.get('period'));
          options.stdDev = parseFloat(formData.get('stdDev'));
          options.color = formData.get('color');
          break;
          
        case 'rsi':
          options.period = parseInt(formData.get('period'));
          options.color = formData.get('color');
          break;
          
        case 'macd':
          options.fastPeriod = parseInt(formData.get('fastPeriod'));
          options.slowPeriod = parseInt(formData.get('slowPeriod'));
          options.signalPeriod = parseInt(formData.get('signalPeriod'));
          break;
      }
      
      // Göstergeyi grafiğe ekle
      chartManager.addIndicator(indicatorType, options);
      
      // Modalı kapat
      modal.style.display = 'none';
      document.body.removeChild(modal);
    });
  }
  
  /**
   * Gösterge tipine göre başlık döndür
   * @param {string} type - Gösterge tipi
   * @returns {string} - Gösterge başlığı
   */
  function getIndicatorTitle(type) {
    switch (type) {
      case 'ma':
        return 'Hareketli Ortalama (Moving Average)';
      case 'bb':
        return 'Bollinger Bantları (Bollinger Bands)';
      case 'rsi':
        return 'Göreceli Güç Endeksi (RSI)';
      case 'macd':
        return 'MACD (Moving Average Convergence Divergence)';
      case 'volume':
        return 'Hacim (Volume)';
      default:
        return 'Teknik Gösterge';
    }
  }
  
  /**
   * Market haberlerini yükle
   * @param {boolean} refresh - Tüm haberleri yeniden yükle
   */
  async function loadMarketNews(refresh = false) {
    if (refresh) {
      currentNewsPage = 1;
      if (newsContainer) {
        newsContainer.innerHTML = '<div class="loading">Haberler yükleniyor...</div>';
      }
    }
    
    try {
      // Haberleri getir
      if (refresh || allNews.length === 0) {
        // Aktif sembol için haberleri getir
        const symbol = chartManager.symbol;
        allNews = await ApiService.getMarketNews(symbol);
      }
      
      // Haber containerı var mı kontrol et
      if (!newsContainer) return;
      
      // İlk yüklemede loading yazısını temizle
      if (refresh || currentNewsPage === 1) {
        newsContainer.innerHTML = '';
      }
      
      // Sayfaya göre haberleri filtrele
      const startIndex = (currentNewsPage - 1) * newsPerPage;
      const endIndex = startIndex + newsPerPage;
      const pageNews = allNews.slice(startIndex, endIndex);
      
      // Haberler için HTML oluştur
      let newsHTML = '';
      
      pageNews.forEach(news => {
        const date = new Date(news.publishedAt);
        const formattedDate = date.toLocaleDateString('tr-TR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        newsHTML += `
          <div class="news-item">
            <h3 class="news-title">${news.title}</h3>
            <p class="news-summary">${news.summary}</p>
            <div class="news-meta">
              <span class="news-source">${news.source}</span>
              <span class="news-date">${formattedDate}</span>
            </div>
            ${news.url !== '#' ? `<a href="${news.url}" target="_blank" class="news-link">Haberi Oku</a>` : ''}
          </div>
        `;
      });
      
      // Haberleri ekle
      if (refresh || currentNewsPage === 1) {
        newsContainer.innerHTML = newsHTML;
      } else {
        newsContainer.innerHTML += newsHTML;
      }
      
      // Daha fazla haber yükle butonunu güncelle
      if (loadMoreNewsBtn) {
        if (endIndex >= allNews.length) {
          loadMoreNewsBtn.style.display = 'none';
        } else {
          loadMoreNewsBtn.style.display = 'block';
        }
      }
      
    } catch (error) {
      console.error('Haberler yüklenirken hata:', error);
      if (newsContainer) {
        newsContainer.innerHTML = '<div class="error">Haberler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</div>';
      }
    }
  }
  
  // Haber sekmesine tıklandığında haberleri yükle
  if (newsTabBtn) {
    newsTabBtn.addEventListener('click', function() {
      loadMarketNews(true);
    });
  }
  
  // Daha fazla haber butonuna tıklandığında
  if (loadMoreNewsBtn) {
    loadMoreNewsBtn.addEventListener('click', function() {
      currentNewsPage++;
      loadMarketNews(false);
    });
  }

  // Başlangıçta watchlist'i doldur
  populateWatchlist();
  
  // İlk haberleri yükle
  if (newsContainer) {
    loadMarketNews(true);
  }
  
  // API'den hisseleri getir (API hazır olduğunda kullanılabilir)
  async function fetchStocks() {
    try {
      const stocks = await ApiService.getAllStocks();
      
      if (stocks && stocks.length > 0) {
        // Gerçek verilerle watchlist'i doldur
        // populateWatchlist(stocks);
      }
    } catch (error) {
      console.error('Hisseler yüklenirken hata:', error);
    }
  }
  
  // Başlangıçta hisseleri getirmeyi dene
  // fetchStocks();

  // Market kategorileri için etkinlik
  if (marketCategories.length > 0) {
    marketCategories.forEach(category => {
      category.addEventListener('click', function() {
        // Aktif kategoriyi kaldır
        marketCategories.forEach(cat => cat.classList.remove('active'));
        // Tıklanan kategoriyi aktif yap
        this.classList.add('active');
        // Kategori değişince içeriği güncellenebilir
      });
    });
  }
  
  // Market summary kaydırma butonu
  if (marketScrollBtn) {
    marketScrollBtn.addEventListener('click', function() {
      const marketItems = document.querySelector('.market-items');
      marketItems.scrollLeft += 300; // 300px sağa kaydır
    });
  }
  
  // Zaman butonu tıklama olayları
  if (timeButtons.length > 0) {
    timeButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        // Tüm butonları sıfırla
        timeButtons.forEach(b => b.classList.remove('active'));
        // Tıklanan butonu aktif yap
        this.classList.add('active');
        // Grafiği güncelle
        updateFeaturedChart(this.textContent);
      });
    });
  }
  
  // Uygulamayı başlat
  function initApp() {
    // Watchlist'i doldur
    populateWatchlist();
    
    // Ana grafik için ilk sembolü ayarla
    chartManager.initChart('BTCUSDT');
    
    // Market özeti grafik
    if (featuredChartEl) {
      createFeaturedChart();
    }
  }
  
  // Uygulamayı başlat
  initApp();
  
  // Featured Chart oluşturma
  function createFeaturedChart() {
    if (!featuredChartEl) return;
    
    const chart = LightweightCharts.createChart(featuredChartEl, {
      width: featuredChartEl.clientWidth,
      height: featuredChartEl.clientHeight,
      layout: {
        background: { color: '#1e222d' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2e39' },
        horzLines: { color: '#2a2e39' },
      },
      rightPriceScale: {
        borderColor: '#2a2e39',
      },
      timeScale: {
        borderColor: '#2a2e39',
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: {
          color: '#4c525e',
          width: 1,
          style: LightweightCharts.LineStyle.Dotted,
        },
        horzLine: {
          color: '#4c525e',
          width: 1,
          style: LightweightCharts.LineStyle.Dotted,
        }
      },
    });
    
    const areaSeries = chart.addAreaSeries({
      topColor: 'rgba(41, 98, 255, 0.56)',
      bottomColor: 'rgba(41, 98, 255, 0.04)',
      lineColor: 'rgba(41, 98, 255, 1)',
      lineWidth: 2,
    });
    
    const sampleData = generateSampleData();
    areaSeries.setData(sampleData);
    
    // Pencere boyutu değiştiğinde grafiği yeniden boyutlandır
    window.addEventListener('resize', function() {
      chart.resize(featuredChartEl.clientWidth, featuredChartEl.clientHeight);
    });
    
    // Grafiği global değişkene ata
    window.featuredChart = {
      chart: chart,
      areaSeries: areaSeries
    };
  }
  
  // Örnek veri oluşturma
  function generateSampleData() {
    const startTime = Date.UTC(2023, 0, 1, 0, 0, 0, 0) / 1000;
    const points = 500;
    const data = [];
    
    let lastClose = 5000 + Math.random() * 500;
    
    for (let i = 0; i < points; i++) {
      const time = startTime + i * 3600 * 24;
      const open = lastClose + (Math.random() - 0.5) * 30;
      const high = open + Math.random() * 20;
      const low = open - Math.random() * 20;
      const close = (open + high + low) / 3 + (Math.random() - 0.5) * 10;
      
      data.push({
        time: time,
        open: open,
        high: high,
        low: low,
        close: close
      });
      
      lastClose = close;
    }
    
    return data;
  }
  
  // Zaman aralığına göre grafiği güncelleme
  function updateFeaturedChart(timeframe) {
    if (!window.featuredChart) return;
    
    const { chart } = window.featuredChart;
    
    switch(timeframe) {
      case '1D':
        chart.timeScale().setVisibleLogicalRange({ from: 0, to: 24 });
        break;
      case '1M':
        chart.timeScale().setVisibleLogicalRange({ from: 0, to: 30 });
        break;
      case '3M':
        chart.timeScale().setVisibleLogicalRange({ from: 0, to: 90 });
        break;
      case '1Y':
        chart.timeScale().setVisibleLogicalRange({ from: 0, to: 365 });
        break;
      case '5Y':
        chart.timeScale().setVisibleLogicalRange({ from: 0, to: 1825 });
        break;
      case 'Tümü':
        chart.timeScale().fitContent();
        break;
    }
  }
}); 
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
  const watchlistFilter = document.querySelector('.watchlist-filter input');
  const toolButtons = document.querySelectorAll('.tool-btn');
  const symbolSearchInput = document.getElementById('symbolSearch');
  
  // Ana Navigasyon Menüsü
  const navLinks = document.querySelectorAll('.main-nav-menu .nav-link');
  
  // Market watchlist tabs
  const marketCategoryTabs = document.querySelectorAll('.market-category-tabs .market-category');
  
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
    if (!watchlistEl) return;
    
    watchlistEl.innerHTML = '';
    
    stocks.forEach(stock => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="stock-info">
          <span class="stock-symbol">${stock.symbol}</span>
          <span class="stock-name">${stock.name}</span>
        </div>
        <div class="stock-price">
          <span class="price-value">$${stock.price.toFixed(2)}</span>
          <span class="price-change ${stock.change >= 0 ? 'up' : 'down'}">${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%</span>
        </div>
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

  // Ana navigasyon menüsü
  if (navLinks.length > 0) {
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Tüm menü linklerden active sınıfını kaldır
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Tıklanan menü linkine active sınıfı ekle
        this.classList.add('active');
        
        // İlgili sayfa içeriğini göster
        const targetSection = this.getAttribute('href').substring(1);
        
        // Burada farklı sayfa içeriklerini gösterme kodları eklenebilir
        console.log(`${targetSection} sayfası gösteriliyor...`);
        
        // Örneğin, sayfa başlığını değiştirme:
        document.title = `Trinity | ${targetSection.charAt(0).toUpperCase() + targetSection.slice(1)}`;
      });
    });
  }

  // Market kategorileri için tıklama olayı
  if (marketCategoryTabs.length > 0) {
    marketCategoryTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // Aktif sekmeden active sınıfını kaldır
        marketCategoryTabs.forEach(t => t.classList.remove('active'));
        
        // Tıklanan sekmeye active sınıfı ekle
        this.classList.add('active');
        
        // Burada ilgili kategori verilerini yükleme kodları olabilir
      });
    });
  }

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
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      openModal(loginModal);
    });
  }
  
  // Ayarlar butonu
  if (settingsBtn) {
    settingsBtn.addEventListener('click', function() {
      openModal(settingsModal);
    });
  }
  
  // Login formu submit
  if (loginForm) {
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
  }
  
  // Giriş yapmış kullanıcı için UI güncelleme
  function updateUIForLoggedInUser() {
    if (currentUser && loginBtn) {
      loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.username}`;
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
  
  // Uygulama başlangıcı
  function initApp() {
    // Market Summary sayfasını varsayılan olarak göster
    document.getElementById('marketSummary').style.display = 'flex';
    
    // Varsayılan olarak Markets nav linkini active yap
    const summaryLink = document.querySelector('.main-nav-menu .nav-link[href="#summary"]');
    if (summaryLink) {
      summaryLink.classList.add('active');
    }
    
    // İzleme listesini oluştur
    populateWatchlist();
    
    // Grafiği başlat
    chartManager.init('chart', 'BTCUSDT', '1d');
    
    // Event listener'ları ekle
    if (loginBtn) loginBtn.addEventListener('click', () => openModal(loginModal));
    if (settingsBtn) settingsBtn.addEventListener('click', () => openModal(settingsModal));
    
    // Dil değiştirme
    const languageSelector = document.getElementById('languageSelector');
    if (languageSelector) {
      languageSelector.addEventListener('change', function() {
        changeLanguage(this.value);
      });
    }
    
    // Zaman dilimi butonları
    if (timeframeButtons.length > 0) {
      timeframeButtons.forEach(button => {
        button.addEventListener('click', function() {
          timeframeButtons.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          chartManager.changeTimeframe(this.getAttribute('data-timeframe'));
        });
      });
    }
    
    // İndikatör butonları
    if (indicatorsBtn) {
      indicatorsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown(indicatorsDropdown);
      });
    }
    
    // Karşılaştırma butonu
    if (addComparisonBtn) {
      addComparisonBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown(comparisonDropdown);
        if (comparisonSearch) {
          comparisonSearch.focus();
        }
      });
    }
    
    // Export butonu
    if (exportChartBtn) {
      exportChartBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDropdown(exportDropdown);
      });
    }
    
    // Belge tıklamasında açık dropdown'ları kapat
    document.addEventListener('click', function() {
      closeAllDropdowns();
    });
  }
  
  // Uygulamayı başlat
  initApp();
}); 
/**
 * Ana Uygulama
 * Uygulamanın başlatılması ve UI event'lerinin yönetimi
 */

// Global tema değiştirme fonksiyonu
function applyThemeSettings() {
  console.log("applyThemeSettings fonksiyonu çağrıldı");
  const themeSelector = document.getElementById('theme');
  if (themeSelector) {
    const selectedTheme = themeSelector.value;
    console.log('Tema değişikliği uygulanıyor:', selectedTheme);
    
    // Temayı localStorage'a kaydet
    localStorage.setItem('theme', selectedTheme);
    
    // Tema sınıflarını değiştir
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(selectedTheme + '-theme');
    
    // Grafikler güncellenebilir (eğer Chart.js kullanılıyorsa)
    if (window.Chart && window.Chart.instances) {
      const isDark = selectedTheme === 'dark';
      
      // Tema renkleri
      const gridColor = isDark ? 'rgba(42, 46, 57, 0.3)' : 'rgba(170, 175, 190, 0.25)';
      const textColor = isDark ? '#a0a7b4' : '#434651';
      const backgroundColor = isDark ? '#131722' : '#ffffff';
      
      // Her bir grafiği güncelle
      Object.values(window.Chart.instances).forEach(chart => {
        try {
          // Yeni stil değerlerini uygula
          chart.options.scales.x.grid.color = gridColor;
          chart.options.scales.x.ticks.color = textColor;
          chart.options.scales.y.grid.color = gridColor;
          chart.options.scales.y.ticks.color = textColor;
          
          // Chart.js container'ın arkaplan rengini ayarla
          chart.canvas.parentNode.style.backgroundColor = backgroundColor;
          
          // Legend renklerini güncelle
          if (chart.options.plugins && chart.options.plugins.legend) {
            chart.options.plugins.legend.labels.color = textColor;
            // Light mode için legend font kalınlığını arttır
            chart.options.plugins.legend.labels.font = {
              weight: isDark ? 'normal' : 'bold',
              size: isDark ? 12 : 13
            };
            // Marker'ları tamamen kaldır
            chart.options.plugins.legend.labels.boxWidth = 0;
            chart.options.plugins.legend.labels.boxHeight = 0;
          }
          
          // Tooltip renklerini güncelle
          if (chart.options.plugins && chart.options.plugins.tooltip) {
            chart.options.plugins.tooltip.backgroundColor = isDark ? 'rgba(28, 32, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';
            chart.options.plugins.tooltip.titleColor = textColor;
            chart.options.plugins.tooltip.bodyColor = textColor;
            chart.options.plugins.tooltip.borderColor = isDark ? 'rgba(42, 46, 57, 0.3)' : 'rgba(224, 227, 235, 0.9)';
          }
          
          // Grafik dataseti renklerini güncelle
          chart.data.datasets.forEach((dataset, i) => {
            // Ana veri renkleri korunur, ama arka plan rengi değişir
            if (dataset.type === 'line' && dataset.fill) {
              // Dolgu rengini temaya göre ayarla (daha hafif opaklık)
              dataset.backgroundColor = isDark 
                ? dataset.borderColor + '20' // %12 opaklık
                : dataset.borderColor + '10'; // %6 opaklık
            }
          });
          
          // Değişiklikleri uygula
          chart.update();
        } catch (error) {
          console.error('Grafik güncelleme hatası:', error);
        }
      });
      
      console.log('Grafikler tema değişikliğine göre güncellendi');
    }
    
    // Market indekslerinin görünümünü yeni temaya göre güncelle
    document.querySelectorAll('.market-index').forEach(marketIndex => {
      // Aktif indeks varsa, aktif indeksin görünümünü vurgula
      if (marketIndex.classList.contains('active')) {
        const priceUnit = marketIndex.querySelector('.price-unit');
        if (priceUnit) {
          priceUnit.style.opacity = '1';
          priceUnit.style.fontWeight = '500';
        }
      }
      
      // Rozet (badge) elemanını bul ve yenilenmesini sağla
      const badge = marketIndex.querySelector('.badge-circle');
      if (badge) {
        // Tüm CSS yenilenmesi için bir küçük DOM yenileme hilesi
        badge.style.display = 'none';
        setTimeout(() => {
          badge.style.display = 'flex';
          
          // Ekstra ışıltı efekti ekleyelim
          badge.style.transition = 'all 0.3s ease';
          badge.style.transform = 'scale(1.1)';
          
          setTimeout(() => {
            badge.style.transform = 'scale(1)';
          }, 300);
        }, 10);
      }
    });
    
    // Modalı kapat
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
      settingsModal.style.display = 'none';
    }
    
    console.log('Tema başarıyla değiştirildi:', selectedTheme);
  } else {
    console.error('Tema seçici bulunamadı');
  }
}

// Sayfa tamamen yüklendikten sonra çalıştır
window.applyThemeSettings = applyThemeSettings;

document.addEventListener('DOMContentLoaded', function() {
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
  const themeSelector = document.getElementById('theme');
  const rightSidebarToggle = document.querySelector('.sidebar-toggle.right-toggle');
  const rightSidebar = document.querySelector('.right-sidebar');
  const leftSidebarToggle = document.querySelector('.sidebar-toggle.left-toggle');
  const leftSidebar = document.querySelector('.left-sidebar');
  
  // Debug logging for UI elements 
  console.log('DOM Elements:', {
    rightSidebarToggle: rightSidebarToggle,
    rightSidebar: rightSidebar,
    leftSidebarToggle: leftSidebarToggle,
    leftSidebar: leftSidebar
  });
  
  // TEMA AYARLARINI BAŞLAT - düzeltildi ve geliştirildi
  function initializeTheme() {
    // localStorage'dan tema tercihini al (yoksa "dark" varsayılan olarak kullan)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    console.log('Kaydedilmiş tema:', savedTheme);
    
    // Tema sınıflarını temizle ve doğru temayı uygula
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(savedTheme + '-theme');
    console.log('Tema uygulandı:', savedTheme, 'Body sınıfları:', document.body.className);
    
    // Tema seçici varsa, değerini ayarla
    if (themeSelector) {
      themeSelector.value = savedTheme;
      console.log('Tema seçici değeri ayarlandı:', savedTheme);
    } else {
      console.warn('Tema seçici (themeSelector) bulunamadı');
    }
  }
  
  // Sayfa yüklendiğinde temayı başlat
  initializeTheme();
  
  // DIRECT TEST: Force blue arrow to be clickable
  document.addEventListener('keydown', function(e) {
    // Test shortcut: Press Ctrl+Alt+W to toggle watchlist
    if (e.ctrlKey && e.altKey && e.key === 'w') {
      console.log('Keyboard shortcut to toggle watchlist');
      toggleWatchlist();
    }
    
    // Test shortcut: Press Ctrl+Alt+T to toggle theme
    if (e.ctrlKey && e.altKey && e.key === 't') {
      console.log('Keyboard shortcut to toggle theme');
      const newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
      switchTheme(newTheme);
    }
  });
  
  // Make toggle functions global for browser console testing
  window.toggleWatchlist = toggleWatchlist;
  window.switchTheme = switchTheme; // Temayı değiştirme fonksiyonunu tarayıcıdan erişilebilir yap
  window.testLeftToggle = function() {
    if (leftSidebarToggle) {
      leftSidebarToggle.click();
    } else {
      console.error('Left toggle button not found');
    }
  };
  
  // Chart Timeframe Buttons
  const chartTimeButtons = document.querySelectorAll('.chart-time-btn');
  
  // Market Summary Elementleri
  const marketIndices = document.querySelectorAll('.market-index');
  const indexTabs = document.querySelectorAll('.index-tab');
  const featuredChartEl = document.getElementById('featuredChart');
  const timeButtons = document.querySelectorAll('.time-btn');
  const selectedIndexName = document.getElementById('selectedIndexName');
  const selectedIndexPrice = document.getElementById('selectedIndexPrice');
  const selectedIndexChange = document.getElementById('selectedIndexChange');
  
  // Aktif indeks ve timeframe
  let activeIndex = 'sp500';
  let activeTimeframe = '1D';
  
  // Ana grafik ve Nasdaq grafik için timeframe'ler
  let mainChartTimeframe = '1D';
  let nasdaqChartTimeframe = '1D';
  
  // Sayfa ilk yüklendiğinde sidebar ayarları
  initializeSidebars();
  
  // Grafikleri Yükle
  initializeCharts();
  
  // Event Listeners
  addEventListeners();
  
  /**
   * Sidebar'ların başlangıç durumunu ayarla
   */
  function initializeSidebars() {
    console.log('Initializing sidebars');
    
    // Sağ sidebar'ı başlangıçta gizle
    if (rightSidebar) {
      rightSidebar.classList.add('collapsed');
      console.log('Right sidebar initialized as collapsed');
    } else {
      console.error('Right sidebar element not found');
    }
    
    // Sağ sidebar toggle butonu için icon ayarla
    if (rightSidebarToggle) {
      const icon = rightSidebarToggle.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
      }
      
      const toggleText = rightSidebarToggle.querySelector('.toggle-text');
      if (toggleText) {
        toggleText.textContent = 'İzleme Listesi';
      }
      
      console.log('Right sidebar toggle button initialized');
    } else {
      console.error('Right sidebar toggle button not found');
    }
  }
  
  /**
   * Event Listener'ları Ekle
   */
  function addEventListeners() {
    console.log('Event listeners ekleniyor');
    
    // Giriş modal açma
    if (loginBtn) {
      loginBtn.addEventListener('click', function() {
        loginModal.style.display = 'flex';
      });
    }
    
    // Ayarlar modal açma
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function() {
        // Tema seçicinin mevcut değerini güncelle
        if (themeSelector) {
          // Mevcut temayı al (body'deki sınıftan veya localStorage'dan)
          const currentTheme = localStorage.getItem('theme') || 
                            (document.body.classList.contains('light-theme') ? 'light' : 'dark');
          
          // Tema seçicinin değerini ayarla
          themeSelector.value = currentTheme;
          console.log('Mevcut tema değeri (ayarlar açıldığında):', currentTheme);
        }
        
        // Modalı göster
        settingsModal.style.display = 'flex';
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
    
    // Dil Değiştirme
    if (languageSelector) {
      languageSelector.addEventListener('change', function() {
        const lang = this.value;
        i18next.changeLanguage(lang, function() {
          updateLanguage();
        });
      });
      
      // Mevcut dili ayarla
      const currentLanguage = i18next.language || 'tr';
      languageSelector.value = currentLanguage;
    }
    
    // TEMA DEĞİŞTİRME OLAYI
    if (themeSelector) {
      console.log('Tema seçici bulundu, event listener ekleniyor');
      
      // Önceki event listener'ları temizle
      themeSelector.removeEventListener('change', handleThemeChange);
      
      // Yeni event listener ekle
      themeSelector.addEventListener('change', handleThemeChange);
      
      // Mevcut temayı seçicide ayarla
      const currentTheme = localStorage.getItem('theme') || 'dark';
      themeSelector.value = currentTheme;
      console.log('Tema seçici değeri ayarlandı:', themeSelector.value);
    } else {
      console.error('Tema seçici bulunamadı!');
    }
    
    // Market İndeksleri Tıklama
    marketIndices.forEach(indexEl => {
      indexEl.addEventListener('click', function() {
        // Aktif sınıfını kaldır
        marketIndices.forEach(idx => idx.classList.remove('active'));
        
        // Bu öğeyi aktif yap
        this.classList.add('active');
        
        // İndeks ID'sini al ve grafiği güncelle
        activeIndex = this.dataset.index;
        loadFeaturedChart(activeIndex, activeTimeframe);
      });
    });
    
    // Chart Timeframe Buttons
    chartTimeButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        // Mevcut düğmenin veri özelliklerini al
        const chartId = this.getAttribute('data-chart');
        const timeframe = this.getAttribute('data-timeframe');
        
        // İlgili grafik grubundaki diğer düğmelerden aktif sınıfı kaldır
        document.querySelectorAll(`.chart-time-btn[data-chart="${chartId}"]`).forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Tıklanan düğmeye aktif sınıfını ekle
        this.classList.add('active');
        
        // Timeframe değerini güncelle
        if (chartId === 'main') {
          mainChartTimeframe = timeframe;
        } else if (chartId === 'nasdaq') {
          nasdaqChartTimeframe = timeframe;
        } else if (chartId === 'featured') {
          activeTimeframe = timeframe;
        }
        
        // Grafik verilerini yükle
        loadChartData(chartId, timeframe);
      });
    });
    
    // Summary Kategorileri - Summary sayfasındaki kategoriler arasında geçiş yapmak için
    document.querySelectorAll('.summary-category').forEach(button => {
      button.addEventListener('click', function() {
        // Tıklanan kategoriyi al
        const targetSection = this.getAttribute('data-target');
        
        // Tüm kategorilerden aktif sınıfını kaldır
        document.querySelectorAll('.summary-category').forEach(btn => {
          btn.classList.remove('active');
        });
        
        // Tıklanan kategoriye aktif sınıfını ekle
        this.classList.add('active');
        
        // Tüm bölümleri gizle
        document.querySelectorAll('.summary-section').forEach(section => {
          section.style.display = 'none';
        });
        
        // Hedef bölümü göster
        const targetElement = document.querySelector(`.${targetSection}-section`);
        if (targetElement) {
          targetElement.style.display = 'block';
        }
      });
    });
    
    // Directly make the left toggle clickable
    if (leftSidebarToggle) {
      // Remove any existing event listeners (just in case)
      leftSidebarToggle.onclick = null;
      
      // Add a direct onclick handler
      leftSidebarToggle.onclick = function(e) {
        console.log('Left toggle clicked directly');
        toggleWatchlist();
        e.stopPropagation();
      };
    }
    
    // Sağ kenar çubuğu toggle işlemi (sağdaki buton)
    if (rightSidebarToggle && rightSidebar) {
      console.log('Adding click event to right sidebar toggle');
      // Remove any existing event listeners
      rightSidebarToggle.onclick = null;
      
      // Add a direct onclick handler
      rightSidebarToggle.onclick = function(e) {
        console.log('Right sidebar toggle clicked');
        toggleWatchlist();
        e.stopPropagation();
      };
    }
    
    // Sayfa ilk yüklendiğinde graph timeframe butonlarını aktifleştir
    loadChartData('main', mainChartTimeframe);
    loadChartData('nasdaq', nasdaqChartTimeframe);
    loadChartData('featured', activeTimeframe);
    
    // Ayarları Uygula butonuna event listener ekle
    const applySettingsBtn = document.getElementById('applySettings');
    if (applySettingsBtn) {
      applySettingsBtn.addEventListener('click', function() {
        // Tema değişikliğini uygula
        if (themeSelector) {
          const selectedTheme = themeSelector.value;
          switchTheme(selectedTheme);
          console.log('Tema değişikliği uygulandı:', selectedTheme);
        }
        
        // Diğer ayarları uygula (gerekirse)
        
        // Modalı kapat
        settingsModal.style.display = 'none';
      });
    }
  }
  
  // Tema değiştirme event handler'ı
  function handleThemeChange(e) {
    const newTheme = e.target.value;
    console.log('Tema değiştirme tetiklendi:', newTheme);
    switchTheme(newTheme);
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
  
  /**
   * Watchlist'i aç/kapa
   */
  function toggleWatchlist() {
    console.log('Toggling watchlist');
    console.log('Before toggle - rightSidebar collapsed:', rightSidebar.classList.contains('collapsed'));
    
    // Sidebar'ı aç/kapa
    rightSidebar.classList.toggle('collapsed');
    
    console.log('After toggle - rightSidebar collapsed:', rightSidebar.classList.contains('collapsed'));
    
    // Sağ toggle butonunun ikonunu değiştir
    if (rightSidebarToggle) {
      const rightIcon = rightSidebarToggle.querySelector('i');
      if (rightIcon) {
        if (rightSidebar.classList.contains('collapsed')) {
          rightIcon.classList.remove('fa-chevron-right');
          rightIcon.classList.add('fa-chevron-left');
        } else {
          rightIcon.classList.remove('fa-chevron-left');
          rightIcon.classList.add('fa-chevron-right');
        }
      }
      
      const rightToggleText = rightSidebarToggle.querySelector('.toggle-text');
      if (rightToggleText) {
        rightToggleText.textContent = rightSidebar.classList.contains('collapsed') ? 'İzleme Listesi' : 'Gizle';
      }
      
      // Toggle butonunun konumunu güncelle
      if (rightSidebar.classList.contains('collapsed')) {
        rightSidebarToggle.style.right = '0';
      } else {
        rightSidebarToggle.style.right = '280px';  // Sidebar genişliği
      }
    }
    
    // Sol toggle butonunun ikonunu değiştir
    if (leftSidebarToggle) {
      const leftIcon = leftSidebarToggle.querySelector('i');
      if (leftIcon) {
        if (rightSidebar.classList.contains('collapsed')) {
          leftIcon.classList.remove('fa-chevron-left');
          leftIcon.classList.add('fa-chevron-right');
        } else {
          leftIcon.classList.remove('fa-chevron-right');
          leftIcon.classList.add('fa-chevron-left');
        }
      }
    }
  }
  
  /**
   * Tema değiştirme fonksiyonu - Tamamen yeniden düzenlendi
   * @param {string} theme - 'dark' veya 'light'
   */
  function switchTheme(theme) {
    console.log('🔄 Tema değiştiriliyor:', theme);
    
    if (theme !== 'dark' && theme !== 'light') {
      console.error('Geçersiz tema değeri:', theme);
      return;
    }
    
    // Temayı localStorage'a kaydet
    localStorage.setItem('theme', theme);
    console.log('Tema localStorage\'a kaydedildi:', theme);
    
    // Önceki tema sınıflarını kaldır
    document.body.classList.remove('dark-theme');
    document.body.classList.remove('light-theme');
    
    // Yeni tema sınıfını ekle
    document.body.classList.add(theme + '-theme');
    console.log('Body sınıfları güncellendi:', document.body.className);
    
    // Tema seçicinin değerini güncelle (varsa)
    if (themeSelector) {
      themeSelector.value = theme;
      console.log('Tema seçici değeri güncellendi:', themeSelector.value);
    }
    
    // Grafikleri temaya göre güncelle
    updateChartsForTheme(theme);
    
    // DOM'da tema değişikliği için bir olay yayınla (diğer componentlerin dinleyebilmesi için)
    const themeChangeEvent = new CustomEvent('themeChanged', { detail: { theme: theme } });
    document.dispatchEvent(themeChangeEvent);
    
    console.log('✅ Tema başarıyla değiştirildi:', theme);
  }
  
  /**
   * Temaya göre grafikleri güncelle
   * @param {string} theme - 'dark' veya 'light'
   */
  function updateChartsForTheme(theme) {
    // Tüm grafikleri temaya uygun olarak güncelle
    if (window.Chart && window.Chart.instances) {
      const isDark = theme === 'dark';
      
      // Tema renkleri
      const gridColor = isDark ? 'rgba(42, 46, 57, 0.3)' : 'rgba(170, 175, 190, 0.25)';
      const textColor = isDark ? '#a0a7b4' : '#131722'; // Light mode için metni daha koyu yaptım
      const backgroundColor = isDark ? '#131722' : '#ffffff';
      
      Object.values(window.Chart.instances).forEach(chart => {
        try {
          // Yeni stil değerlerini uygula
          chart.options.scales.x.grid.color = gridColor;
          chart.options.scales.x.ticks.color = textColor;
          chart.options.scales.y.grid.color = gridColor;
          chart.options.scales.y.ticks.color = textColor;
          
          // Chart.js container'ın arkaplan rengini ayarla
          chart.canvas.parentNode.style.backgroundColor = backgroundColor;
          
          // Legend renklerini güncelle
          if (chart.options.plugins && chart.options.plugins.legend) {
            chart.options.plugins.legend.labels.color = textColor;
            // Light mode için legend font kalınlığını arttır
            chart.options.plugins.legend.labels.font = {
              weight: isDark ? 'normal' : 'bold',
              size: isDark ? 12 : 13
            };
            // Marker'ları tamamen kaldır
            chart.options.plugins.legend.labels.boxWidth = 0;
            chart.options.plugins.legend.labels.boxHeight = 0;
            
            // Grafik tipine göre özel sembolleri ayarla
            if (chart.canvas.id === 'chart') {
              // Nasdaq grafiği için özel sembol
              chart.options.plugins.legend.labels.generateLabels = function(chart) {
                const originalGenerateLabels = Chart.defaults.plugins.legend.labels.generateLabels;
                const labels = originalGenerateLabels(chart);
                labels[0].text = '$NDX | Nasdaq 100';
                return labels;
              };
            } else if (chart.canvas.id === 'nasdaqChart') {
              // Bitcoin grafiği için özel sembol
              chart.options.plugins.legend.labels.generateLabels = function(chart) {
                const originalGenerateLabels = Chart.defaults.plugins.legend.labels.generateLabels;
                const labels = originalGenerateLabels(chart);
                labels[0].text = '฿ | Bitcoin (BTC)';
                return labels;
              };
            } else if (chart.canvas.id === 'featuredChart') {
              // S&P 500 grafiği için özel sembol
              chart.options.plugins.legend.labels.generateLabels = function(chart) {
                const originalGenerateLabels = Chart.defaults.plugins.legend.labels.generateLabels;
                const labels = originalGenerateLabels(chart);
                labels[0].text = '$SPX | S&P 500';
                return labels;
              };
            }
          }
          
          // Tooltip renklerini güncelle
          if (chart.options.plugins && chart.options.plugins.tooltip) {
            chart.options.plugins.tooltip.backgroundColor = isDark ? 'rgba(28, 32, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';
            chart.options.plugins.tooltip.titleColor = isDark ? textColor : '#131722'; // Light mode için daha koyu
            chart.options.plugins.tooltip.bodyColor = isDark ? textColor : '#131722'; // Light mode için daha koyu
            chart.options.plugins.tooltip.borderColor = isDark ? 'rgba(42, 46, 57, 0.3)' : 'rgba(224, 227, 235, 0.9)';
          }
          
          // Grafik dataseti renklerini güncelle
          chart.data.datasets.forEach((dataset, i) => {
            // Ana veri renkleri korunur, ama arka plan rengi değişir
            if (dataset.type === 'line' && dataset.fill) {
              // Dolgu rengini temaya göre ayarla (daha hafif opaklık)
              dataset.backgroundColor = isDark 
                ? dataset.borderColor + '20' // %12 opaklık
                : dataset.borderColor + '10'; // %6 opaklık
            }
          });
          
          // Değişiklikleri uygula
          chart.update();
        } catch (error) {
          console.error('Grafik güncelleme hatası:', error);
        }
      });
      
      console.log('Grafikler tema değişikliğine göre güncellendi');
    }
  }
  
  /**
   * Grafiklerin Başlatılması
   */
  function initializeCharts() {
    console.log('initializeCharts başlatılıyor...');
    try {
      // Ana grafik (Nasdaq) - Chart.js kullanarak basit bir grafik oluşturalım
      const chartCtx = document.getElementById('chart');
      if (chartCtx) {
        console.log('Ana grafik oluşturuluyor...');
        // Rastgele Nasdaq veri noktaları oluştur
        const labels = [];
        const data = [];
        const now = new Date();
        
        // Son 30 günlük örnek veri oluştur
        for (let i = 30; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString());
          
          // 16000 civarında dalgalanan değerler
          const baseValue = 16000;
          const randomChange = (Math.random() - 0.3) * 200; // Genel olarak artış trendi
          data.push(baseValue + randomChange * (30-i)/3);
        }
        
        // Tema bilgisini al
        const isDark = document.body.classList.contains('dark-theme');
        const legendTextColor = isDark ? '#e0e3eb' : '#131722';
        const legendFontWeight = isDark ? 'normal' : 'bold';
        
        // Grafik oluştur
        new Chart(chartCtx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'NDX | Nasdaq 100',
              data: data,
              borderColor: '#2962FF',
              backgroundColor: 'rgba(41, 98, 255, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                labels: {
                  usePointStyle: false,
                  boxWidth: 0,
                  boxHeight: 0,
                  color: legendTextColor,
                  font: {
                    weight: legendFontWeight,
                    size: isDark ? 12 : 14
                  },
                  generateLabels: function(chart) {
                    const datasets = chart.data.datasets;
                    const originalGenerateLabels = Chart.defaults.plugins.legend.labels.generateLabels;
                    const labels = originalGenerateLabels(chart);
                    
                    // Özel sembol ekle
                    labels[0].text = '$NDX | Nasdaq 100';              
                    return labels;
                  }
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(42, 46, 57, 0.3)'
                },
                ticks: {
                  color: isDark ? '#a0a7b4' : '#131722'
                }
              },
              y: {
                grid: {
                  color: 'rgba(42, 46, 57, 0.3)'
                },
                ticks: {
                  color: isDark ? '#a0a7b4' : '#131722'
                }
              }
            }
          }
        });
        console.log('Ana grafik başarıyla oluşturuldu');
      }
      
      // İkinci grafik (Bitcoin) - Chart.js kullanarak
      const nasdaqChartCtx = document.getElementById('nasdaqChart');
      if (nasdaqChartCtx) {
        console.log('İkinci grafik oluşturuluyor...');
        // Bitcoin örnek veri
        const labels = [];
        const data = [];
        const now = new Date();
        
        // Son 30 günlük veri
        for (let i = 30; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString());
          
          // 45000 civarında Bitcoin değerleri
          const baseValue = 45000;
          const randomChange = (Math.random() - 0.3) * 1500;
          data.push(baseValue + randomChange * (30-i)/5);
        }
        
        // Tema bilgisini al
        const isDark = document.body.classList.contains('dark-theme');
        const legendTextColor = isDark ? '#e0e3eb' : '#131722';
        const legendFontWeight = isDark ? 'normal' : 'bold';
        
        // Grafik oluştur
        new Chart(nasdaqChartCtx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Bitcoin (BTC)',
              data: data,
              borderColor: '#F7931A',
              backgroundColor: 'rgba(247, 147, 26, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                labels: {
                  usePointStyle: false,
                  boxWidth: 0,
                  boxHeight: 0,
                  color: legendTextColor,
                  font: {
                    weight: legendFontWeight,
                    size: isDark ? 12 : 14
                  },
                  generateLabels: function(chart) {
                    const datasets = chart.data.datasets;
                    const originalGenerateLabels = Chart.defaults.plugins.legend.labels.generateLabels;
                    const labels = originalGenerateLabels(chart);
                    
                    // Özel sembol ekle
                    labels[0].text = '฿ | Bitcoin (BTC)';
                    return labels;
                  }
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(42, 46, 57, 0.3)'
                },
                ticks: {
                  color: isDark ? '#a0a7b4' : '#131722'
                }
              },
              y: {
                grid: {
                  color: 'rgba(42, 46, 57, 0.3)'
                },
                ticks: {
                  color: isDark ? '#a0a7b4' : '#131722'
                }
              }
            }
          }
        });
        console.log('İkinci grafik başarıyla oluşturuldu');
      }
      
      // Featured Chart - S&P 500 grafiği
      const featuredChartEl = document.getElementById('featuredChart');
      if (featuredChartEl) {
        console.log('Featured grafik oluşturuluyor...');
        // S&P 500 örnek veri
        const labels = [];
        const data = [];
        const now = new Date();
        
        // Son 30 günlük veri
        for (let i = 30; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString());
          
          // 5800 civarında S&P 500 değerleri
          const baseValue = 5800;
          const randomChange = (Math.random() - 0.2) * 50;
          data.push(baseValue + randomChange * (30-i)/6);
        }
        
        // Tema bilgisini al
        const isDark = document.body.classList.contains('dark-theme');
        const legendTextColor = isDark ? '#e0e3eb' : '#131722';
        const legendFontWeight = isDark ? 'normal' : 'bold';
        
        // Grafik oluştur
        new Chart(featuredChartEl, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'S&P 500',
              data: data,
              borderColor: '#5460E6',
              backgroundColor: 'rgba(84, 96, 230, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                labels: {
                  usePointStyle: false,
                  boxWidth: 0,
                  boxHeight: 0,
                  color: legendTextColor,
                  font: {
                    weight: legendFontWeight,
                    size: isDark ? 12 : 14
                  },
                  generateLabels: function(chart) {
                    const datasets = chart.data.datasets;
                    const originalGenerateLabels = Chart.defaults.plugins.legend.labels.generateLabels;
                    const labels = originalGenerateLabels(chart);
                    
                    // Özel sembol ekle
                    labels[0].text = '$SPX | S&P 500';
                    return labels;
                  }
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(42, 46, 57, 0.3)'
                },
                ticks: {
                  color: isDark ? '#a0a7b4' : '#131722'
                }
              },
              y: {
                grid: {
                  color: 'rgba(42, 46, 57, 0.3)'
                },
                ticks: {
                  color: isDark ? '#a0a7b4' : '#131722'
                }
              }
            }
          }
        });
        console.log('Featured grafik başarıyla oluşturuldu');
      }
      
      // Kategori bölümlerini düzenle ve ilk sekmeyi göster
      const summaryCategories = document.querySelectorAll('.summary-category');
      const summarySections = document.querySelectorAll('.summary-section');
      
      // İlk başta tüm bölümleri gizle
      summarySections.forEach(section => {
        section.style.display = 'none';
      });
      
      // İlk kategoriyi aktif yap ve ilgili bölümü göster
      if (summaryCategories.length > 0 && summarySections.length > 0) {
        const firstCategory = summaryCategories[0];
        const firstTarget = firstCategory.getAttribute('data-target');
        
        firstCategory.classList.add('active');
        
        const targetSection = document.querySelector(`.${firstTarget}-section`);
        if (targetSection) {
          targetSection.style.display = 'block';
        }
      }
      
      console.log('initializeCharts tamamlandı.');
    } catch (error) {
      console.error('Grafik başlatma hatası:', error);
    }
  }
  
  /**
   * Featured Grafik Yükleme
   * @param {string} indexId - Yüklenecek indeks ID'si
   * @param {string} timeframe - Zaman aralığı
   */
  function loadFeaturedChart(indexId, timeframe) {
    console.log(`loadFeaturedChart çağrıldı: indexId=${indexId}, timeframe=${timeframe}`);
    
    // Seçilen indeks bilgilerini güncelle
    updateIndexInfo(indexId);
    
    // Grafiği güncelle
    loadChartData('featured', timeframe);
  }
  
  /**
   * İndeks Bilgilerini Güncelle
   * @param {string} indexId - İndeks ID
   */
  function updateIndexInfo(indexId) {
    let name, price, change, changeClass, priceUnit;
    
    // İndeks bazında farklı isim, fiyat ve değişim
    switch(indexId) {
      case 'sp500':
        name = 'S&P 500';
        price = '5,844.20';
        change = '+3.26%';
        changeClass = 'up';
        priceUnit = 'USD';
        break;
      case 'nasdaq':
        name = 'Nasdaq 100';
        price = '20,868.15';
        change = '+4.02%';
        changeClass = 'up';
        priceUnit = 'USD';
        break;
      case 'dow':
        name = 'Dow 30';
        price = '42,410.11';
        change = '+2.81%';
        changeClass = 'up';
        priceUnit = 'USD';
        break;
      case 'japan':
        name = 'Japan 225';
        price = '38,183.04';
        change = '+1.43%';
        changeClass = 'up';
        priceUnit = 'JPY';
        break;
      case 'ftse':
        name = 'FTSE 100';
        price = '8,602.92';
        change = '-0.02%';
        changeClass = 'down';
        priceUnit = 'GBP';
        break;
      default:
        name = 'S&P 500';
        price = '5,844.20';
        change = '+3.26%';
        changeClass = 'up';
        priceUnit = 'USD';
    }
    
    // DOM'daki tüm ilgili öğeleri de güncelle
    // 1. Featured chart header
    if (selectedIndexName) selectedIndexName.textContent = name;
    if (selectedIndexPrice) selectedIndexPrice.textContent = price;
    if (selectedIndexChange) {
    selectedIndexChange.textContent = change;
    selectedIndexChange.className = changeClass;
    }
    
    // 2. Toolbar'daki market indekslerini güncelle
    document.querySelectorAll('.market-index').forEach(index => {
      const indexID = index.getAttribute('data-index');
      if (indexID === indexId) {
        index.classList.add('active');
      } else {
        index.classList.remove('active');
      }
      
      // Bu indeks öğesindeki price-unit'i belirginleştir
      if (indexID === indexId) {
        const priceUnitElement = index.querySelector('.price-unit');
        if (priceUnitElement) {
          priceUnitElement.style.opacity = '1';
          priceUnitElement.style.fontWeight = '500';
        }
      } else {
        const priceUnitElement = index.querySelector('.price-unit');
        if (priceUnitElement) {
          priceUnitElement.style.opacity = '0.9';
          priceUnitElement.style.fontWeight = 'normal';
        }
      }
    });
    
    console.log(`${name} indeksi için bilgiler güncellendi: ${price} ${priceUnit} (${change})`);
  }
  
  /**
   * Grafik verilerini zaman aralığına göre yükle
   * @param {string} chartId - Grafik ID'si
   * @param {string} timeframe - Zaman aralığı
   */
  function loadChartData(chartId, timeframe) {
    console.log(`${chartId} grafiği için ${timeframe} zaman aralığında veri yükleniyor...`);
    
    // Gerçek bir API'den veri yüklenecek
    // Şimdilik örnek veri oluşturalım
    
    // Zaman aralığına göre data nokta sayısını belirle
    let dataPoints;
    let baseDate = new Date();
    let labels = [];
    let data = [];
    let step;
    
    switch(timeframe) {
      case '1D':
        dataPoints = 24; // Saatlik
        step = 60 * 60 * 1000; // 1 saat
        break;
      case '1W':
        dataPoints = 7; // Günlük
        step = 24 * 60 * 60 * 1000; // 1 gün
        break;
      case '1M':
        dataPoints = 30; // Günlük
        step = 24 * 60 * 60 * 1000; // 1 gün
        break;
      case '3M':
        dataPoints = 12; // Haftalık
        step = 7 * 24 * 60 * 60 * 1000; // 1 hafta
        break;
      case '1Y':
        dataPoints = 12; // Aylık
        step = 30 * 24 * 60 * 60 * 1000; // 1 ay (yaklaşık)
        break;
      case 'ALL':
        dataPoints = 10; // Yıllık
        step = 365 * 24 * 60 * 60 * 1000; // 1 yıl
        break;
      default:
        dataPoints = 24; // Varsayılan saatlik
        step = 60 * 60 * 1000;
    }
    
    // Grafik ID'sine göre başlangıç değeri ve trend belirle
    let baseValue, trend, chartColor;
    switch(chartId) {
      case 'main':
        baseValue = 16000;
        trend = 0.3; // Artış trendi
        chartColor = '#2962FF'; // Mavi
        break;
      case 'nasdaq':
        baseValue = 45000;
        trend = 0.25; // Artış trendi
        chartColor = '#F7931A'; // Bitcoin rengi (turuncu)
        break;
      case 'featured':
        baseValue = 5800;
        trend = 0.2; // Artış trendi
        chartColor = '#5460E6'; // Mor
        break;
      default:
        baseValue = 5000;
        trend = 0.2;
        chartColor = '#5460E6';
    }
    
    // Tarih ve veri noktaları oluştur
    for (let i = dataPoints - 1; i >= 0; i--) {
      let date = new Date(baseDate - (i * step));
      
      // Zaman formatını ayarla
      let formattedDate;
      if (timeframe === '1D') {
        formattedDate = date.getHours() + ':00';
      } else if (timeframe === '1W' || timeframe === '1M' || timeframe === '3M') {
        formattedDate = date.toLocaleDateString();
      } else {
        formattedDate = date.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' });
      }
      
      labels.push(formattedDate);
      
      // Uygun değerler oluştur (zaman dilimine göre farklı dalgalanmalar)
      let randomFactor;
      
      // Zaman aralığı arttıkça, değişimi daha fazla yap ve volatiliteyi değiştir
      let volatility, multiplier;
      switch(timeframe) {
        case '1D': 
          volatility = 0.005; 
          multiplier = 0.01;
          randomFactor = Math.random() * 2 - (1 - trend) * 0.8; 
          break;
        case '1W': 
          volatility = 0.01; 
          multiplier = 0.03;
          randomFactor = Math.random() * 2 - (1 - trend) * 0.7; 
          break;
        case '1M': 
          volatility = 0.02; 
          multiplier = 0.08;
          randomFactor = Math.random() * 2 - (1 - trend) * 0.6; 
          break;
        case '3M': 
          volatility = 0.05; 
          multiplier = 0.15;
          randomFactor = Math.random() * 2 - (1 - trend) * 0.5; 
          break;
        case '1Y': 
          volatility = 0.1; 
          multiplier = 0.25;
          randomFactor = Math.random() * 2 - (1 - trend) * 0.4; 
          break;
        case 'ALL': 
          volatility = 0.2; 
          multiplier = 0.6;
          randomFactor = Math.random() * 2 - (1 - trend) * 0.3; 
          break;
        default: 
          volatility = 0.01;
          multiplier = 0.02;
          randomFactor = Math.random() * 2 - (1 - trend);
      }
      
      let value = baseValue * (1 + ((dataPoints - i) / dataPoints * multiplier * trend) + randomFactor * volatility);
      data.push(value);
    }
    
    // Grafik güncelle
    updateChart(chartId, labels, data, chartColor, timeframe);
  }

  /**
   * Grafik verilerini güncelle
   * @param {string} chartId - Grafiğin ID'si
   * @param {Array} labels - Tarih etiketleri
   * @param {Array} data - Veri noktaları
   * @param {string} chartColor - Grafik rengi
   * @param {string} timeframe - Zaman aralığı
   */
  function updateChart(chartId, labels, data, chartColor, timeframe) {
    let chartElement;
    
    switch(chartId) {
      case 'main':
        chartElement = document.getElementById('chart');
        break;
      case 'nasdaq':
        chartElement = document.getElementById('nasdaqChart');
        break;
      case 'featured':
        chartElement = document.getElementById('featuredChart');
        break;
      default:
        console.error('Bilinmeyen grafik ID:', chartId);
        return;
    }
    
    if (!chartElement) {
      console.error('Grafik elementi bulunamadı:', chartId);
      return;
    }
    
    // Chart.js instance'ını bul ve güncelle
    const chartInstance = Chart.getChart(chartElement);
    if (chartInstance) {
      // Grafik tipini belirleme (kısa zaman dilimlerinde çizgi, uzun zaman dilimlerinde alan grafiği)
      let chartType = 'line';
      let tension = 0.4;
      let pointRadius = 0;
      
      // Zaman aralığına göre grafik ayarları
      if (timeframe === '1D' || timeframe === '1W') {
        tension = 0.2;
        pointRadius = 2;
      } else if (timeframe === '1M' || timeframe === '3M') {
        tension = 0.3;
        pointRadius = 1;
      } else {
        tension = 0.4;
        pointRadius = 0;
      }
      
      chartInstance.data.labels = labels;
      chartInstance.data.datasets[0].data = data;
      chartInstance.data.datasets[0].borderColor = chartColor;
      chartInstance.data.datasets[0].backgroundColor = `${chartColor}20`; // %12 opaklık
      chartInstance.data.datasets[0].tension = tension;
      chartInstance.data.datasets[0].pointRadius = pointRadius;
      
      // Grid çizgisi ayarları
      chartInstance.options.scales.x.grid.color = 'rgba(42, 46, 57, 0.2)';
      chartInstance.options.scales.y.grid.color = 'rgba(42, 46, 57, 0.2)';
      
      chartInstance.update();
      console.log(`${chartId} grafiği ${timeframe} zaman aralığında güncellendi`);
    } else {
      console.error('Grafik instance bulunamadı:', chartId);
    }
  }

  /**
   * Mini grafikleri başlat - Hisseler, Kripto ve ETF kartları için
   */
  function initializeMiniCharts() {
    // Mini grafikleri seç
    const miniCharts = document.querySelectorAll('.mini-chart');
    
    // Her mini grafik için
    miniCharts.forEach(chartCanvas => {
      const symbol = chartCanvas.getAttribute('data-symbol');
      if (!symbol) return;
      
      // Rastgele veriler oluştur
      const data = generateRandomData(30);
      
      // Grafik oluştur
      if (chartCanvas.getContext) {
        const ctx = chartCanvas.getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: Array(data.length).fill(''),  // Etiketler boş
            datasets: [{
              data: data,
              borderColor: data[0] <= data[data.length - 1] ? '#26a69a' : '#ef5350',
              borderWidth: 1.5,
              fill: false,
              tension: 0.4,
              pointRadius: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: false
              }
            },
            scales: {
              x: {
                display: false
              },
              y: {
                display: false
              }
            },
            animation: false
          }
        });
      }
    });
    
    // Community Ideas için mini grafikleri de başlat
    const ideaMiniCharts = document.querySelectorAll('.idea-mini-chart');
    
    ideaMiniCharts.forEach(chartCanvas => {
      const symbol = chartCanvas.getAttribute('data-symbol');
      if (!symbol) return;
      
      // Rastgele veriler oluştur
      const data = generateRandomData(30);
      
      // Grafik oluştur
      if (chartCanvas.getContext) {
        const ctx = chartCanvas.getContext('2d');
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: Array(data.length).fill(''),  // Etiketler boş
            datasets: [{
              data: data,
              borderColor: '#2962FF',
              borderWidth: 1.5,
              fill: false,
              tension: 0.4,
              pointRadius: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: false
              }
            },
            scales: {
              x: {
                display: false
              },
              y: {
                display: false
              }
            },
            animation: false
          }
        });
      }
    });
  }

  /**
   * Rastgele veri oluştur
   * @param {number} length - Veri noktalarının sayısı
   * @returns {Array} - Rastgele veri dizisi
   */
  function generateRandomData(length) {
    const data = [];
    let value = Math.random() * 100 + 50;
    
    for (let i = 0; i < length; i++) {
      value += (Math.random() - 0.5) * 10;
      data.push(value);
    }
    
    return data;
  }
}); 
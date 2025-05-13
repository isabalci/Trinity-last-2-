/**
 * Ana Uygulama
 * Uygulamanın başlatılması ve UI event'lerinin yönetimi
 */

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
  
  // Grafikleri Yükle
  initializeCharts();
  
  // Event Listeners
  addEventListeners();
  
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
        
        // Grafik oluştur
        new Chart(chartCtx, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: 'Nasdaq 100',
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
                  color: '#e0e3eb'
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
                  color: '#a0a7b4'
                }
              },
              y: {
                grid: {
                  color: 'rgba(42, 46, 57, 0.3)'
                },
                ticks: {
                  color: '#a0a7b4'
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
                  color: '#e0e3eb'
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
                  color: '#a0a7b4'
                }
              },
              y: {
                grid: {
                  color: 'rgba(42, 46, 57, 0.3)'
                },
                ticks: {
                  color: '#a0a7b4'
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
                  color: '#e0e3eb'
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
                  color: '#a0a7b4'
                }
              },
              y: {
                grid: {
                  color: 'rgba(42, 46, 57, 0.3)'
                },
                ticks: {
                  color: '#a0a7b4'
                }
              }
            }
          }
        });
        console.log('Featured grafik başarıyla oluşturuldu');
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
      loginBtn.addEventListener('click', function() {
        loginModal.style.display = 'flex';
      });
    }
    
    // Ayarlar modal açma
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function() {
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
    
    // Zaman Butonu Tıklama (S&P 500 Grafiği için)
    timeButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        timeButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeTimeframe = this.getAttribute('data-timeframe');
        loadFeaturedChart(activeIndex, activeTimeframe);
      });
    });

    // Göster/gizle tıklamaları için event delegation
    document.body.addEventListener('click', function(e) {
      // Tüm açık dropdown'ları kapat, ancak şimdi tıklanan hariç
      const dropdowns = document.querySelectorAll('.dropdown-menu.show');
      dropdowns.forEach(function(dropdown) {
        if (e.target.closest('.tool-btn') !== dropdown.previousElementSibling) {
          dropdown.classList.remove('show');
        }
      });
      
      // Indicator dropdown toggle
      if (e.target.closest('#indicatorsBtn')) {
        document.getElementById('indicatorsDropdown').classList.toggle('show');
      }
      
      // Comparison dropdown toggle
      if (e.target.closest('#addComparison')) {
        document.getElementById('comparisonDropdown').classList.toggle('show');
      }
      
      // Export dropdown toggle
      if (e.target.closest('#exportChart')) {
        document.getElementById('exportDropdown').classList.toggle('show');
      }
    });

    // Pencere boyutu değişikliklerinde grafikleri yeniden boyutlandır
    window.addEventListener('resize', function() {
      // Grafikleri yeniden oluştur
      if (window.Chart && window.Chart.instances) {
        Object.values(window.Chart.instances).forEach(chart => {
          chart.resize();
        });
      }
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
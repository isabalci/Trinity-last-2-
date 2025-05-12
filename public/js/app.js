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
  
  // Örnek hisseler (gerçek verilerle değiştirilmelidir)
  const demoStocks = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', price: 45678.90, change: 2.34 },
    { symbol: 'ETHUSDT', name: 'Ethereum', price: 3245.67, change: 1.23 },
    { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: -0.45 },
    { symbol: 'MSFT', name: 'Microsoft', price: 345.67, change: 0.87 },
    { symbol: 'GOOGL', name: 'Alphabet', price: 134.56, change: -1.23 },
    { symbol: 'AMZN', name: 'Amazon', price: 145.23, change: 0.56 },
    { symbol: 'TSLA', name: 'Tesla', price: 234.56, change: 3.45 },
    { symbol: 'META', name: 'Meta', price: 345.67, change: -0.23 }
  ];

  // Watchlist'i örnek verilerle doldur
  function populateWatchlist() {
    watchlistEl.innerHTML = '';
    
    demoStocks.forEach(stock => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="stock-symbol">${stock.symbol}</div>
        <div class="stock-price">
          <span>$${stock.price.toFixed(2)}</span>
          <span class="${stock.change >= 0 ? 'up' : 'down'}">${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}%</span>
        </div>
      `;
      
      // Hisseye tıklandığında grafiği değiştir
      li.addEventListener('click', function() {
        chartManager.changeSymbol(stock.symbol);
      });
      
      watchlistEl.appendChild(li);
    });
  }

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

  // Başlangıçta watchlist'i doldur
  populateWatchlist();
  
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
}); 
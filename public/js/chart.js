/**
 * Grafik Modülü
 * TradingView tarzı grafikleri oluşturmak ve yönetmek için fonksiyonlar
 */

class ChartManager {
  constructor(containerId = 'chart') {
    this.container = document.getElementById(containerId);
    this.symbol = 'BTCUSDT';
    this.timeframe = '1d';
    this.chart = null;
    this.candleSeries = null;
    this.volumeSeries = null;
    this.comparisonSeries = {}; // Store comparison series
    this.activeComparisons = []; // Track active comparison symbols
    this.realtimeSubscription = null; // Real-time veri aboneliği
    this.lastCandle = null; // Son mum verisi
    this.indicators = null; // Teknik göstergeler
    
    // Default settings
    this.settings = {
      appearance: {
        backgroundColor: '#131722',
        gridColor: '#1e222d',
        textColor: '#d1d4dc'
      },
      candlestick: {
        upColor: '#26a69a',
        downColor: '#ef5350',
        wickVisible: true,
        borderVisible: false
      },
      volume: {
        visible: true,
        upColor: '#26a69a',
        downColor: '#ef5350'
      },
      timeScale: {
        timeVisible: true,
        timeFormat: 'yyyy-MM-dd'
      },
      realtime: {
        enabled: true, // Gerçek zamanlı güncelleme aktif mi
        updateInterval: 3000 // ms cinsinden güncelleme aralığı
      }
    };
    
    // Load saved settings if available
    this.loadSettings();
    
    this.initChart();
    
    // Teknik göstergeler modülünü başlat
    this.indicators = new TechnicalIndicators(this);
  }

  /**
   * Grafiği oluştur
   */
  initChart() {
    if (!this.container) return;

    // Lightweight Charts'tan ana grafik oluştur
    this.chart = LightweightCharts.createChart(this.container, {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
      layout: {
        background: { color: this.settings.appearance.backgroundColor },
        textColor: this.settings.appearance.textColor,
      },
      grid: {
        vertLines: { color: this.settings.appearance.gridColor },
        horzLines: { color: this.settings.appearance.gridColor },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: this.settings.appearance.gridColor,
      },
      timeScale: {
        borderColor: this.settings.appearance.gridColor,
        timeVisible: this.settings.timeScale.timeVisible,
      },
      watermark: {
        visible: false,  // TradingView logosunu gizle
      },
    });

    // Mum serisi oluştur
    this.candleSeries = this.chart.addCandlestickSeries({
      upColor: this.settings.candlestick.upColor,
      downColor: this.settings.candlestick.downColor,
      borderVisible: this.settings.candlestick.borderVisible,
      wickUpColor: this.settings.candlestick.upColor,
      wickDownColor: this.settings.candlestick.downColor,
      wickVisible: this.settings.candlestick.wickVisible,
    });

    // Hacim serisi oluştur (ayarda visible true ise)
    if (this.settings.volume.visible) {
      this.volumeSeries = this.chart.addHistogramSeries({
        color: this.settings.volume.upColor,
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '', // Ayrı ölçek kullanma
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
    }

    // Pencere boyutu değiştiğinde grafiği yeniden boyutlandır
    window.addEventListener('resize', () => {
      if (this.chart) {
        this.chart.resize(
          this.container.clientWidth,
          this.container.clientHeight
        );
      }
    });

    // TradingView logosunu kaldır
    this.removeTradingViewLogo();

    // İlk verileri yükle
    this.loadChartData();
    
    // Gerçek zamanlı veri aboneliği başlat
    if (this.settings.realtime.enabled) {
      this.subscribeToRealtimeUpdates();
    }
  }

  /**
   * TradingView logosunu DOM'dan kaldır
   */
  removeTradingViewLogo() {
    // Bir miktar gecikmeyle logo elementlerini kaldır (grafiğin yüklenmesi için zaman ver)
    setTimeout(() => {
      // Logo içeren tüm elementleri seç ve kaldır
      const logoElements = document.querySelectorAll('#chart a, #chart .tv-lightweight-charts');
      logoElements.forEach(element => {
        if (element.href && element.href.includes('tradingview.com')) {
          element.style.display = 'none';
        }
      });

      // DOM'da olabilecek tüm TV logo'lu elementleri gizle
      const chartContainer = document.getElementById('chart');
      if (chartContainer) {
        const svgElements = chartContainer.querySelectorAll('svg');
        svgElements.forEach(svg => {
          if (svg.innerHTML.includes('TV')) {
            svg.style.display = 'none';
          }
        });
      }
    }, 100);
  }

  /**
   * Grafik verilerini yükle
   * @param {string} symbol - Hisse sembolü (örn. BTCUSDT)
   * @param {string} timeframe - Zaman dilimi (örn. 1d, 1h)
   */
  async loadChartData(symbol = this.symbol, timeframe = this.timeframe) {
    this.symbol = symbol;
    this.timeframe = timeframe;

    try {
      const candleData = await ApiService.getCandleData(symbol, timeframe);
      
      if (!candleData || candleData.length === 0) {
        console.error('Grafik verisi bulunamadı');
        return;
      }

      // Mum verilerini grafiğe ekle
      this.candleSeries.setData(candleData);
      
      // Son mum verisini kaydet
      this.lastCandle = candleData[candleData.length - 1];

      // Hacim verilerini hazırla ve ekle
      if (this.volumeSeries) {
        const volumeData = candleData.map(candle => ({
          time: candle.time,
          value: candle.volume,
          color: candle.close >= candle.open 
            ? this.settings.volume.upColor 
            : this.settings.volume.downColor,
        }));
        this.volumeSeries.setData(volumeData);
      }

      // Grafik görünümünü ayarla
      this.chart.timeScale().fitContent();

      // Grafik başlığını güncelle
      document.getElementById('chartSymbol').textContent = symbol;

      // Piyasa bilgilerini güncelle
      this.updateMarketInfo(candleData[candleData.length - 1]);
      
      // Logo'yu tekrar kontrol et ve kaldır (veri yüklemesi sonrası)
      this.removeTradingViewLogo();
      
      // Aktif göstergeleri güncelle
      this.updateActiveIndicators();
      
      // Gerçek zamanlı güncelleme aktifse ve abonelik yoksa, yeni abonelik oluştur
      if (this.settings.realtime.enabled && !this.realtimeSubscription) {
        this.subscribeToRealtimeUpdates();
      }
    } catch (error) {
      console.error('Grafik verisi yüklenirken hata:', error);
    }
  }

  /**
   * Piyasa bilgilerini güncelle
   * @param {Object} latestCandle - En son mum verisi
   */
  updateMarketInfo(latestCandle) {
    if (!latestCandle) return;

    // Son fiyat
    const currentPriceEl = document.getElementById('currentPrice');
    if (currentPriceEl) {
      currentPriceEl.textContent = `$${latestCandle.close.toFixed(2)}`;
    }

    // Fiyat değişimi (yüzde)
    const priceChangeEl = document.getElementById('priceChange');
    if (priceChangeEl) {
      const changePercent = ((latestCandle.close - latestCandle.open) / latestCandle.open) * 100;
      const isUp = changePercent >= 0;
      
      priceChangeEl.textContent = `${isUp ? '+' : ''}${changePercent.toFixed(2)}%`;
      priceChangeEl.className = `value ${isUp ? 'up' : 'down'}`;
    }

    // 24 saatlik yüksek
    const high24hEl = document.getElementById('high24h');
    if (high24hEl) {
      high24hEl.textContent = `$${latestCandle.high.toFixed(2)}`;
    }

    // 24 saatlik düşük
    const low24hEl = document.getElementById('low24h');
    if (low24hEl) {
      low24hEl.textContent = `$${latestCandle.low.toFixed(2)}`;
    }

    // Hacim
    const volumeEl = document.getElementById('volume');
    if (volumeEl) {
      const volume = latestCandle.volume;
      let formattedVolume;
      
      if (volume >= 1e9) {
        formattedVolume = `$${(volume / 1e9).toFixed(2)}B`;
      } else if (volume >= 1e6) {
        formattedVolume = `$${(volume / 1e6).toFixed(2)}M`;
      } else if (volume >= 1e3) {
        formattedVolume = `$${(volume / 1e3).toFixed(2)}K`;
      } else {
        formattedVolume = `$${volume.toFixed(2)}`;
      }
      
      volumeEl.textContent = formattedVolume;
    }
  }

  /**
   * Gerçek zamanlı veri güncellemelerine abone ol
   */
  subscribeToRealtimeUpdates() {
    // Önceki abonelik varsa kapat
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
    }
    
    // Ayarlar kapalıysa, abonelik oluşturma
    if (!this.settings.realtime.enabled) {
      return;
    }
    
    // Yeni abonelik oluştur
    this.realtimeSubscription = ApiService.subscribeToRealTimeData(
      this.symbol,
      this.handleRealtimeUpdate.bind(this)
    );
  }
  
  /**
   * Gerçek zamanlı veri güncelleme işleyicisi
   * @param {Object} data - Gerçek zamanlı veri paketi
   */
  handleRealtimeUpdate(data) {
    // Veri paketi doğru formatta değilse veya sembol eşleşmiyorsa
    if (!data || data.symbol !== this.symbol) {
      return;
    }
    
    // Eğer son mum yoksa, güncelleme yapamazsın
    if (!this.lastCandle) {
      return;
    }
    
    // Güncel fiyatı ve hacmi güncelle
    const currentTime = Math.floor(Date.now() / 1000);
    const isNewCandle = this.isNewCandlePeriod(currentTime, this.lastCandle.time);
    
    if (isNewCandle) {
      // Yeni mum oluştur
      const newCandle = {
        time: this.getNewCandleTime(currentTime),
        open: data.price,
        high: data.price,
        low: data.price,
        close: data.price,
        volume: data.volume || 0
      };
      
      // Mum verisini ekle
      this.candleSeries.update(newCandle);
      
      // Hacim verisi ekle
      if (this.volumeSeries) {
        this.volumeSeries.update({
          time: newCandle.time,
          value: newCandle.volume,
          color: this.settings.volume.upColor // Yeni mum olduğunda varsayılan renk
        });
      }
      
      // Son mumu güncelle
      this.lastCandle = newCandle;
    } else {
      // Mevcut mumu güncelle
      const updatedCandle = {
        time: this.lastCandle.time,
        open: this.lastCandle.open,
        high: Math.max(this.lastCandle.high, data.price),
        low: Math.min(this.lastCandle.low, data.price),
        close: data.price,
        volume: (this.lastCandle.volume || 0) + (data.volume || 0)
      };
      
      // Mum verisini güncelle
      this.candleSeries.update(updatedCandle);
      
      // Hacim verisini güncelle
      if (this.volumeSeries) {
        this.volumeSeries.update({
          time: updatedCandle.time,
          value: updatedCandle.volume,
          color: updatedCandle.close >= updatedCandle.open 
            ? this.settings.volume.upColor 
            : this.settings.volume.downColor
        });
      }
      
      // Son mumu güncelle
      this.lastCandle = updatedCandle;
    }
    
    // Piyasa bilgilerini güncelle
    this.updateMarketInfo(this.lastCandle);
    
    // Aktif göstergeleri güncelle
    // Not: Her güncellemede hesaplamak yerine belirli aralıklarla güncelleme yapılabilir
    // bu örnekte basitlik için her güncellemede yapıyoruz
    this.updateActiveIndicators();
  }
  
  /**
   * Verilen zaman yeni bir mum dönemi başlatıyor mu kontrol et
   * @param {number} currentTime - Şimdiki zaman (saniye cinsinden)
   * @param {number} lastCandleTime - Son mumun zamanı (saniye cinsinden)
   * @returns {boolean} - Yeni mum açılmalı mı
   */
  isNewCandlePeriod(currentTime, lastCandleTime) {
    // Zaman dilimlerine göre periyot kontrolü yap
    const period = this.getTimeframePeriodInSeconds();
    
    // Aynı periyot içinde mi kontrol et
    return Math.floor(currentTime / period) > Math.floor(lastCandleTime / period);
  }
  
  /**
   * Şimdiki zamana göre yeni mum zamanını belirle
   * @param {number} currentTime - Şimdiki zaman (saniye cinsinden)
   * @returns {number} - Yeni mumun başlangıç zamanı
   */
  getNewCandleTime(currentTime) {
    const period = this.getTimeframePeriodInSeconds();
    return Math.floor(currentTime / period) * period;
  }
  
  /**
   * Seçili zaman dilimine göre periyodu saniye cinsinden hesapla
   * @returns {number} - Periyot (saniye)
   */
  getTimeframePeriodInSeconds() {
    switch (this.timeframe) {
      case '1m': return 60;
      case '5m': return 60 * 5;
      case '15m': return 60 * 15;
      case '30m': return 60 * 30;
      case '1h': return 60 * 60;
      case '4h': return 60 * 60 * 4;
      case '1d': return 60 * 60 * 24;
      case '1w': return 60 * 60 * 24 * 7;
      case '1M': return 60 * 60 * 24 * 30;
      default: return 60 * 60; // Varsayılan 1 saat
    }
  }
  
  /**
   * Aktif teknik göstergeleri güncelle
   */
  updateActiveIndicators() {
    // Gösterge modülü henüz yüklenmediyse atla
    if (!this.indicators) return;
    
    // Tüm göstergeleri yeniden hesaplayıp güncelle
    // Bu fonksiyon her gerçek zamanlı güncellemede çağrıldığı için
    // performans için optimize edilmelidir (gerektiğinde)
    
    // Bu kısmı daha sonra optimize etmek gerekebilir,
    // şimdilik tüm göstergeleri tekrar hesaplıyoruz
    
    // Aktif göstergeleri al
    const activeIndicators = this.indicators.indicators;
    
    // Her göstergeyi güncelle
    Object.keys(activeIndicators).forEach(indicatorId => {
      const indicator = activeIndicators[indicatorId];
      
      switch (indicator.type) {
        case 'moving-average':
          this.indicators.addMovingAverage(
            indicator.subType,
            indicator.period,
            indicator.series.options().color
          );
          break;
          
        case 'bollinger-bands':
          this.indicators.addBollingerBands(
            indicator.period,
            indicator.stdDev,
            indicator.series[0].options().color
          );
          break;
          
        case 'rsi':
          this.indicators.addRSI(
            indicator.period,
            indicator.series[0].options().color
          );
          break;
          
        case 'macd':
          this.indicators.addMACD(
            indicator.fastPeriod,
            indicator.slowPeriod,
            indicator.signalPeriod
          );
          break;
          
        case 'volume':
          // Hacim zaten otomatik güncelleniyor
          break;
      }
    });
  }
  
  /**
   * Teknik gösterge ekle
   * @param {string} type - Gösterge tipi (ma, bb, rsi, macd, volume)
   * @param {Object} options - Gösterge parametreleri
   * @returns {boolean} - İşlem başarısı
   */
  addIndicator(type, options = {}) {
    if (!this.indicators) return false;
    
    switch (type) {
      case 'ma':
        return this.indicators.addMovingAverage(
          options.maType || 'sma',
          options.period || 20,
          options.color || '#2962FF'
        );
        
      case 'bb':
        return this.indicators.addBollingerBands(
          options.period || 20,
          options.stdDev || 2,
          options.color || '#2962FF'
        );
        
      case 'rsi':
        return this.indicators.addRSI(
          options.period || 14,
          options.color || '#2962FF'
        );
        
      case 'macd':
        return this.indicators.addMACD(
          options.fastPeriod || 12,
          options.slowPeriod || 26,
          options.signalPeriod || 9
        );
        
      case 'volume':
        return this.indicators.addVolume(
          options.upColor || this.settings.volume.upColor,
          options.downColor || this.settings.volume.downColor
        );
        
      default:
        console.error('Bilinmeyen gösterge tipi:', type);
        return false;
    }
  }
  
  /**
   * Teknik gösterge kaldır
   * @param {string} indicatorId - Gösterge ID'si
   * @returns {boolean} - İşlem başarısı
   */
  removeIndicator(indicatorId) {
    if (!this.indicators) return false;
    return this.indicators.removeIndicator(indicatorId);
  }
  
  /**
   * Tüm teknik göstergeleri kaldır
   */
  removeAllIndicators() {
    if (!this.indicators) return;
    this.indicators.removeAllIndicators();
  }

  /**
   * Zaman dilimini değiştir
   * @param {string} timeframe - Yeni zaman dilimi
   */
  changeTimeframe(timeframe) {
    // Gerçek zamanlı aboneliği geçici olarak kaldır
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
    }
    
    this.loadChartData(this.symbol, timeframe);
    
    // Update comparison data if any exist
    this.activeComparisons.forEach(compSymbol => {
      this.updateComparisonData(compSymbol, timeframe);
    });
  }

  /**
   * Sembolü değiştir
   * @param {string} symbol - Yeni sembol
   */
  changeSymbol(symbol) {
    // Gerçek zamanlı aboneliği geçici olarak kaldır
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
    }
    
    // Clear any existing comparisons
    this.clearAllComparisons();
    this.loadChartData(symbol, this.timeframe);
  }
  
  /**
   * Karşılaştırma sembolü ekle
   * @param {string} comparisonSymbol - Karşılaştırılacak sembol
   * @param {string} color - Çizgi rengi
   */
  addComparison(comparisonSymbol, color = '#2962FF') {
    if (comparisonSymbol === this.symbol || 
        this.activeComparisons.includes(comparisonSymbol)) {
      return; // Prevent adding duplicate or same as main symbol
    }
    
    // Add to active comparisons
    this.activeComparisons.push(comparisonSymbol);
    
    // Create a new line series for comparison
    const series = this.chart.addLineSeries({
      color: color,
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
      priceScaleId: 'right',
      title: comparisonSymbol,
    });
    
    this.comparisonSeries[comparisonSymbol] = series;
    
    // Load data for comparison
    this.updateComparisonData(comparisonSymbol, this.timeframe);
    
    // Update comparison legend
    this.updateComparisonLegend();
    
    return true;
  }
  
  /**
   * Karşılaştırma verilerini güncelle
   * @param {string} symbol - Karşılaştırma sembolü
   * @param {string} timeframe - Zaman dilimi
   */
  async updateComparisonData(symbol, timeframe = this.timeframe) {
    try {
      const data = await ApiService.getCandleData(symbol, timeframe);
      
      if (!data || data.length === 0 || !this.comparisonSeries[symbol]) {
        console.error('Karşılaştırma verisi bulunamadı');
        return false;
      }
      
      // Normalize data for comparison (percentage change)
      const baseValue = data[0].close;
      const normalizedData = data.map(candle => ({
        time: candle.time,
        value: (candle.close / baseValue) * 100
      }));
      
      // Update the comparison series
      this.comparisonSeries[symbol].setData(normalizedData);
      
      return true;
    } catch (error) {
      console.error('Karşılaştırma verisi yüklenirken hata:', error);
      return false;
    }
  }
  
  /**
   * Karşılaştırma sembolünü kaldır
   * @param {string} symbol - Kaldırılacak karşılaştırma sembolü
   */
  removeComparison(symbol) {
    if (!this.activeComparisons.includes(symbol)) {
      return false;
    }
    
    // Remove from activeComparisons array
    this.activeComparisons = this.activeComparisons.filter(s => s !== symbol);
    
    // Remove series from chart
    if (this.comparisonSeries[symbol]) {
      this.chart.removeSeries(this.comparisonSeries[symbol]);
      delete this.comparisonSeries[symbol];
    }
    
    // Update comparison legend
    this.updateComparisonLegend();
    
    return true;
  }
  
  /**
   * Tüm karşılaştırmaları temizle
   */
  clearAllComparisons() {
    // Remove all comparison series
    this.activeComparisons.forEach(symbol => {
      if (this.comparisonSeries[symbol]) {
        this.chart.removeSeries(this.comparisonSeries[symbol]);
      }
    });
    
    // Reset tracking arrays
    this.activeComparisons = [];
    this.comparisonSeries = {};
    
    // Update legend
    this.updateComparisonLegend();
  }
  
  /**
   * Karşılaştırma lejantını güncelle
   */
  updateComparisonLegend() {
    const legendEl = document.getElementById('activeComparisons');
    if (!legendEl) return;
    
    legendEl.innerHTML = '';
    
    this.activeComparisons.forEach(symbol => {
      const series = this.comparisonSeries[symbol];
      if (!series) return;
      
      const legendItem = document.createElement('div');
      legendItem.className = 'comparison-item';
      
      const colorBox = document.createElement('span');
      colorBox.className = 'color-box';
      colorBox.style.backgroundColor = series.options().color;
      
      const symbolText = document.createElement('span');
      symbolText.className = 'comparison-symbol';
      symbolText.textContent = symbol;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-comparison';
      removeBtn.innerHTML = '×';
      removeBtn.title = 'Karşılaştırmadan Kaldır';
      removeBtn.addEventListener('click', () => this.removeComparison(symbol));
      
      legendItem.appendChild(colorBox);
      legendItem.appendChild(symbolText);
      legendItem.appendChild(removeBtn);
      
      legendEl.appendChild(legendItem);
    });
  }
  
  /**
   * Grafik verilerini JSON formatında dışa aktar
   * @returns {string} - JSON formatında veri
   */
  exportToJson() {
    try {
      const mainData = {
        symbol: this.symbol,
        timeframe: this.timeframe,
        data: this.candleSeries.data().map(candle => ({
          time: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume
        }))
      };
      
      // Add comparison data if any
      const comparisonData = {};
      this.activeComparisons.forEach(symbol => {
        if (this.comparisonSeries[symbol]) {
          comparisonData[symbol] = this.comparisonSeries[symbol].data().map(point => ({
            time: point.time,
            value: point.value
          }));
        }
      });
      
      const exportData = {
        mainData,
        comparisonData
      };
      
      // Convert to JSON string
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('JSON dışa aktarma hatası:', error);
      return null;
    }
  }
  
  /**
   * Grafik verilerini CSV formatında dışa aktar
   * @returns {string} - CSV formatında veri
   */
  exportToCsv() {
    try {
      // CSV header
      let csv = 'time,symbol,open,high,low,close,volume\n';
      
      // Main data
      const mainData = this.candleSeries.data();
      mainData.forEach(candle => {
        const date = new Date(candle.time * 1000);
        const dateStr = date.toISOString().split('T')[0];
        csv += `${dateStr},${this.symbol},${candle.open},${candle.high},${candle.low},${candle.close},${candle.volume}\n`;
      });
      
      return csv;
    } catch (error) {
      console.error('CSV dışa aktarma hatası:', error);
      return null;
    }
  }
  
  /**
   * Belirtilen formatta veriyi dosya olarak indir
   * @param {string} format - Dosya formatı (json veya csv)
   */
  downloadChartData(format = 'json') {
    let content, filename, mimeType;
    
    if (format === 'json') {
      content = this.exportToJson();
      filename = `${this.symbol}_${this.timeframe}_chart_data.json`;
      mimeType = 'application/json';
    } else if (format === 'csv') {
      content = this.exportToCsv();
      filename = `${this.symbol}_${this.timeframe}_chart_data.csv`;
      mimeType = 'text/csv';
    } else {
      console.error('Desteklenmeyen format:', format);
      return;
    }
    
    if (!content) return;
    
    // Create download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    
    // Add to document, trigger click, and remove
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  /**
   * Tarihi belirtilen formatta biçimlendir
   * @param {Date} date - Tarih nesnesi
   * @param {string} format - Tarih formatı
   * @returns {string} - Biçimlendirilmiş tarih
   */
  formatDate(date, format) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    switch (format) {
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'dd.MM.yyyy':
        return `${day}.${month}.${year}`;
      default:
        return `${year}-${month}-${day}`;
    }
  }
  
  /**
   * Ayarları localStorage'dan yükle
   */
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('chartSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        this.settings = { ...this.settings, ...parsedSettings };
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    }
  }
  
  /**
   * Ayarları localStorage'a kaydet
   */
  saveSettings() {
    try {
      localStorage.setItem('chartSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
    }
  }
  
  /**
   * Grafik ayarlarını güncelle
   * @param {Object} newSettings - Yeni ayarlar
   */
  updateSettings(newSettings) {
    // Ayarları güncelle
    this.settings = { ...this.settings, ...newSettings };
    
    // Görünümü güncelle
    if (this.chart) {
      // Arka plan ve metin rengi
      this.chart.applyOptions({
        layout: {
          background: { color: this.settings.appearance.backgroundColor },
          textColor: this.settings.appearance.textColor,
        },
        grid: {
          vertLines: { color: this.settings.appearance.gridColor },
          horzLines: { color: this.settings.appearance.gridColor },
        },
        rightPriceScale: {
          borderColor: this.settings.appearance.gridColor,
        },
        timeScale: {
          borderColor: this.settings.appearance.gridColor,
          timeVisible: this.settings.timeScale.timeVisible,
        },
      });
      
      // Mum serisini güncelle
      if (this.candleSeries) {
        this.candleSeries.applyOptions({
          upColor: this.settings.candlestick.upColor,
          downColor: this.settings.candlestick.downColor,
          borderVisible: this.settings.candlestick.borderVisible,
          wickUpColor: this.settings.candlestick.upColor,
          wickDownColor: this.settings.candlestick.downColor,
          wickVisible: this.settings.candlestick.wickVisible,
        });
      }
      
      // Hacim serisi ayarlarını güncelle veya oluştur/kaldır
      if (this.settings.volume.visible) {
        if (!this.volumeSeries) {
          // Hacim serisi yoksa oluştur
          this.volumeSeries = this.chart.addHistogramSeries({
            priceFormat: { type: 'volume' },
            priceScaleId: '',
            scaleMargins: { top: 0.8, bottom: 0 },
          });
          
          // Eğer veri varsa, veriyi yükle
          if (this.candleSeries && this.candleSeries.data()) {
            const volumeData = this.candleSeries.data().map(candle => ({
              time: candle.time,
              value: candle.volume || 0,
              color: candle.close >= candle.open ? this.settings.volume.upColor : this.settings.volume.downColor,
            }));
            this.volumeSeries.setData(volumeData);
          }
        }
      } else if (this.volumeSeries) {
        // Hacim görünmez olarak ayarlandıysa, seriyi kaldır
        this.chart.removeSeries(this.volumeSeries);
        this.volumeSeries = null;
      }
      
      // Gerçek zamanlı veri ayarlarını güncelle
      if (this.settings.realtime.enabled) {
        this.subscribeToRealtimeUpdates();
      } else if (this.realtimeSubscription) {
        this.realtimeSubscription.unsubscribe();
        this.realtimeSubscription = null;
      }
    }
    
    // Ayarları kaydet
    this.saveSettings();
    
    // TradingView logosunu tekrar kaldır
    this.removeTradingViewLogo();
    
    return true;
  }
  
  /**
   * Ayarları varsayılana sıfırla
   */
  resetSettings() {
    // Varsayılan ayarları tanımla
    const defaultSettings = {
      appearance: {
        backgroundColor: '#131722',
        gridColor: '#1e222d',
        textColor: '#d1d4dc'
      },
      candlestick: {
        upColor: '#26a69a',
        downColor: '#ef5350',
        wickVisible: true,
        borderVisible: false
      },
      volume: {
        visible: true,
        upColor: '#26a69a',
        downColor: '#ef5350'
      },
      timeScale: {
        timeVisible: true,
        timeFormat: 'yyyy-MM-dd'
      },
      realtime: {
        enabled: true,
        updateInterval: 3000
      }
    };
    
    // Ayarları güncelle
    return this.updateSettings(defaultSettings);
  }
}

// Global olarak kullanılabilir
window.ChartManager = ChartManager; 
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
    this.initChart();
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
        background: { color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#1e222d' },
        horzLines: { color: '#1e222d' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#1e222d',
      },
      timeScale: {
        borderColor: '#1e222d',
        timeVisible: true,
      },
    });

    // Mum serisi oluştur
    this.candleSeries = this.chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Hacim serisi oluştur
    this.volumeSeries = this.chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Ayrı ölçek kullanma
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Pencere boyutu değiştiğinde grafiği yeniden boyutlandır
    window.addEventListener('resize', () => {
      if (this.chart) {
        this.chart.resize(
          this.container.clientWidth,
          this.container.clientHeight
        );
      }
    });

    // İlk verileri yükle
    this.loadChartData();
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

      // Hacim verilerini hazırla ve ekle
      const volumeData = candleData.map(candle => ({
        time: candle.time,
        value: candle.volume,
        color: candle.close >= candle.open ? '#26a69a' : '#ef5350',
      }));
      this.volumeSeries.setData(volumeData);

      // Grafik görünümünü ayarla
      this.chart.timeScale().fitContent();

      // Grafik başlığını güncelle
      document.getElementById('chartSymbol').textContent = symbol;

      // Piyasa bilgilerini güncelle
      this.updateMarketInfo(candleData[candleData.length - 1]);
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
   * Zaman dilimini değiştir
   * @param {string} timeframe - Yeni zaman dilimi
   */
  changeTimeframe(timeframe) {
    this.loadChartData(this.symbol, timeframe);
  }

  /**
   * Sembolü değiştir
   * @param {string} symbol - Yeni sembol
   */
  changeSymbol(symbol) {
    this.loadChartData(symbol, this.timeframe);
  }
}

// Global olarak kullanılabilir
window.ChartManager = ChartManager; 
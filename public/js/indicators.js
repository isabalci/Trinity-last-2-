/**
 * Teknik Göstergeler (Indicators) Modülü
 * Grafik üzerinde kullanılacak çeşitli teknik göstergeler
 */

class TechnicalIndicators {
  constructor(chartManager) {
    this.chartManager = chartManager;
    this.indicators = {}; // Aktif göstergeler
  }

  /**
   * Hareketli Ortalama (Moving Average) göstergesini ekle
   * @param {string} type - MA tipi (sma: Simple MA, ema: Exponential MA)
   * @param {number} period - Periyot (genellikle 20, 50, 100, 200)
   * @param {string} color - Çizgi rengi (hex formatında)
   * @returns {boolean} - İşlem başarısı
   */
  addMovingAverage(type = 'sma', period = 20, color = '#2962FF') {
    // İlgili tipin geçerli olup olmadığını kontrol et
    if (type !== 'sma' && type !== 'ema') {
      console.error('Geçersiz hareketli ortalama tipi');
      return false;
    }
    
    // Aynı gösterge zaten varsa kaldır
    const indicatorId = `${type}-${period}`;
    if (this.indicators[indicatorId]) {
      this.removeIndicator(indicatorId);
    }
    
    // Verileri al
    const data = this.chartManager.candleSeries.data();
    if (!data || data.length === 0) {
      console.error('Gösterge eklemek için yeterli veri yok');
      return false;
    }
    
    // Gösterge verisini hesapla
    const values = type === 'sma' 
      ? this.calculateSMA(data, period) 
      : this.calculateEMA(data, period);
    
    // Gösterge serisini oluştur
    const series = this.chartManager.chart.addLineSeries({
      color: color,
      lineWidth: 1,
      title: `${type.toUpperCase()}(${period})`,
      priceScaleId: 'right',
    });
    
    // Veriyi ayarla
    series.setData(values);
    
    // Göstergeyi kaydet
    this.indicators[indicatorId] = {
      type: 'moving-average',
      subType: type,
      period: period,
      series: series
    };
    
    return true;
  }
  
  /**
   * Bollinger Bantları göstergesini ekle
   * @param {number} period - Periyot (genellikle 20)
   * @param {number} stdDev - Standart sapma çarpanı (genellikle 2)
   * @param {string} color - Renk
   * @returns {boolean} - İşlem başarısı
   */
  addBollingerBands(period = 20, stdDev = 2, color = '#2962FF') {
    // Aynı gösterge zaten varsa kaldır
    const indicatorId = `bb-${period}-${stdDev}`;
    if (this.indicators[indicatorId]) {
      this.removeIndicator(indicatorId);
    }
    
    // Verileri al
    const data = this.chartManager.candleSeries.data();
    if (!data || data.length === 0) {
      console.error('Gösterge eklemek için yeterli veri yok');
      return false;
    }
    
    // Gösterge verisini hesapla
    const { middle, upper, lower } = this.calculateBollingerBands(data, period, stdDev);
    
    // Orta bant (SMA)
    const middleSeries = this.chartManager.chart.addLineSeries({
      color: color,
      lineWidth: 1,
      title: `BB Middle(${period}, ${stdDev})`,
      priceScaleId: 'right',
    });
    
    middleSeries.setData(middle);
    
    // Üst bant
    const upperSeries = this.chartManager.chart.addLineSeries({
      color: color,
      lineWidth: 1,
      lineStyle: 2, // Kesikli çizgi
      title: `BB Upper(${period}, ${stdDev})`,
      priceScaleId: 'right',
    });
    
    upperSeries.setData(upper);
    
    // Alt bant
    const lowerSeries = this.chartManager.chart.addLineSeries({
      color: color,
      lineWidth: 1,
      lineStyle: 2, // Kesikli çizgi
      title: `BB Lower(${period}, ${stdDev})`,
      priceScaleId: 'right',
    });
    
    lowerSeries.setData(lower);
    
    // Göstergeyi kaydet
    this.indicators[indicatorId] = {
      type: 'bollinger-bands',
      period: period,
      stdDev: stdDev,
      series: [middleSeries, upperSeries, lowerSeries]
    };
    
    return true;
  }
  
  /**
   * RSI (Relative Strength Index) göstergesini ekle
   * @param {number} period - Periyot (genellikle 14)
   * @param {string} color - Çizgi rengi
   * @returns {boolean} - İşlem başarısı
   */
  addRSI(period = 14, color = '#2962FF') {
    // Aynı gösterge zaten varsa kaldır
    const indicatorId = `rsi-${period}`;
    if (this.indicators[indicatorId]) {
      this.removeIndicator(indicatorId);
    }
    
    // Verileri al
    const data = this.chartManager.candleSeries.data();
    if (!data || data.length === 0) {
      console.error('Gösterge eklemek için yeterli veri yok');
      return false;
    }
    
    // Gösterge verisini hesapla
    const values = this.calculateRSI(data, period);
    
    // Pane oluştur (ayrı bir panel olarak göster)
    const rsiPanel = this.chartManager.chart.addLineSeries({
      color: color,
      lineWidth: 1,
      title: `RSI(${period})`,
      priceScaleId: 'right',
      pane: 1, // Ana grafiğin altında yeni bir panel
    });
    
    // 30 ve 70 seviyelerini göstermek için çizgiler ekle
    const overSoldLine = this.chartManager.chart.addLineSeries({
      color: '#FF9800',
      lineWidth: 1,
      lineStyle: 2, // Kesikli çizgi
      title: 'Oversold (30)',
      priceScaleId: 'right',
      pane: 1, // RSI paneli
    });
    
    const overBoughtLine = this.chartManager.chart.addLineSeries({
      color: '#FF9800',
      lineWidth: 1,
      lineStyle: 2, // Kesikli çizgi
      title: 'Overbought (70)',
      priceScaleId: 'right',
      pane: 1, // RSI paneli
    });
    
    // Sabit değerler için çizgiler
    const startTime = data[0].time;
    const endTime = data[data.length - 1].time;
    
    // Aşırı satış seviyesi (30)
    overSoldLine.setData([
      { time: startTime, value: 30 },
      { time: endTime, value: 30 }
    ]);
    
    // Aşırı alım seviyesi (70)
    overBoughtLine.setData([
      { time: startTime, value: 70 },
      { time: endTime, value: 70 }
    ]);
    
    // RSI verisi
    rsiPanel.setData(values);
    
    // Göstergeyi kaydet
    this.indicators[indicatorId] = {
      type: 'rsi',
      period: period,
      series: [rsiPanel, overSoldLine, overBoughtLine]
    };
    
    return true;
  }
  
  /**
   * MACD (Moving Average Convergence Divergence) göstergesini ekle
   * @param {number} fastPeriod - Hızlı periyot (genellikle 12)
   * @param {number} slowPeriod - Yavaş periyot (genellikle 26)
   * @param {number} signalPeriod - Sinyal periyotu (genellikle 9)
   * @returns {boolean} - İşlem başarısı
   */
  addMACD(fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    // Aynı gösterge zaten varsa kaldır
    const indicatorId = `macd-${fastPeriod}-${slowPeriod}-${signalPeriod}`;
    if (this.indicators[indicatorId]) {
      this.removeIndicator(indicatorId);
    }
    
    // Verileri al
    const data = this.chartManager.candleSeries.data();
    if (!data || data.length === 0) {
      console.error('Gösterge eklemek için yeterli veri yok');
      return false;
    }
    
    // Gösterge verisini hesapla
    const { macdLine, signalLine, histogram } = this.calculateMACD(
      data, fastPeriod, slowPeriod, signalPeriod
    );
    
    // MACD paneli oluştur
    const macdLineSeries = this.chartManager.chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 1,
      title: `MACD(${fastPeriod}, ${slowPeriod}, ${signalPeriod})`,
      priceScaleId: 'right',
      pane: 2, // İkinci panel (RSI panelinin altında)
    });
    
    const signalLineSeries = this.chartManager.chart.addLineSeries({
      color: '#FF9800',
      lineWidth: 1,
      title: 'Signal Line',
      priceScaleId: 'right',
      pane: 2,
    });
    
    const histogramSeries = this.chartManager.chart.addHistogramSeries({
      color: '#26a69a', // Çubuklar için varsayılan renk
      priceScaleId: 'right',
      pane: 2,
    });
    
    // Verileri ayarla
    macdLineSeries.setData(macdLine);
    signalLineSeries.setData(signalLine);
    histogramSeries.setData(histogram);
    
    // Göstergeyi kaydet
    this.indicators[indicatorId] = {
      type: 'macd',
      fastPeriod,
      slowPeriod,
      signalPeriod,
      series: [macdLineSeries, signalLineSeries, histogramSeries]
    };
    
    return true;
  }
  
  /**
   * Hacim (Volume) göstergesini ekle
   * @param {string} upColor - Yükseliş için renk
   * @param {string} downColor - Düşüş için renk
   * @returns {boolean} - İşlem başarısı
   */
  addVolume(upColor = '#26a69a', downColor = '#ef5350') {
    // Hacim zaten aktifse
    if (this.chartManager.volumeSeries) {
      return false;
    }
    
    // Verileri al
    const data = this.chartManager.candleSeries.data();
    if (!data || data.length === 0) {
      console.error('Gösterge eklemek için yeterli veri yok');
      return false;
    }
    
    // Hacim serisini oluştur
    this.chartManager.volumeSeries = this.chartManager.chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '', // Ayrı ölçek kullanma
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    
    // Hacim verilerini hazırla
    const volumeData = data.map(candle => ({
      time: candle.time,
      value: candle.volume,
      color: candle.close >= candle.open 
        ? upColor 
        : downColor,
    }));
    
    // Verileri ayarla
    this.chartManager.volumeSeries.setData(volumeData);
    
    // Göstergeyi kaydet
    this.indicators['volume'] = {
      type: 'volume',
      series: this.chartManager.volumeSeries
    };
    
    return true;
  }
  
  /**
   * Belirli bir göstergeyi kaldır
   * @param {string} indicatorId - Gösterge kimliği
   * @returns {boolean} - İşlem başarısı
   */
  removeIndicator(indicatorId) {
    const indicator = this.indicators[indicatorId];
    if (!indicator) {
      return false;
    }
    
    // Özel durum: Volume göstergesi
    if (indicatorId === 'volume') {
      if (this.chartManager.volumeSeries) {
        this.chartManager.chart.removeSeries(this.chartManager.volumeSeries);
        this.chartManager.volumeSeries = null;
      }
      delete this.indicators[indicatorId];
      return true;
    }
    
    // Çoklu seriler (Bollinger, RSI, MACD gibi)
    if (Array.isArray(indicator.series)) {
      indicator.series.forEach(series => {
        this.chartManager.chart.removeSeries(series);
      });
    } else {
      // Tekli seri (MA gibi)
      this.chartManager.chart.removeSeries(indicator.series);
    }
    
    // Göstergeyi kaldır
    delete this.indicators[indicatorId];
    
    return true;
  }
  
  /**
   * Tüm göstergeleri kaldır
   */
  removeAllIndicators() {
    Object.keys(this.indicators).forEach(id => {
      this.removeIndicator(id);
    });
  }
  
  /**
   * Basit Hareketli Ortalama (SMA) hesapla
   * @param {Array} data - Mum verileri
   * @param {number} period - Periyot
   * @returns {Array} - SMA değerleri
   */
  calculateSMA(data, period) {
    const result = [];
    
    // Period kadar veri olmadan hesaplanamaz
    if (data.length < period) {
      return result;
    }
    
    // İlk SMA'yı hesapla
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i].close;
    }
    
    // İlk periyot için ortalama
    let sma = sum / period;
    
    // İlk veriyi ekle
    result.push({
      time: data[period - 1].time,
      value: sma
    });
    
    // Kayan pencere ile SMA hesapla
    for (let i = period; i < data.length; i++) {
      sum = sum - data[i - period].close + data[i].close;
      sma = sum / period;
      
      result.push({
        time: data[i].time,
        value: sma
      });
    }
    
    return result;
  }
  
  /**
   * Üssel Hareketli Ortalama (EMA) hesapla
   * @param {Array} data - Mum verileri
   * @param {number} period - Periyot
   * @returns {Array} - EMA değerleri
   */
  calculateEMA(data, period) {
    const result = [];
    
    // Period kadar veri olmadan hesaplanamaz
    if (data.length < period) {
      return result;
    }
    
    // İlk EMA değeri olarak SMA kullan
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i].close;
    }
    
    let ema = sum / period;
    
    // İlk veriyi ekle
    result.push({
      time: data[period - 1].time,
      value: ema
    });
    
    // EMA çarpanı
    const multiplier = 2 / (period + 1);
    
    // EMA hesapla
    for (let i = period; i < data.length; i++) {
      ema = (data[i].close - ema) * multiplier + ema;
      
      result.push({
        time: data[i].time,
        value: ema
      });
    }
    
    return result;
  }
  
  /**
   * Bollinger Bantlarını hesapla
   * @param {Array} data - Mum verileri
   * @param {number} period - Periyot
   * @param {number} stdDev - Standart sapma çarpanı
   * @returns {Object} - middle, upper, lower bantları
   */
  calculateBollingerBands(data, period, stdDev) {
    const middle = this.calculateSMA(data, period);
    const upper = [];
    const lower = [];
    
    // Period kadar veri olmadan hesaplanamaz
    if (data.length < period) {
      return { middle, upper, lower };
    }
    
    // Her bir SMA noktası için standart sapmayı hesapla
    for (let i = period - 1; i < data.length; i++) {
      // İlgili SMA değeri
      const sma = middle[i - (period - 1)].value;
      
      // Varyans için kareler toplamı
      let sumSquaredDeviations = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const deviation = data[j].close - sma;
        sumSquaredDeviations += deviation * deviation;
      }
      
      // Standart sapma
      const standardDeviation = Math.sqrt(sumSquaredDeviations / period);
      
      // Üst ve alt bantlar
      upper.push({
        time: data[i].time,
        value: sma + stdDev * standardDeviation
      });
      
      lower.push({
        time: data[i].time,
        value: sma - stdDev * standardDeviation
      });
    }
    
    return { middle, upper, lower };
  }
  
  /**
   * RSI (Relative Strength Index) hesapla
   * @param {Array} data - Mum verileri
   * @param {number} period - Periyot
   * @returns {Array} - RSI değerleri
   */
  calculateRSI(data, period) {
    const result = [];
    
    // Period + 1 kadar veri olmadan hesaplanamaz
    if (data.length < period + 1) {
      return result;
    }
    
    // Kazanç ve kayıp toplamları
    let sumGain = 0;
    let sumLoss = 0;
    
    // İlk periyot için kazanç ve kayıpları topla
    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      
      if (change >= 0) {
        sumGain += change;
      } else {
        sumLoss += Math.abs(change);
      }
    }
    
    // İlk ortalama kazanç ve kayıp
    let avgGain = sumGain / period;
    let avgLoss = sumLoss / period;
    
    // İlk RS ve RSI
    let rs = avgGain / avgLoss;
    let rsi = 100 - (100 / (1 + rs));
    
    // İlk RSI ekle
    result.push({
      time: data[period].time,
      value: rsi
    });
    
    // Diğer noktalar için RSI hesapla
    for (let i = period + 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      
      // Ortalama kazanç ve kayıpları güncelle
      if (change >= 0) {
        avgGain = ((avgGain * (period - 1)) + change) / period;
        avgLoss = ((avgLoss * (period - 1))) / period;
      } else {
        avgGain = ((avgGain * (period - 1))) / period;
        avgLoss = ((avgLoss * (period - 1)) + Math.abs(change)) / period;
      }
      
      // RS ve RSI
      rs = avgGain / avgLoss;
      rsi = 100 - (100 / (1 + rs));
      
      // NaN kontrolü
      if (isNaN(rsi)) {
        rsi = 50; // Varsayılan orta değer
      }
      
      // RSI değerini ekle
      result.push({
        time: data[i].time,
        value: rsi
      });
    }
    
    return result;
  }
  
  /**
   * MACD (Moving Average Convergence Divergence) hesapla
   * @param {Array} data - Mum verileri
   * @param {number} fastPeriod - Hızlı periyot
   * @param {number} slowPeriod - Yavaş periyot
   * @param {number} signalPeriod - Sinyal periyotu
   * @returns {Object} - MACD, Sinyal ve Histogram değerleri
   */
  calculateMACD(data, fastPeriod, slowPeriod, signalPeriod) {
    // EMA'ları hesapla
    const fastEMA = this.calculateEMA(data, fastPeriod);
    const slowEMA = this.calculateEMA(data, slowPeriod);
    
    // Başlangıç indexi (yavaş EMA periyotu)
    const startIndex = slowPeriod - 1;
    
    // Boş değerler için geçici diziler oluştur
    const macdLineRaw = [];
    
    // MACD hattını hesapla (hızlı EMA - yavaş EMA)
    for (let i = 0; i < slowEMA.length; i++) {
      const slowEmaIndex = i;
      const fastEmaIndex = slowEmaIndex + (slowPeriod - fastPeriod);
      
      const macdValue = fastEMA[fastEmaIndex].value - slowEMA[slowEmaIndex].value;
      
      macdLineRaw.push({
        time: slowEMA[slowEmaIndex].time,
        value: macdValue
      });
    }
    
    // Sinyal hattını hesapla (MACD'nin EMA'sı)
    // (gerçekte bu bir EMA değil, macdLineRaw'ın Sinyal periyotlu EMA'sı)
    const signalLineRaw = [];
    
    // İlk signal değerini SMA olarak hesapla
    let sum = 0;
    for (let i = 0; i < signalPeriod; i++) {
      sum += macdLineRaw[i].value;
    }
    
    let signalValue = sum / signalPeriod;
    
    signalLineRaw.push({
      time: macdLineRaw[signalPeriod - 1].time,
      value: signalValue
    });
    
    // Signal EMA'sını hesapla
    const multiplier = 2 / (signalPeriod + 1);
    
    for (let i = signalPeriod; i < macdLineRaw.length; i++) {
      signalValue = (macdLineRaw[i].value - signalValue) * multiplier + signalValue;
      
      signalLineRaw.push({
        time: macdLineRaw[i].time,
        value: signalValue
      });
    }
    
    // Histogram değerlerini hesapla (MACD - Sinyal)
    const histogramRaw = [];
    
    for (let i = 0; i < signalLineRaw.length; i++) {
      const macdIndex = i + (signalPeriod - 1);
      const histValue = macdLineRaw[macdIndex].value - signalLineRaw[i].value;
      
      histogramRaw.push({
        time: signalLineRaw[i].time,
        value: histValue,
        color: histValue >= 0 ? '#26a69a' : '#ef5350'
      });
    }
    
    // Sonuçları hazırla
    return {
      macdLine: macdLineRaw,
      signalLine: signalLineRaw,
      histogram: histogramRaw
    };
  }
}

// Global olarak kullanılabilir
window.TechnicalIndicators = TechnicalIndicators; 
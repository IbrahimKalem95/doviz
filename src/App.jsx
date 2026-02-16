import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './App.css'

// Mock veriler oluştur
const generateMockData = (currency, days) => {
  const data = []
  
  // Her para birimine ait gerçekçi temel oranlar
  const baseRates = {
    USD: 32.5,
    EUR: 35.8,
    GBP: 40.2,
    JPY: 0.22,
    CHF: 37.1,
    CAD: 24.3,
    AUD: 21.5,
    NZD: 19.8,
    CNY: 4.5,
    INR: 0.39,
    SAR: 8.7,
    AED: 8.9,
    SEK: 3.1,
    NOK: 3.0,
    DKK: 4.8,
    KWD: 105.5,
    QAR: 8.95,
    OMR: 84.3,
    BHD: 86.5,
  }
  
  const baseRate = baseRates[currency] || 30
  
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    // Günlük varyans %1-2 arasında
    const variancePercent = (Math.random() - 0.5) * 0.02
    const variance = baseRate * variancePercent
    data.push({
      date: date.toLocaleDateString('tr-TR', { month: '2-digit', day: '2-digit' }),
      fullDate: date.toLocaleDateString('tr-TR'),
      rate: parseFloat((baseRate + variance).toFixed(4))
    })
  }
  return data
}

function App() {
  const [exchangeRates, setExchangeRates] = useState({
    USD: 0,
    EUR: 0,
    GBP: 0,
    JPY: 0,
    CHF: 0,
    CAD: 0,
    AUD: 0,
    NZD: 0,
    CNY: 0,
    INR: 0,
    SAR: 0,
    AED: 0,
    SEK: 0,
    NOK: 0,
    DKK: 0,
    KWD: 0,
    QAR: 0,
    OMR: 0,
    BHD: 0,
  })
  const [tlAmount, setTlAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('calculator')
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [timeframe, setTimeframe] = useState('weekly')

  // Döviz kurlarını API'den çek
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/TRY')
        const data = await response.json()
        
        // İstediğimiz para birimlerini filtrele
        const filtered = {}
        Object.keys(exchangeRates).forEach(currency => {
          filtered[currency] = data.rates[currency] || 0
        })
        
        setExchangeRates(filtered)
        setError(null)
      } catch (err) {
        setError('Döviz kurları yüklenirken hata oluştu')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchExchangeRates()
    // Her 30 dakikada bir kurları güncelle
    const interval = setInterval(fetchExchangeRates, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleAmountChange = (value) => {
    setTlAmount(value)
  }

  const chartData = timeframe === 'weekly' 
    ? generateMockData(selectedCurrency, 7) 
    : generateMockData(selectedCurrency, 30)

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>💱 TL Döviz Hesaplayıcısı</h1>
          <p>Türk Lirası (TRY) döviz kurlarına göre hesaplama yapın ve grafikleri görüntüleyin</p>
        </header>

        {loading && <div className="loading">Döviz kurları yükleniyor...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && !error && (
          <>
            {/* Tab Navigation */}
            <div className="tabs">
              <button 
                className={`tab-button ${activeTab === 'calculator' ? 'active' : ''}`}
                onClick={() => setActiveTab('calculator')}
              >
                🧮 Hesaplayıcı
              </button>
              <button 
                className={`tab-button ${activeTab === 'charts' ? 'active' : ''}`}
                onClick={() => setActiveTab('charts')}
              >
                📈 Grafik Analizi
              </button>
            </div>

            {/* Calculator Tab */}
            {activeTab === 'calculator' && (
              <div className="calculator-container">
                <div className="input-section-compact">
                  <label htmlFor="tl-input">Türk Lirası (TRY)</label>
                  <input
                    id="tl-input"
                    type="number"
                    placeholder="0.00"
                    value={tlAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    min="0"
                    step="0.01"
                    className="tl-input-compact"
                  />
                </div>

                <div className="rates-list">
                  {Object.entries(exchangeRates).map(([currency, rate]) => (
                    <div key={currency} className="rate-item">
                      <div className="rate-item-header">
                        <span className="currency-code">{currency}</span>
                        <span className="rate-info">1 TRY = {rate.toFixed(4)}</span>
                      </div>
                      {tlAmount && (
                        <div className="rate-item-result">
                          {(parseFloat(tlAmount) * rate).toFixed(2)} {currency}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charts Tab */}
            {activeTab === 'charts' && (
              <div className="charts-section">
                <div className="charts-controls">
                  <div className="control-group">
                    <label htmlFor="currency-select">Para Birimi Seçin:</label>
                    <select 
                      id="currency-select"
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="currency-select"
                    >
                      {Object.keys(exchangeRates).map(currency => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="control-group">
                    <label>Zaman Aralığı:</label>
                    <div className="timeframe-buttons">
                      <button 
                        className={`timeframe-btn ${timeframe === 'weekly' ? 'active' : ''}`}
                        onClick={() => setTimeframe('weekly')}
                      >
                        📅 Haftalık
                      </button>
                      <button 
                        className={`timeframe-btn ${timeframe === 'monthly' ? 'active' : ''}`}
                        onClick={() => setTimeframe('monthly')}
                      >
                        📆 Aylık
                      </button>
                    </div>
                  </div>
                </div>

                <div className="chart-container">
                  <div className="chart-info">
                    <h3>1 TRY = {selectedCurrency} (Son Veriler)</h3>
                    <p className="current-rate">
                      Mevcut Kur: {exchangeRates[selectedCurrency].toFixed(4)} {selectedCurrency}
                    </p>
                  </div>

                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#666', fontSize: 12 }}
                        angle={timeframe === 'monthly' ? -45 : 0}
                        textAnchor={timeframe === 'monthly' ? 'end' : 'middle'}
                        height={timeframe === 'monthly' ? 80 : 40}
                      />
                      <YAxis 
                        tick={{ fill: '#666', fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip 
                        formatter={(value) => value.toFixed(4)}
                        labelFormatter={(label) => `Tarih: ${label}`}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          padding: '10px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="#667eea" 
                        strokeWidth={3}
                        dot={{ fill: '#667eea', r: 4 }}
                        activeDot={{ r: 6 }}
                        name={`${selectedCurrency} Kuru`}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="chart-stats">
                    <div className="stat">
                      <span className="stat-label">En Yüksek:</span>
                      <span className="stat-value">
                        {Math.max(...chartData.map(d => d.rate)).toFixed(4)} {selectedCurrency}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">En Düşük:</span>
                      <span className="stat-value">
                        {Math.min(...chartData.map(d => d.rate)).toFixed(4)} {selectedCurrency}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Ortalama:</span>
                      <span className="stat-value">
                        {(chartData.reduce((sum, d) => sum + d.rate, 0) / chartData.length).toFixed(4)} {selectedCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <footer className="footer">
          <p>Kurlar <strong>ExchangeRate-API</strong> tarafından sağlanmaktadır</p>
          <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '10px' }}>
            Son güncelleme: {new Date().toLocaleString('tr-TR')}
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App

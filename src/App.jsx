import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './App.css'

// İçerik kontrol - uygunsuz söylemleri filtrele
const containsInappropriateContent = (text) => {
  if (!text) return false
  
  const inappropriate = [
    // Küfür ve ağır söylemleri filtrele (Türkçe)
    /\b(aq|siktir|am|pislik|piç|salaklık|salak|oç|oc)\b/i,
    // Siyasi söylemler
    /\b(chp|akp|hdp|mhp|pkk|ergenekon)\b/i,
    // Hacker/tehdit söylemleri
    /\b(hack|crack|virus|malware|ddos|exploit|dos)\b/i,
    // Spam linkler
    /\b(http|https|\.com|bitly|tinyurl)\b/i,
  ]
  
  return inappropriate.some(pattern => pattern.test(text))
}

// localStorage işlemleri
const loadFeatureRequests = () => {
  try {
    const data = localStorage.getItem('featureRequests')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const saveFeatureRequests = (requests) => {
  localStorage.setItem('featureRequests', JSON.stringify(requests))
}

// Mock veriler oluştur - API'den gelen base rate'i kullan
const generateMockData = (currency, days, baseRate) => {
  const data = []
  
  const rate = baseRate || 30
  
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    // Günlük varyans %1-2 arasında
    const variancePercent = (Math.random() - 0.5) * 0.02
    const variance = rate * variancePercent
    data.push({
      date: date.toLocaleDateString('tr-TR', { month: '2-digit', day: '2-digit' }),
      fullDate: date.toLocaleDateString('tr-TR'),
      rate: parseFloat((rate + variance).toFixed(4))
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
  const [goldGramAmount, setGoldGramAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('calculator')
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [timeframe, setTimeframe] = useState('weekly')
  const [featureRequest, setFeatureRequest] = useState('')
  const [featureRequests, setFeatureRequests] = useState([])
  const [adminPassword, setAdminPassword] = useState('')
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [showRequestSuccess, setShowRequestSuccess] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [goldPrices, setGoldPrices] = useState({
    gram: 2850,
    ceyrek: 11400,
    yarim: 22800,
    tam: 45600,
    cumhuriyet: 50000,
    ata: 48000
  })

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

  // Feature requests'i yükle
  useEffect(() => {
    setFeatureRequests(loadFeatureRequests())
  }, [])

  const handleAmountChange = (value) => {
    setTlAmount(value)
  }

  // Feature request ekle
  const handleSubmitFeatureRequest = () => {
    if (!featureRequest.trim()) {
      setRequestError('Lütfen bir talep yazınız')
      return
    }

    if (featureRequest.length < 10) {
      setRequestError('Talep en az 10 karakter olmalıdır')
      return
    }

    if (containsInappropriateContent(featureRequest)) {
      setRequestError('Talep uygunsuz içerik barındırmaktadır')
      return
    }

    const newRequest = {
      id: Date.now(),
      text: featureRequest,
      date: new Date().toLocaleDateString('tr-TR'),
      status: 'pending', // pending, approved, in-progress, completed
      priority: 0
    }

    const updated = [...featureRequests, newRequest]
    setFeatureRequests(updated)
    saveFeatureRequests(updated)
    
    setFeatureRequest('')
    setRequestError('')
    setShowRequestSuccess(true)
    setTimeout(() => setShowRequestSuccess(false), 3000)
  }

  // Admin giriş
  const handleAdminLogin = () => {
    if (adminPassword === 'doviz2026admin') {
      setIsAdminLoggedIn(true)
      setAdminPassword('')
    } else {
      setRequestError('Hatalı şifre')
    }
  }

  // Admin çıkış
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false)
    setAdminPassword('')
  }

  // Request status güncelle
  const updateRequestStatus = (id, newStatus) => {
    const updated = featureRequests.map(req => 
      req.id === id ? { ...req, status: newStatus } : req
    )
    setFeatureRequests(updated)
    saveFeatureRequests(updated)
  }

  // Request priority güncelle
  const updateRequestPriority = (id, newPriority) => {
    const updated = featureRequests.map(req => 
      req.id === id ? { ...req, priority: newPriority } : req
    )
    setFeatureRequests(updated)
    saveFeatureRequests(updated)
  }

  // Request sil
  const deleteRequest = (id) => {
    const updated = featureRequests.filter(req => req.id !== id)
    setFeatureRequests(updated)
    saveFeatureRequests(updated)
  }

  const chartData = timeframe === 'weekly' 
    ? generateMockData(selectedCurrency, 7, exchangeRates[selectedCurrency] > 0 ? 1 / exchangeRates[selectedCurrency] : 0)
    : timeframe === 'monthly'
    ? generateMockData(selectedCurrency, 30, exchangeRates[selectedCurrency] > 0 ? 1 / exchangeRates[selectedCurrency] : 0)
    : generateMockData(selectedCurrency, 365, exchangeRates[selectedCurrency] > 0 ? 1 / exchangeRates[selectedCurrency] : 0)

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
                className={`tab-button ${activeTab === 'gold' ? 'active' : ''}`}
                onClick={() => setActiveTab('gold')}
              >
                ✨ Altın Fiyatları
              </button>
              <button 
                className={`tab-button ${activeTab === 'charts' ? 'active' : ''}`}
                onClick={() => setActiveTab('charts')}
              >
                📈 Grafik Analizi
              </button>
              <button 
                className={`tab-button ${activeTab === 'feedback' ? 'active' : ''}`}
                onClick={() => setActiveTab('feedback')}
              >
                💬 Fikirler
              </button>
              <button 
                className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
                onClick={() => setActiveTab('admin')}
              >
                🔐 Yönetici
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

            {/* Gold Tab */}
            {activeTab === 'gold' && (
              <div className="gold-container">
                <div className="input-section-compact">
                  <label htmlFor="gold-input">Gram Altın Miktarı</label>
                  <input
                    id="gold-input"
                    type="number"
                    placeholder="0.00"
                    value={goldGramAmount}
                    onChange={(e) => setGoldGramAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="tl-input-compact"
                  />
                </div>

                <div className="gold-prices-list">
                  <div className="gold-item">
                    <div className="gold-item-header">
                      <span className="gold-type">📍 Gram Altın</span>
                      <span className="gold-rate">₺{goldPrices.gram.toLocaleString('tr-TR')}/gram</span>
                    </div>
                    {goldGramAmount && (
                      <div className="gold-item-result">
                        ₺{(parseFloat(goldGramAmount) * goldPrices.gram).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>

                  <div className="gold-item">
                    <div className="gold-item-header">
                      <span className="gold-type">⬜ Çeyrek Altın</span>
                      <span className="gold-rate">₺{goldPrices.ceyrek.toLocaleString('tr-TR')}</span>
                    </div>
                    {goldGramAmount && (
                      <div className="gold-item-result">
                        {(parseFloat(goldGramAmount) * goldPrices.gram / goldPrices.ceyrek).toFixed(4)} adet (₺{(parseFloat(goldGramAmount) * goldPrices.gram).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </div>
                    )}
                  </div>

                  <div className="gold-item">
                    <div className="gold-item-header">
                      <span className="gold-type">⬛ Yarım Altın</span>
                      <span className="gold-rate">₺{goldPrices.yarim.toLocaleString('tr-TR')}</span>
                    </div>
                    {goldGramAmount && (
                      <div className="gold-item-result">
                        {(parseFloat(goldGramAmount) * goldPrices.gram / goldPrices.yarim).toFixed(4)} adet (₺{(parseFloat(goldGramAmount) * goldPrices.gram).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </div>
                    )}
                  </div>

                  <div className="gold-item">
                    <div className="gold-item-header">
                      <span className="gold-type">☀️ Tam Altın</span>
                      <span className="gold-rate">₺{goldPrices.tam.toLocaleString('tr-TR')}</span>
                    </div>
                    {goldGramAmount && (
                      <div className="gold-item-result">
                        {(parseFloat(goldGramAmount) * goldPrices.gram / goldPrices.tam).toFixed(4)} adet (₺{(parseFloat(goldGramAmount) * goldPrices.gram).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </div>
                    )}
                  </div>

                  <div className="gold-item">
                    <div className="gold-item-header">
                      <span className="gold-type">👑 Cumhuriyet Altını</span>
                      <span className="gold-rate">₺{goldPrices.cumhuriyet.toLocaleString('tr-TR')}</span>
                    </div>
                    {goldGramAmount && (
                      <div className="gold-item-result">
                        {(parseFloat(goldGramAmount) * goldPrices.gram / goldPrices.cumhuriyet).toFixed(4)} adet (₺{(parseFloat(goldGramAmount) * goldPrices.gram).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </div>
                    )}
                  </div>

                  <div className="gold-item">
                    <div className="gold-item-header">
                      <span className="gold-type">🦅 Ata Altını</span>
                      <span className="gold-rate">₺{goldPrices.ata.toLocaleString('tr-TR')}</span>
                    </div>
                    {goldGramAmount && (
                      <div className="gold-item-result">
                        {(parseFloat(goldGramAmount) * goldPrices.gram / goldPrices.ata).toFixed(4)} adet (₺{(parseFloat(goldGramAmount) * goldPrices.gram).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                      </div>
                    )}
                  </div>
                </div>

                <div className="gold-info">
                  <h3>📌 Altın Türleri Hakkında</h3>
                  <ul className="gold-info-list">
                    <li><strong>Gram Altın:</strong> 1 gramdan başlayan saf altın</li>
                    <li><strong>Çeyrek Altın:</strong> 1/4 ons (yaklaşık 7.776g) 22 ayar altın</li>
                    <li><strong>Yarım Altın:</strong> 1/2 ons (yaklaşık 15.552g) 22 ayar altın</li>
                    <li><strong>Tam Altın:</strong> 1 ons (yaklaşık 31.104g) 22 ayar altın</li>
                    <li><strong>Cumhuriyet Altını:</strong> 1923'ten beri basılan resmi madeni para</li>
                    <li><strong>Ata Altını:</strong> Atatürk portresi olan koleksiyonluk altın madeni para</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="feedback-section">
                <div className="feedback-header">
                  <h2>💬 Özellik Talebi</h2>
                  <p>Sayfa ile ilgili fikirleriniz ve taleplerini paylaşın. Ek özelliklerin geliştirilmesine yardımcı olun!</p>
                </div>

                <div className="feedback-form">
                  <div className="feedback-input-group">
                    <label htmlFor="feature-request">Fikriniz</label>
                    <textarea
                      id="feature-request"
                      placeholder="Örn: Grafiklere karşılaştırma özelliği eklenebilir..."
                      value={featureRequest}
                      onChange={(e) => {
                        setFeatureRequest(e.target.value)
                        setRequestError('')
                      }}
                      className="feedback-textarea"
                      maxLength="500"
                    />
                    <div className="char-count">
                      {featureRequest.length}/500
                    </div>
                  </div>

                  {requestError && (
                    <div className="error-message">
                      ❌ {requestError}
                    </div>
                  )}

                  {showRequestSuccess && (
                    <div className="success-message">
                      ✅ Fikriniz iletildi! Teşekkürler.
                    </div>
                  )}

                  <button 
                    onClick={handleSubmitFeatureRequest}
                    className="submit-feedback-btn"
                  >
                    Gönder
                  </button>
                </div>

                <div className="feedback-stats">
                  <div className="stat-item">
                    <span className="stat-number">{featureRequests.length}</span>
                    <span className="stat-label">Toplam Talep</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{featureRequests.filter(r => r.status === 'completed').length}</span>
                    <span className="stat-label">Tamamlanan</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{featureRequests.filter(r => r.status === 'in-progress').length}</span>
                    <span className="stat-label">Geliştirilen</span>
                  </div>
                </div>

                <div className="pending-requests">
                  <h3>⏳ Beklemede Olan Talepler (Sizin de oy verebileceğiniz)</h3>
                  {featureRequests.filter(r => r.status === 'pending').length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#999' }}>Şu anda beklemede talep yok</p>
                  ) : (
                    <div className="requests-list">
                      {featureRequests
                        .filter(r => r.status === 'pending')
                        .map(req => (
                          <div key={req.id} className="request-item-display">
                            <div className="request-text">{req.text}</div>
                            <div className="request-meta">{req.date}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Panel */}
            {activeTab === 'admin' && (
              <div className="admin-section">
                {!isAdminLoggedIn ? (
                  <div className="admin-login">
                    <div className="admin-login-box">
                      <h2>🔐 Yönetici Girişi</h2>
                      <input
                        type="password"
                        placeholder="Şifre girin"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value)
                          setRequestError('')
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                        className="admin-password-input"
                      />
                      {requestError && (
                        <div className="error-message">{requestError}</div>
                      )}
                      <button onClick={handleAdminLogin} className="admin-login-btn">
                        Giriş Yap
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="admin-panel">
                    <div className="admin-header">
                      <h2>🔐 Yönetici Paneli</h2>
                      <button onClick={handleAdminLogout} className="logout-btn">Çıkış Yap</button>
                    </div>

                    <div className="admin-stats">
                      <div className="stat-box">
                        <div className="stat-number">{featureRequests.length}</div>
                        <div className="stat-title">Toplam</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-number">{featureRequests.filter(r => r.status === 'pending').length}</div>
                        <div className="stat-title">Beklemede</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-number">{featureRequests.filter(r => r.status === 'approved').length}</div>
                        <div className="stat-title">Onaylanmış</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-number">{featureRequests.filter(r => r.status === 'in-progress').length}</div>
                        <div className="stat-title">Geliştirilen</div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-number">{featureRequests.filter(r => r.status === 'completed').length}</div>
                        <div className="stat-title">Tamamlanan</div>
                      </div>
                    </div>

                    <div className="admin-requests">
                      <h3>📋 Tüm Talepler</h3>
                      {featureRequests.length === 0 ? (
                        <p>Talep bulunmuyor</p>
                      ) : (
                        <div className="requests-table">
                          {featureRequests
                            .sort((a, b) => b.priority - a.priority)
                            .map(req => (
                              <div key={req.id} className="admin-request-item">
                                <div className="request-content">
                                  <div className="request-text-admin">{req.text}</div>
                                  <div className="request-date">{req.date}</div>
                                </div>
                                <div className="request-controls">
                                  <select
                                    value={req.status}
                                    onChange={(e) => updateRequestStatus(req.id, e.target.value)}
                                    className="status-select"
                                  >
                                    <option value="pending">Beklemede</option>
                                    <option value="approved">Onaylandı</option>
                                    <option value="in-progress">Geliştiriliyor</option>
                                    <option value="completed">Tamamlandı</option>
                                  </select>

                                  <select
                                    value={req.priority}
                                    onChange={(e) => updateRequestPriority(req.id, parseInt(e.target.value))}
                                    className="priority-select"
                                  >
                                    <option value="0">Öncelik: Düşük</option>
                                    <option value="1">Öncelik: Orta</option>
                                    <option value="2">Öncelik: Yüksek</option>
                                  </select>

                                  <button
                                    onClick={() => deleteRequest(req.id)}
                                    className="delete-btn"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                      <button 
                        className={`timeframe-btn ${timeframe === 'yearly' ? 'active' : ''}`}
                        onClick={() => setTimeframe('yearly')}
                      >
                        📊 1 Yıllık
                      </button>
                    </div>
                  </div>
                </div>

                <div className="chart-container">
                  <div className="chart-info">
                    <h3>1 {selectedCurrency} = {exchangeRates[selectedCurrency] > 0 ? (1 / exchangeRates[selectedCurrency]).toFixed(2) : '0'} TRY (Son Veriler)</h3>
                    <p className="current-rate">
                      Mevcut Kur: {exchangeRates[selectedCurrency] > 0 ? (1 / exchangeRates[selectedCurrency]).toFixed(4) : '0'} TRY
                    </p>
                  </div>

                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#666', fontSize: 12 }}
                        angle={timeframe !== 'weekly' ? -45 : 0}
                        textAnchor={timeframe !== 'weekly' ? 'end' : 'middle'}
                        height={timeframe !== 'weekly' ? 80 : 40}
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
                        name={`1 ${selectedCurrency} = ? TRY`}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="chart-stats">
                    <div className="stat">
                      <span className="stat-label">En Yüksek:</span>
                      <span className="stat-value">
                        {Math.max(...chartData.map(d => d.rate)).toFixed(4)} TRY
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">En Düşük:</span>
                      <span className="stat-value">
                        {Math.min(...chartData.map(d => d.rate)).toFixed(4)} TRY
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Ortalama:</span>
                      <span className="stat-value">
                        {(chartData.reduce((sum, d) => sum + d.rate, 0) / chartData.length).toFixed(4)} TRY
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

# Döviz Hesaplayıcı - Test Senaryosu

## API Oranları (Tarih: 16.02.2026)
```
1 TRY = 0.0229 USD  → 1 USD = 43.65 TRY
1 TRY = 0.0193 EUR  → 1 EUR = 51.81 TRY
1 TRY = 0.0168 GBP  → 1 GBP = 59.52 TRY
1 TRY = 3.5 JPY     → 1 JPY = 0.286 TRY
```

## Test Senaryoları

### 1. Hesaplayıcı Sekmesi Testi

#### Test 1.1: TRY → USD Dönüşümü
- **Giriş:** 100 TRY
- **Beklenen Sonuç:** 100 × 0.0229 = 2.29 USD
- **Kontrol Noktaları:**
  - [ ] Input alanına "100" yazılabiliyor
  - [ ] USD satırında "2.29 USD" gösteriliyor
  - [ ] Hesaplama doğru (100 * 0.0229 = 2.29)

#### Test 1.2: TRY → EUR Dönüşümü
- **Giriş:** 1000 TRY
- **Beklenen Sonuç:** 1000 × 0.0193 = 19.30 EUR
- **Kontrol Noktaları:**
  - [ ] EUR satırında "19.30 EUR" gösteriliyor

#### Test 1.3: Boş Giriş
- **Giriş:** Boş
- **Beklenen Sonuç:** Hiçbir hesaplama sonucu gösterilmiyor
- **Kontrol Noktaları:**
  - [ ] Rate-item-result'ler gözükmüyor

---

### 2. Altın Sekmesi Testi

#### Test 2.1: Gram Altın → Çeyrek Altın
- **Giriş:** 10 gram altın
- **Beklenen Sonuçlar:**
  - Toplam TRY: 10 × 2850 = 28,500 TRY
  - Çeyrek Altın: 28,500 / 11,400 = 2.5 adet
- **Kontrol Noktaları:**
  - [ ] "₺28,500.00" gösteriliyor (Toplam TL değeri)
  - [ ] "2.5000 adet" gösteriliyor
  - [ ] "₺28,500.00" hesaplaması doğru

#### Test 2.2: Gram Altın → Tam Altın
- **Giriş:** 100 gram altın
- **Beklenen Sonuçlar:**
  - Toplam TRY: 100 × 2850 = 285,000 TRY
  - Tam Altın: 285,000 / 45,600 = 6.25 adet
- **Kontrol Noktaları:**
  - [ ] "₺285,000.00" gösteriliyor
  - [ ] "6.2500 adet" gösteriliyor

---

### 3. Grafik Analizi Sekmesi Testi

#### Test 3.1: USD - Haftalık Grafik
- **Para Birimi:** USD
- **Zaman Aralığı:** Haftalık (7 gün)
- **Beklenen Sonuçlar:**
  - Başlık: "1 USD = 43.65 TRY (Son Veriler)"
  - Mevcut Kur: "43.65 USD" (Hatalı - TRY olması gerekli!)
  - Grafik: 7 gün gösteriliyor
  - Varyasyon: ±1-2% aralığında (42.76 - 44.54 TRY)
- **Kontrol Noktaları:**
  - [ ] Başlık "1 USD = X TRY" formatında
  - [ ] Kur "43.65 TRY" gösteriliyor (0.0229'un tersi)
  - [ ] X-axis 7 veri noktası gösteriliyor
  - [ ] Y-axis değerleri 42-45 aralığında

#### Test 3.2: USD - Aylık Grafik
- **Para Birimi:** USD
- **Zaman Aralığı:** Aylık (30 gün)
- **Beklenen Sonuçlar:**
  - Grafik: 30 gün gösteriliyor
  - X-axis: -45° açıyla gösteriliyor
- **Kontrol Noktaları:**
  - [ ] X-axis 30 veri noktası gösteriliyor
  - [ ] Tarihler okunabilir

#### Test 3.3: USD - Yıllık Grafik
- **Para Birimi:** USD
- **Zaman Aralığı:** Yıllık (365 gün)
- **Beklenen Sonuçlar:**
  - Grafik: 365 gün gösteriliyor
- **Kontrol Noktaları:**
  - [ ] X-axis 365 veri noktası gösteriliyor
  - [ ] Tarihler 45° açıyla gösteriliyor

#### Test 3.4: EUR - Haftalık Grafik
- **Para Birimi:** EUR
- **Zaman Aralığı:** Haftalık
- **Beklenen Sonuçlar:**
  - Başlık: "1 EUR = 51.81 TRY (Son Veriler)"
  - Varyasyon: ±1-2% aralığında (50.77 - 52.85 TRY)
- **Kontrol Noktaları:**
  - [ ] Başlık EUR olmuş
  - [ ] Kur "51.81 TRY" gösteriliyor
  - [ ] Varyasyon doğru

#### Test 3.5: JPY - Haftalık Grafik
- **Para Birimi:** JPY
- **Zaman Aralığı:** Haftalık
- **Beklenen Sonuçlar:**
  - Başlık: "1 JPY = 0.29 TRY (Son Veriler)"
  - Varyasyon: ±1-2% aralığında
- **Kontrol Noktaları:**
  - [ ] Başlık JPY olmuş
  - [ ] Kur "0.29 TRY" gösteriliyor (1/3.5)
  - [ ] Küçük sayılar doğru gösteriliyor

---

### 4. Grafik İstatistikleri Testi

#### Test 4.1: En Yüksek/En Düşük/Ortalama (USD)
- **Beklenen Sonuçlar:**
  - En Yüksek: ~44.54 TRY (43.65 + 2%)
  - En Düşük: ~42.76 TRY (43.65 - 2%)
  - Ortalama: ~43.65 TRY
- **Kontrol Noktaları:**
  - [ ] İstatistikler gösteriliyor
  - [ ] En yüksek > Ortalama
  - [ ] Ortalama > En düşük

---

### 5. Responsive Tasarım Testi

#### Test 5.1: Desktop (1200px+)
- [ ] Tab'lar yatay sırada
- [ ] Altın sekmesinde grid 2 sütunlu
- [ ] Grafik tam genişlikte

#### Test 5.2: Tablet (768px - 1199px)
- [ ] Sekmeler yatay ama dar
- [ ] Altın sekmesinde grid 1 sütunlu
- [ ] Grafik tablet boyutunda

#### Test 5.3: Mobil (<768px)
- [ ] Sekmeler yatay scroll
- [ ] Altın sekmesinde 1 sütun
- [ ] Grafik mobile-friendly

---

## Test Kontrol Listesi

### Başarılı Test Kriterleri
- ✅ Tüm matematiksel hesaplamalar doğru
- ✅ Tüm oranlar API'den gelen kurlarla eşleşiyor
- ✅ Para birimi değiştirme anında güncelleniyor
- ✅ Zaman aralığı değiştirme grafik güncelliyor
- ✅ Responsive tasarım çalışıyor
- ✅ Hata yok, konsol temiz

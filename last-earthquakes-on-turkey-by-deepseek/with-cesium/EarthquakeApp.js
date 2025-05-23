export class EarthquakeApp {
  constructor(terrainProvider) {
    this.viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: terrainProvider,
      sceneMode: Cesium.SceneMode.SCENE3D,
    });

    // Türkiye ve Yunanistan'ı içine alan bounding box
    const turkeyGreeceBoundingBox = Cesium.Rectangle.fromDegrees(
      25.0,  // Batı boylamı (Türkiye ve Yunanistan'ın batı sınırı)
      34.0,  // Güney enlemi (Türkiye ve Yunanistan'ın güney sınırı)
      45.0,  // Doğu boylamı (Türkiye ve Yunanistan'ın doğu sınırı)
      42.0   // Kuzey enlemi (Türkiye ve Yunanistan'ın kuzey sınırı)
    );

    // Kamerayı bounding box'a odakla
    this.viewer.camera.setView({
      destination: turkeyGreeceBoundingBox
    });

    // Depth testi kapat
    this.viewer.scene.globe.depthTestAgainstTerrain = false;

    this.entities = this.viewer.entities;
    this.earthquakes = [];
    this.currentIndex = 0;
    this.isPlaying = true;
    this.minMagnitude = Infinity;
    this.maxMagnitude = -Infinity;
    this.minDepth = Infinity;
    this.maxDepth = -Infinity;

    this.speedSlider = document.getElementById('speedSlider');
    this.speedValue = document.getElementById('speedValue');
    this.playPauseBtn = document.getElementById('playPauseBtn');
    this.restartBtn = document.getElementById('restartBtn');
    this.refreshBtn = document.getElementById('refreshBtn');
    this.timeSlider = document.getElementById('timeSlider');
    this.timeValue = document.getElementById('timeValue');
    this.earthquakeInfo = document.getElementById('earthquakeInfo');
    this.sourceInfo = document.getElementById('sourceInfo');
    this.updateNotification = document.getElementById('updateNotification');
    this.languageSelect = document.getElementById('language');
    this.soundCheckbox = document.getElementById('soundCheckbox');
    this.focusCheckbox = document.getElementById('focusCheckbox');
    this.soundLabel = document.getElementById('soundLabel');
    this.focusLabel = document.getElementById('focusLabel');

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.oscillator = null;

    this.texts = {
      tr: {
        speedLabel: "Animasyon Hızı:",
        timeLabel: "Zaman:",
        playPause: "Durdur",
        restart: "Baştan Başlat",
        refresh: "Son Depremlerle Güncelle",
        source: "Kaynak: <a href='http://www.koeri.boun.edu.tr/sismo/2/tr/' target='_blank'>Boğaziçi Üniversitesi Kandilli Rasathanesi ve Deprem Araştırma Enstitüsü Bölgesel Deprem-Tsunami İzleme ve Değerlendirme Merkezi</a>",
        updateNotification: "1 dakika sonra güncellenecek...",
        soundLabel: "Ses Aç",
        focusLabel: "Son Depreme Odaklan"
      },
      en: {
        speedLabel: "Animation Speed:",
        timeLabel: "Time:",
        playPause: "Pause",
        restart: "Restart",
        refresh: "Update with Latest Earthquakes",
        source: "Source: <a href='http://www.koeri.boun.edu.tr/sismo/2/tr/' target='_blank'>Boğaziçi University Kandilli Observatory and Earthquake Research Institute Regional Earthquake-Tsunami Monitoring Center</a>",
        updateNotification: "Updating in 1 minute...",
        soundLabel: "Enable Sound",
        focusLabel: "Focus on Last Earthquake"
      }
    };
  }

  init() {
    this.setupEventListeners();
    this.fetchEarthquakeData();
  }

  setupEventListeners() {
    this.languageSelect.addEventListener('change', () => this.updateTexts(this.languageSelect.value));
    this.speedSlider.addEventListener('input', () => this.updateSpeed());
    this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    this.restartBtn.addEventListener('click', () => this.restartAnimation());
    this.refreshBtn.addEventListener('click', () => location.reload());
    this.timeSlider.addEventListener('input', () => this.updateTimeSlider());
  }

  updateTexts(lang) {
    const text = this.texts[lang];
    document.getElementById('speedLabel').textContent = text.speedLabel;
    document.getElementById('timeLabel').textContent = text.timeLabel;
    this.playPauseBtn.querySelector('.mdc-button__label').textContent = this.isPlaying ? text.playPause : "Oynat";
    this.restartBtn.querySelector('.mdc-button__label').textContent = text.restart;
    this.refreshBtn.querySelector('.mdc-button__label').textContent = text.refresh;
    this.sourceInfo.innerHTML = text.source;
    this.updateNotification.textContent = text.updateNotification;
    this.soundLabel.textContent = text.soundLabel;
    this.focusLabel.textContent = text.focusLabel;
  }

  updateSpeed() {
    this.speedValue.textContent = 5000 - this.speedSlider.value + 100;
    if (this.isPlaying) {
      clearInterval(this.animationInterval);
      this.animationInterval = setInterval(() => this.showNextEarthquake(), 5000 - this.speedSlider.value + 100);
    }
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    this.updateTexts(this.languageSelect.value);
    if (this.isPlaying) {
      this.animationInterval = setInterval(() => this.showNextEarthquake(), 5000 - this.speedSlider.value + 100);
    } else {
      clearInterval(this.animationInterval);
    }
  }

  restartAnimation() {
    this.currentIndex = 0;
    this.timeSlider.value = 0;
    this.timeValue.textContent = '-';
    this.entities.removeAll();
    if (this.isPlaying) {
      clearInterval(this.animationInterval);
      this.animationInterval = setInterval(() => this.showNextEarthquake(), 5000 - this.speedSlider.value + 100);
    }
  }

  updateTimeSlider() {
    this.currentIndex = parseInt(this.timeSlider.value);
    if (this.earthquakes[this.currentIndex]) {
      this.timeValue.textContent = `${this.earthquakes[this.currentIndex].date} ${this.earthquakes[this.currentIndex].time}`;
    }
    this.entities.removeAll();
    for (let i = 0; i < this.currentIndex; i++) {
      this.showEarthquake(this.earthquakes[i]);
    }
  }

  async fetchEarthquakeData() {
    const proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';
    const targetUrl = 'http://www.koeri.boun.edu.tr/scripts/lst7.asp';
  
  
    try {
      const response = await fetch(proxyUrl + targetUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const rows = doc.querySelectorAll('pre')[0].textContent.split('\n').slice(7, -1);
  
      this.earthquakes = rows.map(row => {
        const columns = row.trim().split(/\s+/);
        const magnitude = parseFloat(columns[6]) || parseFloat(columns[7]) || parseFloat(columns[8]);
        const depth = parseFloat(columns[4]);
        return {
          date: columns[0],
          time: columns[1],
          latitude: parseFloat(columns[2]),
          longitude: parseFloat(columns[3]),
          depth: depth,
          magnitude: magnitude
        };
      }).filter(earthquake => !isNaN(earthquake.magnitude));
  
      this.minMagnitude = Math.min(...this.earthquakes.map(e => e.magnitude));
      this.maxMagnitude = Math.max(...this.earthquakes.map(e => e.magnitude));
      this.minDepth = Math.min(...this.earthquakes.map(e => e.depth));
      this.maxDepth = Math.max(...this.earthquakes.map(e => e.depth));
  
      this.animationInterval = setInterval(() => this.showNextEarthquake(), 5000 - this.speedSlider.value + 100);
    } catch (error) {
      console.error('Deprem verisi alınırken hata:', error);
    }
  }

  showEarthquake(earthquake) {
    const position = Cesium.Cartesian3.fromDegrees(earthquake.longitude, earthquake.latitude, -earthquake.depth * 1000);
    const radius = this.calculateEffectRadius(earthquake.magnitude, earthquake.depth); // Etki yarıçapını hesapla
    const color = this.getColor(radius); // Renk hesapla (etki yarıçapına göre)

    // Deprem noktası
    const sphereEntity = this.entities.add({
      position: position,
      ellipsoid: {
        radii: new Cesium.Cartesian3(radius, radius, radius),
        material: new Cesium.Color(color.red, color.green, color.blue, color.alpha), // Doğru renk formatı
        outline: false // Outline kaldırıldı
      }
    });

    // Label pozisyonunu kürenin tepesine yerleştir
    const labelPosition = Cesium.Cartesian3.fromDegrees(
      earthquake.longitude,
      earthquake.latitude,
      -earthquake.depth * 1000 + radius // Kürenin tepesine yerleştir
    );

    // Label
    const labelEntity = this.entities.add({
      position: labelPosition, // Kürenin tepesindeki pozisyon
      label: {
        text: `${earthquake.magnitude.toFixed(1)}\n${earthquake.depth.toFixed(1)} km`,
        font: '20px Helvetica', // Helvetica font
        fillColor: new Cesium.Color(color.red, color.green, color.blue, 1.0), // Küre rengiyle aynı
        outlineColor: Cesium.Color.BLACK, // Siyah outline
        outlineWidth: 3, // Outline genişliği 3
        style: Cesium.LabelStyle.FILL_AND_OUTLINE, // Hem fill hem outline kullan
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // Label'ı kürenin tepesine yerleştir
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        eyeOffset: new Cesium.Cartesian3(0, 0, -100) // Label'ı öne çıkar
      }
    });

    // Animasyonlu küre
    let currentRadius = 0;
    const maxRadius = radius;
    const animationDuration = 1000; // 1 saniye
    const startTime = Date.now();
    const animateSphere = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      currentRadius = maxRadius * progress;
      sphereEntity.ellipsoid.radii = new Cesium.Cartesian3(currentRadius, currentRadius, currentRadius);
      if (progress < 1) {
        requestAnimationFrame(animateSphere);
      }
    };
    animateSphere();

    this.earthquakeInfo.textContent = `Deprem Bilgisi: ${earthquake.date} ${earthquake.time} - Büyüklük: ${earthquake.magnitude} - Derinlik: ${earthquake.depth} km`;

    this.playSound(earthquake.magnitude);

    if (this.focusCheckbox.checked) {
      const currentCameraHeight = this.viewer.camera.positionCartographic.height;
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(earthquake.longitude, earthquake.latitude, currentCameraHeight),
        duration: 1
      });
    }
  }
/*old calculation*/
  /*
  calculateEffectRadius(magnitude, depth) {
    // Yeni formül: 10^(0.45*M - 1.88) * sqrt(D)
    return Math.pow(10, 0.45 * magnitude - 1.88) * Math.sqrt(depth) * 1000; //ref: https://www.reddit.com/r/Earthquakes/comments/11yy62h/how_to_guesstimate_felt_radius_of_an_eartquake/
  }
  */
  
  /**
   * Depremin büyüklüğü (magnitüd) ve derinliğine göre hissedilen etki yarıçapını hesaplar.
   *
   * Bu formül, Türkiye'deki şehir yapısı ve zemin koşulları gibi faktörler göz önüne alınarak
   * ampirik olarak ayarlanmıştır. Sonuç yaklaşık bir tahmindir ve gerçek hissedilme,
   * zemin türü, bina yoğunluğu, hava durumu gibi etkenlere göre değişebilir.
   *
   * @param {number} magnitude - Depremin büyüklüğü (Magnitüd - örn: 6.2)
   * @param {number} depth - Depremin yerin altındaki derinliği (kilometre cinsinden)
   * @returns {number} Depremin yaklaşık hissedilen yarıçapı (metre cinsinden)
   */
  /*
  calculateEffectRadius(magnitude, depth) {
    const baseRadius = 10 ** (0.6 * magnitude - 1.5);
    const depthFactor = 1 / (1 + depth / 15);
    return baseRadius * depthFactor * 10 * 1000; // metre cinsinden
  }
*/
  /**
   * McCue formülüne göre, depremin büyüklüğüne (magnitüd) göre hissedilen
   * yarıçapı (etki alanı) metre cinsinden hesaplar.
   *
   * Bu formül yüzeye yakın depremler için geçerlidir. Derinlik dikkate alınmaz.
   * 
   * Kaynak: https://cqsrg.org/tools/perceptionradius/
   *
   * @param {number} magnitude - Depremin büyüklüğü (örneğin: 6.2)
   * @returns {number} Depremin yaklaşık hissedilen yarıçapı (metre cinsinden)
   */
  calculateEffectRadius(magnitude) {
    const radiusKm = Math.exp(magnitude / 1.01 - 0.13); // kilometre cinsinden
    return radiusKm * 1000; // metreye çevir
  }

  getColor(radius) {
    // Etki yarıçapına göre renk hesapla
    const minRadius = 3000; // Minimum etki yarıçapı (3 km)
    const maxRadius = 60000; // Maksimum etki yarıçapı (7.5 km)
    const normalizedRadius = (radius - minRadius) / (maxRadius - minRadius);

    let red, green, blue;
    if (normalizedRadius < 0.5) {
      red = 2 * normalizedRadius; // 0.0 - 1.0 arası
      green = 1.0;
      blue = 0.0;
    } else {
      red = 1.0;
      green = 2 * (1 - normalizedRadius); // 1.0 - 0.0 arası
      blue = 0.0;
    }
    return {
      red: red,
      green: green,
      blue: blue,
      alpha: 0.5 // Yarı opak
    };
  }

  showNextEarthquake() {
    if (this.currentIndex >= this.earthquakes.length) {
      clearInterval(this.animationInterval);
      this.isPlaying = false;
      this.playPauseBtn.querySelector('.mdc-button__label').textContent = "Oynat";
      this.currentIndex = 0;
      this.timeSlider.value = 0;
      this.timeValue.textContent = '-';
      this.entities.removeAll();
      this.animationInterval = setInterval(() => this.showNextEarthquake(), 5000 - this.speedSlider.value + 100);
      return;
    }

    this.showEarthquake(this.earthquakes[this.currentIndex]);
    this.currentIndex++;
    this.timeSlider.value = this.currentIndex;
    this.timeValue.textContent = `${this.earthquakes[this.currentIndex - 1].date} ${this.earthquakes[this.currentIndex - 1].time}`;
  }

  playSound(magnitude) {
    if (!this.soundCheckbox.checked) return;
    if (this.oscillator) this.oscillator.stop();
    this.oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const frequency = 100 + (magnitude - this.minMagnitude) / (this.maxMagnitude - this.minMagnitude) * 200;
    this.oscillator.frequency.value = frequency;
    gainNode.gain.value = 0.5;
    this.oscillator.type = 'sine';
    this.oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    this.oscillator.start();
    this.oscillator.stop(this.audioContext.currentTime + 0.03);
  }
}

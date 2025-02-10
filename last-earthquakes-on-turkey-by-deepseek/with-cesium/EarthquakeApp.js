export class EarthquakeApp {
  constructor() {
    this.viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain(),
      sceneMode: Cesium.SceneMode.SCENE3D,
    });

    // Türkiye'ye odaklan
    this.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(35.2433, 39.4816, 1000000), // Türkiye merkezli
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
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const targetUrl = 'http://www.koeri.boun.edu.tr/scripts/lst7.asp';
    const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const rows = doc.querySelectorAll('pre')[0].textContent.split('\n').slice(7, -1);

    this.earthquakes = rows.map(row => {
      const columns = row.split(/\s+/);
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
  }

  showEarthquake(earthquake) {
    const position = Cesium.Cartesian3.fromDegrees(earthquake.longitude, earthquake.latitude);
    const color = this.getColor(earthquake.magnitude);
    const radius = this.getRadius(earthquake.magnitude);

    this.entities.add({
      position: position,
      point: {
        pixelSize: radius,
        color: Cesium.Color.fromBytes(...color),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 1
      },
      label: {
        text: `${earthquake.magnitude.toFixed(1)}\n${earthquake.depth.toFixed(1)} km`,
        font: '14px Arial',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER
      }
    });

    this.earthquakeInfo.textContent = `Deprem Bilgisi: ${earthquake.date} ${earthquake.time} - Büyüklük: ${earthquake.magnitude} - Derinlik: ${earthquake.depth} km`;

    this.playSound(earthquake.magnitude);

    if (this.focusCheckbox.checked) {
      this.viewer.camera.flyTo({
        destination: position,
        duration: 1,
        offset: new Cesium.HeadingPitchRange(0, -90, 1000000) // Mevcut zoomu koru
      });
    }
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

  getColor(magnitude) {
    const normalizedMagnitude = (magnitude - this.minMagnitude) / (this.maxMagnitude - this.minMagnitude);
    if (normalizedMagnitude < 0.5) {
      return [255 * 2 * normalizedMagnitude, 255, 0, 255];
    } else {
      return [255, 255 * 2 * (1 - normalizedMagnitude), 0, 255];
    }
  }

  getRadius(magnitude) {
    return (magnitude - this.minMagnitude) / (this.maxMagnitude - this.minMagnitude) * 20 + 5;
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

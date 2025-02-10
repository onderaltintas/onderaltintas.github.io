export class EarthquakeApp {
  constructor() {
    this.map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([35.2433, 39.4816]),
        zoom: 6
      })
    });

    this.earthquakeLayer = new ol.layer.Vector({
      source: new ol.source.Vector()
    });
    this.map.addLayer(this.earthquakeLayer);

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
    this.earthquakeLayer.getSource().clear();
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
    this.earthquakeLayer.getSource().clear();
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
    const point = new ol.geom.Point(ol.proj.fromLonLat([earthquake.longitude, earthquake.latitude]));
    const feature = new ol.Feature({
      geometry: point,
      magnitude: earthquake.magnitude,
      depth: earthquake.depth
    });

    const color = this.getColor(earthquake.magnitude);
    const radius = this.getRadius(earthquake.magnitude);
    const opacity = this.getOpacity(earthquake.depth);
    const style = new ol.style.Style({
      image: new ol.style.Circle({
        radius: radius,
        fill: new ol.style.Fill({
          color: [...color.slice(0, 3), opacity]
        }),
        stroke: new ol.style.Stroke({
          color: 'black',
          width: 1
        })
      }),
      text: new ol.style.Text({
        text: `${earthquake.magnitude.toFixed(1)}\n${earthquake.depth.toFixed(1)} km`,
        fill: new ol.style.Fill({
          color: '#000000'
        }),
        stroke: new ol.style.Stroke({
          color: '#ffffff',
          width: 2
        }),
        offsetY: 0,
        textAlign: 'center',
        textBaseline: 'middle'
      })
    });

    feature.setStyle(style);
    this.earthquakeLayer.getSource().addFeature(feature);

    const pulseFeature = new ol.Feature({
      geometry: point
    });
    const pulseStyle = new ol.style.Style({
      image: new ol.style.Circle({
        radius: radius,
        stroke: new ol.style.Stroke({
          color: 'rgba(255, 0, 0, 1)',
          width: 2
        }),
        fill: new ol.style.Fill({
          color: 'rgba(255, 0, 0, 0)'
        })
      })
    });
    pulseFeature.setStyle(pulseStyle);
    this.earthquakeLayer.getSource().addFeature(pulseFeature);

    let currentRadius = radius;
    const maxPulseRadius = radius * 2;
    const animationDuration = 2000;
    const startTime = Date.now();
    const animatePulse = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      currentRadius = radius + (maxPulseRadius - radius) * progress;
      pulseStyle.getImage().setRadius(currentRadius);
      pulseStyle.getImage().getStroke().setColor(`rgba(255, 0, 0, ${1 - progress})`);
      if (progress < 1) {
        requestAnimationFrame(animatePulse);
      } else {
        this.earthquakeLayer.getSource().removeFeature(pulseFeature);
      }
    };
    animatePulse();

    this.earthquakeInfo.textContent = `Deprem Bilgisi: ${earthquake.date} ${earthquake.time} - Büyüklük: ${earthquake.magnitude} - Derinlik: ${earthquake.depth} km`;

    this.playSound(earthquake.magnitude);

    if (this.focusCheckbox.checked) {
      const view = this.map.getView();
      const targetCenter = ol.proj.fromLonLat([earthquake.longitude, earthquake.latitude]);
      view.animate({
        center: targetCenter,
        duration: 500
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
      this.earthquakeLayer.getSource().clear();
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
      return [255 * 2 * normalizedMagnitude, 255, 0, 0.7];
    } else {
      return [255, 255 * 2 * (1 - normalizedMagnitude), 0, 0.7];
    }
  }

  getRadius(magnitude) {
    return (magnitude - this.minMagnitude) / (this.maxMagnitude - this.minMagnitude) * 20 + 5;
  }

  getOpacity(depth) {
    return 0.9 - (depth - this.minDepth) / (this.maxDepth - this.minDepth) * 0.89;
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
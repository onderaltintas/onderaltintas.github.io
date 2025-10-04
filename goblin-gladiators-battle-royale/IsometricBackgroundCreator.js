class IsometricBackgroundCreator {
    constructor() {
        this.backgroundCanvas = null;
        this.backgroundCtx = null;
        this.currentType = null;
        this.backgroundSeed = Math.random() * 1000;
        this.isCreated = false;
        
        // Tip tanımları
        this.Types = {
            grass: { En: 'Grass', Tr: 'Çim' },
            desert: { En: 'Desert', Tr: 'Çöl' },
            wood: { En: 'Wood', Tr: 'Ahşap' },
            stone: { En: 'Stone', Tr: 'Taş' },
            cloud: { En: 'Cloud', Tr: 'Bulut' },
            marble: { En: 'Marble', Tr: 'Mermer' },
            cobblestone: { En: 'Cobblestone', Tr: 'Arnavut Kaldırımı' },
            street: { En: 'Street', Tr: 'Sokak' },
            snow: { En: 'Snow', Tr: 'Kar' },
            mosaic: { En: 'Mosaic', Tr: 'Mozaik' }
        };

        // Renk paletleri
        this.colors = {
            desert: ['#f4d742', '#e5c135', '#d6ac29', '#c7991e'],
            grass: ['#7cfc00', '#70e000', '#64c400', '#58a800'],
            wood: ['#e8c46e', '#d4b15f', '#c09e51', '#ac8b43'],
            stone: ['#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0'],
            cloud: ['#ffffff', '#fefefe', '#fdfdfd', '#fcfcfc'], // Neredeyse tamamen beyaz
            marble: ['#f5f5f5', '#e8e8e8', '#dbdbdb', '#cecece'],
            cobblestone: ['#d0d0d0', '#c0c0c0', '#b0b0b0', '#a0a0a0'],
            street: ['#a0a0a0', '#b0b0b0', '#c0c0c0', '#d0d0d0'], // Daha açık gri tonlar
            snow: ['#ffffff', '#f8f8f8', '#f0f0f0', '#e8e8e8'],
            mosaic: ['#ffb6c1', '#98fb98', '#87ceeb', '#dda0dd'] // Pastel tonlar
        };

        // İzometrik dönüşüm parametreleri
        this.tileWidth = 80;
        this.tileHeight = 40;
    }

    create(canvas, type = 'grass') {
        if (!canvas) {
            console.error('Canvas parametresi gereklidir!');
            return;
        }

        // Off-screen canvas oluştur
        this.backgroundCanvas = document.createElement('canvas');
        this.backgroundCanvas.width = canvas.width;
        this.backgroundCanvas.height = canvas.height;
        this.backgroundCtx = this.backgroundCanvas.getContext('2d');
        
        this.currentType = type;
        this.isCreated = true;

        // Arkaplanı oluştur
        this.generateBackground(type);
        
        // İlk kopyalamayı yap
        this.update(canvas);
    }

    update(canvas) {
        if (!this.isCreated) {
            console.warn('Arkaplan henüz oluşturulmadı. Önce create() metodunu çağırın.');
            return;
        }

        if (!canvas) {
            console.error('Canvas parametresi gereklidir!');
            return;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.backgroundCanvas, 0, 0);
    }

    generateBackground(type) {
        this.backgroundCtx.clearRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
        
        // Cloud tipi için gökyüzü arkaplanı
        if (type === 'cloud') {
            const gradient = this.backgroundCtx.createLinearGradient(0, 0, 0, this.backgroundCanvas.height);
            gradient.addColorStop(0, '#87CEEB'); // Açık mavi
            gradient.addColorStop(0.7, '#B0E2FF'); // Orta mavi
            gradient.addColorStop(1, '#E0F7FF'); // Daha açık mavi
            this.backgroundCtx.fillStyle = gradient;
            this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
        }
        
        const cols = Math.ceil(this.backgroundCanvas.width / this.tileWidth) * 2 + 10;
        const rows = Math.ceil(this.backgroundCanvas.height / this.tileHeight) * 2 + 10;
        
        const centerX = this.backgroundCanvas.width / 2;
        const centerY = -this.tileHeight * 2;
        
        for (let x = -cols; x < cols; x++) {
            for (let y = -rows; y < rows; y++) {
                const screenX = (x - y) * this.tileWidth / 2 + centerX;
                const screenY = (x + y) * this.tileHeight / 2 + centerY;
                
                if (screenX + this.tileWidth/2 > -this.tileWidth && 
                    screenX - this.tileWidth/2 < this.backgroundCanvas.width + this.tileWidth && 
                    screenY > -this.tileHeight && 
                    screenY < this.backgroundCanvas.height + this.tileHeight) {
                    this.drawIsometricTile(screenX, screenY, type, x, y);
                }
            }
        }
    }

    drawIsometricTile(x, y, type, gridX, gridY) {
        const colorVariants = this.colors[type];
        
        const colorIndex = Math.abs(Math.floor(Math.sin(gridX * 12.9898 + gridY * 78.233 + this.backgroundSeed) * 43758.5453)) % colorVariants.length;
        const baseColor = colorVariants[colorIndex];
        
        // Cloud tipinde arkaplanın görünmesi için dolgu yapma
        if (type !== 'cloud') {
            this.backgroundCtx.beginPath();
            this.backgroundCtx.moveTo(x, y);
            this.backgroundCtx.lineTo(x + this.tileWidth / 2, y + this.tileHeight / 2);
            this.backgroundCtx.lineTo(x, y + this.tileHeight);
            this.backgroundCtx.lineTo(x - this.tileWidth / 2, y + this.tileHeight / 2);
            this.backgroundCtx.closePath();
            
            this.backgroundCtx.fillStyle = baseColor;
            this.backgroundCtx.fill();
        }
        
        this.addTexture(x, y, type, baseColor, gridX, gridY);
    }

    addTexture(x, y, type, baseColor, gridX, gridY) {
        this.backgroundCtx.save();
        this.backgroundCtx.translate(x, y);
        
        const random = (index) => {
            return Math.abs(Math.sin(gridX * 12.9898 + gridY * 78.233 + this.backgroundSeed + index * 100) * 43758.5453) % 1;
        };
        
        switch(type) {
            case 'grass':
                this.backgroundCtx.fillStyle = this.darkenColor(baseColor, 20);
                for (let i = 0; i < 12; i++) {
                    const r = random(i);
                    const bladeX = (r - 0.5) * this.tileWidth / 1.5;
                    const bladeY = random(i + 10) * this.tileHeight;
                    const height = 2 + random(i + 20) * 5;
                    const width = 0.5 + random(i + 30) * 1;
                    this.backgroundCtx.fillRect(bladeX, bladeY, width, height);
                }
                break;
                
            case 'desert':
                this.backgroundCtx.fillStyle = this.darkenColor(baseColor, 15);
                for (let i = 0; i < 15; i++) {
                    const r1 = random(i);
                    const r2 = random(i + 100);
                    const grainX = (r1 - 0.5) * this.tileWidth / 1.2;
                    const grainY = r2 * this.tileHeight;
                    const size = 0.5 + random(i + 200) * 2;
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.arc(grainX, grainY, size, 0, Math.PI * 2);
                    this.backgroundCtx.fill();
                }
                
                this.backgroundCtx.fillStyle = this.lightenColor(baseColor, 10);
                for (let i = 0; i < 3; i++) {
                    const r1 = random(i + 300);
                    const r2 = random(i + 400);
                    const r3 = random(i + 500);
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.ellipse(
                        (r1 - 0.5) * this.tileWidth / 3,
                        r2 * this.tileHeight,
                        8 + r3 * 12,
                        2 + random(i + 600) * 4,
                        random(i + 700) * Math.PI,
                        0, Math.PI * 2
                    );
                    this.backgroundCtx.fill();
                }
                break;
                
            case 'wood':
                this.backgroundCtx.strokeStyle = this.darkenColor(baseColor, 15);
                this.backgroundCtx.lineWidth = 1;
                for (let i = 0; i < 5; i++) {
                    const startY = random(i) * this.tileHeight;
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.moveTo(-this.tileWidth/3, startY);
                    this.backgroundCtx.bezierCurveTo(
                        -this.tileWidth/6, startY + (random(i + 10) - 0.5) * 8,
                        this.tileWidth/6, startY + (random(i + 20) - 0.5) * 8,
                        this.tileWidth/3, startY
                    );
                    this.backgroundCtx.stroke();
                }
                
                this.backgroundCtx.fillStyle = this.darkenColor(baseColor, 20);
                for (let i = 0; i < 2; i++) {
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.arc(
                        (random(i + 30) - 0.5) * this.tileWidth / 3,
                        random(i + 40) * this.tileHeight,
                        2 + random(i + 50) * 2, 0, Math.PI * 2
                    );
                    this.backgroundCtx.fill();
                }
                break;
                
            case 'stone':
                // Daha gerçekçi taş dokusu
                this.backgroundCtx.fillStyle = this.darkenColor(baseColor, 10);
                for (let i = 0; i < 6; i++) {
                    const stoneX = (random(i) - 0.5) * this.tileWidth / 1.5;
                    const stoneY = random(i + 10) * this.tileHeight;
                    const width = 4 + random(i + 20) * 6;
                    const height = 3 + random(i + 30) * 5;
                    
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.ellipse(stoneX, stoneY, width, height, 
                                             random(i + 40) * Math.PI, 0, Math.PI * 2);
                    this.backgroundCtx.fill();
                    
                    // Taş üzerine hafif vurgular
                    this.backgroundCtx.fillStyle = this.lightenColor(baseColor, 15);
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.ellipse(stoneX - width/4, stoneY - height/4, 
                                             width/3, height/3, 0, 0, Math.PI * 2);
                    this.backgroundCtx.fill();
                    
                    this.backgroundCtx.fillStyle = this.darkenColor(baseColor, 10);
                }
                
                // Taş aralarındaki çizgiler
                this.backgroundCtx.strokeStyle = this.darkenColor(baseColor, 25);
                this.backgroundCtx.lineWidth = 0.7;
                for (let i = 0; i < 2; i++) {
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.moveTo((random(i + 50) - 0.5) * this.tileWidth / 2, 0);
                    this.backgroundCtx.lineTo((random(i + 60) - 0.5) * this.tileWidth / 2, this.tileHeight);
                    this.backgroundCtx.stroke();
                }
                break;
                
            case 'cloud':
                // Daha sık ve beyaz bulutlar
                this.backgroundCtx.fillStyle = baseColor;
                
                for (let i = 0; i < 15; i++) { // Daha fazla bulut
                    const cloudX = (random(i) - 0.5) * this.tileWidth / 1.2;
                    const cloudY = random(i + 10) * this.tileHeight;
                    const size = 3 + random(i + 20) * 6; // Daha küçük boyut
                    
                    // Tam dairesel bulut
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.arc(cloudX, cloudY, size, 0, Math.PI * 2);
                    this.backgroundCtx.fill();
                    
                    // Bulut gölgeleri (çok hafif)
                    this.backgroundCtx.fillStyle = this.darkenColor(baseColor, 2); // Çok hafif gölge
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.arc(cloudX + 1, cloudY + 1, size * 0.9, 0, Math.PI * 2);
                    this.backgroundCtx.fill();
                    
                    this.backgroundCtx.fillStyle = baseColor;
                }
                break;
                
            case 'marble':
                this.backgroundCtx.strokeStyle = this.darkenColor(baseColor, 10);
                this.backgroundCtx.lineWidth = 1;
                for (let i = 0; i < 8; i++) {
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.moveTo(-this.tileWidth/2, random(i) * this.tileHeight);
                    this.backgroundCtx.bezierCurveTo(
                        -this.tileWidth/4, random(i + 10) * this.tileHeight,
                        this.tileWidth/4, random(i + 20) * this.tileHeight,
                        this.tileWidth/2, random(i + 30) * this.tileHeight
                    );
                    this.backgroundCtx.stroke();
                }
                
                this.backgroundCtx.fillStyle = this.darkenColor(baseColor, 5);
                for (let i = 0; i < 4; i++) {
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.ellipse(
                        (random(i + 40) - 0.5) * this.tileWidth / 2,
                        random(i + 50) * this.tileHeight,
                        3 + random(i + 60) * 4,
                        1 + random(i + 70) * 2,
                        random(i + 80) * Math.PI,
                        0, Math.PI * 2
                    );
                    this.backgroundCtx.fill();
                }
                break;
                
            case 'cobblestone':
                // Her tile'a bir izometrik sekizgen
                this.backgroundCtx.fillStyle = baseColor;
                
                // İzometrik sekizgen çizimi
                this.backgroundCtx.beginPath();
                
                // Sekizgenin köşe noktaları (izometrik perspektifte)
                const size = 15; // Sekizgen boyutu
                
                // Üst noktalar
                this.backgroundCtx.moveTo(0, -size/2);
                this.backgroundCtx.lineTo(size/2, -size/4);
                this.backgroundCtx.lineTo(size/2, size/4);
                this.backgroundCtx.lineTo(0, size/2);
                this.backgroundCtx.lineTo(-size/2, size/4);
                this.backgroundCtx.lineTo(-size/2, -size/4);
                this.backgroundCtx.closePath();
                
                this.backgroundCtx.fill();
                
                // Sekizgen kenarları
                this.backgroundCtx.strokeStyle = this.darkenColor(baseColor, 20);
                this.backgroundCtx.lineWidth = 1;
                this.backgroundCtx.stroke();
                break;
                
            case 'street':
                // İzometrik sokak görünümü
                this.backgroundCtx.fillStyle = baseColor;
                
                // İzometrik dörtgen çizimi
                this.backgroundCtx.beginPath();
                this.backgroundCtx.moveTo(-this.tileWidth/2, 0);
                this.backgroundCtx.lineTo(0, this.tileHeight/2);
                this.backgroundCtx.lineTo(this.tileWidth/2, 0);
                this.backgroundCtx.lineTo(0, -this.tileHeight/2);
                this.backgroundCtx.closePath();
                this.backgroundCtx.fill();
                
                // Yol çizgileri (izometrik)
                this.backgroundCtx.strokeStyle = this.lightenColor(baseColor, 40);
                this.backgroundCtx.lineWidth = 2;
                
                // Merkez çizgisi
                this.backgroundCtx.beginPath();
                this.backgroundCtx.moveTo(-this.tileWidth/4, this.tileHeight/4);
                this.backgroundCtx.lineTo(this.tileWidth/4, -this.tileHeight/4);
                this.backgroundCtx.stroke();
                
                // Yan çizgiler
                this.backgroundCtx.beginPath();
                this.backgroundCtx.moveTo(-this.tileWidth/3, this.tileHeight/6);
                this.backgroundCtx.lineTo(this.tileWidth/6, -this.tileHeight/3);
                this.backgroundCtx.stroke();
                
                this.backgroundCtx.beginPath();
                this.backgroundCtx.moveTo(-this.tileWidth/6, this.tileHeight/3);
                this.backgroundCtx.lineTo(this.tileWidth/3, -this.tileHeight/6);
                this.backgroundCtx.stroke();
                
                // Yol işaretleri
                this.backgroundCtx.fillStyle = this.lightenColor(baseColor, 60);
                for (let i = 0; i < 3; i++) {
                    const markerX = (random(i) - 0.5) * this.tileWidth / 3;
                    const markerY = (random(i + 10) - 0.5) * this.tileHeight / 3;
                    
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.ellipse(markerX, markerY, 2, 1, 0, 0, Math.PI * 2);
                    this.backgroundCtx.fill();
                }
                break;
                
            case 'snow':
                // Kar efekti
                this.backgroundCtx.fillStyle = baseColor;
                
                // Kar taneleri
                for (let i = 0; i < 20; i++) {
                    const flakeX = (random(i) - 0.5) * this.tileWidth / 1.2;
                    const flakeY = random(i + 10) * this.tileHeight;
                    const size = 1 + random(i + 20) * 3;
                    
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.arc(flakeX, flakeY, size, 0, Math.PI * 2);
                    this.backgroundCtx.fill();
                }
                
                // Buz kristalleri
                this.backgroundCtx.strokeStyle = this.lightenColor(baseColor, 10);
                this.backgroundCtx.lineWidth = 1;
                for (let i = 0; i < 8; i++) {
                    const crystalX = (random(i + 30) - 0.5) * this.tileWidth / 1.5;
                    const crystalY = random(i + 40) * this.tileHeight;
                    const arms = 4 + Math.floor(random(i + 50) * 4);
                    
                    this.backgroundCtx.beginPath();
                    for (let j = 0; j < arms; j++) {
                        const angle = (j * 2 * Math.PI) / arms;
                        const armLength = 2 + random(i + 60) * 4;
                        
                        this.backgroundCtx.moveTo(crystalX, crystalY);
                        this.backgroundCtx.lineTo(
                            crystalX + Math.cos(angle) * armLength,
                            crystalY + Math.sin(angle) * armLength
                        );
                    }
                    this.backgroundCtx.stroke();
                }
                break;
                
            case 'mosaic':
                // Pastel renkli mozaik
                const shapes = 12; // Mozaik parçası sayısı
                
                for (let i = 0; i < shapes; i++) {
                    // Pastel renk seçimi
                    const colorIndex = Math.floor(random(i) * this.colors.mosaic.length);
                    const shapeColor = this.colors.mosaic[colorIndex];
                    
                    this.backgroundCtx.fillStyle = shapeColor;
                    
                    const shapeX = (random(i) - 0.5) * this.tileWidth / 1.2;
                    const shapeY = random(i + 10) * this.tileHeight;
                    const size = 5 + random(i + 20) * 8;
                    
                    // Rastgele şekil seçimi
                    const shapeType = Math.floor(random(i + 30) * 4);
                    
                    this.backgroundCtx.beginPath();
                    
                    switch(shapeType) {
                        case 0: // Üçgen
                            this.backgroundCtx.moveTo(shapeX, shapeY - size/2);
                            this.backgroundCtx.lineTo(shapeX + size/2, shapeY + size/2);
                            this.backgroundCtx.lineTo(shapeX - size/2, shapeY + size/2);
                            break;
                            
                        case 1: // Dörtgen (izometrik)
                            this.backgroundCtx.moveTo(shapeX - size/2, shapeY);
                            this.backgroundCtx.lineTo(shapeX, shapeY - size/2);
                            this.backgroundCtx.lineTo(shapeX + size/2, shapeY);
                            this.backgroundCtx.lineTo(shapeX, shapeY + size/2);
                            break;
                            
                        case 2: // Beşgen
                            for (let j = 0; j < 5; j++) {
                                const angle = (j * 2 * Math.PI) / 5;
                                const pentX = shapeX + size * Math.cos(angle);
                                const pentY = shapeY + size * Math.sin(angle);
                                
                                if (j === 0) {
                                    this.backgroundCtx.moveTo(pentX, pentY);
                                } else {
                                    this.backgroundCtx.lineTo(pentX, pentY);
                                }
                            }
                            break;
                            
                        case 3: // Altıgen
                            for (let j = 0; j < 6; j++) {
                                const angle = (j * 2 * Math.PI) / 6;
                                const hexX = shapeX + size * Math.cos(angle);
                                const hexY = shapeY + size * Math.sin(angle);
                                
                                if (j === 0) {
                                    this.backgroundCtx.moveTo(hexX, hexY);
                                } else {
                                    this.backgroundCtx.lineTo(hexX, hexY);
                                }
                            }
                            break;
                    }
                    
                    this.backgroundCtx.closePath();
                    this.backgroundCtx.fill();
                    
                    // Mozaik parçası kenarları
                    this.backgroundCtx.strokeStyle = this.darkenColor(shapeColor, 10);
                    this.backgroundCtx.lineWidth = 0.5;
                    this.backgroundCtx.stroke();
                }
                break;
        }
        
        this.backgroundCtx.restore();
    }

    darkenColor(color, percent) {
        const num = parseInt(color.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 0 ? 0 : R) * 0x10000 + (G < 0 ? 0 : G) * 0x100 + (B < 0 ? 0 : B)).toString(16).slice(1);
    }

    lightenColor(color, percent) {
        const num = parseInt(color.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R) * 0x10000 + (G > 255 ? 255 : G) * 0x100 + (B > 255 ? 255 : B)).toString(16).slice(1);
    }

    // Mevcut arkaplan tipini değiştirmek için
    changeType(canvas, newType) {
        if (!this.isCreated) {
            console.warn('Arkaplan henüz oluşturulmadı. Önce create() metodunu çağırın.');
            return;
        }
        
        this.create(canvas, newType);
    }

    // Seed değerini değiştirmek için (isteğe bağlı)
    setSeed(newSeed) {
        this.backgroundSeed = newSeed;
        if (this.isCreated && this.currentType) {
            this.generateBackground(this.currentType);
        }
    }

    // Tip isimlerini almak için
    getTypeName(type, language = 'Tr') {
        if (this.Types[type] && this.Types[type][language]) {
            return this.Types[type][language];
        }
        return type;
    }

    // Tüm tipleri listelemek için
    getAllTypes() {
        return Object.keys(this.Types);
    }
}

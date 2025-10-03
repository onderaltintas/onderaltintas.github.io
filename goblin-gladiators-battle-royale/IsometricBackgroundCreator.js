class IsometricBackgroundCreator {
    constructor() {
        this.backgroundCanvas = null;
        this.backgroundCtx = null;
        this.currentType = null;
        this.backgroundSeed = Math.random() * 1000;
        this.isCreated = false;
        
        // Renk paletleri
        this.colors = {
            desert: ['#f4d742', '#e5c135', '#d6ac29', '#c7991e'],
            grass: ['#7cfc00', '#70e000', '#64c400', '#58a800'],
            wood: ['#e8c46e', '#d4b15f', '#c09e51', '#ac8b43'], // Açık tonlara ayarlandı
            stone: ['#c4c4c4', '#b0b0b0', '#9c9c9c', '#888888'], // Açık tonlara ayarlandı
            cloud: ['#ffffff', '#f8f8f8', '#f0f0f0', '#e8e8e8'],
            marble: ['#f5f5f5', '#e8e8e8', '#dbdbdb', '#cecece'],
            cobblestone: ['#a8a8a8', '#989898', '#888888', '#787878'],
            street: ['#4a4a4a', '#555555', '#606060', '#6b6b6b']
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
            gradient.addColorStop(1, '#E0F7FF'); // Daha açık mavi
            this.backgroundCtx.fillStyle = gradient;
            this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
            
            // Gökkuşağı efekti
            this.drawRainbow();
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

    drawRainbow() {
        const rainbowColors = [
            'rgba(255, 0, 0, 0.3)',     // Kırmızı
            'rgba(255, 165, 0, 0.3)',   // Turuncu
            'rgba(255, 255, 0, 0.3)',   // Sarı
            'rgba(0, 255, 0, 0.3)',     // Yeşil
            'rgba(0, 0, 255, 0.3)',     // Mavi
            'rgba(75, 0, 130, 0.3)',    // Çivit
            'rgba(238, 130, 238, 0.3)'  // Mor
        ];
        
        const centerX = this.backgroundCanvas.width / 2;
        const startY = this.backgroundCanvas.height * 0.1;
        const radius = this.backgroundCanvas.width * 0.3;
        
        for (let i = 0; i < rainbowColors.length; i++) {
            this.backgroundCtx.beginPath();
            this.backgroundCtx.arc(centerX, this.backgroundCanvas.height + 50, radius - i * 15, Math.PI, 2 * Math.PI);
            this.backgroundCtx.strokeStyle = rainbowColors[i];
            this.backgroundCtx.lineWidth = 10;
            this.backgroundCtx.stroke();
        }
    }

    drawIsometricTile(x, y, type, gridX, gridY) {
        const colorVariants = this.colors[type];
        
        const colorIndex = Math.abs(Math.floor(Math.sin(gridX * 12.9898 + gridY * 78.233 + this.backgroundSeed) * 43758.5453)) % colorVariants.length;
        const baseColor = colorVariants[colorIndex];
        
        this.backgroundCtx.beginPath();
        this.backgroundCtx.moveTo(x, y);
        this.backgroundCtx.lineTo(x + this.tileWidth / 2, y + this.tileHeight / 2);
        this.backgroundCtx.lineTo(x, y + this.tileHeight);
        this.backgroundCtx.lineTo(x - this.tileWidth / 2, y + this.tileHeight / 2);
        this.backgroundCtx.closePath();
        
        this.backgroundCtx.fillStyle = baseColor;
        this.backgroundCtx.fill();
        
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
                this.backgroundCtx.strokeStyle = this.darkenColor(baseColor, 15); // Daha açık kontur
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
                
                this.backgroundCtx.fillStyle = this.darkenColor(baseColor, 20); // Daha açık düğümler
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
                this.backgroundCtx.fillStyle = this.darkenColor(baseColor, 15); // Daha az koyu
                for (let i = 0; i < 8; i++) {
                    const stoneX = (random(i) - 0.5) * this.tileWidth / 1.5;
                    const stoneY = random(i + 10) * this.tileHeight;
                    const width = 3 + random(i + 20) * 6;
                    const height = 3 + random(i + 30) * 4;
                    
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.ellipse(stoneX, stoneY, width, height, random(i + 40) * Math.PI, 0, Math.PI * 2);
                    this.backgroundCtx.fill();
                }
                
                this.backgroundCtx.strokeStyle = this.darkenColor(baseColor, 25); // Daha açık çizgiler
                this.backgroundCtx.lineWidth = 0.7;
                for (let i = 0; i < 3; i++) {
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.moveTo((random(i + 50) - 0.5) * this.tileWidth / 2, 0);
                    this.backgroundCtx.lineTo((random(i + 60) - 0.5) * this.tileWidth / 2, this.tileHeight);
                    this.backgroundCtx.stroke();
                    
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.moveTo(-this.tileWidth/2, random(i + 70) * this.tileHeight);
                    this.backgroundCtx.lineTo(this.tileWidth/2, random(i + 80) * this.tileHeight);
                    this.backgroundCtx.stroke();
                }
                break;
                
            case 'cloud':
                this.backgroundCtx.fillStyle = this.lightenColor(baseColor, 10);
                for (let i = 0; i < 5; i++) {
                    const cloudX = (random(i) - 0.5) * this.tileWidth / 1.5;
                    const cloudY = random(i + 10) * this.tileHeight;
                    const size = 5 + random(i + 20) * 10;
                    
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.arc(cloudX, cloudY, size, 0, Math.PI * 2);
                    this.backgroundCtx.fill();
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
                this.backgroundCtx.strokeStyle = this.darkenColor(baseColor, 20);
                this.backgroundCtx.lineWidth = 1.5;
                
                // Taş sınırları
                for (let i = 0; i < 6; i++) {
                    const offsetX = (random(i) - 0.5) * this.tileWidth / 4;
                    const offsetY = (random(i + 10) - 0.5) * this.tileHeight / 2;
                    
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.arc(offsetX, offsetY, 8 + random(i + 20) * 10, 0, Math.PI * 2);
                    this.backgroundCtx.stroke();
                }
                
                // Taş dokusu
                this.backgroundCtx.fillStyle = this.darkenColor(baseColor, 10);
                for (let i = 0; i < 12; i++) {
                    const stoneX = (random(i + 30) - 0.5) * this.tileWidth / 1.5;
                    const stoneY = random(i + 40) * this.tileHeight;
                    const size = 2 + random(i + 50) * 3;
                    
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.arc(stoneX, stoneY, size, 0, Math.PI * 2);
                    this.backgroundCtx.fill();
                }
                break;
                
            case 'street':
                this.backgroundCtx.fillStyle = this.darkenColor(baseColor, 5);
                this.backgroundCtx.fillRect(-this.tileWidth/2, 0, this.tileWidth, this.tileHeight);
                
                // Yol çizgileri
                this.backgroundCtx.strokeStyle = this.lightenColor(baseColor, 40);
                this.backgroundCtx.lineWidth = 2;
                this.backgroundCtx.setLineDash([10, 5]);
                
                this.backgroundCtx.beginPath();
                this.backgroundCtx.moveTo(-this.tileWidth/3, this.tileHeight/2);
                this.backgroundCtx.lineTo(this.tileWidth/3, this.tileHeight/2);
                this.backgroundCtx.stroke();
                
                this.backgroundCtx.setLineDash([]);
                
                // Yol işaretleri
                this.backgroundCtx.fillStyle = this.lightenColor(baseColor, 50);
                for (let i = 0; i < 2; i++) {
                    this.backgroundCtx.beginPath();
                    this.backgroundCtx.arc(
                        (random(i + 60) - 0.5) * this.tileWidth / 4,
                        this.tileHeight * 0.7,
                        3, 0, Math.PI * 2
                    );
                    this.backgroundCtx.fill();
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
}

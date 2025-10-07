class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.backgroundCreator = new IsometricBackgroundCreator();
        
        this.settings = {
            SHOW_HEALTH_BARS: false,
            NUMBER_OF_GOBLINS: 150,
            SPRITE_WIDTH: 128,
            SPRITE_HEIGHT: 128
        };

        this.goblins = [];
        this.bullets = [];
        this.spriteVariants = [];
        
        // Yeni özellikler
        this.state = "title"; // "title", "fighting", "betting", "gameOver"
        this.playerGold = 100;
        this.selectedGoblin = null;
        this.arenaName = "";
        this.titleAlpha = 0;
        this.titleFadeIn = true;
        this.winnerGoblin = null;
        this.places = [];
        this.names = [];
        this.lastFiveGoblins = [];
        this.betAmount = 20;
        this.showArenaName = true;
        
        // Düzeltme 2 ve 3 için sayaçlar
        this.gameOverTick = 0;
        this.titleDisplayTick = 0; 

        this.init();
    }

    async init() {
        // Canvas boyutunu ayarla
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Arkaplanı oluştur
        const backgroundTypes = [];
        for (const key in this.backgroundCreator.colors) {
            backgroundTypes.push(key);
        }
        const randomBackground = backgroundTypes[Math.floor(Math.random() * backgroundTypes.length)];
        this.backgroundCreator.create(this.canvas, randomBackground);

        // Pencere boyutu değişikliği dinleyicisi
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });

        // places.json ve names.json yükle
        try {
            const placesResponse = await fetch('js/places.json');
            this.places = await placesResponse.json();
            const namesResponse = await fetch('js/names.json');
            this.names = await namesResponse.json();
        } catch (error) {
            console.error('Dosyalar yüklenirken hata oluştu:', error);
            // Varsayılan değerler
            this.places = ["Default Arena"];
            this.names = ["Goblin"];
        }

        // Arena ismini seç
        this.arenaName = this.places[Math.floor(Math.random() * this.places.length)];

        // Sprite sheet'i yükle
        this.spriteSheet = new Image();
        this.spriteSheet.src = "assets/sprites.png";
        this.spriteSheet.onload = () => this.onSpriteSheetLoaded();
    }

    onSpriteSheetLoaded() {
        // Sprite varyantlarını oluştur
        for (let i = 0; i < 8; i++) {
            const off = document.createElement("canvas");
            off.width = this.spriteSheet.width;
            off.height = this.spriteSheet.height;
            const offCtx = off.getContext("2d");
            offCtx.filter = `hue-rotate(${i * 45}deg)`;
            offCtx.drawImage(this.spriteSheet, 0, 0);
            offCtx.filter = "none";
            this.spriteVariants.push(off);
        }

        this.startNewRound();
    }

    startNewRound() {
        this.goblins = [];
        this.bullets = [];
        this.state = "title";
        this.titleAlpha = 0;
        this.titleFadeIn = true;
        this.selectedGoblin = null;
        this.showArenaName = true;
        this.gameOverTick = 0; // Sayaçları sıfırla
        this.titleDisplayTick = 0; // Sayaçları sıfırla

        // Eğer bir önceki kazanan varsa, onu ekle
        if (this.winnerGoblin) {
            this.goblins.push(this.winnerGoblin);
            // Kazanan goblin'in konumunu sıfırla
            this.winnerGoblin.x = Math.random() * this.canvas.width;
            this.winnerGoblin.y = Math.random() * this.canvas.height;
            this.winnerGoblin.state = "walking";
            this.winnerGoblin.health = this.winnerGoblin.maxHealth;
        }

        // Kalan goblinleri oluştur
        const remainingGoblins = this.settings.NUMBER_OF_GOBLINS - this.goblins.length;
        for (let i = 0; i < remainingGoblins; i++) {
            this.goblins.push(this.createRandomGoblin());
        }

        // Arena ismini güncelle
        this.arenaName = this.places[Math.floor(Math.random() * this.places.length)];
        
        this.gameLoop();
    }

    createRandomGoblin() {
        const goblin = new Goblin(
            Math.random() * this.canvas.width,
            Math.random() * this.canvas.height,
            this
        );

        // Rastgele isim ve soyisim
        goblin.firstName = this.names[Math.floor(Math.random() * this.names.length)];
        goblin.lastName = this.names[Math.floor(Math.random() * this.names.length)];

        // Health: 80-120
        goblin.maxHealth = Math.floor(Math.random() * 41) + 80;
        goblin.health = goblin.maxHealth;

        // Attack power: 15-25
        goblin.attackPower = Math.floor(Math.random() * 11) + 15;

        // Kill count
        goblin.killCount = 0;

        return goblin;
    }

    gameLoop() {
        // Arkaplanı güncelle
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.backgroundCreator.update(this.canvas);

        // State'e göre güncelleme
        if (this.state === "title") {
            this.updateTitle();
        } else if (this.state === "fighting") {
            this.updateFighting();
        } else if (this.state === "betting") {
            this.updateBetting();
        } else if (this.state === "gameOver") {
            this.updateGameOver();
        }

        // Çizimler
        

        for (let g of this.goblins) g.draw(this.ctx);
        for (let b of this.bullets) b.draw(this.ctx);

        if (this.state === "title") {
            this.drawTitle();
        } else if (this.state === "betting") {
            this.drawBetting();
        } else if (this.state === "gameOver") {
            this.drawGameOver();
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    updateTitle() {
        // Düzeltme 2: Title ekranındaki setTimeout'u titleDisplayTick ile değiştirerek arena isminin daha uzun süre ve düzgün görünmesini sağla
        if (this.titleFadeIn) {
            this.titleAlpha += 0.02;
            if (this.titleAlpha >= 1) {
                this.titleAlpha = 1;
                this.titleFadeIn = false;
                this.titleDisplayTick = 0; // Ekranın tam görünür olduğu anı başlat
            }
        } else {
            this.titleDisplayTick++;
            // 2 saniye (120 kare) bekle
            if (this.titleDisplayTick >= 120) { 
                this.titleAlpha -= 0.02;
                if (this.titleAlpha <= 0) {
                    this.state = "fighting";
                    this.showArenaName = false;
                }
            }
        }
    }

    updateFighting() {
        for (let i = this.goblins.length - 1; i >= 0; i--) {
            this.goblins[i].update();
        }

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
        }

        // Eğer 5 goblin kaldıysa bet moduna geç
        if (this.goblins.length <= 5 && this.state !== "betting" && this.state !== "gameOver") {
            this.state = "betting";
            this.lastFiveGoblins = [...this.goblins];
            // Health barları göster
            this.settings.SHOW_HEALTH_BARS = true;
        }

        // Eğer 1 goblin kaldıysa game over
        if (this.goblins.length === 1 && this.state !== "gameOver") {
            this.winnerGoblin = this.goblins[0];
            this.state = "gameOver";
            this.gameOverTick = 0; // Game over sayacını başlat
            
            // Eğer seçilen goblin kazandıysa ödül ver
            if (this.selectedGoblin === this.winnerGoblin) {
                this.playerGold += this.betAmount * 2;
            }
        }
    }

    updateBetting() {
        // Bet modunda goblinler hareket etmeye devam eder
        for (let i = this.goblins.length - 1; i >= 0; i--) {
            this.goblins[i].update();
        }

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
        }

        // Eğer 1 goblin kaldıysa game over
        if (this.goblins.length === 1 && this.state !== "gameOver") {
            this.winnerGoblin = this.goblins[0];
            this.state = "gameOver";
            this.gameOverTick = 0; // Game over sayacını başlat
            
            // Eğer seçilen goblin kazandıysa ödül ver
            if (this.selectedGoblin === this.winnerGoblin) {
                this.playerGold += this.betAmount * 2;
            }
        }
        
        // Düzeltme 1'i desteklemek için: Eğer bahis yapılmadıysa ve 5 saniye geçtiyse, bahis listesini kaldırmak için otomatik olarak fighting'e dön.
        if (!this.selectedGoblin) {
            this.titleDisplayTick++; // titleDisplayTick'i bahis bekleme süresi olarak kullan
            // 5 saniye (300 kare) sonra otomatik olarak fighting'e dön
            if (this.titleDisplayTick > 300) {
                 this.state = "fighting";
                 this.titleDisplayTick = 0;
            }
        }
    }

    updateGameOver() {
        // Düzeltme 2 ve 3: setTimeout yerine frame sayacı kullanarak oyun sonu ekranını tut ve sonra yeniden başlat
        this.gameOverTick++;
        // 5 saniye (300 kare) sonra yeni round başlat
        if (this.gameOverTick > 300) { 
            this.startNewRound();
        }
    }

    drawTitle() {
        if (!this.showArenaName) return;
        
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.titleAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = "48px Arial";
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.titleAlpha})`;
        this.ctx.textAlign = "center";
        this.ctx.fillText(`${this.arenaName} Arena`, this.canvas.width / 2, this.canvas.height / 2);
    }

    drawBetting() {
        // Goblin listesini çiz
        const listWidth = 300;
        const listHeight = this.lastFiveGoblins.length * 30 + 50;
        const startX = this.canvas.width - listWidth - 20;
        const startY = 20;

        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(startX, startY, listWidth, listHeight);

        this.ctx.font = "14px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "left";

        // Başlık
        this.ctx.font = "16px Arial";
        this.ctx.fillText("Surviving Goblins", startX + 10, startY + 20);
        
        this.ctx.font = "14px Arial";
        let yOffset = startY + 40;
        this.lastFiveGoblins.forEach((goblin, index) => {
            const isSelected = this.selectedGoblin === goblin;
            const text = `${goblin.firstName} ${goblin.lastName} - Kills: ${goblin.killCount}`;
            
            // Seçili goblin farklı renkte
            this.ctx.fillStyle = isSelected ? "gold" : "white";
            this.ctx.fillText(text, startX + 10, yOffset);
            
            // Bet butonu
            const buttonText = isSelected ? "BET PLACED" : `🪙 Bet ${this.betAmount}`;
            this.ctx.fillStyle = isSelected ? "gray" : "gold";
            this.ctx.fillText(buttonText, startX + listWidth - 80, yOffset);
            
            yOffset += 20;
        });

        // Altın miktarını göster
        this.ctx.fillStyle = "gold";
        this.ctx.fillText(`Gold: ${this.playerGold} 🪙`, startX + 10, yOffset + 10);
    }

    drawGameOver() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = "36px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(`Congratulations ${this.winnerGoblin.firstName} ${this.winnerGoblin.lastName}!`, this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = "24px Arial";
        if (this.selectedGoblin === this.winnerGoblin) {
            this.ctx.fillStyle = "gold";
            this.ctx.fillText(`You won ${this.betAmount * 2} gold!`, this.canvas.width / 2, this.canvas.height / 2);
        } else {
            this.ctx.fillText("Better luck next time!", this.canvas.width / 2, this.canvas.height / 2);
        }
        
        this.ctx.font = "18px Arial";
        // Düzeltme 3: Oyun sonu bekleme süresini göster
        const secondsLeft = Math.ceil((300 - this.gameOverTick) / 60);
        this.ctx.fillText(`Next round starting in ${secondsLeft} seconds...`, this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    // Bet butonlarına tıklama işlemi için
    handleClick(x, y) {
        if (this.state === "betting") {
            const listWidth = 300;
            const listHeight = this.lastFiveGoblins.length * 30 + 50;
            const startX = this.canvas.width - listWidth - 20;
            const startY = 20;

            // Tıklama listenin içinde mi?
            if (x >= startX && x <= startX + listWidth && y >= startY && y <= startY + listHeight) {
                const itemHeight = 20;
                const index = Math.floor((y - startY - 40) / itemHeight);
                
                if (index >= 0 && index < this.lastFiveGoblins.length) {
                    const goblin = this.lastFiveGoblins[index];
                    
                    // Eğer yeterli altın varsa ve daha önce seçilmemişse
                    if (this.playerGold >= this.betAmount && !this.selectedGoblin) {
                        this.selectedGoblin = goblin;
                        this.playerGold -= this.betAmount;
                        // Düzeltme 1: Bahis yapıldıktan sonra listeyi kaldırmak için durumu hemen fighting'e çevir.
                        this.state = "fighting"; 
                    }
                }
            }
        }
    }
}
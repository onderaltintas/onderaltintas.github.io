class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.backgroundCreator = new IsometricBackgroundCreator();
        this.settings = new GameSettings();
        
        this.goblins = [];
        this.bullets = [];
        this.spriteVariants = [];
        
        // Yeni özellikler
        this.state = "title";
        this.playerGold = 100;
        this.selectedGoblin = null;
        this.arenaName = "";
        this.titleAlpha = 0;
        this.titleFadeIn = true;
        this.winnerGoblin = null;
        this.places = [];
        this.names = [];
        this.lastFiveGoblins = [];
        this.betAmount = this.settings.INITIAL_BET_AMOUNT;
        this.showArenaName = true;
        this.betPlaced = false;
        this.gameOverTimer = null;

        this.init();
    }

    async init() {
        // Canvas boyutunu ayarla ve mobil uyumlu yap
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Arkaplanı oluştur
        const backgroundTypes = [];
        for (const key in this.backgroundCreator.colors) {
            backgroundTypes.push(key);
        }
        const randomBackground = backgroundTypes[Math.floor(Math.random() * backgroundTypes.length)];
        this.backgroundCreator.create(this.canvas, randomBackground);

        // Dosyaları yükle
        try {
            const placesResponse = await fetch('js/places.json');
            this.places = await placesResponse.json();
            const namesResponse = await fetch('js/names.json');
            this.names = await namesResponse.json();
        } catch (error) {
            console.error('Dosyalar yüklenirken hata oluştu:', error);
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

    resizeCanvas() {
        // Mobil uyumlu canvas boyutu
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Arkaplanı yeniden oluştur
        if (this.backgroundCreator && this.backgroundCreator.isCreated) {
            this.backgroundCreator.create(this.canvas, this.backgroundCreator.currentType);
        }
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
        // Önceki timer'ı temizle
        if (this.gameOverTimer) {
            clearTimeout(this.gameOverTimer);
            this.gameOverTimer = null;
        }

        this.goblins = [];
        this.bullets = [];
        this.state = "title";
        this.titleAlpha = 0;
        this.titleFadeIn = true;
        this.selectedGoblin = null;
        this.betPlaced = false;
        this.showArenaName = true;
        this.winnerGoblin = null;
        this.betAmount = this.settings.INITIAL_BET_AMOUNT;

        // Eğer bir önceki kazanan varsa, onu ekle
        if (this.winnerGoblin) {
            this.goblins.push(this.winnerGoblin);
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

        // Settings'ten health değerleri
        goblin.maxHealth = Math.floor(Math.random() * (this.settings.GOBLIN_MAX_HEALTH - this.settings.GOBLIN_MIN_HEALTH + 1)) + this.settings.GOBLIN_MIN_HEALTH;
        goblin.health = goblin.maxHealth;

        // Settings'ten attack power değerleri
        goblin.attackPower = Math.floor(Math.random() * (this.settings.GOBLIN_MAX_ATTACK_POWER - this.settings.GOBLIN_MIN_ATTACK_POWER + 1)) + this.settings.GOBLIN_MIN_ATTACK_POWER;

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
        this.titleAlpha += this.titleFadeIn ? 0.02 : -0.02;
        if (this.titleAlpha >= 1) {
            this.titleAlpha = 1;
            setTimeout(() => {
                this.titleFadeIn = false;
            }, 2000);
        } else if (this.titleAlpha <= 0) {
            this.state = "fighting";
            this.showArenaName = false;
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
            this.settings.SHOW_HEALTH_BARS = true;
        }

        // Eğer 1 goblin kaldıysa game over
        if (this.goblins.length === 1 && this.state !== "gameOver") {
            this.winnerGoblin = this.goblins[0];
            this.state = "gameOver";
            
            if (this.selectedGoblin === this.winnerGoblin) {
                this.playerGold += this.betAmount * 2;
            }
            
            this.startGameOverTimer();
        }
    }

    updateBetting() {
        // Ölü goblinleri listeden çıkar ve bahis miktarını azalt
        this.lastFiveGoblins = this.lastFiveGoblins.filter(goblin => 
            this.goblins.includes(goblin) && goblin.state !== "dying"
        );

        // Eğer goblin öldüyse ve bahis henüz yapılmadıysa, bahis miktarını azalt
        if (!this.betPlaced && this.lastFiveGoblins.length < 5) {
            const newBetAmount = Math.max(
                this.settings.MIN_BET_AMOUNT, 
                this.betAmount - this.settings.BET_REDUCTION_ON_DEATH
            );
            
            if (newBetAmount < this.betAmount) {
                this.betAmount = newBetAmount;
                console.log(`Goblin öldü! Bahis miktarı ${this.betAmount} altına düştü.`);
            }
        }

        // Bet modunda goblinler hareket etmeye devam eder
        for (let i = this.goblins.length - 1; i >= 0; i--) {
            this.goblins[i].update();
        }

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
        }

        // Eğer 1 goblin kaldıysa game over
        if (this.goblins.length === 1) {
            this.winnerGoblin = this.goblins[0];
            this.state = "gameOver";
            
            if (this.selectedGoblin === this.winnerGoblin) {
                this.playerGold += this.betAmount * 2;
            }
            
            this.startGameOverTimer();
        }
    }

    updateGameOver() {
        // Game over state'inde özel bir update gerekmiyor
    }

    startGameOverTimer() {
        if (this.gameOverTimer) {
            clearTimeout(this.gameOverTimer);
        }
        
        this.gameOverTimer = setTimeout(() => {
            this.startNewRound();
        }, 3000);
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
        // Eğer bahis yapıldıysa liste gösterilmez
        if (this.betPlaced) return;

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
        this.ctx.fillText("Next round starting soon...", this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    handleClick(x, y) {
        if (this.state === "betting" && !this.betPlaced) {
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
                        this.betPlaced = true;
                    }
                }
            }
        }
    }
}
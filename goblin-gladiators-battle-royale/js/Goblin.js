class Goblin {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        
        const directions = [
            [-1, 0], [-1, -1], [0, -1], [1, -1],
            [1, 0], [1, 1], [0, 1], [-1, 1]
        ];
        const randomDir = directions[Math.floor(Math.random() * directions.length)];
        
        this.dirX = randomDir[0];
        this.dirY = randomDir[1];
        this.speed = 1.5;
        this.frame = 0;
        this.frameTick = Math.floor(Math.random() * 10);
        this.fireCooldown = Math.floor(Math.random() * 120);
        this.variant = Math.floor(Math.random() * 8);
        
        this.state = "walking";
        this.animationFrame = 0;
        this.animationTick = 0;
        
        // Yeni özellikler
        this.firstName = "";
        this.lastName = "";
        this.maxHealth = 100;
        this.health = 100;
        this.attackPower = 20;
        this.killCount = 0;
        
        this.walkType = Math.random() < 0.5 ? 0 : 1;
        this.deathType = Math.random() < 0.5 ? 0 : 1;
        
        this.idleTimer = 0;
        this.idleDuration = 60 + Math.floor(Math.random() * 120);
        
        this.halfWidth = 64;
        this.halfHeight = 64;
    }

    getDirectionIndex() {
        if (this.dirX === -1 && this.dirY === 0) return 0;
        if (this.dirX === -1 && this.dirY === -1) return 1;
        if (this.dirX === 0 && this.dirY === -1) return 2;
        if (this.dirX === 1 && this.dirY === -1) return 3;
        if (this.dirX === 1 && this.dirY === 0) return 4;
        if (this.dirX === 1 && this.dirY === 1) return 5;
        if (this.dirX === 0 && this.dirY === 1) return 6;
        if (this.dirX === -1 && this.dirY === 1) return 7;
        return 6;
    }

    getNeighborDirections() {
        const currentDir = this.getDirectionIndex();
        switch(currentDir) {
            case 0: return [7, 1];
            case 1: return [0, 2];
            case 2: return [1, 3];
            case 3: return [2, 4];
            case 4: return [3, 5];
            case 5: return [4, 6];
            case 6: return [5, 7];
            case 7: return [6, 0];
            default: return [0, 1];
        }
    }

    changeToNeighborDirection() {
        const neighbors = this.getNeighborDirections();
        const newDirIndex = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        switch(newDirIndex) {
            case 0: this.dirX = -1; this.dirY = 0; break;
            case 1: this.dirX = -1; this.dirY = -1; break;
            case 2: this.dirX = 0; this.dirY = -1; break;
            case 3: this.dirX = 1; this.dirY = -1; break;
            case 4: this.dirX = 1; this.dirY = 0; break;
            case 5: this.dirX = 1; this.dirY = 1; break;
            case 6: this.dirX = 0; this.dirY = 1; break;
            case 7: this.dirX = -1; this.dirY = 1; break;
        }
    }

    update() {
        if (this.state === "dying") {
            this.animationTick++;
            if (this.animationTick > 15) {
                this.animationFrame++;
                this.animationTick = 0;
                
                const deathFrames = this.deathType === 0 ? 6 : 8;
                if (this.animationFrame >= deathFrames) {
                    const idx = this.game.goblins.indexOf(this);
                    if (idx > -1) this.game.goblins.splice(idx, 1);
                }
            }
            return;
        }
        
        if (this.state === "attacking") {
            this.animationTick++;
            if (this.animationTick > 10) {
                this.animationFrame++;
                this.animationTick = 0;
                
                if (this.animationFrame >= 4) {
                    this.state = "walking";
                    this.animationFrame = 0;
                }
            }
            return;
        }
        
        if (this.state === "idle") {
            this.idleTimer++;
            this.animationTick++;
            
            if (this.animationTick > 15) {
                this.animationFrame = (this.animationFrame + 1) % 4;
                this.animationTick = 0;
            }
            
            if (this.idleTimer >= this.idleDuration) {
                this.state = "walking";
                this.idleTimer = 0;
                this.idleDuration = 60 + Math.floor(Math.random() * 120);
            }
            
            return;
        }

        if (this.state === "walking") {
            if (Math.random() < 0.005) {
                this.state = "idle";
                this.animationFrame = 0;
                this.animationTick = 0;
                return;
            }
            
            if (Math.random() < 0.01) {
                this.changeToNeighborDirection();
            }

            this.x += this.dirX * this.speed;
            this.y += this.dirY * this.speed;

            // Sınır kontrolü
            if (this.x < 0) {
                this.dirX = 1;
                this.x = 0;
            }
            if (this.x > this.game.canvas.width) {
                this.dirX = -1;
                this.x = this.game.canvas.width;
            }
            if (this.y < 0) {
                this.dirY = 1;
                this.y = 0;
            }
            if (this.y > this.game.canvas.height) {
                this.dirY = -1;
                this.y = this.game.canvas.height;
            }

            this.frameTick++;
            if (this.frameTick > 10) {
                this.frame = (this.frame + 1) % 8;
                this.frameTick = 0;
            }

            if (this.fireCooldown > 0) this.fireCooldown--;

            if (this.fireCooldown === 0) {
                const target = this.findTarget();
                if (target) {
                    this.shoot(target);
                    this.fireCooldown = 120 + Math.floor(Math.random() * 60);
                }
            }
        }
    }

    findTarget() {
        const rangeSq = 150 * 150;
        
        for (let g of this.game.goblins) {
            if (g !== this && g.state !== "dying") {
                const dx = g.x - this.x;
                const dy = g.y - this.y;
                const distanceSq = dx * dx + dy * dy;
                
                const dotProduct = this.dirX * dx + this.dirY * dy;
                if (dotProduct > 0 && distanceSq < rangeSq) {
                    return g;
                }
            }
        }
        return null;
    }

    shoot(target) {
        this.state = "attacking";
        this.animationFrame = 0;
        this.animationTick = 0;
        
        this.game.bullets.push(new Bullet(this.x, this.y, target.x, target.y, target, this, this.game));
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0 && this.state !== "dying") {
            this.state = "dying";
            this.animationFrame = 0;
            this.animationTick = 0;
        }
    }

    draw(ctx) {
        const dir = this.getDirectionIndex();
        let frame;
        
        if (this.state === "dying") {
            if (this.deathType === 0) {
                frame = 34 + this.animationFrame;
            } else {
                frame = 40 + this.animationFrame;
            }
        } else if (this.state === "attacking") {
            frame = 20 + this.animationFrame;
        } else if (this.state === "idle") {
            frame = this.animationFrame;
        } else {
            if (this.walkType === 0) {
                frame = 5 + this.frame;
            } else {
                frame = 13 + this.frame;
            }
        }

        ctx.drawImage(
            this.game.spriteVariants[this.variant],
            frame * this.game.settings.SPRITE_WIDTH, 
            dir * this.game.settings.SPRITE_HEIGHT, 
            this.game.settings.SPRITE_WIDTH, 
            this.game.settings.SPRITE_HEIGHT,
            this.x - this.halfWidth, 
            this.y - this.halfHeight, 
            128, 
            128
        );
        
        // Eğer bet modundaysa veya game over durumundaysa health bar ve isim göster
        if (this.game.state === "betting" || this.game.state === "gameOver") {
            // Health bar
            const barWidth = 64;
            const barHeight = 5;
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = "red";
            ctx.fillRect(this.x - barWidth/2, this.y - 80, barWidth, barHeight);
            ctx.fillStyle = "green";
            ctx.fillRect(this.x - barWidth/2, this.y - 80, barWidth * healthPercent, barHeight);

            // İsim
            ctx.font = "12px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText(`${this.firstName} ${this.lastName}`, this.x, this.y - 85);
        }
    }
}
class Bullet {
    constructor(x, y, targetX, targetY, target, shooter, game) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.target = target;
        this.shooter = shooter;
        this.game = game;
        this.progress = 0;
        this.speed = 0.05;
    }
    
    update() {
        this.progress += this.speed;
        
        if (this.progress >= 1) {
            if (this.game.goblins.includes(this.target) && this.target.state !== "dying") {
                this.target.takeDamage(this.shooter.attackPower);
                // Eğer hedef öldüyse, shooter'ın kill count'unu artır
                if (this.target.health <= 0) {
                    this.shooter.killCount++;
                }
            }
            
            const idx = this.game.bullets.indexOf(this);
            if (idx > -1) this.game.bullets.splice(idx, 1);
        }
    }
    
    draw(ctx) {
        const currentX = this.x + (this.targetX - this.x) * this.progress;
        const currentY = this.y + (this.targetY - this.y) * this.progress;
        
        ctx.beginPath();
        ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(currentX, currentY);
        ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
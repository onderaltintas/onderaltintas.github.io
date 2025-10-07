class GameSettings {
    constructor() {
        // Goblin settings
        this.GOBLIN_MIN_HEALTH = 80;
        this.GOBLIN_MAX_HEALTH = 120;
        this.GOBLIN_MIN_ATTACK_POWER = 15;
        this.GOBLIN_MAX_ATTACK_POWER = 25;
        
        // Game settings
        this.SHOW_HEALTH_BARS = false;
        this.NUMBER_OF_GOBLINS = 15;
        this.SPRITE_WIDTH = 128;
        this.SPRITE_HEIGHT = 128;
        this.INITIAL_BET_AMOUNT = 20;
        this.BET_REDUCTION_ON_DEATH = 10;
        this.MIN_BET_AMOUNT = 10;
    }
}
// acnhScript.js
// acnhScript.js
// acnhScript.js
/**
 * Main application controller for Animal Crossing Creature Tracker
 * @module ACNHTracker
 * @requires translations
 * @requires creatures
 */
class ACNHTracker {
    /**
     * Initialize the tracker application
     * @constructor
     */
    constructor() {
        // DOM Elements
        this.elements = {
            creatureList: document.getElementById('creature-list'),
            activeOnly: document.getElementById('active-only'),
            uncaughtOnly: document.getElementById('uncaught-only'),
            typeFilter: document.getElementById('type-filter'),
            languageSelector: document.getElementById('language-selector')
        };
        
        // Application state
        this.state = {
            creatures: [],
            caught: {},
            settings: {
                activeOnly: true,
                uncaughtOnly: true,
                type: 'all',
                language: 'tr'
            },
            translations: {},
            currentTime: new Date(),
            timerInterval: null,
            renderInterval: null
        };
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Initialize the application by loading data and setting up event listeners
     * @async
     */
    async init() {
        // Load data
        await this.loadData();
        
        // Load saved state
        this.loadState();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial render
        this.render();
        
        // Setup timers
        this.setupTimers();
    }
    
    /**
     * Load JSON data (translations and creatures)
     * @async
     */
    async loadData() {
        try {
            // Load translations
            const translationsResponse = await fetch('translations.json');
            this.state.translations = await translationsResponse.json();
            
            // Load creatures
            const creaturesResponse = await fetch('creatures.json');
            this.state.creatures = await creaturesResponse.json();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    /**
     * Load saved state from localStorage
     */
    loadState() {
        // Load settings
        const savedSettings = localStorage.getItem('acnhSettings');
        if (savedSettings) {
            this.state.settings = {...this.state.settings, ...JSON.parse(savedSettings)};
        }
        
        // Load caught status
        const savedCaught = localStorage.getItem('acnhCaught');
        if (savedCaught) {
            this.state.caught = JSON.parse(savedCaught);
        }
        
        // Update UI to match settings
        this.elements.activeOnly.checked = this.state.settings.activeOnly;
        this.elements.uncaughtOnly.checked = this.state.settings.uncaughtOnly;
        this.elements.typeFilter.value = this.state.settings.type;
        this.elements.languageSelector.value = this.state.settings.language;
    }
    
    /**
     * Save current state to localStorage
     */
    saveState() {
        // Save settings
        localStorage.setItem('acnhSettings', JSON.stringify(this.state.settings));
        
        // Save caught status
        localStorage.setItem('acnhCaught', JSON.stringify(this.state.caught));
    }
    
    /**
     * Set up event listeners for UI controls
     */
    setupEventListeners() {
        // Active creatures filter
        this.elements.activeOnly.addEventListener('change', (e) => {
            this.state.settings.activeOnly = e.target.checked;
            this.saveState();
            this.render();
        });
        
        // Uncaught only filter
        this.elements.uncaughtOnly.addEventListener('change', (e) => {
            this.state.settings.uncaughtOnly = e.target.checked;
            this.saveState();
            this.render();
        });
        
        // Type filter
        this.elements.typeFilter.addEventListener('change', (e) => {
            this.state.settings.type = e.target.value;
            this.saveState();
            this.render();
        });
        
        // Language selector
        this.elements.languageSelector.addEventListener('change', (e) => {
            this.state.settings.language = e.target.value;
            this.saveState();
            this.translatePage();
            this.render();
        });
    }
    
    /**
     * Set up timers for countdown and periodic updates
     */
    setupTimers() {
        // Update current time every second for countdowns
        this.state.timerInterval = setInterval(() => {
            this.state.currentTime = new Date();
            this.updateCountdowns();
        }, 1000);
        
        // Full re-render every minute to handle creatures becoming active/inactive
        this.state.renderInterval = setInterval(() => {
            this.render();
        }, 60000);
    }
    
    /**
     * Translate page elements based on selected language
     */
    translatePage() {
        const lang = this.state.settings.language;
        const translations = this.state.translations[lang] || {};
        
        // Translate all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[key]) {
                el.textContent = translations[key];
            }
        });
    }
    
    /**
     * Check if a creature is currently active (available to catch)
     * @param {Object} creature - Creature object
     * @returns {boolean} - True if creature is currently active
     */
    isCreatureActive(creature) {
        const now = this.state.currentTime;
        const currentMonth = now.getMonth() + 1; // JavaScript months are 0-11
        const currentHour = now.getHours();
        
        // Check month availability
        if (!creature.months.includes(currentMonth)) {
            return false;
        }
        
        // Check hour availability
        return creature.hours.includes(currentHour);
    }
    
    /**
     * Calculate time remaining for an active creature
     * @param {Object} creature - Creature object
     * @returns {number} - Time remaining in seconds
     */
    calculateTimeRemaining(creature) {
        if (!this.isCreatureActive(creature)) return 0;
        
        const now = this.state.currentTime;
        const currentHour = now.getHours();
        
        // Find next unavailable hour
        let nextUnavailable = currentHour + 1;
        while (creature.hours.includes(nextUnavailable)) {
            nextUnavailable++;
        }
        
        // Handle midnight wrap
        if (nextUnavailable >= 24) {
            nextUnavailable -= 24;
        }
        
        // Calculate end time
        const endTime = new Date(now);
        endTime.setHours(nextUnavailable, 0, 0, 0);
        
        // Adjust for next day if needed
        if (nextUnavailable <= currentHour) {
            endTime.setDate(endTime.getDate() + 1);
        }
        
        return Math.floor((endTime - now) / 1000);
    }
    
    /**
     * Format seconds into MM:SS
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Update countdown timers for all displayed creatures
     */
    updateCountdowns() {
        document.querySelectorAll('.countdown').forEach(element => {
            const creatureId = parseInt(element.dataset.id);
            const creature = this.state.creatures.find(c => c.id === creatureId);
            
            if (creature) {
                const timeRemaining = this.calculateTimeRemaining(creature);
                if (timeRemaining > 0) {
                    element.textContent = this.formatTime(timeRemaining);
                } else {
                    element.textContent = this.state.translations[this.state.settings.language]?.expired || 'Süre doldu';
                }
            }
        });
    }
    
    /**
     * Handle caught status toggle
     * @param {number} creatureId - ID of the creature
     * @param {boolean} isCaught - New caught status
     */
    toggleCaughtStatus(creatureId, isCaught) {
        this.state.caught[creatureId] = isCaught;
        this.saveState();
        
        // Re-render if we're showing only uncaught
        if (this.state.settings.uncaughtOnly) {
            this.render();
        }
    }
    
    /**
     * Render the creature list based on current filters
     */
    render() {
        const { activeOnly, uncaughtOnly, type } = this.state.settings;
        const lang = this.state.settings.language;
        
        // Filter creatures
        const filteredCreatures = this.state.creatures.filter(creature => {
            // Filter by type
            if (type !== 'all' && creature.type !== type) return false;
            
            // Filter by active status
            if (activeOnly && !this.isCreatureActive(creature)) return false;
            
            // Filter by caught status
            if (uncaughtOnly && this.state.caught[creature.id]) return false;
            
            return true;
        });
        
        // Generate HTML for creature cards
        this.elements.creatureList.innerHTML = filteredCreatures.map(creature => {
            const isActive = this.isCreatureActive(creature);
            const isCaught = !!this.state.caught[creature.id];
            const timeRemaining = this.calculateTimeRemaining(creature);
            
            return `
                <div class="creature-card ${isCaught ? 'caught' : ''}" data-id="${creature.id}">
                    <img src="${creature.image}" alt="${creature.name[lang]}" class="creature-image">
                    <div class="creature-info">
                        <h3 class="creature-name">${creature.name[lang]}</h3>
                        <p class="creature-details">
                            <span data-i18n="type">Tür</span>: ${this.state.translations[lang]?.[creature.type] || creature.type}<br>
                            <span data-i18n="location">Konum</span>: ${creature.location[lang]}<br>
                            <span data-i18n="price">Fiyat</span>: <span class="creature-price">${creature.price} 🔔</span>
                        </p>
                        ${isActive ? `
                            <div class="countdown" data-id="${creature.id}">
                                ${this.formatTime(timeRemaining)}
                            </div>
                        ` : ''}
                    </div>
                    <div class="caught-container">
                        <input type="checkbox" class="caught-checkbox" 
                               id="caught-${creature.id}" 
                               ${isCaught ? 'checked' : ''}>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to checkboxes
        document.querySelectorAll('.caught-checkbox').forEach(checkbox => {
            const creatureId = parseInt(checkbox.id.split('-')[1]);
            checkbox.addEventListener('change', (e) => {
                this.toggleCaughtStatus(creatureId, e.target.checked);
                
                // Toggle caught class on parent
                const card = e.target.closest('.creature-card');
                if (card) {
                    card.classList.toggle('caught', e.target.checked);
                }
            });
        });
        
        // Translate the page
        this.translatePage();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const tracker = new ACNHTracker();
});

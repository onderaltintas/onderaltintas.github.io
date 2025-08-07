/**
 * Global state object to manage application data.
 * @type {object}
 */
const state = {
    /**
     * Stores the caught status of creatures.
     * @type {Object.<string, boolean>}
     */
    caught: {},
    /**
     * Stores user filter and language settings.
     * @type {object}
     */
    filters: {
        filterType: 'thisMonthRadio',
        showUncaught: true,
        language: 'tr'
    },
    /**
     * Stores the currently active creature tab.
     * @type {string}
     */
    currentTab: 'fish'
};

/**
 * References to key DOM elements.
 * @type {object}
 */
const elements = {
    appTitle: document.getElementById('appTitle'),
    mainHeader: document.getElementById('mainHeader'),
    subHeader: document.getElementById('subHeader'),
    langLabel: document.getElementById('langLabel'),
    languageSelect: document.getElementById('language-select'),
    thisMonthRadio: document.getElementById('thisMonthRadio'),
    activeCreaturesRadio: document.getElementById('activeCreaturesRadio'),
    allCreaturesRadio: document.getElementById('allCreaturesRadio'),
    showUncaughtCheckbox: document.getElementById('showUncaughtCheckbox'),
    fishTab: document.getElementById('fishTab'),
    bugsTab: document.getElementById('bugsTab'),
    seaCreaturesTab: document.getElementById('seaCreaturesTab'),
    creatureLists: {
        fish: document.getElementById('fishList'),
        bugs: document.getElementById('bugsList'),
        seaCreatures: document.getElementById('seaCreaturesList')
    }
};

/**
 * Loads the application state from local storage.
 * If no state is found, initializes with default values.
 * @returns {void}
 */
const loadState = () => {
    const savedCaught = localStorage.getItem('caughtCreatures');
    if (savedCaught) {
        state.caught = JSON.parse(savedCaught);
    }
    const savedFilters = localStorage.getItem('trackerSettings');
    if (savedFilters) {
        state.filters = { ...state.filters, ...JSON.parse(savedFilters) };
    }
};

/**
 * Saves the application state to local storage.
 * @returns {void}
 */
const saveState = () => {
    localStorage.setItem('caughtCreatures', JSON.stringify(state.caught));
    localStorage.setItem('trackerSettings', JSON.stringify(state.filters));
};

/**
 * Applies the selected language from translations.json to the UI.
 * @returns {void}
 */
const applyLocalization = () => {
    const lang = state.filters.language;
    const currentLangStrings = translations[lang];

    elements.appTitle.textContent = currentLangStrings.appTitle;
    elements.mainHeader.textContent = currentLangStrings.mainHeader;
    elements.subHeader.textContent = currentLangStrings.subHeader;
    elements.langLabel.textContent = currentLangStrings.langLabel;

    document.querySelectorAll('.label-text').forEach(el => {
        const key = el.getAttribute('data-key');
        if (currentLangStrings[key]) {
            el.textContent = currentLangStrings[key];
        }
    });

    elements.fishTab.textContent = currentLangStrings.fish;
    elements.bugsTab.textContent = currentLangStrings.bugs;
    elements.seaCreaturesTab.textContent = currentLangStrings.seaCreatures;
};

/**
 * Checks if a creature is active at the current time and month.
 * @param {object} creature - The creature object to check.
 * @returns {boolean} True if the creature is active, otherwise false.
 */
const isCreatureActiveNow = (creature) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentHour = now.getHours();

    const isMonthActive = creature.months.includes(currentMonth);
    const isHourActive = creature.hours.includes(currentHour);

    return isMonthActive && isHourActive;
};

/**
 * Calculates the time remaining until a creature becomes unavailable or available again.
 * @param {object} creature - The creature object.
 * @returns {number} The time remaining in milliseconds.
 */
const getTimeRemaining = (creature) => {
    const now = new Date();
    const currentHour = now.getHours();
    const sortedHours = creature.hours.sort((a, b) => a - b);
    
    // Find the next hour boundary the creature will be active or inactive
    let nextChangeHour;
    if (isCreatureActiveNow(creature)) {
        // Creature is active, find next inactive hour or wrap to the start of the active period
        const nextInactiveHour = sortedHours.find(h => h > currentHour) || (sortedHours.length > 0 ? sortedHours[0] : null);
        if (nextInactiveHour === null) return 0; // Not active in any hour
        nextChangeHour = nextInactiveHour;
    } else {
        // Creature is inactive, find next active hour or wrap to the start of the active period
        const nextActiveHour = sortedHours.find(h => h > currentHour) || (sortedHours.length > 0 ? sortedHours[0] : null);
        if (nextActiveHour === null) return 0; // Not active in any hour
        nextChangeHour = nextActiveHour;
    }
    
    const nextChange = new Date();
    nextChange.setHours(nextChangeHour, 0, 0, 0);

    // If the next change is in the past, it's for the next day
    if (nextChange.getTime() < now.getTime()) {
        nextChange.setDate(nextChange.getDate() + 1);
    }
    
    return nextChange.getTime() - now.getTime();
};

/**
 * Renders the list of creatures on the page based on current filters.
 * @returns {void}
 */
const renderCreatures = () => {
    const creatureCategory = state.currentTab;
    const creatures = creaturesData[creatureCategory];
    const container = elements.creatureLists[creatureCategory];
    container.innerHTML = '';
    const now = new Date();
    const currentMonth = now.getMonth() + 1;

    creatures.forEach(creature => {
        const isCaught = state.caught[creature.id];
        const isThisMonth = creature.months.includes(currentMonth);
        const isActiveNow = isCreatureActiveNow(creature);

        let shouldRender = true;
        if (state.filters.filterType === 'thisMonthRadio' && !isThisMonth) {
            shouldRender = false;
        } else if (state.filters.filterType === 'activeCreaturesRadio' && !isActiveNow) {
            shouldRender = false;
        }
        if (state.filters.showUncaught && isCaught) {
            shouldRender = false;
        }

        if (shouldRender) {
            const card = document.createElement('div');
            card.className = 'creature-card';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'caught-checkbox';
            checkbox.checked = isCaught;
            checkbox.addEventListener('change', (e) => {
                state.caught[creature.id] = e.target.checked;
                saveState();
                renderCreatures();
            });

            const img = document.createElement('img');
            img.src = creature.image;
            img.alt = creature.name;
            img.className = 'creature-image';

            const name = document.createElement('h3');
            name.className = 'creature-name';
            name.textContent = creature.name;

            const countdown = document.createElement('div');
            countdown.className = 'countdown-timer';
            if (isActiveNow) {
                const updateTimer = () => {
                    const timeLeft = getTimeRemaining(creature);
                    if (timeLeft > 0) {
                        const seconds = Math.floor((timeLeft / 1000) % 60);
                        const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
                        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
                        countdown.textContent = `${translations[state.filters.language].countdown} ${hours}s ${minutes}d ${seconds}s`;
                    } else {
                        // Timer expired, re-render to update status
                        clearInterval(card.timerInterval);
                        renderCreatures();
                    }
                };
                card.timerInterval = setInterval(updateTimer, 1000);
                updateTimer();
            }

            card.append(checkbox, img, name, countdown);
            container.appendChild(card);
        }
    });
};

/**
 * Sets up all event listeners for UI interactions.
 * @returns {void}
 */
const setupEventListeners = () => {
    document.querySelectorAll('input[name="filter-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.filters.filterType = e.target.id;
            saveState();
            renderCreatures();
        });
    });

    elements.showUncaughtCheckbox.addEventListener('change', (e) => {
        state.filters.showUncaught = e.target.checked;
        saveState();
        renderCreatures();
    });

    elements.languageSelect.addEventListener('change', (e) => {
        state.filters.language = e.target.value;
        saveState();
        applyLocalization();
        renderCreatures();
    });

    document.querySelectorAll('.tablinks').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.tabcontent').forEach(content => {
                content.style.display = 'none';
            });
            document.querySelectorAll('.tablinks').forEach(link => {
                link.classList.remove('active');
            });
            
            const newTabId = e.currentTarget.getAttribute('data-tab');
            document.getElementById(newTabId).style.display = 'block';
            e.currentTarget.classList.add('active');
            state.currentTab = newTabId;
            renderCreatures();
        });
    });
};

/**
 * Initializes the application on page load.
 * @returns {void}
 */
const init = () => {
    loadState();
    elements.languageSelect.value = state.filters.language;
    
    // Set initial filter buttons based on loaded state
    document.getElementById(state.filters.filterType).checked = true;
    elements.showUncaughtCheckbox.checked = state.filters.showUncaught;

    applyLocalization();
    setupEventListeners();
    
    // Set initial active tab and render
    document.getElementById('fish').style.display = 'block';
    elements.fishTab.classList.add('active');
    renderCreatures();
};

document.addEventListener('DOMContentLoaded', init);
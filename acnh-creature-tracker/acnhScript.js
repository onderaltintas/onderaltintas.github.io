/**
 * Global state object to manage application data.
 * @type {object}
 */
const state = {
    caught: {},
    filters: {
        filterType: 'thisMonthRadio',
        showUncaught: true,
        language: 'tr'
    },
    currentTab: 'fish',
    currentMonth: new Date().getMonth() + 1,
    creaturesData: {},
    translations: {}
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
    monthButtons: document.querySelectorAll('.availableMonth'),
    tablinks: document.querySelectorAll('.tablinks'),
    tabcontents: document.querySelectorAll('.tabcontent'),
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
    const currentLangStrings = state.translations[lang];

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

    elements.tablinks.forEach(link => {
        const key = link.getAttribute('data-tab');
        if (currentLangStrings[key]) {
            link.textContent = currentLangStrings[key];
        }
    });
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
    const sortedHours = [...creature.hours].sort((a, b) => a - b);
    
    let nextChangeHour;
    if (isCreatureActiveNow(creature)) {
        nextChangeHour = sortedHours.find(h => h > currentHour);
        if (!nextChangeHour) {
            nextChangeHour = sortedHours.length > 0 ? sortedHours[0] : null;
        }
    } else {
        nextChangeHour = sortedHours.find(h => h > currentHour);
        if (!nextChangeHour) {
            nextChangeHour = sortedHours.length > 0 ? sortedHours[0] : null;
        }
    }
    
    if (nextChangeHour === null) return 0;

    const nextChange = new Date();
    nextChange.setHours(nextChangeHour, 0, 0, 0);

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
    const creatures = state.creaturesData[creatureCategory];
    const container = elements.creatureLists[creatureCategory];
    container.innerHTML = '';
    const now = new Date();
    const currentMonth = now.getMonth() + 1;

    // Clear any previous countdown timers
    document.querySelectorAll('.creature-row').forEach(row => {
        if (row.timerInterval) {
            clearInterval(row.timerInterval);
        }
    });

    creatures.forEach(creature => {
        const isCaught = state.caught[creature.id];
        const isThisMonth = creature.months.includes(currentMonth);
        const isActiveNow = isCreatureActiveNow(creature);

        let shouldRender = false;
        
        if (state.filters.filterType === 'thisMonthRadio' && isThisMonth) {
            shouldRender = true;
        } else if (state.filters.filterType === 'activeCreaturesRadio' && isActiveNow) {
            shouldRender = true;
        } else if (state.filters.filterType === 'allCreaturesRadio') {
            shouldRender = true;
        }

        if (state.filters.showUncaught && isCaught) {
            shouldRender = false;
        }

        if (shouldRender) {
            const tr = document.createElement('tr');
            tr.className = 'creature-row';

            const checkboxTd = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isCaught;
            checkbox.addEventListener('change', (e) => {
                state.caught[creature.id] = e.target.checked;
                saveState();
                renderCreatures();
            });
            checkboxTd.appendChild(checkbox);

            const nameTd = document.createElement('td');
            nameTd.textContent = creature.name;

            const imageTd = document.createElement('td');
            const img = document.createElement('img');
            img.src = creature.image;
            img.alt = creature.name;
            img.className = 'creature-image';
            imageTd.appendChild(img);

            const priceTd = document.createElement('td');
            priceTd.textContent = creature.price;

            const locationTd = document.createElement('td');
            locationTd.textContent = creature.location;
            
            const shadowSizeTd = document.createElement('td');
            shadowSizeTd.textContent = creature.shadowSize;
            
            const timeTd = document.createElement('td');
            timeTd.textContent = creature.hours.length === 24 ? "All day" : creature.hours.join(', ');
            
            tr.appendChild(checkboxTd);
            tr.appendChild(nameTd);
            tr.appendChild(imageTd);
            tr.appendChild(priceTd);
            tr.appendChild(locationTd);
            
            if (creatureCategory !== 'bugs') {
                tr.appendChild(shadowSizeTd);
            }

            tr.appendChild(timeTd);

            if (isActiveNow) {
                const countdown = document.createElement('div');
                countdown.className = 'countdown-timer';
                const updateTimer = () => {
                    const timeLeft = getTimeRemaining(creature);
                    if (timeLeft > 0) {
                        const seconds = Math.floor((timeLeft / 1000) % 60);
                        const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
                        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
                        countdown.textContent = `${state.translations[state.filters.language].countdown} ${hours}s ${minutes}d ${seconds}s`;
                    } else {
                        clearInterval(tr.timerInterval);
                        renderCreatures();
                    }
                };
                tr.timerInterval = setInterval(updateTimer, 1000);
                updateTimer();
                timeTd.appendChild(countdown);
            }

            container.appendChild(tr);
        }
    });
};

/**
 * Handles the display of creatures when a month button is clicked.
 * @param {number} month - The month number to display (1-12).
 * @returns {void}
 */
const displayByMonth = (month) => {
    state.currentMonth = month;
    elements.thisMonthRadio.checked = false;
    elements.activeCreaturesRadio.checked = false;
    elements.allCreaturesRadio.checked = false;
    
    elements.monthButtons.forEach(button => button.classList.remove('active'));
    elements.monthButtons[month - 1].classList.add('active');

    const creatureCategory = state.currentTab;
    const creatures = state.creaturesData[creatureCategory];
    const container = elements.creatureLists[creatureCategory];
    container.innerHTML = '';
    
    creatures.forEach(creature => {
        const isCaught = state.caught[creature.id];
        const isThisMonth = creature.months.includes(month);

        let shouldRender = true;
        if (!isThisMonth) {
            shouldRender = false;
        }
        if (state.filters.showUncaught && isCaught) {
            shouldRender = false;
        }

        if (shouldRender) {
            const tr = document.createElement('tr');
            tr.className = 'creature-row';

            const checkboxTd = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isCaught;
            checkbox.addEventListener('change', (e) => {
                state.caught[creature.id] = e.target.checked;
                saveState();
            });
            checkboxTd.appendChild(checkbox);

            const nameTd = document.createElement('td');
            nameTd.textContent = creature.name;
            const imageTd = document.createElement('td');
            const img = document.createElement('img');
            img.src = creature.image;
            img.alt = creature.name;
            img.className = 'creature-image';
            imageTd.appendChild(img);
            const priceTd = document.createElement('td');
            priceTd.textContent = creature.price;
            const locationTd = document.createElement('td');
            locationTd.textContent = creature.location;
            const shadowSizeTd = document.createElement('td');
            shadowSizeTd.textContent = creature.shadowSize;
            const timeTd = document.createElement('td');
            timeTd.textContent = creature.hours.length === 24 ? "All day" : creature.hours.join(', ');
            
            tr.appendChild(checkboxTd);
            tr.appendChild(nameTd);
            tr.appendChild(imageTd);
            tr.appendChild(priceTd);
            tr.appendChild(locationTd);
            if (creatureCategory !== 'bugs') {
                tr.appendChild(shadowSizeTd);
            }
            tr.appendChild(timeTd);
            container.appendChild(tr);
        }
    });
};

/**
 * Sets up all event listeners for UI interactions.
 * @returns {void}
 */
const setupEventListeners = () => {
    elements.monthButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            displayByMonth(index + 1);
        });
    });

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

    elements.tablinks.forEach(tab => {
        tab.addEventListener('click', (e) => {
            elements.tabcontents.forEach(content => {
                content.style.display = 'none';
            });
            elements.tablinks.forEach(link => {
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
 * Initializes the application on page load after data is loaded.
 * @returns {void}
 */
const init = () => {
    loadState();
    elements.languageSelect.value = state.filters.language;
    
    document.getElementById(state.filters.filterType).checked = true;
    elements.showUncaughtCheckbox.checked = state.filters.showUncaught;

    applyLocalization();
    setupEventListeners();
    
    document.getElementById(state.currentTab).style.display = 'block';
    document.getElementById(`${state.currentTab}Tab`).classList.add('active');
    
    // Default olarak "Bu Ay" filtresi aktif gelsin ve listeyi oluştursun
    document.getElementById('thisMonthRadio').checked = true;
    state.filters.filterType = 'thisMonthRadio';
    renderCreatures();
};

document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        fetch('creatures.json').then(response => response.json()),
        fetch('translations.json').then(response => response.json())
    ]).then(([creatures, translations]) => {
        state.creaturesData = creatures;
        state.translations = translations;
        init();
    }).catch(error => console.error('Error loading data files:', error));
});

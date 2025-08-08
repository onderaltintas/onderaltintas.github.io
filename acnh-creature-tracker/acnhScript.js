// Set variables
let northHemFish = [];
let northHemBugs = [];
let northHemSeaCr = [];
let monthButtons = document.getElementsByClassName("availableMonth");
let month = new Date().getMonth(); // Current month (0-11)
let isNorthernHemisphere = true; // Default to northern hemisphere
let currentLanguage = 'tr'; // Default language
let translationData = {}; // Will store translations
let creatureData = {}; // Global creature data
let isActiveNowMode = false; // Aktif şimdi modu için

// Hemisphere and uncaught toggle
const hemisphereToggle = document.getElementById('hemisphereToggle');
const hemisphereText = document.getElementById('hemisphereText');
const uncaughtToggle = document.getElementById('uncaughtToggle');
const languageSelect = document.getElementById('languageSelect');
const activeNowButton = document.getElementById('activeNowButton'); // Yeşil buton

// Load translations
async function loadTranslations() {
    try {
        const response = await fetch('translations.json');
        return response.json();
    } catch (error) {
        console.error("Çeviriler yüklenirken hata oluştu:", error);
        return {};
    }
}

// Apply translations to UI
function applyTranslations(lang) {
    const t = translationData[lang] || {};
    
    // Update UI elements
    document.getElementById('appSubtitle').textContent = t.app_title || 'Animal Crossing Yakalama Takipçisi';
    hemisphereText.textContent = isNorthernHemisphere ? 
        (t.northern_hemisphere || 'Kuzey Yarıküre') : 
        (t.southern_hemisphere || 'Güney Yarıküre');
    
    document.getElementById('uncaughtText').textContent = t.show_uncaught || 'Yakalanmayanlar';
    
    // Aktif şimdi buton metni
    activeNowButton.textContent = t.active_now_button || 'Şu An';
    
    document.getElementById('fishTab').textContent = t.fish || 'Balıklar';
    document.getElementById('bugsTab').textContent = t.bugs || 'Böcekler';
    document.getElementById('seaTab').textContent = t.sea_creatures || 'Deniz Canlıları';
    
    document.getElementById('capturedHeader').textContent = t.captured || 'Yakalandı';
    document.getElementById('nameHeader').textContent = t.name || 'İsim';
    document.getElementById('imageHeader').textContent = t.image || 'Resim';
    document.getElementById('priceHeader').textContent = t.price || 'Fiyat';
    document.getElementById('locationHeader').textContent = t.location || 'Konum';
    document.getElementById('timeHeader').textContent = t.time || 'Zaman';
    
    // Update month headers
    const monthAbbr = lang === 'tr' ? 
        ["Ock", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Ekm", "Kas", "Ara"] :
        ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    document.getElementById('janHeader').textContent = monthAbbr[0];
    document.getElementById('febHeader').textContent = monthAbbr[1];
    document.getElementById('marHeader').textContent = monthAbbr[2];
    document.getElementById('aprHeader').textContent = monthAbbr[3];
    document.getElementById('mayHeader').textContent = monthAbbr[4];
    document.getElementById('junHeader').textContent = monthAbbr[5];
    document.getElementById('julHeader').textContent = monthAbbr[6];
    document.getElementById('augHeader').textContent = monthAbbr[7];
    document.getElementById('sepHeader').textContent = monthAbbr[8];
    document.getElementById('octHeader').textContent = monthAbbr[9];
    document.getElementById('novHeader').textContent = monthAbbr[10];
    document.getElementById('decHeader').textContent = monthAbbr[11];
    
    // Update month buttons
    const monthNames = lang === 'tr' ? 
        ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"] :
        ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    for (let i = 0; i < monthButtons.length; i++) {
        monthButtons[i].textContent = monthNames[i];
    }
}

// Change language
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    applyTranslations(lang);
    
    // Re-render tables to update translations
    if (creatureData.fish) {
        populateTables();
        updateDisplay();
    }
}

// Translate a string with case-insensitive and partial matching
function translate(text) {
    if (!text) return '';
    
    const t = translationData[currentLanguage] || {};
    
    // First try exact match
    if (t[text]) {
        return t[text];
    }
    
    // Then try case-insensitive match
    const lowerText = text.toLowerCase();
    for (const key in t) {
        if (key.toLowerCase() === lowerText) {
            return t[key];
        }
    }
    
    // Finally, try to match known patterns
    if (lowerText.includes("small")) return t["Small"] || text;
    if (lowerText.includes("medium")) return t["Medium"] || text;
    if (lowerText.includes("large")) return t["Large"] || text;
    if (lowerText.includes("huge")) return t["Huge"] || text;
    if (lowerText.includes("narrow")) return t["Narrow"] || text;
    if (lowerText.includes("on tree")) return t["On Trees"] || text;
    if (lowerText.includes("slow")) return t["Slow"] || text;
    if (lowerText.includes("quick")) return t["Quick"] || text;
    if (lowerText.includes("moderate")) return t["Moderate"] || text;
    if (lowerText.includes("fast")) return t["Fast"] || text;
    
    return text;
}

// Event listeners
hemisphereToggle.addEventListener('change', function() {
    isNorthernHemisphere = this.checked;
    applyTranslations(currentLanguage);
    updateDisplay();
});

uncaughtToggle.addEventListener('change', updateDisplay);
languageSelect.addEventListener('change', function() {
    changeLanguage(this.value);
});

// Aktif şimdi buton event listener
activeNowButton.addEventListener('click', function() {
    // Aktif modu aç/kapat
    isActiveNowMode = !isActiveNowMode;
    
    if (isActiveNowMode) {
        // Aktif modda şu anki ayı seç
        month = new Date().getMonth();
        highlightMonth(month);
        activeNowButton.classList.add('active');
    } else {
        activeNowButton.classList.remove('active');
    }
    
    updateDisplay();
});

// Tab control functions
function openList(evt, listName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    const tablinks = document.getElementsByClassName("tablinks");
    
    // Hide all tab content
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    // Remove active class from all tab links
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    // Show the specific tab content
    document.getElementById(listName).style.display = "block";
    
    // Add active class to the button that opened the tab
    evt.currentTarget.className += " active";
}

// Highlight selected month
function highlightMonth(selectedIndex) {
    for (let i = 0; i < monthButtons.length; i++) {
        if (i === selectedIndex) {
            monthButtons[i].classList.add("monthSelected");
        } else {
            monthButtons[i].classList.remove("monthSelected");
        }
    }
}

// Set month and update display
function setMonthAndUpdate(selectedMonth) {
    month = selectedMonth;
    isActiveNowMode = false; // Aktif modu kapat
    activeNowButton.classList.remove('active');
    highlightMonth(selectedMonth);
    updateDisplay();
}

// Load creature data from JSON
async function loadCreatureData() {
    try {
        const response = await fetch('creatures.json');
        return response.json();
    } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
        return null;
    }
}

// Save capture status to localStorage
function saveCaptureStatus(type, name, isCaptured) {
    const key = `captured_${type}_${name}`;
    localStorage.setItem(key, isCaptured ? 'true' : 'false');
}

// Load capture status from localStorage
function loadCaptureStatus(type, name) {
    const key = `captured_${type}_${name}`;
    return localStorage.getItem(key) === 'true';
}

// Create table rows with capture checkbox
function createTableRow(creature, type) {
    const row = document.createElement('tr');
    row.className = `${type}North`;
    
    // Add capture checkbox
    const captureCell = document.createElement('td');
    const captureCheckbox = document.createElement('input');
    captureCheckbox.type = 'checkbox';
    captureCheckbox.className = 'capture-checkbox';
    
    // Load capture status from localStorage
    const isCaptured = loadCaptureStatus(type, creature.name);
    captureCheckbox.checked = isCaptured;
    
    // Save status when checkbox changes
    captureCheckbox.addEventListener('change', function() {
        saveCaptureStatus(type, creature.name, this.checked);
        updateDisplay(); // Update display after status change
    });
    
    captureCell.appendChild(captureCheckbox);
    row.appendChild(captureCell);
    
    // Add name (no translation)
    const nameCell = document.createElement('td');
    nameCell.textContent = creature.name;
    row.appendChild(nameCell);
    
    // Add image
    const imgCell = document.createElement('td');
    const img = document.createElement('img');
    img.src = creature.image;
    img.alt = creature.name;
    img.width = 50;
    imgCell.appendChild(img);
    row.appendChild(imgCell);
    
    // Add price
    const priceCell = document.createElement('td');
    priceCell.textContent = creature.price;
    row.appendChild(priceCell);
    
    // Add location (with translation)
    const locationCell = document.createElement('td');
    
    // Handle different location fields
    if (type === 'sea') {
        // Translate sea creature attributes
        let locationText = '';
        if (creature.shadowSize) locationText += translate(creature.shadowSize) + ' ';
        if (creature.swimmingPattern) locationText += translate(creature.swimmingPattern);
        locationCell.textContent = locationText.trim();
    } else {
        // Translate location
        locationCell.textContent = translate(creature.location) || '';
    }
    
    row.appendChild(locationCell);
    
    // Add time (with translation)
    const timeCell = document.createElement('td');
    timeCell.textContent = translate(creature.time) || '';
    row.appendChild(timeCell);
    
    // Add months based on hemisphere
    // Mobile: Months were removed to reduce row length
    /*
    const months = isNorthernHemisphere ? creature.months.north : creature.months.south;
    for (let i = 0; i < 12; i++) {
        const monthCell = document.createElement('td');
        monthCell.textContent = months[i] ? 'x' : '';
        row.appendChild(monthCell);
    }
    */
    
    return row;
}

// Convert time string to minutes
function timeToMinutes(timeStr) {
    const time = timeStr.trim().toUpperCase();
    let hour, minute = 0;
    let period = "";
    
    if (time.includes("AM") || time.includes("PM")) {
        if (time.includes("AM")) {
            period = "AM";
        } else {
            period = "PM";
        }
        
        // Extract time part
        const timePart = time.replace("AM", "").replace("PM", "").trim();
        const parts = timePart.split(':');
        
        hour = parseInt(parts[0]);
        minute = parts.length > 1 ? parseInt(parts[1]) : 0;
        
        // Handle 12AM and 12PM
        if (period === "AM" && hour === 12) {
            hour = 0;
        } else if (period === "PM" && hour !== 12) {
            hour += 12;
        }
    } else {
        // Handle 24-hour format if needed
        const parts = time.split(':');
        hour = parseInt(parts[0]);
        minute = parts.length > 1 ? parseInt(parts[1]) : 0;
    }
    
    return hour * 60 + minute;
}

// Check if creature is active now
function isActiveNow(timeRange) {
    if (!timeRange) return false;
    
    // "Tüm gün" kontrolü
    if (timeRange.includes("Tüm gün") || 
        timeRange.includes("All day") || 
        timeRange.includes("All Day")) {
        return true;
    }
    
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;
    
    // Birden fazla zaman aralığı varsa (örneğin: "9AM-4PM & 9PM-4AM")
    const timeRanges = timeRange.split('&').map(t => t.trim());
    
    for (const range of timeRanges) {
        const [startStr, endStr] = range.split('-').map(s => s.trim());
        
        try {
            const startMinutes = timeToMinutes(startStr);
            let endMinutes = timeToMinutes(endStr);
            
            // Gece yarısını geçen zaman aralıkları
            if (endMinutes < startMinutes) {
                // Gece yarısını geçen aralıklar için endMinutes'i 24 saat ekleyerek ayarla
                if (currentTotalMinutes >= startMinutes) {
                    // Gece yarısından önceki kısım
                    if (currentTotalMinutes >= startMinutes && currentTotalMinutes <= (24 * 60)) {
                        return true;
                    }
                } else {
                    // Gece yarısından sonraki kısım
                    if (currentTotalMinutes <= endMinutes) {
                        return true;
                    }
                }
            } else {
                // Normal zaman aralığı
                if (currentTotalMinutes >= startMinutes && currentTotalMinutes <= endMinutes) {
                    return true;
                }
            }
        } catch (e) {
            console.error("Zaman aralığı ayrıştırma hatası:", e);
        }
    }
    
    return false;
}

// Update display based on filters
function updateDisplay() {
    const showOnlyUncaught = uncaughtToggle.checked;
    const hemisphere = isNorthernHemisphere ? 'north' : 'south';
    
    // Use the selected month instead of current real month
    const selectedMonth = month;
    
    // Filter fish
    if (northHemFish.length > 0) {
        Array.from(northHemFish).forEach(row => {
            const name = row.cells[1].textContent;
            const creature = creatureData.fish.find(f => f.name === name);
            const captureCheckbox = row.querySelector('.capture-checkbox');
            const isCaptured = captureCheckbox.checked;
            
            if (creature) {
                const months = creature.months[hemisphere];
                const isAvailable = months[selectedMonth]; // Use selected month
                
                // Check if leaving this month (next month not available)
                const nextMonth = (selectedMonth + 1) % 12;
                const isLeaving = isAvailable && !months[nextMonth];
                
                if (isActiveNowMode) {
                    // Aktif mod: sadece şu anda aktif olanlar
                    const isActive = isActiveNow(creature.time);
                    
                    if (isAvailable && isActive && (!showOnlyUncaught || !isCaptured)) {
                        row.style.display = 'table-row';
                        if (isLeaving) {
                            row.classList.add('leaving-soon');
                        } else {
                            row.classList.remove('leaving-soon');
                        }
                    } else {
                        row.style.display = 'none';
                        row.classList.remove('leaving-soon');
                    }
                } else {
                    // Normal mod
                    if (isAvailable && (!showOnlyUncaught || !isCaptured)) {
                        row.style.display = 'table-row';
                        row.classList.remove('leaving-soon');
                    } else {
                        row.style.display = 'none';
                        row.classList.remove('leaving-soon');
                    }
                }
            }
        });
    }
    
    // Filter bugs
    if (northHemBugs.length > 0) {
        Array.from(northHemBugs).forEach(row => {
            const name = row.cells[1].textContent;
            const creature = creatureData.bugs.find(b => b.name === name);
            const captureCheckbox = row.querySelector('.capture-checkbox');
            const isCaptured = captureCheckbox.checked;
            
            if (creature) {
                const months = creature.months[hemisphere];
                const isAvailable = months[selectedMonth]; // Use selected month
                
                // Check if leaving this month (next month not available)
                const nextMonth = (selectedMonth + 1) % 12;
                const isLeaving = isAvailable && !months[nextMonth];
                
                if (isActiveNowMode) {
                    // Aktif mod: sadece şu anda aktif olanlar
                    const isActive = isActiveNow(creature.time);
                    
                    if (isAvailable && isActive && (!showOnlyUncaught || !isCaptured)) {
                        row.style.display = 'table-row';
                        if (isLeaving) {
                            row.classList.add('leaving-soon');
                        } else {
                            row.classList.remove('leaving-soon');
                        }
                    } else {
                        row.style.display = 'none';
                        row.classList.remove('leaving-soon');
                    }
                } else {
                    // Normal mod
                    if (isAvailable && (!showOnlyUncaught || !isCaptured)) {
                        row.style.display = 'table-row';
                        row.classList.remove('leaving-soon');
                    } else {
                        row.style.display = 'none';
                        row.classList.remove('leaving-soon');
                    }
                }
            }
        });
    }
    
    // Filter sea creatures
    if (northHemSeaCr.length > 0) {
        Array.from(northHemSeaCr).forEach(row => {
            const name = row.cells[1].textContent;
            const creature = creatureData.seaCreatures.find(s => s.name === name);
            const captureCheckbox = row.querySelector('.capture-checkbox');
            const isCaptured = captureCheckbox.checked;
            
            if (creature) {
                const months = creature.months[hemisphere];
                const isAvailable = months[selectedMonth]; // Use selected month
                
                // Check if leaving this month (next month not available)
                const nextMonth = (selectedMonth + 1) % 12;
                const isLeaving = isAvailable && !months[nextMonth];
                
                if (isActiveNowMode) {
                    // Aktif mod: sadece şu anda aktif olanlar
                    const isActive = isActiveNow(creature.time);
                    
                    if (isAvailable && isActive && (!showOnlyUncaught || !isCaptured)) {
                        row.style.display = 'table-row';
                        if (isLeaving) {
                            row.classList.add('leaving-soon');
                        } else {
                            row.classList.remove('leaving-soon');
                        }
                    } else {
                        row.style.display = 'none';
                        row.classList.remove('leaving-soon');
                    }
                } else {
                    // Normal mod
                    if (isAvailable && (!showOnlyUncaught || !isCaptured)) {
                        row.style.display = 'table-row';
                        row.classList.remove('leaving-soon');
                    } else {
                        row.style.display = 'none';
                        row.classList.remove('leaving-soon');
                    }
                }
            }
        });
    }
}

// Populate tables with creature data
function populateTables() {
    // Clear existing tables
    document.getElementById('fish-body').innerHTML = '';
    document.getElementById('bugs-body').innerHTML = '';
    document.getElementById('seaCreatures-body').innerHTML = '';
    
    // Populate fish table
    const fishBody = document.getElementById('fish-body');
    creatureData.fish.forEach(fish => {
        const row = createTableRow(fish, 'fish');
        fishBody.appendChild(row);
    });
    
    // Populate bugs table
    const bugsBody = document.getElementById('bugs-body');
    creatureData.bugs.forEach(bug => {
        const row = createTableRow(bug, 'bugs');
        bugsBody.appendChild(row);
    });
    
    // Populate sea creatures table
    const seaBody = document.getElementById('seaCreatures-body');
    creatureData.seaCreatures.forEach(seaCreature => {
        const row = createTableRow(seaCreature, 'sea');
        seaBody.appendChild(row);
    });
    
    // Initialize global variables
    northHemFish = document.getElementsByClassName('fishNorth');
    northHemBugs = document.getElementsByClassName('bugsNorth');
    northHemSeaCr = document.getElementsByClassName('seaNorth');
}

// Initialize page
async function initPage() {
    // Load translations and creature data
    translationData = await loadTranslations();
    const data = await loadCreatureData();
    if (!data) return;
    
    // Save creature data globally
    creatureData = data;
    
    // Set language from localStorage or default
    const savedLang = localStorage.getItem('language') || 'tr';
    currentLanguage = savedLang;
    document.getElementById('languageSelect').value = savedLang;
    
    // Apply translations
    applyTranslations(savedLang);
    
    // Populate tables
    populateTables();
    
    // Set current month as default
    const currentMonth = new Date().getMonth();
    highlightMonth(currentMonth);
    updateDisplay();
    
    // Set default tab
    document.getElementById('bugs').style.display = 'none';
    document.getElementById('seaCreatures').style.display = 'none';
    document.getElementById('fish').style.display = 'block';
    
    // Set active tab
    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove('active');
    }
    tablinks[0].classList.add('active');
}

// Start the application
window.onload = initPage;

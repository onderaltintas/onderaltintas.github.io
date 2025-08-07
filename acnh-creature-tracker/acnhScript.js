// Set variables
let northHemFish = [];
let northHemBugs = [];
let northHemSeaCr = [];
let monthButtons = document.getElementsByClassName("availableMonth");
let month = new Date().getMonth(); // Current month (0-11)
let isNorthernHemisphere = true; // Default to northern hemisphere
let showOnlyUncaught = false; // Yeni değişken

// Hemisphere toggle
const hemisphereToggle = document.getElementById('hemisphereToggle');
const hemisphereText = document.getElementById('hemisphereText');
const uncaughtToggle = document.getElementById('uncaughtToggle'); // Yeni toggle

hemisphereToggle.addEventListener('change', function() {
    isNorthernHemisphere = this.checked;
    hemisphereText.textContent = isNorthernHemisphere ? 'Kuzey Yarıküre' : 'Güney Yarıküre';
    displayMonth(month);
});

// Uncaught toggle event listener
uncaughtToggle.addEventListener('change', function() {
    showOnlyUncaught = this.checked;
    displayMonth(month);
});

// Kalan fonksiyonlar aynı...

// Display creatures for selected month with hemisphere support
function displayMonth(selectedMonth) {
    month = selectedMonth;
    highlightMonth(selectedMonth);
    
    // Get current hemisphere months
    const hemisphere = isNorthernHemisphere ? 'north' : 'south';
    
    // Filter fish
    if (northHemFish.length > 0) {
        Array.from(northHemFish).forEach(row => {
            // Get creature name to find in JSON
            const name = row.cells[1].textContent; // Index 1 (0 is checkbox)
            const creature = creatureData.fish.find(f => f.name === name);
            
            let shouldShow = true;
            
            if (creature) {
                const months = creature.months[hemisphere];
                shouldShow = months[selectedMonth];
                
                // Yakalanmayanlar filtresi
                if (shouldShow && showOnlyUncaught) {
                    const captureCheckbox = row.querySelector('.capture-checkbox');
                    shouldShow = !captureCheckbox.checked;
                }
            }
            
            row.style.display = shouldShow ? 'table-row' : 'none';
        });
    }
    
    // Filter bugs
    if (northHemBugs.length > 0) {
        Array.from(northHemBugs).forEach(row => {
            const name = row.cells[1].textContent;
            const creature = creatureData.bugs.find(b => b.name === name);
            
            let shouldShow = true;
            
            if (creature) {
                const months = creature.months[hemisphere];
                shouldShow = months[selectedMonth];
                
                if (shouldShow && showOnlyUncaught) {
                    const captureCheckbox = row.querySelector('.capture-checkbox');
                    shouldShow = !captureCheckbox.checked;
                }
            }
            
            row.style.display = shouldShow ? 'table-row' : 'none';
        });
    }
    
    // Filter sea creatures
    if (northHemSeaCr.length > 0) {
        Array.from(northHemSeaCr).forEach(row => {
            const name = row.cells[1].textContent;
            const creature = creatureData.seaCreatures.find(s => s.name === name);
            
            let shouldShow = true;
            
            if (creature) {
                const months = creature.months[hemisphere];
                shouldShow = months[selectedMonth];
                
                if (shouldShow && showOnlyUncaught) {
                    const captureCheckbox = row.querySelector('.capture-checkbox');
                    shouldShow = !captureCheckbox.checked;
                }
            }
            
            row.style.display = shouldShow ? 'table-row' : 'none';
        });
    }
}

// Global creature data
let creatureData;

// Initialize page
async function initPage() {
    const data = await loadCreatureData();
    if (!data) return;
    
    // Save creature data globally
    creatureData = data;
    
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
    
    // Set current month as default
    const currentMonth = new Date().getMonth();
    highlightMonth(currentMonth);
    displayMonth(currentMonth);
    
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

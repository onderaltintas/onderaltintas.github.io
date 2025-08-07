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

// Initialize page fonksiyonu aynı kalıyor...

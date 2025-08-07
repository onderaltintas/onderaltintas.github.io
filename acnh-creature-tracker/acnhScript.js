// Set variables
let northHemFish = [];
let northHemBugs = [];
let northHemSeaCr = [];
let monthButtons = document.getElementsByClassName("availableMonth");
let month = new Date().getMonth(); // Current month (0-11)
let isNorthernHemisphere = true; // Default to northern hemisphere

// Hemisphere toggle
const hemisphereToggle = document.getElementById('hemisphereToggle');
const hemisphereText = document.getElementById('hemisphereText');

hemisphereToggle.addEventListener('change', function() {
    isNorthernHemisphere = this.checked;
    hemisphereText.textContent = isNorthernHemisphere ? 'Kuzey Yarıküre' : 'Güney Yarıküre';
    
    // Refresh the display
    displayMonth(month);
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

// Load creature data from JSON
async function loadCreatureData() {
    try {
        const response = await fetch('creatures.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
        return null;
    }
}

// Create table rows with hemisphere support
function createTableRow(creature, type) {
    const row = document.createElement('tr');
    row.className = `${type}North`;
    
    // Add name
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
    
    // Add location
    const locationCell = document.createElement('td');
    
    // Handle different location fields
    if (type === 'sea') {
        locationCell.textContent = creature.shadowSize || creature.swimmingPattern || '';
    } else {
        locationCell.textContent = creature.location || '';
    }
    
    row.appendChild(locationCell);
    
    // Add time
    const timeCell = document.createElement('td');
    timeCell.textContent = creature.time;
    row.appendChild(timeCell);
    
    // Add months based on hemisphere
    const months = isNorthernHemisphere ? creature.months.north : creature.months.south;
    for (let i = 0; i < 12; i++) {
        const monthCell = document.createElement('td');
        monthCell.textContent = months[i] ? 'x' : '';
        row.appendChild(monthCell);
    }
    
    return row;
}

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
            const name = row.cells[0].textContent;
            const creature = creatureData.fish.find(f => f.name === name);
            
            if (creature) {
                const months = creature.months[hemisphere];
                if (months[selectedMonth]) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    }
    
    // Filter bugs
    if (northHemBugs.length > 0) {
        Array.from(northHemBugs).forEach(row => {
            const name = row.cells[0].textContent;
            const creature = creatureData.bugs.find(b => b.name === name);
            
            if (creature) {
                const months = creature.months[hemisphere];
                if (months[selectedMonth]) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    }
    
    // Filter sea creatures
    if (northHemSeaCr.length > 0) {
        Array.from(northHemSeaCr).forEach(row => {
            const name = row.cells[0].textContent;
            const creature = creatureData.seaCreatures.find(s => s.name === name);
            
            if (creature) {
                const months = creature.months[hemisphere];
                if (months[selectedMonth]) {
                    row.style.display = 'table-row';
                } else {
                    row.style.display = 'none';
                }
            }
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

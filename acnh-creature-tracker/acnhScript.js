// Set variables
let northHemFish = [];
let northHemBugs = [];
let northHemSeaCr = [];
let monthButtons = document.getElementsByClassName("availableMonth");
let month = new Date().getMonth(); // Current month (0-11)

// Tab control functions
function openList(evt, listName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    const tablinks = document.getElementsByClassName("tablinks");
    
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    document.getElementById(listName).style.display = "block";
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

// Create table rows with corrected field names
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
    
    // Add months (using north hemisphere data)
    const months = creature.months.north;
    for (let i = 0; i < 12; i++) {
        const monthCell = document.createElement('td');
        monthCell.textContent = months[i] ? 'x' : '';
        row.appendChild(monthCell);
    }
    
    return row;
}

// Display creatures for selected month
function displayMonth(selectedMonth) {
    month = selectedMonth;
    highlightMonth(selectedMonth);
    
    // DÜZELTME: HTMLCollection'ı diziye çevir
    Array.from(northHemFish).forEach(row => {
        const monthCells = row.getElementsByTagName('td');
        if (monthCells[5 + selectedMonth].textContent === 'x') {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
    
    // DÜZELTME: HTMLCollection'ı diziye çevir
    Array.from(northHemBugs).forEach(row => {
        const monthCells = row.getElementsByTagName('td');
        if (monthCells[5 + selectedMonth].textContent === 'x') {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
    
    // DÜZELTME: HTMLCollection'ı diziye çevir
    Array.from(northHemSeaCr).forEach(row => {
        const monthCells = row.getElementsByTagName('td');
        if (monthCells[5 + selectedMonth].textContent === 'x') {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
}

// Initialize page
async function initPage() {
    const creatureData = await loadCreatureData();
    if (!creatureData) return;
    
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
    document.getElementById('fish').style.display = 'block';
    document.getElementsByClassName('tablinks')[0].classList.add('active');
}

// Start the application
window.onload = initPage;

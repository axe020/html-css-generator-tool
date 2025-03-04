// DOM Elements
const gradientType = document.getElementById('gradientType');
const angle = document.getElementById('angle');
const angleValue = document.getElementById('angleValue');
const angleControl = document.getElementById('angleControl');
const colorStops = document.getElementById('colorStops');
const addColorBtn = document.getElementById('addColor');
const gradientPreview = document.getElementById('gradientPreview');
const cssCode = document.querySelector('#cssCode code');
const tailwindCode = document.querySelector('#tailwindCode code');
const copyButton = document.getElementById('copyCode');
const snackbar = document.getElementById('snackbar');
const tabButtons = document.querySelectorAll('.tab-button');
const codePanes = document.querySelectorAll('.code-pane');
const modal = document.getElementById('modal');
const howToUseButton = document.getElementById('howToUse');
const closeButton = document.querySelector('.close-button');

// State
let activeTab = 'css';

// Initial setup
updateGradient();

// Event listeners
gradientType.addEventListener('change', () => {
    angleControl.style.display = gradientType.value === 'linear' ? 'block' : 'none';
    updateGradient();
});

angle.addEventListener('input', () => {
    angleValue.textContent = `${angle.value}°`;
    updateGradient();
});

addColorBtn.addEventListener('click', () => {
    addColorStop();
    updateGradient();
});

colorStops.addEventListener('input', (e) => {
    if (e.target.type === 'color' || e.target.type === 'number') {
        updateGradient();
    }
});

colorStops.addEventListener('click', (e) => {
    if (e.target.closest('.remove-color') && colorStops.children.length > 2) {
        e.target.closest('.color-stop').remove();
        updateGradient();
    }
});

// Tab switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        activeTab = button.dataset.tab;
        
        // Update active states
        tabButtons.forEach(btn => btn.classList.remove('active'));
        codePanes.forEach(pane => pane.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(`${activeTab}Code`).classList.add('active');
    });
});

// Copy code functionality
copyButton.addEventListener('click', () => {
    const codeToCopy = activeTab === 'css' ? cssCode.textContent : tailwindCode.textContent;
    navigator.clipboard.writeText(codeToCopy).then(() => {
        snackbar.textContent = `${activeTab.toUpperCase()} code copied to clipboard!`;
        snackbar.className = 'show';
        setTimeout(() => snackbar.className = '', 3000);
    });
});

// Modal functionality
howToUseButton.addEventListener('click', () => {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
});

closeButton.addEventListener('click', () => {
    modal.classList.remove('show');
    document.body.style.overflow = '';
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
});

function addColorStop() {
    const colorStop = document.createElement('div');
    colorStop.className = 'color-stop';
    
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = getRandomColor();
    
    const positionInput = document.createElement('input');
    positionInput.type = 'number';
    positionInput.className = 'stop-position';
    positionInput.min = 0;
    positionInput.max = 100;
    positionInput.value = 50;
    
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-color';
    removeButton.innerHTML = '<span class="material-icons">close</span>';
    
    colorStop.appendChild(colorInput);
    colorStop.appendChild(positionInput);
    colorStop.appendChild(removeButton);
    colorStops.appendChild(colorStop);
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function updateGradient() {
    const type = gradientType.value;
    const stops = Array.from(colorStops.children).map(stop => {
        const color = stop.querySelector('input[type="color"]').value;
        const position = stop.querySelector('input[type="number"]').value;
        return `${color} ${position}%`;
    });
    
    let gradient = '';
    let cssCodeText = '';
    let tailwindCodeText = '';
    
    switch (type) {
        case 'linear':
            gradient = `linear-gradient(${angle.value}deg, ${stops.join(', ')})`;
            cssCodeText = `.gradient {\n    background: ${gradient};\n}`;
            tailwindCodeText = `<div class="bg-gradient-to-r from-[${stops[0].split(' ')[0]}] to-[${stops[stops.length-1].split(' ')[0]}]"></div>`;
            break;
            
        case 'radial':
            gradient = `radial-gradient(circle, ${stops.join(', ')})`;
            cssCodeText = `.gradient {\n    background: ${gradient};\n}`;
            tailwindCodeText = `<div class="bg-gradient-radial from-[${stops[0].split(' ')[0]}] to-[${stops[stops.length-1].split(' ')[0]}]"></div>`;
            break;
            
        case 'conic':
            gradient = `conic-gradient(${stops.join(', ')})`;
            cssCodeText = `.gradient {\n    background: ${gradient};\n}`;
            tailwindCodeText = `<div class="bg-gradient-conic from-[${stops[0].split(' ')[0]}] to-[${stops[stops.length-1].split(' ')[0]}]"></div>`;
            break;
    }
    
    gradientPreview.style.background = gradient;
    cssCode.textContent = cssCodeText;
    tailwindCode.textContent = tailwindCodeText;
} 
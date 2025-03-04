// DOM Elements
const flexContainer = document.getElementById('flexContainer');
const flexDirection = document.getElementById('flexDirection');
const justifyContent = document.getElementById('justifyContent');
const alignItems = document.getElementById('alignItems');
const flexWrap = document.getElementById('flexWrap');
const gap = document.getElementById('gap');
const itemCount = document.getElementById('itemCount');
const flexGrow = document.getElementById('flexGrow');
const flexShrink = document.getElementById('flexShrink');
const flexBasis = document.getElementById('flexBasis');
const cssCode = document.querySelector('#cssCode code');
const htmlCode = document.querySelector('#htmlCode code');
const copyButton = document.getElementById('copyCode');
const snackbar = document.getElementById('snackbar');
const tabButtons = document.querySelectorAll('.tab-button');
const codePanes = document.querySelectorAll('.code-pane');
const modal = document.getElementById('modal');
const howToUseButton = document.getElementById('howToUse');
const closeButton = document.querySelector('.close-button');

// Initial setup
let activeTab = 'css';
generateFlexItems();
updateFlexbox();

// Event listeners
[flexDirection, justifyContent, alignItems, flexWrap].forEach(select => {
    select.addEventListener('change', updateFlexbox);
});

[gap, itemCount, flexGrow, flexShrink].forEach(input => {
    input.addEventListener('input', updateFlexbox);
});

flexBasis.addEventListener('input', updateFlexbox);

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
    const codeToCopy = activeTab === 'css' ? cssCode.textContent : htmlCode.textContent;
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

function generateFlexItems() {
    flexContainer.innerHTML = '';
    const count = parseInt(itemCount.value);
    
    for (let i = 1; i <= count; i++) {
        const item = document.createElement('div');
        item.className = 'flex-item';
        item.textContent = `Item ${i}`;
        item.style.flexGrow = flexGrow.value;
        item.style.flexShrink = flexShrink.value;
        item.style.flexBasis = flexBasis.value;
        flexContainer.appendChild(item);
    }
}

function updateFlexbox() {
    // Update container styles
    flexContainer.style.flexDirection = flexDirection.value;
    flexContainer.style.justifyContent = justifyContent.value;
    flexContainer.style.alignItems = alignItems.value;
    flexContainer.style.flexWrap = flexWrap.value;
    flexContainer.style.gap = `${gap.value}px`;

    // Regenerate items with new flex properties
    generateFlexItems();

    // Update code display
    updateCode();
}

function updateCode() {
    // Generate CSS code
    const cssContent = `.flex-container {
    display: flex;
    flex-direction: ${flexDirection.value};
    justify-content: ${justifyContent.value};
    align-items: ${alignItems.value};
    flex-wrap: ${flexWrap.value};
    gap: ${gap.value}px;
}

.flex-item {
    flex-grow: ${flexGrow.value};
    flex-shrink: ${flexShrink.value};
    flex-basis: ${flexBasis.value};
    /* Additional styles for visualization */
    padding: 1rem;
    background-color: #6200ee;
    color: white;
    border-radius: 8px;
    text-align: center;
}`;

    // Generate HTML code
    const htmlContent = `<div class="flex-container">
    ${Array(parseInt(itemCount.value)).fill(0).map((_, i) => 
        `    <div class="flex-item">Item ${i + 1}</div>`
    ).join('\n')}
</div>`;

    // Update code displays
    cssCode.textContent = cssContent;
    htmlCode.textContent = htmlContent;
}

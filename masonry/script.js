document.addEventListener('DOMContentLoaded', () => {
    const masonryContainer = document.getElementById('masonry');
    const masonryBuilder = document.getElementById('masonryBuilder');
    const builderOverlay = document.querySelector('.builder-overlay');
    const builderSize = document.getElementById('builderSize');
    const columnsInput = document.getElementById('columns');
    const gapInput = document.getElementById('gap');
    const itemWidthInput = document.getElementById('itemWidth');
    const generateButton = document.getElementById('generate');
    const cssCodeElement = document.getElementById('cssCode');
    const htmlCodeElement = document.getElementById('htmlCode');
    const copyCodeButton = document.getElementById('copyCode');
    const snackbar = document.getElementById('snackbar');
    const modal = document.getElementById('instructionsModal');
    const helpButton = document.getElementById('helpButton');
    const closeButtons = document.querySelectorAll('.close-modal');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    let currentTab = 'css';

    let draggedItem = null;
    let masonryItems = [];
    let isDrawing = false;
    let startX = 0;
    let startY = 0;

    // Modal functionality
    function showModal() {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    helpButton.addEventListener('click', showModal);
    closeButtons.forEach(button => button.addEventListener('click', hideModal));

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    // Show instructions modal on first visit
    if (!localStorage.getItem('hasVisitedMasonry')) {
        showModal();
        localStorage.setItem('hasVisitedMasonry', 'true');
    }

    // Masonry Builder Event Listeners
    masonryBuilder.addEventListener('mousedown', startDrawing);
    masonryBuilder.addEventListener('mousemove', updateSize);
    document.addEventListener('mouseup', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        const rect = masonryBuilder.getBoundingClientRect();
        startX = Math.floor((e.clientX - rect.left) / 20) * 20;
        startY = Math.floor((e.clientY - rect.top) / 20) * 20;
        
        builderOverlay.style.left = `${startX}px`;
        builderOverlay.style.top = `${startY}px`;
        builderOverlay.style.width = '0';
        builderOverlay.style.height = '0';
        builderOverlay.style.opacity = '1';
        
        masonryBuilder.classList.add('active');
    }

    function updateSize(e) {
        if (!isDrawing) return;

        const rect = masonryBuilder.getBoundingClientRect();
        const rawX = e.clientX - rect.left;
        const rawY = e.clientY - rect.top;
        
        // Snap to grid
        const currentX = Math.min(Math.max(0, Math.floor(rawX / 20) * 20), rect.width - 20);
        const currentY = Math.min(Math.max(0, Math.floor(rawY / 20) * 20), rect.height - 20);

        const width = Math.abs(currentX - startX) + 20;
        const height = Math.abs(currentY - startY) + 20;

        builderOverlay.style.left = `${Math.min(startX, currentX)}px`;
        builderOverlay.style.top = `${Math.min(startY, currentY)}px`;
        builderOverlay.style.width = `${width}px`;
        builderOverlay.style.height = `${height}px`;

        // Calculate grid cells
        const gridCellsX = Math.ceil(width / 20);
        const gridCellsY = Math.ceil(height / 20);
        const totalCells = gridCellsX * gridCellsY;

        // Calculate size ratio based on grid cells
        const sizeRatio = Math.max(1, Math.round(Math.sqrt(totalCells)));
        builderSize.textContent = `Creating item with size ratio: ${sizeRatio}x (${gridCellsX}x${gridCellsY} cells)`;
    }

    function stopDrawing() {
        if (!isDrawing) return;
        
        isDrawing = false;
        masonryBuilder.classList.remove('active');
        
        // Get the size of the drawn area to determine item size
        const width = parseInt(builderOverlay.style.width);
        const height = parseInt(builderOverlay.style.height);
        
        // Only create item if the drawn area is large enough (at least 2x2 grid cells)
        if (width >= 40 && height >= 40) {
            const gridCellsX = Math.ceil(width / 20);
            const gridCellsY = Math.ceil(height / 20);
            const totalCells = gridCellsX * gridCellsY;
            const sizeRatio = Math.max(1, Math.round(Math.sqrt(totalCells)));
            addMasonryItem(sizeRatio);
            generateMasonry();
        }
        
        // Reset overlay
        builderOverlay.style.width = '0';
        builderOverlay.style.height = '0';
        builderOverlay.style.opacity = '0';
        builderSize.textContent = 'Drag to add items';
    }

    function addMasonryItem(sizeRatio) {
        const item = document.createElement('div');
        item.className = 'masonry-item';
        item.draggable = true;
        item.dataset.index = masonryItems.length;
        item.dataset.sizeRatio = sizeRatio;
        
        // Create random colored placeholder with size ratio
        const hue = Math.random() * 360;
        item.style.backgroundColor = `hsl(${hue}, 70%, 95%)`;
        item.style.minHeight = `${100 * sizeRatio}px`;
        
        item.innerHTML = `
            <div style="color: hsl(${hue}, 70%, 30%);">
                <h3>Item ${masonryItems.length + 1}</h3>
                <p>Size Ratio: ${sizeRatio}x</p>
            </div>
        `;

        // Add drag and drop event listeners
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);

        masonryItems.push(item);
    }

    function handleDragStart(e) {
        draggedItem = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.index);
    }

    function handleDragEnd(e) {
        draggedItem.classList.remove('dragging');
        masonryItems.forEach(item => {
            item.classList.remove('drag-over');
        });
        draggedItem = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        if (draggedItem !== this) {
            const draggedIndex = parseInt(draggedItem.dataset.index);
            const droppedIndex = parseInt(this.dataset.index);
            
            // Swap the items in the array
            [masonryItems[draggedIndex], masonryItems[droppedIndex]] = 
            [masonryItems[droppedIndex], masonryItems[draggedIndex]];
            
            // Update indices
            masonryItems[draggedIndex].dataset.index = draggedIndex;
            masonryItems[droppedIndex].dataset.index = droppedIndex;
            
            generateMasonry();
        }
    }

    function generateMasonry() {
        const columns = parseInt(columnsInput.value);
        const gap = parseInt(gapInput.value);
        const itemWidth = parseInt(itemWidthInput.value);

        // Clear existing masonry
        masonryContainer.innerHTML = '';

        // Set masonry properties
        masonryContainer.style.columnCount = columns;
        masonryContainer.style.columnGap = `${gap}px`;

        // Add items to masonry
        masonryItems.forEach(item => {
            masonryContainer.appendChild(item);
        });

        updateCode();
    }

    function updateCode() {
        const columns = columnsInput.value;
        const gap = gapInput.value;
        const itemWidth = itemWidthInput.value;

        // Update CSS code
        const cssCode = `.masonry {
    column-count: ${columns};
    column-gap: ${gap}px;
    padding: ${gap}px;
    width: 100%;
    max-width: ${columns * (parseInt(itemWidth) + gap)}px;
    margin: 0 auto;
}

.masonry-item {
    break-inside: avoid;
    margin-bottom: ${gap}px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.masonry-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}`;

        // Update HTML code
        const htmlItems = masonryItems.map((item, index) => {
            const sizeRatio = item.dataset.sizeRatio;
            return `    <div class="masonry-item" style="min-height: ${100 * sizeRatio}px">
        <div>
            <h3>Item ${index + 1}</h3>
            <p>Size Ratio: ${sizeRatio}x</p>
        </div>
    </div>`;
        });
        
        const htmlCode = `<div class="masonry">
${htmlItems.join('\n')}
</div>`;

        cssCodeElement.textContent = cssCode;
        htmlCodeElement.textContent = htmlCode;
    }

    // Tab functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            switchTab(tab);
        });
    });

    function switchTab(tab) {
        currentTab = tab;
        
        // Update buttons
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tab);
        });

        // Update panes
        tabPanes.forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tab}Tab`);
        });
    }

    function copyToClipboard() {
        const codeElement = currentTab === 'css' ? cssCodeElement : htmlCodeElement;
        const code = codeElement.textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            showSnackbar();
        });
    }

    function showSnackbar() {
        snackbar.textContent = `${currentTab.toUpperCase()} code copied to clipboard!`;
        snackbar.classList.add('show');
        setTimeout(() => {
            snackbar.classList.remove('show');
        }, 3000);
    }

    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });

    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        button.appendChild(ripple);
        
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }

    // Event listeners
    generateButton.addEventListener('click', generateMasonry);
    copyCodeButton.addEventListener('click', copyToClipboard);

    // Initialize masonry
    generateMasonry();
}); 
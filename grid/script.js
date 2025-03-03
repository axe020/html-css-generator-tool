document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid');
    const gridBuilder = document.getElementById('gridBuilder');
    const builderOverlay = document.querySelector('.builder-overlay');
    const builderSize = document.getElementById('builderSize');
    const rowsInput = document.getElementById('rows');
    const columnsInput = document.getElementById('columns');
    const gapInput = document.getElementById('gap');
    const generateButton = document.getElementById('generate');
    const cssCodeElement = document.getElementById('cssCode');
    const copyCodeButton = document.getElementById('copyCode');
    const snackbar = document.getElementById('snackbar');
    const modal = document.getElementById('instructionsModal');
    const helpButton = document.getElementById('helpButton');
    const closeButtons = document.querySelectorAll('.close-modal');
    const htmlCodeElement = document.getElementById('htmlCode');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    let currentTab = 'css';

    let draggedItem = null;
    let gridItems = [];
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
    if (!localStorage.getItem('hasVisited')) {
        showModal();
        localStorage.setItem('hasVisited', 'true');
    }

    // Grid Builder Event Listeners
    gridBuilder.addEventListener('mousedown', startDrawing);
    gridBuilder.addEventListener('mousemove', updateGrid);
    document.addEventListener('mouseup', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        const rect = gridBuilder.getBoundingClientRect();
        startX = Math.floor((e.clientX - rect.left) / 20) * 20;
        startY = Math.floor((e.clientY - rect.top) / 20) * 20;
        
        // Clear any existing overlay
        builderOverlay.style.width = '0';
        builderOverlay.style.height = '0';
        builderOverlay.style.opacity = '0';
        
        // Set new starting position
        builderOverlay.style.left = `${startX}px`;
        builderOverlay.style.top = `${startY}px`;
        
        // Show overlay for new drawing
        setTimeout(() => {
            builderOverlay.style.opacity = '1';
        }, 50);
        
        gridBuilder.classList.add('active');
        builderSize.textContent = 'Drawing grid...';
    }

    function updateGrid(e) {
        if (!isDrawing) return;

        const rect = gridBuilder.getBoundingClientRect();
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

        // Update input values (clamped between 1 and 12)
        columnsInput.value = Math.min(12, Math.max(1, gridCellsX));
        rowsInput.value = Math.min(12, Math.max(1, gridCellsY));
        
        // Update size display
        builderSize.textContent = `Creating grid: ${gridCellsY} x ${gridCellsX}`;

        // Generate grid preview
        generateGrid();
    }

    function stopDrawing() {
        if (!isDrawing) return;
        
        isDrawing = false;
        gridBuilder.classList.remove('active');
        
        // Get the size of the drawn area
        const width = parseInt(builderOverlay.style.width);
        const height = parseInt(builderOverlay.style.height);
        
        // Only update if the drawn area is large enough (at least 2x2 grid cells)
        if (width >= 40 && height >= 40) {
            const gridCellsX = Math.ceil(width / 20);
            const gridCellsY = Math.ceil(height / 20);
            
            // Update input values (clamped between 1 and 12)
            columnsInput.value = Math.min(12, Math.max(1, gridCellsX));
            rowsInput.value = Math.min(12, Math.max(1, gridCellsY));
            
            generateGrid();
            
            // Keep the overlay visible but with reduced opacity
            builderOverlay.style.opacity = '0.3';
            builderSize.textContent = `Grid: ${gridCellsY} x ${gridCellsX}`;
        } else {
            // Reset overlay only if the drawn area is too small
            builderOverlay.style.width = '0';
            builderOverlay.style.height = '0';
            builderOverlay.style.opacity = '0';
            builderSize.textContent = 'Drag to create grid';
        }
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

    function generateGrid() {
        const rows = parseInt(rowsInput.value);
        const columns = parseInt(columnsInput.value);
        const gap = parseInt(gapInput.value);

        // Clear existing grid
        gridContainer.innerHTML = '';
        gridItems = [];

        // Set grid properties
        gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        gridContainer.style.gap = `${gap}px`;

        // Create grid items with animation delay
        for (let i = 0; i < rows * columns; i++) {
            const gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridItem.textContent = `Item ${i + 1}`;
            gridItem.draggable = true;
            gridItem.dataset.index = i;
            
            // Add animation styles
            gridItem.style.opacity = '0';
            gridItem.style.transform = 'scale(0.8)';
            gridItem.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            gridItem.style.transitionDelay = `${i * 30}ms`;

            // Add drag and drop event listeners
            gridItem.addEventListener('dragstart', handleDragStart);
            gridItem.addEventListener('dragend', handleDragEnd);
            gridItem.addEventListener('dragover', handleDragOver);
            gridItem.addEventListener('drop', handleDrop);

            gridContainer.appendChild(gridItem);
            gridItems.push(gridItem);

            // Trigger animation
            setTimeout(() => {
                gridItem.style.opacity = '1';
                gridItem.style.transform = 'scale(1)';
            }, 50);
        }

        updateCode();
    }

    function handleDragStart(e) {
        draggedItem = this;
        this.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.textContent);
    }

    function handleDragEnd(e) {
        draggedItem.classList.remove('dragging');
        gridItems.forEach(item => {
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
            const allItems = [...gridItems];
            const draggedIndex = parseInt(draggedItem.dataset.index);
            const droppedIndex = parseInt(this.dataset.index);

            // Swap the positions with animation
            const draggedContent = draggedItem.textContent;
            const droppedContent = this.textContent;

            // Add swap animation
            this.style.transform = 'scale(0.8)';
            draggedItem.style.transform = 'scale(0.8)';

            setTimeout(() => {
                draggedItem.textContent = droppedContent;
                this.textContent = draggedContent;

                this.style.transform = 'scale(1)';
                draggedItem.style.transform = 'scale(1)';
            }, 150);
        }
    }

    function updateCode() {
        const rows = rowsInput.value;
        const columns = columnsInput.value;
        const gap = gapInput.value;

        // Update CSS code
        const cssCode = `.grid {
    display: grid;
    grid-template-rows: repeat(${rows}, 1fr);
    grid-template-columns: repeat(${columns}, 1fr);
    gap: ${gap}px;
    width: 100%;
    height: 100%;
}

.grid-item {
    background-color: white;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}`;

        // Update HTML code
        const gridItems = [];
        for (let i = 1; i <= rows * columns; i++) {
            gridItems.push(`    <div class="grid-item">Item ${i}</div>`);
        }
        
        const htmlCode = `<div class="grid">
${gridItems.join('\n')}
</div>`;

        cssCodeElement.textContent = cssCode;
        htmlCodeElement.textContent = htmlCode;
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

    // Event listeners
    generateButton.addEventListener('click', generateGrid);
    copyCodeButton.addEventListener('click', copyToClipboard);

    // Initialize grid
    generateGrid();
}); 
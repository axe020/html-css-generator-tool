document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const tableBuilder = document.getElementById('tableBuilder');
    const builderOverlay = document.getElementById('builderOverlay');
    const builderSize = document.getElementById('builderSize');
    const tablePreview = document.getElementById('tablePreview');
    const rowsInput = document.getElementById('rowsInput');
    const columnsInput = document.getElementById('columnsInput');
    const borderInput = document.getElementById('borderInput');
    const paddingInput = document.getElementById('paddingInput');
    const cssCodeContent = document.getElementById('cssCodeContent');
    const htmlCodeContent = document.getElementById('htmlCodeContent');
    const copyButton = document.getElementById('copyButton');
    const snackbar = document.getElementById('snackbar');
    const instructionsBtn = document.getElementById('instructionsBtn');
    const instructionsModal = document.getElementById('instructionsModal');
    const closeModal = document.getElementById('closeModal');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    let isDrawing = false;
    let startX, startY;

    // Event listeners for the builder
    tableBuilder.addEventListener('mousedown', startDrawing);
    tableBuilder.addEventListener('mousemove', updateGrid);
    tableBuilder.addEventListener('mouseup', stopDrawing);
    tableBuilder.addEventListener('mouseleave', stopDrawing);

    // Event listeners for inputs
    rowsInput.addEventListener('input', generateTable);
    columnsInput.addEventListener('input', generateTable);
    borderInput.addEventListener('input', generateTable);
    paddingInput.addEventListener('input', generateTable);

    function createTablePreview(rows, cols) {
        let table = document.createElement('table');
        let thead = document.createElement('thead');
        let tbody = document.createElement('tbody');

        // Create header row
        let headerRow = document.createElement('tr');
        for (let i = 0; i < cols; i++) {
            let th = document.createElement('th');
            th.textContent = `H${i + 1}`;
            headerRow.appendChild(th);
        }
        thead.appendChild(headerRow);

        // Create body rows
        for (let i = 0; i < rows - 1; i++) {
            let row = document.createElement('tr');
            for (let j = 0; j < cols; j++) {
                let td = document.createElement('td');
                td.textContent = `${i + 1}-${j + 1}`;
                row.appendChild(td);
            }
            tbody.appendChild(row);
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        return table;
    }

    function startDrawing(e) {
        isDrawing = true;
        const rect = tableBuilder.getBoundingClientRect();
        startX = Math.floor((e.clientX - rect.left) / 20) * 20;
        startY = Math.floor((e.clientY - rect.top) / 20) * 20;
        
        // Clear any existing overlay and preview
        builderOverlay.style.width = '0';
        builderOverlay.style.height = '0';
        builderOverlay.style.opacity = '0';
        tablePreview.innerHTML = '';
        tablePreview.classList.remove('active');
        
        // Set new starting position
        builderOverlay.style.left = `${startX}px`;
        builderOverlay.style.top = `${startY}px`;
        
        // Show overlay for new drawing
        setTimeout(() => {
            builderOverlay.style.opacity = '1';
        }, 50);
        
        tableBuilder.classList.add('active');
        builderSize.textContent = 'Drawing table...';
    }

    function updateGrid(e) {
        if (!isDrawing) return;

        const rect = tableBuilder.getBoundingClientRect();
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

        // Calculate table cells
        const tableCellsX = Math.ceil(width / 20);
        const tableCellsY = Math.ceil(height / 20);

        // Update input values (minimum 1, maximum 50)
        const cols = Math.max(1, tableCellsX);
        const rows = Math.max(1, tableCellsY);
        
        columnsInput.value = cols;
        rowsInput.value = rows;
        
        // Update size display
        builderSize.textContent = `Creating table: ${rows} x ${cols}`;

        // Update preview
        if (width >= 40 && height >= 40) {
            tablePreview.innerHTML = '';
            tablePreview.appendChild(createTablePreview(rows, cols));
            tablePreview.classList.add('active');
        } else {
            tablePreview.innerHTML = '';
            tablePreview.classList.remove('active');
        }

        // Generate table code
        generateTable();
    }

    function stopDrawing() {
        if (!isDrawing) return;
        
        isDrawing = false;
        tableBuilder.classList.remove('active');
        
        // Get the size of the drawn area
        const width = parseInt(builderOverlay.style.width);
        const height = parseInt(builderOverlay.style.height);
        
        // Only update if the drawn area is large enough (at least 2x2 table cells)
        if (width >= 40 && height >= 40) {
            const tableCellsX = Math.ceil(width / 20);
            const tableCellsY = Math.ceil(height / 20);
            
            // Update input values (minimum 1)
            const cols = Math.max(1, tableCellsX);
            const rows = Math.max(1, tableCellsY);
            
            columnsInput.value = cols;
            rowsInput.value = rows;
            
            generateTable();
            
            // Keep the overlay visible but with reduced opacity
            builderOverlay.style.opacity = '0.3';
            builderSize.textContent = `Table: ${rows} x ${cols}`;
            tablePreview.classList.add('active');
        } else {
            // Reset overlay and preview if the drawn area is too small
            builderOverlay.style.width = '0';
            builderOverlay.style.height = '0';
            builderOverlay.style.opacity = '0';
            builderSize.textContent = 'Drag to create table';
            tablePreview.innerHTML = '';
            tablePreview.classList.remove('active');
        }
    }

    function generateTable() {
        const rows = parseInt(rowsInput.value) || 1;
        const columns = parseInt(columnsInput.value) || 1;
        const borderWidth = parseInt(borderInput.value) || 1;
        const cellPadding = parseInt(paddingInput.value) || 8;

        // Update preview
        tablePreview.innerHTML = '';
        tablePreview.appendChild(createTablePreview(rows, columns));
        tablePreview.classList.add('active');

        // Generate CSS code
        const cssCode = `table {
  border-collapse: collapse;
  width: 100%;
}

td {
  border: ${borderWidth}px solid #ddd;
  padding: ${cellPadding}px;
  text-align: left;
}

th {
  border: ${borderWidth}px solid #ddd;
  padding: ${cellPadding}px;
  text-align: left;
  background-color: #f8f9fa;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f8f9fa;
}

tr:hover {
  background-color: #f5f5f5;
}`;

        // Generate HTML code
        let htmlCode = '<table>\n  <thead>\n    <tr>\n';
        
        // Add header cells
        for (let i = 0; i < columns; i++) {
            htmlCode += '      <th>Header ' + (i + 1) + '</th>\n';
        }
        htmlCode += '    </tr>\n  </thead>\n  <tbody>\n';
        
        // Add body rows
        for (let i = 0; i < rows - 1; i++) {
            htmlCode += '    <tr>\n';
            for (let j = 0; j < columns; j++) {
                htmlCode += '      <td>Cell ' + (i + 1) + '-' + (j + 1) + '</td>\n';
            }
            htmlCode += '    </tr>\n';
        }
        htmlCode += '  </tbody>\n</table>';

        // Update code displays
        cssCodeContent.textContent = cssCode;
        htmlCodeContent.textContent = htmlCode;
    }

    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            switchTab(tab);
        });
    });

    function switchTab(tab) {
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tab);
        });

        tabPanes.forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tab}Code`);
        });
    }

    // Copy button functionality
    copyButton.addEventListener('click', () => {
        const activePane = document.querySelector('.tab-pane.active');
        const codeContent = activePane.querySelector('code').textContent;
        const codeType = activePane.id === 'cssCode' ? 'CSS' : 'HTML';

        navigator.clipboard.writeText(codeContent).then(() => {
            showSnackbar(`${codeType} code copied to clipboard!`);
        });
    });

    function showSnackbar(message) {
        snackbar.textContent = message;
        snackbar.className = 'show';
        setTimeout(() => {
            snackbar.className = '';
        }, 3000);
    }

    // Modal functionality
    instructionsBtn.addEventListener('click', () => {
        instructionsModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        instructionsModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === instructionsModal) {
            instructionsModal.style.display = 'none';
        }
    });

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

    // Generate initial table
    generateTable();
}); 
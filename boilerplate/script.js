// DOM Elements
const cssInput = document.getElementById('cssInput');
const outputCode = document.getElementById('outputCode');
const copyButton = document.getElementById('copyCode');
const downloadButton = document.getElementById('downloadCode');
const modal = document.getElementById('modal');
const howToUseButton = document.getElementById('howToUse');
const closeButton = document.querySelector('.close-button');
const snackbar = document.getElementById('snackbar');

// Framework CDN URLs and dependencies
const cdnUrls = {
    bootstrap: {
        css: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
        js: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
    },
    tailwind: {
        css: 'https://cdn.jsdelivr.net/npm/tailwindcss@3.4.1/dist/tailwind.min.css'
    },
    foundation: {
        css: 'https://cdn.jsdelivr.net/npm/foundation-sites@6.8.1/dist/css/foundation.min.css',
        js: 'https://cdn.jsdelivr.net/npm/foundation-sites@6.8.1/dist/js/foundation.min.js'
    },
    pure: {
        css: 'https://cdn.jsdelivr.net/npm/purecss@3.0.0/build/pure-min.css'
    },
    normalize: {
        css: 'https://cdn.jsdelivr.net/npm/normalize.css@8.0.1/normalize.min.css'
    },
    reset: {
        css: 'https://cdn.jsdelivr.net/npm/reset-css/reset.min.css'
    },
    nextui: {
        css: 'https://cdn.jsdelivr.net/npm/@nextui-org/theme@2.2.9/dist/theme.min.css',
        js: 'https://cdn.jsdelivr.net/npm/@nextui-org/system@2.2.9/dist/system.min.js'
    },
    master: {
        css: 'https://cdn.jsdelivr.net/npm/@master/normal.css@2.0.0/dist/normal.min.css',
        js: 'https://cdn.jsdelivr.net/npm/@master/css@2.0.0/dist/master.min.js'
    },
    fontawesome: {
        css: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/css/all.min.css'
    },
    animate: {
        css: 'https://cdn.jsdelivr.net/npm/animate.css@4.1.1/animate.min.css'
    }
};

// Event Listeners
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', generateBoilerplate);
});
document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('input', generateBoilerplate);
});
copyButton.addEventListener('click', copyToClipboard);
downloadButton.addEventListener('click', downloadBoilerplate);
howToUseButton.addEventListener('click', showModal);
closeButton.addEventListener('click', hideModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
});

// Generate boilerplate code based on selected options
function generateBoilerplate() {
    const frameworks = getSelectedValues('framework');
    const resets = getSelectedValues('reset');
    const ui = getSelectedValues('ui');
    const additional = getSelectedValues('additional');
    const loading = document.querySelector('input[name="loading"]:checked').value;
    
    const title = document.getElementById('pageTitle').value || 'My Website';
    const description = document.getElementById('description').value;
    const keywords = document.getElementById('keywords').value;
    const author = document.getElementById('author').value;
    const siteName = document.getElementById('siteName').value;
    const socialImage = document.getElementById('socialImage').value;
    const twitterHandle = document.getElementById('twitterHandle').value;
    const siteUrl = document.getElementById('siteUrl').value;
    
    const socialOptions = getSelectedValues('social');
    const socialExtras = getSelectedValues('social-extra');
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>`;

    // Add meta tags if provided
    if (description) {
        html += `\n    <meta name="description" content="${escapeHtml(description)}">`;
    }
    if (keywords) {
        html += `\n    <meta name="keywords" content="${escapeHtml(keywords)}">`;
    }
    if (author) {
        html += `\n    <meta name="author" content="${escapeHtml(author)}">`;
    }

    // Add Open Graph meta tags
    if (socialOptions.includes('opengraph')) {
        html += `\n    <!-- Open Graph / Facebook -->`;
        html += `\n    <meta property="og:type" content="website">`;
        html += `\n    <meta property="og:title" content="${escapeHtml(title)}">`;
        if (description) {
            html += `\n    <meta property="og:description" content="${escapeHtml(description)}">`;
        }
        if (siteUrl) {
            html += `\n    <meta property="og:url" content="${escapeHtml(siteUrl)}">`;
        }
        if (siteName) {
            html += `\n    <meta property="og:site_name" content="${escapeHtml(siteName)}">`;
        }
        if (socialImage) {
            html += `\n    <meta property="og:image" content="${escapeHtml(socialImage)}">`;
        }
        if (socialExtras.includes('locale')) {
            html += `\n    <meta property="og:locale" content="en_US">`;
        }
    }

    // Add Twitter Card meta tags
    if (socialOptions.includes('twitter')) {
        html += `\n    <!-- Twitter -->`;
        if (socialExtras.includes('card')) {
            html += `\n    <meta name="twitter:card" content="summary_large_image">`;
        }
        if (twitterHandle) {
            html += `\n    <meta name="twitter:site" content="${escapeHtml(twitterHandle)}">`;
            html += `\n    <meta name="twitter:creator" content="${escapeHtml(twitterHandle)}">`;
        }
        html += `\n    <meta name="twitter:title" content="${escapeHtml(title)}">`;
        if (description) {
            html += `\n    <meta name="twitter:description" content="${escapeHtml(description)}">`;
        }
        if (socialImage) {
            html += `\n    <meta name="twitter:image" content="${escapeHtml(socialImage)}">`;
        }
    }

    // Add CSS Reset/Normalize
    resets.forEach(reset => {
        if (cdnUrls[reset]?.css) {
            html += `\n    <link rel="stylesheet" href="${cdnUrls[reset].css}">`;
        }
    });

    // Add CSS Frameworks
    frameworks.forEach(framework => {
        if (cdnUrls[framework]?.css) {
            html += `\n    <link rel="stylesheet" href="${cdnUrls[framework].css}">`;
        }
    });

    // Add UI Libraries CSS
    ui.forEach(lib => {
        if (cdnUrls[lib]?.css) {
            html += `\n    <link rel="stylesheet" href="${cdnUrls[lib].css}">`;
        }
    });

    // Add Additional Libraries CSS
    additional.forEach(lib => {
        if (cdnUrls[lib]?.css) {
            html += `\n    <link rel="stylesheet" href="${cdnUrls[lib].css}">`;
        }
    });

    // Add custom styles
    html += `\n    <link rel="stylesheet" href="styles.css">`;

    html += `\n</head>
<body>
    <h1>Welcome to ${escapeHtml(title)}</h1>

    <!-- Your content here -->`;

    // Add JavaScript libraries with specified loading strategy
    const loadAttr = loading === 'normal' ? '' : ` ${loading}`;

    // Add Framework JavaScript
    frameworks.forEach(framework => {
        if (cdnUrls[framework]?.js) {
            html += `\n    <script src="${cdnUrls[framework].js}"${loadAttr}></script>`;
        }
    });

    // Add UI Libraries JavaScript
    ui.forEach(lib => {
        if (cdnUrls[lib]?.js) {
            html += `\n    <script src="${cdnUrls[lib].js}"${loadAttr}></script>`;
        }
    });

    // Add custom script
    html += `\n    <script src="script.js"${loadAttr}></script>`;

    html += `\n</body>
</html>`;

    outputCode.textContent = html;
}

// Helper function to get selected values from checkboxes
function getSelectedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map(input => input.value);
}

// Helper function to escape HTML special characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility function to copy code to clipboard
function copyToClipboard() {
    const code = outputCode.textContent;
    if (!code) {
        showSnackbar('No code to copy');
        return;
    }
    
    navigator.clipboard.writeText(code).then(() => {
        showSnackbar('Code copied to clipboard!');
    });
}

// UI helper functions
function showModal() {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

function showSnackbar(message) {
    snackbar.textContent = message;
    snackbar.className = 'show';
    setTimeout(() => snackbar.className = '', 3000);
}

/**
 * Downloads the generated HTML boilerplate as a file
 */
function downloadBoilerplate() {
    const code = outputCode.textContent;
    if (!code) {
        showSnackbar('No code to download');
        return;
    }
    
    // Create a title for the file based on the page title or use default
    const title = document.getElementById('pageTitle').value || 'index';
    
    // Create a Blob containing the HTML code
    const blob = new Blob([code], { type: 'text/html' });
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title}.html`;
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    showSnackbar('File downloaded successfully!');
}

// Generate initial boilerplate
generateBoilerplate(); 
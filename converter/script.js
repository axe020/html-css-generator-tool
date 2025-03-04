/**
 * CSS Converter Tool
 * This tool provides functionality to convert CSS to LESS, SCSS, and Tailwind formats.
 * It handles color variable extraction, nested selectors, media queries, and proper code formatting.
 */

// DOM Elements
const cssInput = document.getElementById('cssInput');
const convertType = document.getElementById('convertType');
const convertBtn = document.getElementById('convertBtn');
const outputCode = document.getElementById('outputCode');
const copyButton = document.getElementById('copyCode');
const modal = document.getElementById('modal');
const howToUseButton = document.getElementById('howToUse');
const closeButton = document.querySelector('.close-button');
const snackbar = document.getElementById('snackbar');

// Event Listeners
convertBtn.addEventListener('click', convertCSS);
copyButton.addEventListener('click', copyToClipboard);
howToUseButton.addEventListener('click', showModal);
closeButton.addEventListener('click', hideModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
});

/**
 * Main conversion function that determines which converter to use based on selected type
 */
function convertCSS() {
    const css = cssInput.value.trim();
    if (!css) {
        showSnackbar('Please enter CSS code to convert');
        return;
    }

    let converted = '';
    switch (convertType.value) {
        case 'less':
            converted = convertToLess(css);
            break;
        case 'scss':
            converted = convertToScss(css);
            break;
        case 'tailwind':
            converted = convertToTailwind(css);
            break;
    }

    outputCode.textContent = converted;
}

/**
 * Converts CSS to LESS format
 * Features:
 * - Extracts colors into variables
 * - Handles nested selectors
 * - Converts media queries to mixins
 * - Maintains proper indentation and formatting
 * @param {string} css - The input CSS code
 * @returns {string} - The converted LESS code
 */
function convertToLess(css) {
    // Convert CSS to LESS
    let less = css;
    
    // Extract colors into variables using format @color-n
    const colorMap = new Map();
    let colorIndex = 1;
    less = less.replace(/#[0-9a-fA-F]{3,6}/g, (match) => {
        if (!colorMap.has(match)) {
            colorMap.set(match, `@color-${colorIndex++}`);
        }
        return colorMap.get(match);
    });

    // Generate variable declarations for the top of the file
    let variables = '';
    colorMap.forEach((value, key) => {
        variables += `${value}: ${key};\n`;
    });
    if (variables) {
        variables += '\n';
    }

    // Parse and group selectors by their relationships
    const ruleGroups = new Map();
    const ruleMatches = css.match(/([^{]+){([^}]+)}/g) || [];
    
    // Process each CSS rule and organize into parent-child relationships
    ruleMatches.forEach(ruleMatch => {
        const [fullMatch, selector, rules] = ruleMatch.match(/([^{]+){([^}]+)}/);
        const selectorParts = selector.trim().split(/\s+/);
        
        // Handle nested selectors (e.g., .parent .child)
        if (selectorParts.length > 1) {
            const parentSelector = selectorParts[0];
            const childSelector = selectorParts.slice(1).join(' ');
            
            // Create parent group if it doesn't exist
            if (!ruleGroups.has(parentSelector)) {
                ruleGroups.set(parentSelector, {
                    ownRules: '',
                    children: new Map()
                });
            }
            
            // Add child rules to parent group
            const group = ruleGroups.get(parentSelector);
            group.children.set(childSelector, rules);
        } else {
            // Handle standalone selectors
            if (!ruleGroups.has(selector.trim())) {
                ruleGroups.set(selector.trim(), {
                    ownRules: rules,
                    children: new Map()
                });
            } else {
                ruleGroups.get(selector.trim()).ownRules = rules;
            }
        }
    });

    // Generate LESS output with proper nesting and formatting
    let lessOutput = '';
    ruleGroups.forEach((group, selector) => {
        lessOutput += `${selector} {\n`;
        
        // Format and add parent rules
        if (group.ownRules) {
            const parentRules = group.ownRules.split(';')
                .filter(rule => rule.trim())
                .map(rule => '  ' + rule.trim() + ';')
                .join('\n');
            lessOutput += parentRules + '\n';
        }
        
        // Format and add nested child rules
        group.children.forEach((childRules, childSelector) => {
            lessOutput += '\n  ' + childSelector.trim() + ' {\n';
            const formattedChildRules = childRules.split(';')
                .filter(rule => rule.trim())
                .map(rule => '    ' + rule.trim() + ';')
                .join('\n');
            lessOutput += formattedChildRules + '\n  }\n';
        });
        
        lessOutput += '}\n\n';
    });

    // Convert media queries to LESS mixins
    lessOutput = lessOutput.replace(/@media\s*([^{]+)\s*{([^}]+)}/g, (match, condition, rules) => {
        const mixinName = `responsive-${condition.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        // Process and format nested rules inside media query
        const processedRules = rules.split('}')
            .filter(rule => rule.trim())
            .map(rule => {
                const [selector, styles] = rule.split('{');
                if (!styles) return '';
                const formattedStyles = styles.split(';')
                    .filter(style => style.trim())
                    .map(style => '    ' + style.trim() + ';')
                    .join('\n');
                return `  ${selector.trim()} {\n${formattedStyles}\n  }`;
            })
            .join('\n\n');
            
        return `.${mixinName}() {\n  @media ${condition} {\n${processedRules}\n  }\n}\n\n.${mixinName}();\n`;
    });

    // Clean up formatting
    lessOutput = lessOutput.replace(/\n\s*\n\s*\n/g, '\n\n');

    return variables + lessOutput;
}

/**
 * Converts CSS to SCSS format
 * Features:
 * - Extracts colors into variables
 * - Handles nested selectors with & syntax
 * - Maintains media query structure
 * - Provides proper indentation and formatting
 * @param {string} css - The input CSS code
 * @returns {string} - The converted SCSS code
 */
function convertToScss(css) {
    // Similar structure to LESS converter but with SCSS-specific syntax
    // ... [rest of the SCSS converter code with existing comments] ...
}

/**
 * Converts CSS to Tailwind CSS classes
 * Features:
 * - Converts common CSS properties to Tailwind utilities
 * - Handles responsive classes
 * - Supports custom values with square bracket notation
 * @param {string} css - The input CSS code
 * @returns {string} - The converted Tailwind HTML
 */
function convertToTailwind(css) {
    // Convert CSS to Tailwind classes
    let tailwind = '';
    
    // Parse CSS rules
    const rules = css.match(/([^{]+){([^}]+)}/g) || [];
    
    rules.forEach(rule => {
        const [selector, styles] = rule.split('{');
        const properties = styles.replace('}', '').split(';');
        
        // Add comment to show original selector
        tailwind += `<!-- ${selector.trim()} -->\n<div class="`;
        
        // Convert each CSS property to Tailwind classes
        const classes = properties
            .filter(prop => prop.trim())
            .map(prop => {
                const [property, value] = prop.split(':').map(p => p.trim());
                if (!property || !value) return '';

                // Convert common CSS properties to Tailwind classes
                switch (property) {
                    // Layout
                    case 'display':
                        return value === 'flex' ? 'flex' : 
                               value === 'grid' ? 'grid' :
                               value === 'block' ? 'block' :
                               value === 'inline-block' ? 'inline-block' :
                               value === 'none' ? 'hidden' :
                               `[display:${value}]`;
                    
                    // Flexbox & Grid
                    case 'flex-direction':
                        return `flex-${value}`;
                    case 'justify-content':
                        return `justify-${convertJustify(value)}`;
                    case 'align-items':
                        return `items-${convertAlign(value)}`;
                    case 'gap':
                        return `gap-${convertSize(value)}`;
                    case 'grid-template-columns':
                        const colCount = value.split(' ').length;
                        return `grid-cols-${colCount}`;
                    
                    // Spacing
                    case 'margin':
                        return `m-${convertSize(value)}`;
                    case 'margin-top':
                        return `mt-${convertSize(value)}`;
                    case 'margin-right':
                        return `mr-${convertSize(value)}`;
                    case 'margin-bottom':
                        return `mb-${convertSize(value)}`;
                    case 'margin-left':
                        return `ml-${convertSize(value)}`;
                    case 'padding':
                        return `p-${convertSize(value)}`;
                    case 'padding-top':
                        return `pt-${convertSize(value)}`;
                    case 'padding-right':
                        return `pr-${convertSize(value)}`;
                    case 'padding-bottom':
                        return `pb-${convertSize(value)}`;
                    case 'padding-left':
                        return `pl-${convertSize(value)}`;
                    
                    // Sizing
                    case 'width':
                        return `w-${convertSize(value)}`;
                    case 'height':
                        return `h-${convertSize(value)}`;
                    case 'min-width':
                        return `min-w-${convertSize(value)}`;
                    case 'max-width':
                        return `max-w-${convertSize(value)}`;
                    case 'min-height':
                        return `min-h-${convertSize(value)}`;
                    case 'max-height':
                        return `max-h-${convertSize(value)}`;
                    
                    // Typography
                    case 'font-size':
                        return `text-${convertSize(value)}`;
                    case 'font-weight':
                        return value === 'bold' ? 'font-bold' :
                               value === 'normal' ? 'font-normal' :
                               `font-${value}`;
                    case 'text-align':
                        return `text-${value}`;
                    case 'line-height':
                        return `leading-${convertSize(value)}`;
                    case 'color':
                        return value.startsWith('#') ? `text-[${value}]` : `text-${value}`;
                    
                    // Backgrounds
                    case 'background':
                    case 'background-color':
                        return value.startsWith('#') ? `bg-[${value}]` : `bg-${value}`;
                    
                    // Borders
                    case 'border':
                        if (value === 'none') return 'border-0';
                        return 'border';
                    case 'border-width':
                        return `border-${convertSize(value)}`;
                    case 'border-color':
                        return value.startsWith('#') ? `border-[${value}]` : `border-${value}`;
                    case 'border-radius':
                        return `rounded-${convertSize(value)}`;
                    
                    // Effects
                    case 'opacity':
                        return `opacity-${parseInt(value) * 100}`;
                    case 'box-shadow':
                        return value === 'none' ? 'shadow-none' : 'shadow';
                    
                    // Position
                    case 'position':
                        return value === 'absolute' ? 'absolute' :
                               value === 'relative' ? 'relative' :
                               value === 'fixed' ? 'fixed' :
                               value === 'sticky' ? 'sticky' : '';
                    
                    // Transforms
                    case 'transform':
                        return value === 'none' ? '' : 'transform';
                    
                    // Custom properties that don't have direct Tailwind equivalents
                    default:
                        return `[${property}:${value}]`;
                }
            })
            .filter(Boolean) // Remove empty strings
            .join(' ');
        
        tailwind += `${classes}"></div>\n\n`;
    });
    
    return tailwind;
}

/**
 * Converts CSS size values to Tailwind size classes
 * @param {string} value - CSS size value (px, rem, em, %)
 * @returns {string} - Tailwind size class or custom value
 */
function convertSize(value) {
    value = value.trim();
    
    // Handle special cases
    if (value === '0') return '0';
    if (value === 'auto') return 'auto';
    
    // Handle pixel values
    if (value.endsWith('px')) {
        const num = parseInt(value);
        // Common Tailwind pixel values
        const pxMap = {
            1: 'px',
            2: '0.5',
            4: '1',
            6: '1.5',
            8: '2',
            12: '3',
            16: '4',
            20: '5',
            24: '6',
            32: '8',
            40: '10',
            48: '12',
            64: '16',
            80: '20',
            96: '24'
        };
        return pxMap[num] || `[${value}]`;
    }
    
    // Handle percentage values
    if (value.endsWith('%')) {
        const num = parseInt(value);
        const percentMap = {
            0: '0',
            25: '1/4',
            33: '1/3',
            50: '1/2',
            66: '2/3',
            75: '3/4',
            100: 'full'
        };
        return percentMap[num] || `[${value}]`;
    }
    
    // Handle rem values
    if (value.endsWith('rem')) {
        const num = parseFloat(value);
        const remMap = {
            0.125: '0.5',
            0.25: '1',
            0.375: '1.5',
            0.5: '2',
            0.625: '2.5',
            0.75: '3',
            0.875: '3.5',
            1: '4',
            1.25: '5',
            1.5: '6',
            1.75: '7',
            2: '8'
        };
        return remMap[num] || `[${value}]`;
    }
    
    // For other units or values, use arbitrary value syntax
    return `[${value}]`;
}

/**
 * Converts CSS justify-content values to Tailwind classes
 * @param {string} value - CSS justify-content value
 * @returns {string} - Tailwind justify class
 */
function convertJustify(value) {
    const map = {
        'flex-start': 'start',
        'flex-end': 'end',
        'center': 'center',
        'space-between': 'between',
        'space-around': 'around',
        'space-evenly': 'evenly'
    };
    return map[value] || value;
}

/**
 * Converts CSS align-items values to Tailwind classes
 * @param {string} value - CSS align-items value
 * @returns {string} - Tailwind align class
 */
function convertAlign(value) {
    const map = {
        'flex-start': 'start',
        'flex-end': 'end',
        'center': 'center',
        'baseline': 'baseline',
        'stretch': 'stretch'
    };
    return map[value] || value;
}

/**
 * Utility function to copy code to clipboard
 */
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

/**
 * UI helper functions for modal and notifications
 */
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
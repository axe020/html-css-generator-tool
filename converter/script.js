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

// Functions
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

function convertToLess(css) {
    // Convert CSS to LESS
    let less = css;
    
    // Convert hex colors to variables
    const colorMap = new Map();
    let colorIndex = 1;
    less = less.replace(/#[0-9a-fA-F]{3,6}/g, (match) => {
        if (!colorMap.has(match)) {
            colorMap.set(match, `@color-${colorIndex++}`);
        }
        return colorMap.get(match);
    });

    // Add variable declarations at the top
    let variables = '';
    colorMap.forEach((value, key) => {
        variables += `${value}: ${key};\n`;
    });
    if (variables) {
        variables += '\n';
    }

    // First, collect all rules and group them by parent selector
    const ruleGroups = new Map();
    const ruleMatches = css.match(/([^{]+){([^}]+)}/g) || [];
    
    ruleMatches.forEach(ruleMatch => {
        const [fullMatch, selector, rules] = ruleMatch.match(/([^{]+){([^}]+)}/);
        const selectorParts = selector.trim().split(/\s+/);
        
        // If this is a child selector (contains space)
        if (selectorParts.length > 1) {
            const parentSelector = selectorParts[0];
            const childSelector = selectorParts.slice(1).join(' ');
            
            if (!ruleGroups.has(parentSelector)) {
                ruleGroups.set(parentSelector, {
                    ownRules: '',
                    children: new Map()
                });
            }
            
            const group = ruleGroups.get(parentSelector);
            group.children.set(childSelector, rules);
        } else {
            // This is a parent selector
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

    // Convert the grouped rules to LESS format
    let lessOutput = '';
    ruleGroups.forEach((group, selector) => {
        lessOutput += `${selector} {\n`;
        
        // Add parent's own rules
        if (group.ownRules) {
            const parentRules = group.ownRules.split(';')
                .filter(rule => rule.trim())
                .map(rule => '  ' + rule.trim() + ';')
                .join('\n');
            lessOutput += parentRules + '\n';
        }
        
        // Add nested child rules
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

    // Convert media queries to mixins with proper nesting
    lessOutput = lessOutput.replace(/@media\s*([^{]+)\s*{([^}]+)}/g, (match, condition, rules) => {
        const mixinName = `responsive-${condition.replace(/[^a-zA-Z0-9]/g, '-')}`;
        
        // Process nested rules inside media query
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

    // Clean up multiple consecutive empty lines
    lessOutput = lessOutput.replace(/\n\s*\n\s*\n/g, '\n\n');

    return variables + lessOutput;
}

function convertToScss(css) {
    // Convert CSS to SCSS
    let scss = css;
    
    // Convert colors to variables
    const colorMap = new Map();
    let colorIndex = 1;
    scss = scss.replace(/#[0-9a-fA-F]{3,6}/g, (match) => {
        if (!colorMap.has(match)) {
            colorMap.set(match, `$color-${colorIndex++}`);
        }
        return colorMap.get(match);
    });

    // Add variable declarations at the top
    let variables = '';
    colorMap.forEach((value, key) => {
        variables += `${value}: ${key};\n`;
    });
    if (variables) {
        variables += '\n';
    }

    // First, collect all rules and group them by parent selector
    const ruleGroups = new Map();
    const ruleMatches = css.match(/([^{]+){([^}]+)}/g) || [];
    
    ruleMatches.forEach(ruleMatch => {
        const [fullMatch, selector, rules] = ruleMatch.match(/([^{]+){([^}]+)}/);
        const selectorParts = selector.trim().split(/\s+/);
        
        // If this is a child selector (contains space)
        if (selectorParts.length > 1) {
            const parentSelector = selectorParts[0];
            const childSelector = selectorParts.slice(1).join(' ');
            
            if (!ruleGroups.has(parentSelector)) {
                ruleGroups.set(parentSelector, {
                    ownRules: '',
                    children: new Map()
                });
            }
            
            const group = ruleGroups.get(parentSelector);
            group.children.set(childSelector, rules);
        } else {
            // This is a parent selector
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

    // Convert the grouped rules to SCSS format
    let scssOutput = '';
    ruleGroups.forEach((group, selector) => {
        scssOutput += `${selector} {\n`;
        
        // Add parent's own rules
        if (group.ownRules) {
            const parentRules = group.ownRules.split(';')
                .filter(rule => rule.trim())
                .map(rule => '  ' + rule.trim() + ';')
                .join('\n');
            scssOutput += parentRules + '\n';
        }
        
        // Add nested child rules
        group.children.forEach((childRules, childSelector) => {
            scssOutput += '\n  ' + childSelector.trim() + ' {\n';
            const formattedChildRules = childRules.split(';')
                .filter(rule => rule.trim())
                .map(rule => '    ' + rule.trim() + ';')
                .join('\n');
            scssOutput += formattedChildRules + '\n  }\n';
        });
        
        scssOutput += '}\n\n';
    });

    // Convert media queries to nested format
    scssOutput = scssOutput.replace(/@media\s*([^{]+)\s*{([^}]+)}/g, (match, condition, rules) => {
        const formattedRules = rules.split('}')
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
        return `@media ${condition} {\n${formattedRules}\n}\n`;
    });

    // Clean up multiple consecutive empty lines
    scssOutput = scssOutput.replace(/\n\s*\n\s*\n/g, '\n\n');

    return variables + scssOutput;
}

function convertToTailwind(css) {
    // Convert CSS to Tailwind classes
    let tailwind = '';
    
    // Parse CSS rules
    const rules = css.match(/[^{]+{[^}]+}/g) || [];
    
    rules.forEach(rule => {
        const [selector, styles] = rule.split('{');
        const properties = styles.replace('}', '').split(';');
        
        tailwind += `<!-- ${selector.trim()} -->\n<div class="`;
        
        properties.forEach(prop => {
            const [property, value] = prop.split(':').map(p => p.trim());
            if (property && value) {
                // Convert common CSS properties to Tailwind classes
                switch (property) {
                    case 'margin':
                        tailwind += `m-${convertSize(value)} `;
                        break;
                    case 'padding':
                        tailwind += `p-${convertSize(value)} `;
                        break;
                    case 'width':
                        tailwind += `w-${convertSize(value)} `;
                        break;
                    case 'height':
                        tailwind += `h-${convertSize(value)} `;
                        break;
                    case 'background-color':
                        tailwind += `bg-[${value}] `;
                        break;
                    case 'color':
                        tailwind += `text-[${value}] `;
                        break;
                    case 'display':
                        tailwind += `${value} `;
                        break;
                    case 'flex-direction':
                        tailwind += `flex-${value} `;
                        break;
                    case 'justify-content':
                        tailwind += `justify-${convertJustify(value)} `;
                        break;
                    case 'align-items':
                        tailwind += `items-${convertAlign(value)} `;
                        break;
                    case 'border-radius':
                        tailwind += `rounded-${convertSize(value)} `;
                        break;
                    // Add more property conversions as needed
                }
            }
        });
        
        tailwind += `"></div>\n\n`;
    });
    
    return tailwind;
}

function convertSize(value) {
    // Convert CSS sizes to Tailwind sizes
    value = value.trim();
    if (value === '0') return '0';
    if (value.endsWith('px')) {
        const num = parseInt(value);
        if (num <= 1) return 'px';
        if (num <= 2) return '0.5';
        if (num <= 4) return '1';
        if (num <= 6) return '1.5';
        if (num <= 8) return '2';
        if (num <= 12) return '3';
        if (num <= 16) return '4';
        return `[${value}]`;
    }
    if (value.endsWith('%')) {
        const num = parseInt(value);
        if (num === 100) return 'full';
        if (num === 75) return '3/4';
        if (num === 50) return '1/2';
        if (num === 25) return '1/4';
        return `[${value}]`;
    }
    return `[${value}]`;
}

function convertJustify(value) {
    // Convert justify-content values to Tailwind classes
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

function convertAlign(value) {
    // Convert align-items values to Tailwind classes
    const map = {
        'flex-start': 'start',
        'flex-end': 'end',
        'center': 'center',
        'baseline': 'baseline',
        'stretch': 'stretch'
    };
    return map[value] || value;
}

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
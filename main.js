const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~';

// Random character generator
function getRandomChar() {
    return chars[Math.floor(Math.random() * chars.length)];
}

// Scramble text effect (matrix/flicker)
function scrambleWords(element, targetText, duration = 1000) {
    let iterations = 0;
    const maxIterations = duration / 50;
    
    // Ensure element text matches length
    element.innerText = targetText.replace(/./g, '-');
    
    const interval = setInterval(() => {
        element.innerText = targetText.split('').map((char, index) => {
            if (char === ' ') return ' ';
            if (index < (iterations / maxIterations) * targetText.length) {
                return targetText[index];
            }
            return getRandomChar();
        }).join('');
        
        // Randomly change color between white, gray, and dark
        const colors = ['#ffffff', '#888888', '#555555'];
        element.style.color = colors[Math.floor(Math.random() * colors.length)];
        
        if (iterations >= maxIterations) {
            clearInterval(interval);
            element.innerText = targetText;
            element.style.color = ''; // Reset to css initial
        }
        iterations++;
    }, 50);
}

// Write text one by one with flickering effect
function typeWriteFlicker(element, text, callback) {
    element.innerText = '';
    let currentText = '';
    let i = 0;
    
    element.cancelTyping = false;

    function typeChar() {
        if (element.cancelTyping) return;
        if (i < text.length) {
            const char = text[i];
            currentText += char;
            
            // Temporary flicker on the new character
            let flickerCount = 0;
            const flickerInterval = setInterval(() => {
                const arr = currentText.split('');
                if (char !== ' ') {
                    arr[arr.length - 1] = getRandomChar();
                }
                element.innerText = arr.join('');
                
                // Randomly flicker color
                const colors = ['#ffffff', '#888888', '#333333'];
                element.style.color = colors[Math.floor(Math.random() * colors.length)];
                
                flickerCount++;
                if (flickerCount > 4) {
                    clearInterval(flickerInterval);
                    if (element.cancelTyping) return;
                    element.innerText = currentText;
                    element.style.color = '';
                    i++;
                    setTimeout(typeChar, 100);
                }
            }, 40);
        } else {
            if (callback) setTimeout(callback, 200);
        }
    }
    typeChar();
}

// Background Matrix effect (Canvas based for perfect coverage)
function initMatrixBg() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let columns = [];
    let fontSize = 18;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const colCount = Math.floor(canvas.width / fontSize) + 1;
        columns = [];
        for (let i = 0; i < colCount; i++) {
            // Randomly fill the initial state
            columns.push({
                y: Math.random() * canvas.height,
                chars: Array.from({length: 20}, () => getRandomChar())
            });
        }
    }

    window.addEventListener('resize', resize);
    resize();

    function draw() {
        // Subtle clear to allow "trails" or just clear if static grid is preferred
        // Since user wants "bunch of symbols which change", we'll do a grid
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = fontSize + 'px "Tiny5"';
        
        for (let i = 0; i < columns.length; i++) {
            const x = i * fontSize;
            // Draw a few random characters in each column to simulate the "bunch of symbols"
            for (let j = 0; j < canvas.height / fontSize; j++) {
                const y = j * fontSize;
                // Only draw/update occasionally but fill the screen
                if (Math.random() > 0.98) {
                    ctx.fillStyle = '#1a1a1a'; // Dark color for background symbols
                    ctx.fillText(getRandomChar(), x, y);
                }
            }
            
            // Or more simply, just a static-ish grid that flickers
            const y = columns[i].y;
            ctx.fillStyle = '#222'; // Matrix color
            ctx.fillText(getRandomChar(), x, y);
            
            columns[i].y += fontSize;
            if (columns[i].y > canvas.height && Math.random() > 0.975) {
                columns[i].y = 0;
            }
        }
    }

    // Dynamic colors based on theme
    function getThemeColors() {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        return {
            high: isLight ? 'rgba(18, 18, 18, ' : 'rgba(255, 255, 255, ',
            mid: isLight ? 'rgba(102, 102, 102, ' : 'rgba(136, 136, 136, ',
            low: isLight ? 'rgba(220, 220, 220, ' : 'rgba(34, 34, 34, '
        };
    }

    // Smoother flicker/fade effect
    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = fontSize + 'px "Tiny5"';
        
        const colors = getThemeColors();
        const cols = Math.ceil(canvas.width / fontSize);
        const rows = Math.ceil(canvas.height / fontSize);
        
        for(let c = 0; c < cols; c++) {
            if (!columns[c]) columns[c] = [];
            for(let r = 0; r < rows; r++) {
                if (!columns[c][r]) {
                    columns[c][r] = {
                        char: getRandomChar(),
                        opacity: Math.random() * 0.5,
                        targetOpacity: Math.random() * 0.5
                    };
                }

                const cell = columns[c][r];

                // Smoothly interpolate opacity towards target
                cell.opacity += (cell.targetOpacity - cell.opacity) * 0.05;

                // Occasionally change target opacity or character
                if (Math.random() > 0.98) {
                    cell.targetOpacity = Math.random() * 0.4;
                }
                if (Math.random() > 0.997) {
                    cell.char = getRandomChar();
                }
                
                // Draw with calculated opacity
                const alpha = cell.opacity;
                if (alpha > 0.3) {
                    ctx.fillStyle = colors.high + alpha + ')';
                } else if (alpha > 0.15) {
                    ctx.fillStyle = colors.mid + alpha + ')';
                } else {
                    ctx.fillStyle = colors.low + alpha + ')';
                }
                
                ctx.fillText(cell.char, c * fontSize, (r + 1) * fontSize);
            }
        }
        requestAnimationFrame(drawGrid);
    }

    drawGrid();
}

// Theme Management
function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    toggle.innerText = `MODE: ${savedTheme.toUpperCase()}`;

    toggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        toggle.innerText = `MODE: ${newTheme.toUpperCase()}`;
        
        // Flicker effect on toggle
        scrambleWords(toggle, `MODE: ${newTheme.toUpperCase()}`, 400);
    });
}

// Continuous scramble effect on hover
function applyHoverScramble() {
    const elements = document.querySelectorAll('.glitch-hover');
    elements.forEach(el => {
        let originalText = el.innerText;
        let interval;
        el.addEventListener('mouseenter', () => {
            interval = setInterval(() => {
                el.innerText = originalText.split('').map(char => {
                    if (char === ' ') return ' ';
                    return Math.random() > 0.85 ? getRandomChar() : char;
                }).join('');
            }, 120);
        });
        el.addEventListener('mouseleave', () => {
            clearInterval(interval);
            el.innerText = originalText;
        });
    });
}

// Continuous scramble for .scramble-text randomly
function initRandomScramble() {
    const elements = document.querySelectorAll('.scramble-text');
    setInterval(() => {
        const randomEl = elements[Math.floor(Math.random() * elements.length)];
        if(!randomEl) return;
        
        const originalText = randomEl.getAttribute('data-text') || randomEl.innerText;
        if (!randomEl.getAttribute('data-text')) randomEl.setAttribute('data-text', originalText);
        
        scrambleWords(randomEl, originalText, 500);
    }, 2000);
}


// Init Sequence
document.addEventListener('DOMContentLoaded', () => {
    initMatrixBg();
    initTheme();
    
    const introTitle = document.getElementById('intro-title');
    const introPrompt = document.getElementById('intro-prompt');
    const introScreen = document.getElementById('intro-screen');
    const mainScreen = document.getElementById('main-screen');

    if(introTitle) {
        let isTransitioning = false;
        
        const transitionToMain = (e) => {
            if (e) e.preventDefault();
            if (isTransitioning) return;
            isTransitioning = true;
            
            introTitle.cancelTyping = true;
            
            document.removeEventListener('keydown', transitionToMain);
            document.removeEventListener('click', transitionToMain);
            
            introPrompt.classList.remove('hidden');
            
            // Outro scramble
            scrambleWords(introTitle, getRandomChar().repeat(11), 600);
            scrambleWords(introPrompt, getRandomChar().repeat(25), 600);
            
            introScreen.style.opacity = '0';
            
            setTimeout(() => {
                introScreen.classList.remove('active');
                introScreen.classList.add('hidden');
                
                mainScreen.classList.remove('hidden');
                mainScreen.classList.add('active');
                
                // Animate entry of main screen elements
                document.querySelectorAll('.glitch-text').forEach(el => {
                    const text = el.getAttribute('data-text') || el.innerText;
                    if(!el.getAttribute('data-text')) el.setAttribute('data-text', text);
                    scrambleWords(el, text, 1500);
                });
                
                applyHoverScramble();
                initRandomScramble();
            }, 600);
        };
        
        document.addEventListener('keydown', transitionToMain);
        document.addEventListener('click', transitionToMain);

        // Start typing title
        typeWriteFlicker(introTitle, introTitle.getAttribute('data-text'), () => {
            if (!isTransitioning) {
                introPrompt.classList.remove('hidden');
            }
        });
    }
});

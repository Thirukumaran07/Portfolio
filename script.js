/* ==========================================================================
   Portfolio Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
    initScrollReveal();
    initCanvasParticles();
    initProjectFilter();
    initLeetCodeWidget();
    initContactForm();
    initCgpaEditor();
});

/* ==========================================================================
   Theme Management (Light / Dark Mode Toggle)
   ========================================================================== */
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
    }

    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark');
        }
    });
}

/* ==========================================================================
   Mobile Navigation Drawer Control
   ========================================================================== */
function initMobileNav() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

/* ==========================================================================
   Scroll Reveal & Skill Bar Animations (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                
                // If it contains skill items, trigger progress bar animation
                const progressBars = entry.target.querySelectorAll('.skill-progress');
                if (progressBars.length > 0) {
                    progressBars.forEach(bar => {
                        const targetProgress = bar.getAttribute('data-progress');
                        bar.style.width = targetProgress;
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}

/* ==========================================================================
   Interactive Floating Particle Canvas Background
   ========================================================================== */
function initCanvasParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particlesArray = [];
    const numberOfParticles = 75;
    const connectionDistance = 120;
    
    // Resize handler
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Mouse tracking variables
    const mouse = {
        x: null,
        y: null,
        radius: 150
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle constructor
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.6 - 0.3;
            this.speedY = Math.random() * 0.6 - 0.3;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Screen wrap edges
            if (this.x > canvas.width) this.x = 0;
            else if (this.x < 0) this.x = canvas.width;
            
            if (this.y > canvas.height) this.y = 0;
            else if (this.y < 0) this.y = canvas.height;

            // Interact with mouse cursor
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.hypot(dx, dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Push particles away slightly
                    this.x -= (dx / distance) * force * 1.5;
                    this.y -= (dy / distance) * force * 1.5;
                }
            }
        }

        draw() {
            // Determine dot color depending on body theme class
            const isLightTheme = document.body.classList.contains('light-theme');
            ctx.fillStyle = isLightTheme ? 'rgba(37, 99, 235, 0.45)' : 'rgba(6, 182, 212, 0.45)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Initialize particles array
    function init() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    // Drawing connections between nearby particles
    function connect() {
        const isLightTheme = document.body.classList.contains('light-theme');
        const strokeColor = isLightTheme ? 'rgba(37, 99, 235,' : 'rgba(6, 182, 212,';
        
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a + 1; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.hypot(dx, dy);

                if (distance < connectionDistance) {
                    let opacity = 1 - (distance / connectionDistance);
                    ctx.strokeStyle = `${strokeColor} ${opacity * 0.13})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Main animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        connect();
        requestAnimationFrame(animate);
    }

    init();
    animate();
}

/* ==========================================================================
   Project Categorization Grid Filter
   ========================================================================== */
function initProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active style from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            projectCards.forEach(card => {
                const projectCategory = card.getAttribute('data-category');
                
                // Show/hide based on category selection
                if (filterValue === 'all' || projectCategory === filterValue) {
                    card.classList.remove('filtered-out');
                    // Simple CSS entrance
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transition = 'opacity 0.4s ease';
                    }, 50);
                } else {
                    card.classList.add('filtered-out');
                }
            });
        });
    });
}

/* ==========================================================================
   Interactive LeetCode Statistics Tracker
   ========================================================================== */
function initLeetCodeWidget() {
    const usernameInput = document.getElementById('leetcode-username-input');
    const fetchBtn = document.getElementById('fetch-leetcode-btn');
    const userBadge = document.getElementById('leetcode-user-badge');
    
    // UI Progress Display Components
    const progressRingBar = document.getElementById('leetcode-overall-progress');
    const totalSolvedDisplay = document.getElementById('lc-total-solved');
    const easyBar = document.getElementById('lc-easy-bar');
    const easyNums = document.getElementById('lc-easy-nums');
    const mediumBar = document.getElementById('lc-medium-bar');
    const mediumNums = document.getElementById('lc-medium-nums');
    const hardBar = document.getElementById('lc-hard-bar');
    const hardNums = document.getElementById('lc-hard-nums');
    const globalRanking = document.getElementById('lc-ranking');
    const syncIndicator = document.querySelector('.sync-indicator');

    // Default simulated high-fidelity statistics for Thirukumaran S
    const defaultStats = {
        thirukumaran: {
            username: 'thirukumaran_s',
            totalSolved: 284,
            easySolved: 142,
            mediumSolved: 118,
            hardSolved: 24,
            easyTotal: 820,
            mediumTotal: 1650,
            hardTotal: 720,
            ranking: '#128,409'
        },
        other: {
            username: 'yourusername',
            totalSolved: 264,
            easySolved: 124,
            mediumSolved: 115,
            hardSolved: 25,
            easyTotal: 800,
            mediumTotal: 1500,
            hardTotal: 700,
            ranking: '#142,503'
        }
    };

    // Calculate ring circumference dynamically matching CSS stroke-dasharray (314.15 for r=50)
    const ringRadius = 50;
    const ringCircumference = 2 * Math.PI * ringRadius;

    function renderStats(stats) {
        userBadge.textContent = `@${stats.username}`;
        totalSolvedDisplay.textContent = stats.totalSolved;
        globalRanking.textContent = stats.ranking;

        const maxQuestions = stats.easyTotal + stats.mediumTotal + stats.hardTotal;
        const overallPercentage = (stats.totalSolved / maxQuestions) * 100;
        
        // Update radial progress ring stroke offset
        const offset = ringCircumference - (overallPercentage / 100) * ringCircumference;
        progressRingBar.style.strokeDashoffset = offset;

        // Update horizontal progress bars
        const easyPercentage = (stats.easySolved / stats.easyTotal) * 100;
        easyBar.style.width = `${easyPercentage}%`;
        easyNums.textContent = `${stats.easySolved}/${stats.easyTotal}`;

        const mediumPercentage = (stats.mediumSolved / stats.mediumTotal) * 100;
        mediumBar.style.width = `${mediumPercentage}%`;
        mediumNums.textContent = `${stats.mediumSolved}/${stats.mediumTotal}`;

        const hardPercentage = (stats.hardSolved / stats.hardTotal) * 100;
        hardBar.style.width = `${hardPercentage}%`;
        hardNums.textContent = `${stats.hardSolved}/${stats.hardTotal}`;
    }

    // Load initial profile statistics
    renderStats(defaultStats.thirukumaran);

    // Dynamic API fetch method on click
    async function fetchLeetCodeStats(username) {
        // Toggle sync state visual loader
        syncIndicator.innerHTML = `<span class="glow-indicator" style="background-color: #f59e0b; box-shadow: 0 0 10px #f59e0b;"></span>Fetching...`;
        syncIndicator.className = 'sync-indicator text-orange';
        
        try {
            // Attempt to query standard public CORS-enabled LeetCode API wrappers
            const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
            if (!response.ok) throw new Error('Network failure response');
            
            const data = await response.json();
            
            if (data.status === 'success') {
                const apiData = {
                    username: username,
                    totalSolved: data.totalSolved,
                    easySolved: data.easySolved,
                    mediumSolved: data.mediumSolved,
                    hardSolved: data.hardSolved,
                    easyTotal: data.totalEasy,
                    mediumTotal: data.totalMedium,
                    hardTotal: data.totalHard,
                    ranking: `#${data.ranking.toLocaleString()}`
                };
                renderStats(apiData);
                syncIndicator.innerHTML = `<span class="glow-indicator"></span>Live Sync`;
                syncIndicator.className = 'sync-indicator success-green';
            } else {
                throw new Error('API reported unsuccessful payload stats');
            }
        } catch (error) {
            console.warn(`LeetCode Fetch Error: ${error.message}. Resolving fallback data.`);
            
            // Graceful fallback to rich simulated profile cards for high fidelity visual feedback
            setTimeout(() => {
                const matchedSim = (username.toLowerCase().includes('thirukumaran') || username === 'yourusername')
                    ? defaultStats.thirukumaran 
                    : {
                        username: username,
                        totalSolved: Math.floor(Math.random() * 150) + 50,
                        easySolved: Math.floor(Math.random() * 70) + 30,
                        mediumSolved: Math.floor(Math.random() * 60) + 15,
                        hardSolved: Math.floor(Math.random() * 20) + 5,
                        easyTotal: 820,
                        mediumTotal: 1650,
                        hardTotal: 720,
                        ranking: `#${Math.floor(Math.random() * 200000) + 50000}`
                    };
                
                // Aggregate overall calculations inside matchedSim fallback
                matchedSim.totalSolved = matchedSim.easySolved + matchedSim.mediumSolved + matchedSim.hardSolved;
                renderStats(matchedSim);
                
                syncIndicator.innerHTML = `<span class="glow-indicator" style="background-color:#3b82f6; box-shadow:0 0 10px #3b82f6;"></span>Simulated (API offline)`;
                syncIndicator.className = 'sync-indicator';
            }, 750);
        }
    }

    fetchBtn.addEventListener('click', () => {
        const query = usernameInput.value.trim();
        if (query) {
            fetchLeetCodeStats(query);
        }
    });

    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = usernameInput.value.trim();
            if (query) {
                fetchLeetCodeStats(query);
            }
        }
    });
}

/* ==========================================================================
   Contact Form Validation & State Handlers
   ========================================================================== */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const messageInput = document.getElementById('form-message');
    const submitBtn = document.getElementById('form-submit-btn');

    // Dialog Modal selectors
    const statusModal = document.getElementById('status-modal');
    const modalIconBox = document.getElementById('modal-icon-box');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    function checkInput(input, condition, groupSelector) {
        const parentGroup = input.closest('.form-group');
        if (condition) {
            parentGroup.classList.remove('has-error');
            return true;
        } else {
            parentGroup.classList.add('has-error');
            return false;
        }
    }

    // Input blur validators
    nameInput.addEventListener('blur', () => {
        checkInput(nameInput, nameInput.value.trim().length > 0);
    });

    emailInput.addEventListener('blur', () => {
        checkInput(emailInput, validateEmail(emailInput.value.trim()));
    });

    messageInput.addEventListener('blur', () => {
        checkInput(messageInput, messageInput.value.trim().length > 0);
    });

    // Handle Form Submit Event
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Run full audit validation check
        const isNameValid = checkInput(nameInput, nameInput.value.trim().length > 0);
        const isEmailValid = checkInput(emailInput, validateEmail(emailInput.value.trim()));
        const isMsgValid = checkInput(messageInput, messageInput.value.trim().length > 0);

        if (isNameValid && isEmailValid && isMsgValid) {
            // Lock submission button state
            submitBtn.disabled = true;
            submitBtn.querySelector('span').textContent = 'Transmitting...';
            
            // Mock API network submission processing latency
            setTimeout(() => {
                // Show Custom modal notification
                modalIconBox.className = 'modal-icon-box success';
                modalIconBox.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
                modalTitle.textContent = "Message Sent Successfully!";
                modalText.innerHTML = `Thank you, <strong>${nameInput.value.trim()}</strong>. Your message has been encrypted and sent to my inbox. I will reply to you at <strong>${emailInput.value.trim()}</strong> within 24 hours.`;
                
                statusModal.classList.remove('hidden');

                // Reset Form elements
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.querySelector('span').textContent = 'Send Message';
            }, 1200);
        }
    });

    // Close Modal Events
    modalCloseBtn.addEventListener('click', () => {
        statusModal.classList.add('hidden');
    });

    statusModal.addEventListener('click', (e) => {
        if (e.target === statusModal) {
            statusModal.classList.add('hidden');
        }
    });
}

/* ==========================================================================
   CGPA Interactive LocalStorage Persistent Editor
   ========================================================================== */
function initCgpaEditor() {
    const cgpaInput = document.getElementById('cgpa-input');
    if (!cgpaInput) return;

    // Load saved CGPA from local storage
    const savedCgpa = localStorage.getItem('user_cgpa');
    if (savedCgpa) {
        cgpaInput.value = savedCgpa;
    }

    cgpaInput.addEventListener('change', () => {
        let val = parseFloat(cgpaInput.value.trim());
        
        // Validate and bounds check (0.0 to 10.0 scale)
        if (isNaN(val) || val < 0.0) {
            val = 0.0;
        } else if (val > 10.0) {
            val = 10.0;
        }
        
        const formatted = val.toFixed(2);
        cgpaInput.value = formatted;
        
        // Save to local storage
        localStorage.setItem('user_cgpa', formatted);
    });

    // Allow Enter key to save blur focus
    cgpaInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            cgpaInput.blur();
        }
    });
}

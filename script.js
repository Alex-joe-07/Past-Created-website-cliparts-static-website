/**
 * GWC Waterproofing Website - Main JavaScript
 * Pure Vanilla JavaScript - No External Libraries
 */

(function() {
    'use strict';

    // DOM Elements
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const heroVideo = document.querySelector('.hero-video');

    // Configuration
    const CONFIG = {
        scrollThreshold: 50,
        smoothScrollDuration: 800
    };

    /**
     * Initialize the application
     */
    function init() {
        setupHamburgerMenu();
        setupScrollEffects();
        setupSmoothScrolling();
        setupActiveNavigation();
        setupVideoOptimization();
        setupIntersectionObserver();
    }

    /**
     * Hamburger Menu Toggle
     */
    function setupHamburgerMenu() {
        if (!hamburger || !navMenu) return;

        hamburger.addEventListener('click', toggleMenu);
        
        // Close menu when clicking on nav links
        navLinks.forEach(function(link) {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = navMenu.contains(event.target) || hamburger.contains(event.target);
            if (!isClickInside && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        navbar.classList.toggle('menu-open'); 
        
        // Update ARIA attributes
        const isExpanded = hamburger.classList.contains('active');
        hamburger.setAttribute('aria-expanded', isExpanded);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isExpanded ? 'hidden' : '';
    }

    /**
     * Close mobile menu
     */
    function closeMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        navbar.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    /**
     * Navbar Scroll Effects
     */
    function setupScrollEffects() {
        if (!navbar) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    handleNavbarScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Initial check
        handleNavbarScroll();
    }

    /**
     * Handle navbar appearance on scroll
     */
    function handleNavbarScroll() {
        const scrollY = window.scrollY;
        
        if (scrollY > CONFIG.scrollThreshold) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    /**
     * Smooth Scrolling for Anchor Links
     */
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(event) {
                const href = this.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') return;
                
                event.preventDefault();
                
                const target = document.querySelector(href);
                if (!target) return;

                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

                smoothScrollTo(targetPosition);
            });
        });
    }

    /**
     * Custom smooth scroll function
     */
    function smoothScrollTo(targetPosition) {
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();

        function animation(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / CONFIG.smoothScrollDuration, 1);
            
            // Easing function - easeInOutCubic
            const ease = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            window.scrollTo(0, startPosition + distance * ease);

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    /**
     * Active Navigation Link Highlighting
     */
    function setupActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        
        if (sections.length === 0) return;

        function updateActiveLink() {
            const scrollY = window.scrollY;
            const navbarHeight = navbar ? navbar.offsetHeight : 0;

            sections.forEach(function(section) {
                const sectionTop = section.offsetTop - navbarHeight - 100;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    navLinks.forEach(function(link) {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Throttled scroll handler
        let scrollTimeout = null;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) return;
            
            scrollTimeout = setTimeout(function() {
                updateActiveLink();
                scrollTimeout = null;
            }, 100);
        });

        // Initial check
        updateActiveLink();
    }

    /**
     * Video Performance Optimization
     */
    function setupVideoOptimization() {
        if (!heroVideo) return;

        // Pause video when not in viewport to save resources
        const videoObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    heroVideo.play().catch(function() {
                        // Video play failed, possibly due to autoplay restrictions
                    });
                } else {
                    heroVideo.pause();
                }
            });
        }, {
            threshold: 0.1
        });

        videoObserver.observe(heroVideo);

        // Handle video loading errors
        heroVideo.addEventListener('error', function() {
            // Video failed to load, overlay will show
            this.style.display = 'none';
        });

        // Reduce video quality on slow connections
        if (navigator.connection) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                heroVideo.setAttribute('preload', 'none');
            }
        }
    }

    /**
     * Intersection Observer for Animations
     */
    function setupIntersectionObserver() {
        const animateElements = document.querySelectorAll(
            '.service-card, .feature-box, .contact-item, .stat-item'
        );

        if (animateElements.length === 0) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animateElements.forEach(function(element) {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }

    // Add visible class styles dynamically
    function addVisibleStyles() {
        const style = document.createElement('style');
        style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
        document.head.appendChild(style);
    }

    /**
     * Form Validation (if contact form is added later)
     */
    function validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input, textarea');
        let isValid = true;

        inputs.forEach(function(input) {
            if (input.hasAttribute('required') && !input.value.trim()) {
                isValid = false;
                showError(input, 'This field is required');
            } else if (input.type === 'email' && !isValidEmail(input.value)) {
                isValid = false;
                showError(input, 'Please enter a valid email');
            } else {
                clearError(input);
            }
        });

        return isValid;
    }

    /**
     * Email validation helper
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Show error message
     */
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
        input.classList.add('error');
    }

    /**
     * Clear error message
     */
    function clearError(input) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        input.classList.remove('error');
    }

    /**
     * Debounce utility function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    /**
     * Throttle utility function
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const context = this;
            const args = arguments;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            addVisibleStyles();
            init();
        });
    } else {
        addVisibleStyles();
        init();
    }

    // Expose form validation for potential future use
    window.GWC = {
        validateForm: validateForm,
        debounce: debounce,
        throttle: throttle
    };

})();

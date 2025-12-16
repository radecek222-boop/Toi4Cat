/**
 * TOI4CAT - Main JavaScript
 * Ekologická toaleta pro kočky
 */

(function() {
    'use strict';

    // DOM Elements
    const navToggle = document.querySelector('.nav__toggle');
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');

    /**
     * Mobile Navigation Toggle
     */
    function initMobileNav() {
        if (!navToggle || !nav) return;

        navToggle.addEventListener('click', () => {
            nav.classList.toggle('nav--open');
            navToggle.setAttribute('aria-expanded',
                nav.classList.contains('nav--open'));
        });

        // Close nav when clicking outside
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
                nav.classList.remove('nav--open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /**
     * Smooth Scroll for Anchor Links
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Header Scroll Effect
     */
    function initHeaderScroll() {
        if (!header) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 50) {
                header.classList.add('header--scrolled');
            } else {
                header.classList.remove('header--scrolled');
            }

            lastScroll = currentScroll;
        });
    }

    /**
     * Contact Form Handler
     */
    function initContactForm() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // TODO: Implement actual form submission
            console.log('Form submitted:', data);

            // Show success message
            alert('Děkujeme za vaši zprávu! Ozveme se vám co nejdříve.');
            form.reset();
        });
    }

    /**
     * Image Gallery Lightbox
     */
    function initGallery() {
        const galleryItems = document.querySelectorAll('.gallery__item');
        if (!galleryItems.length) return;

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (!img) return;

                // Create lightbox
                const lightbox = document.createElement('div');
                lightbox.className = 'lightbox';
                lightbox.innerHTML = `
                    <div class="lightbox__overlay"></div>
                    <div class="lightbox__content">
                        <img src="${img.src}" alt="${img.alt}">
                        <button class="lightbox__close">&times;</button>
                    </div>
                `;

                document.body.appendChild(lightbox);
                document.body.style.overflow = 'hidden';

                // Close lightbox
                const close = () => {
                    lightbox.remove();
                    document.body.style.overflow = '';
                };

                lightbox.querySelector('.lightbox__overlay').addEventListener('click', close);
                lightbox.querySelector('.lightbox__close').addEventListener('click', close);
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') close();
                }, { once: true });
            });
        });
    }

    /**
     * Lazy Loading Images
     */
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        if (!images.length) return;

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    /**
     * Scroll Animation Effects
     */
    function initScrollAnimations() {
        const animElements = document.querySelectorAll('.feature, .feature__text, .feature__title, .gallery__item, .about-item');
        if (!animElements.length) return;

        const animObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    animObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        animElements.forEach(el => animObserver.observe(el));
    }

    /**
     * 3D Book Flip Scroll Effect
     */
    function init3DScrollEffect() {
        const sections = document.querySelectorAll('.section, .hero');
        if (!sections.length) return;

        window.addEventListener('scroll', () => {
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);

                // Calculate rotation based on scroll position
                const rotationX = (scrollPercent - 0.5) * 8;
                const scale = 0.95 + (scrollPercent * 0.05);

                // Apply 3D transformation
                section.style.transform = `rotateX(${rotationX}deg) scale(${scale})`;
            });
        });
    }

    /**
     * Initialize all modules
     */
    function init() {
        initMobileNav();
        initSmoothScroll();
        initHeaderScroll();
        initContactForm();
        initGallery();
        initLazyLoading();
        initScrollAnimations();
        init3DScrollEffect();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

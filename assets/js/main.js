(() => {
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const progress = document.querySelector('.scroll-progress');

  const toggleNav = () => {
    nav.classList.toggle('is-open');
    navToggle?.setAttribute('aria-expanded', nav.classList.contains('is-open'));
  };

  navToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleNav();
  });

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !navToggle?.contains(e.target)) {
      nav.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        nav.classList.remove('is-open');
        navToggle?.setAttribute('aria-expanded', 'false');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY / (max || 1);
    progress.style.transform = `scaleX(${Math.min(1, scrolled)})`;
  });

  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    const toggle = item.querySelector('.faq-toggle');
    const content = item.querySelector('.faq-content');
    toggle?.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      content.style.maxHeight = isOpen ? `${content.scrollHeight}px` : '0px';
      toggle.querySelector('span').textContent = isOpen ? '–' : '+';
    });
  });

  const contactForm = document.querySelector('.contact-form');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Děkujeme za zprávu! Ozveme se co nejdříve.');
    contactForm.reset();
  });
})();

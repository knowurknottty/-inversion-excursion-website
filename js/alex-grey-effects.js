/**
 * Inversion Excursion v2.0 — Alex Grey Edition
 * Enhanced interactivity with sacred geometry, energy body visualization,
 * and cosmic/transcendent effects inspired by the visionary art of Alex Grey.
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    animationDuration: 618, // Golden ratio milliseconds
    scrollThreshold: 0.1,
    starCount: 100,
    sacredGeometryRotation: true,
    energyBodyLayers: 5,
    breathCycle: 4000 // 4 second breath
  };

  // State
  const state = {
    scrollProgress: 0,
    energyActivation: 0,
    currentSection: null,
    mousePosition: { x: 0, y: 0 },
    isBreathing: false
  };

  // ==========================================================================
  // DOM ELEMENTS
  // ==========================================================================

  const elements = {
    body: document.body,
    sidebar: document.querySelector('.sidebar'),
    menuToggle: document.querySelector('.menu-toggle'),
    content: document.querySelector('.content'),
    hero: document.querySelector('.hero'),
    sections: document.querySelectorAll('.section'),
    chapterCards: document.querySelectorAll('.chapter-card'),
    towerVisual: document.querySelector('.tower-visual')
  };

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  function init() {
    createStarfield();
    createEnergyBody();
    initNavigation();
    initScrollEffects();
    initMouseEffects();
    initKeyboardShortcuts();
    initSacredGeometry();
    initBreathingAnimation();
    initProgressBar();
    initSectionRevelation();
    
    console.log('🕉️ Inversion Excursion v2.0 — Alex Grey Edition initialized');
    console.log('✦ The Exit is always open. You are the Observer. ✦');
  }

  // ==========================================================================
  // STARFIELD — Cosmic background
  // ==========================================================================

  function createStarfield() {
    const starfield = document.createElement('div');
    starfield.className = 'cosmic-stars';
    starfield.setAttribute('aria-hidden', 'true');
    
    // Generate dynamic stars with varying opacity and size
    for (let i = 0; i < CONFIG.starCount; i++) {
      const star = document.createElement('div');
      const size = Math.random() * 2 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 3 + Math.random() * 4;
      
      star.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: white;
        border-radius: 50%;
        left: ${x}%;
        top: ${y}%;
        opacity: ${Math.random() * 0.5 + 0.2};
        animation: star-twinkle ${duration}s ease-in-out ${delay}s infinite;
        box-shadow: 0 0 ${size * 2}px rgba(255, 255, 255, 0.5);
      `;
      
      starfield.appendChild(star);
    }
    
    // Add shooting stars occasionally
    setInterval(() => {
      if (Math.random() > 0.7) createShootingStar(starfield);
    }, 5000);
    
    elements.body.insertBefore(starfield, elements.body.firstChild);
    
    // Add CSS for star animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes star-twinkle {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.2); }
      }
      @keyframes shooting-star {
        0% { transform: translateX(0) translateY(0); opacity: 1; }
        100% { transform: translateX(-200px) translateY(200px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  function createShootingStar(container) {
    const shootingStar = document.createElement('div');
    const startX = 50 + Math.random() * 50;
    const startY = Math.random() * 30;
    
    shootingStar.style.cssText = `
      position: absolute;
      width: 100px;
      height: 2px;
      background: linear-gradient(90deg, white, transparent);
      left: ${startX}%;
      top: ${startY}%;
      transform: rotate(-45deg);
      animation: shooting-star 1s ease-out forwards;
      pointer-events: none;
    `;
    
    container.appendChild(shootingStar);
    setTimeout(() => shootingStar.remove(), 1000);
  }

  // ==========================================================================
  // ENERGY BODY VISUALIZATION
  // ==========================================================================

  function createEnergyBody() {
    const energyContainer = document.createElement('div');
    energyContainer.id = 'energy-body';
    energyContainer.setAttribute('aria-hidden', 'true');
    energyContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
      opacity: 0;
      transition: opacity 1s ease;
    `;
    
    // Create energy layers (like Alex Grey's Sacred Mirrors)
    const layers = [
      { color: 'rgba(255, 255, 255, 0.03)', size: 1.0, name: 'physical' },
      { color: 'rgba(147, 112, 219, 0.04)', size: 1.1, name: 'etheric' },
      { color: 'rgba(255, 107, 53, 0.03)', size: 1.2, name: 'astral' },
      { color: 'rgba(0, 123, 167, 0.02)', size: 1.3, name: 'mental' },
      { color: 'rgba(255, 215, 0, 0.02)', size: 1.4, name: 'causal' }
    ];
    
    layers.forEach((layer, index) => {
      const layerEl = document.createElement('div');
      layerEl.className = `energy-layer energy-layer-${layer.name}`;
      layerEl.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${layer.size * 100}vmax;
        height: ${layer.size * 100}vmax;
        background: radial-gradient(circle, ${layer.color} 0%, transparent 70%);
        animation: energy-pulse ${CONFIG.breathCycle + (index * 500)}ms ease-in-out infinite;
        animation-delay: ${index * 200}ms;
      `;
      energyContainer.appendChild(layerEl);
    });
    
    // Add chakra points along vertical axis
    const chakras = [
      { color: '#8B0000', y: 85, name: 'root' },
      { color: '#FF6B35', y: 70, name: 'sacral' },
      { color: '#FFD700', y: 55, name: 'solar' },
      { color: '#50C878', y: 45, name: 'heart' },
      { color: '#007BA7', y: 30, name: 'throat' },
      { color: '#4B0082', y: 20, name: 'third-eye' },
      { color: '#E6E6FA', y: 10, name: 'crown' }
    ];
    
    chakras.forEach((chakra, index) => {
      const chakraEl = document.createElement('div');
      chakraEl.className = `chakra-point chakra-${chakra.name}`;
      chakraEl.style.cssText = `
        position: absolute;
        left: 50%;
        top: ${chakra.y}%;
        transform: translate(-50%, -50%);
        width: 20px;
        height: 20px;
        background: ${chakra.color};
        border-radius: 50%;
        filter: blur(8px);
        opacity: 0.3;
        animation: chakra-pulse 4s ease-in-out ${index * 0.3}s infinite;
      `;
      energyContainer.appendChild(chakraEl);
    });
    
    elements.body.appendChild(energyContainer);
    
    // Add energy CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes energy-pulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
      }
      @keyframes chakra-pulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
        50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);
    
    // Fade in energy body after page load
    setTimeout(() => {
      energyContainer.style.opacity = '1';
    }, 1000);
  }

  // ==========================================================================
  // SACRED GEOMETRY ANIMATIONS
  // ==========================================================================

  function initSacredGeometry() {
    // Create SVG containers for sacred geometry
    const sacredContainer = document.createElement('div');
    sacredContainer.className = 'sacred-geometry-bg';
    sacredContainer.setAttribute('aria-hidden', 'true');
    
    // Flower of Life
    const flowerOfLife = createSVGElement('flower-of-life.svg', 'flower-of-life');
    sacredContainer.appendChild(flowerOfLife);
    
    // Sri Yantra
    const sriYantra = createSVGElement('sri-yantra.svg', 'sri-yantra');
    sacredContainer.appendChild(sriYantra);
    
    elements.body.insertBefore(sacredContainer, elements.body.children[1]);
  }

  function createSVGElement(filename, className) {
    const div = document.createElement('div');
    div.className = className;
    div.style.color = 'rgba(212, 175, 55, 0.1)';
    
    // Fetch and insert SVG
    fetch(`assets/geometry/${filename}`)
      .then(response => response.text())
      .then(svg => {
        div.innerHTML = svg;
        const svgEl = div.querySelector('svg');
        if (svgEl) {
          svgEl.style.width = '100%';
          svgEl.style.height = '100%';
        }
      })
      .catch(() => {
        // Fallback: create simple geometric pattern
        div.innerHTML = createFallbackGeometry(className);
      });
    
    return div;
  }

  function createFallbackGeometry(type) {
    if (type === 'flower-of-life') {
      return `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="50" fill="none" stroke="currentColor"/>
        ${Array.from({length: 6}, (_, i) => {
          const angle = (i * 60) * Math.PI / 180;
          const x = 100 + 50 * Math.cos(angle);
          const y = 100 + 50 * Math.sin(angle);
          return `<circle cx="${x}" cy="${y}" r="50" fill="none" stroke="currentColor"/>`;
        }).join('')}</svg>`;
    }
    return `<svg viewBox="0 0 200 200"><polygon points="100,20 180,180 20,180" fill="none" stroke="currentColor"/></svg>`;
  }

  // ==========================================================================
  // NAVIGATION
  // ==========================================================================

  function openSidebar() {
    elements.sidebar.classList.add('open');
    elements.menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('sidebar-open');

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', closeSidebar);
    document.body.appendChild(backdrop);
  }

  function closeSidebar() {
    elements.sidebar.classList.remove('open');
    elements.menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('sidebar-open');

    const backdrop = document.querySelector('.sidebar-backdrop');
    if (backdrop) backdrop.remove();
  }

  function initNavigation() {
    if (!elements.menuToggle || !elements.sidebar) return;

    elements.menuToggle.addEventListener('click', () => {
      const isOpen = elements.sidebar.classList.contains('open');
      if (isOpen) { closeSidebar(); } else { openSidebar(); }
    });

    // Active nav link highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.includes(currentPage) || (currentPage === '' && href === 'index.html'))) {
        link.classList.add('active');
      }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          // Close sidebar on mobile before scrolling
          if (window.innerWidth <= 900) closeSidebar();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ==========================================================================
  // SCROLL EFFECTS
  // ==========================================================================

  function initScrollEffects() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollProgress();
          updateEnergyActivation();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function updateScrollProgress() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    state.scrollProgress = height > 0 ? (winScroll / height) * 100 : 0;
    
    // Update progress bar
    const progressBar = document.querySelector('.reading-progress');
    if (progressBar) {
      progressBar.style.width = state.scrollProgress + '%';
    }
  }

  function updateEnergyActivation() {
    // Calculate energy activation based on scroll position
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    
    state.energyActivation = Math.min(scrollY / (docHeight - windowHeight), 1);
    
    // Update energy body opacity based on activation
    const energyBody = document.getElementById('energy-body');
    if (energyBody) {
      const opacity = 0.3 + (state.energyActivation * 0.4);
      energyBody.style.opacity = opacity;
    }
  }

  function initProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #D4AF37, #E6E6FA);
      width: 0%;
      z-index: 9999;
      transition: width 0.1s;
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
    `;
    document.body.appendChild(progressBar);
  }

  // ==========================================================================
  // SECTION REVELATION — Scroll-triggered animations
  // ==========================================================================

  function initSectionRevelation() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: CONFIG.scrollThreshold
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealEnergySignature(entry.target);
        }
      });
    }, observerOptions);
    
    elements.sections.forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(30px)';
      section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      observer.observe(section);
    });
    
    elements.chapterCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(40px)';
      card.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`;
      observer.observe(card);
    });
    
    // Add revealed styles
    const style = document.createElement('style');
    style.textContent = `
      .section.revealed,
      .chapter-card.revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function revealEnergySignature(element) {
    // Create a brief energy pulse when section is revealed
    const pulse = document.createElement('div');
    pulse.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
      pointer-events: none;
      animation: energy-reveal 1s ease-out forwards;
      z-index: -1;
    `;
    
    element.style.position = 'relative';
    element.appendChild(pulse);
    
    setTimeout(() => pulse.remove(), 1000);
  }

  // ==========================================================================
  // MOUSE EFFECTS — Energy follows cursor
  // ==========================================================================

  function initMouseEffects() {
    let ticking = false;
    
    document.addEventListener('mousemove', (e) => {
      state.mousePosition.x = e.clientX;
      state.mousePosition.y = e.clientY;
      
      if (!ticking) {
        requestAnimationFrame(() => {
          updateEnergyFollow();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function updateEnergyFollow() {
    // Subtle parallax effect on sacred geometry based on mouse position
    const sacredGeo = document.querySelector('.sacred-geometry-bg');
    if (sacredGeo && window.innerWidth > 768) {
      const x = (state.mousePosition.x / window.innerWidth - 0.5) * 20;
      const y = (state.mousePosition.y / window.innerHeight - 0.5) * 20;
      sacredGeo.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }
  }

  // ==========================================================================
  // KEYBOARD SHORTCUTS
  // ==========================================================================

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // 'm' key to toggle menu
      if (e.key === 'm' && !e.ctrlKey && !e.metaKey) {
        if (window.innerWidth <= 900) {
          const isOpen = elements.sidebar.classList.contains('open');
          if (isOpen) { closeSidebar(); } else { openSidebar(); }
        }
      }

      // 'Escape' to close menu
      if (e.key === 'Escape') closeSidebar();
      
      // Arrow keys for chapter navigation
      if (e.key === 'ArrowRight' && document.querySelector('.chapter-nav-link.next')) {
        document.querySelector('.chapter-nav-link.next').click();
      }
      if (e.key === 'ArrowLeft' && document.querySelector('.chapter-nav-link.prev')) {
        document.querySelector('.chapter-nav-link.prev').click();
      }
    });
  }

  // ==========================================================================
  // BREATHING ANIMATION
  // ==========================================================================

  function initBreathingAnimation() {
    // Create breathing indicator
    const breathIndicator = document.createElement('div');
    breathIndicator.id = 'breath-indicator';
    breathIndicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 2px solid rgba(212, 175, 55, 0.3);
      z-index: 100;
      opacity: 0.6;
      cursor: pointer;
      transition: opacity 0.3s ease;
    `;
    
    const breathInner = document.createElement('div');
    breathInner.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      background: rgba(212, 175, 55, 0.5);
      border-radius: 50%;
      animation: breath-cycle ${CONFIG.breathCycle}ms ease-in-out infinite;
    `;
    
    breathIndicator.appendChild(breathInner);
    elements.body.appendChild(breathIndicator);
    
    // Add breathing animation CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes breath-cycle {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
        50% { transform: translate(-50%, -50%) scale(2); opacity: 0.8; }
      }
      @keyframes energy-reveal {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
        100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
      }
      #breath-indicator:hover {
        opacity: 1;
      }
      #breath-indicator:hover::after {
        content: 'Breathe';
        position: absolute;
        bottom: 70px;
        left: 50%;
        transform: translateX(-50%);
        font-family: var(--font-sans);
        font-size: 0.7rem;
        color: rgba(212, 175, 55, 0.8);
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
    
    // Toggle breathing guidance
    breathIndicator.addEventListener('click', () => {
      state.isBreathing = !state.isBreathing;
      if (state.isBreathing) {
        breathInner.style.animationDuration = '8000ms';
        showBreathingGuidance();
      } else {
        breathInner.style.animationDuration = `${CONFIG.breathCycle}ms`;
      }
    });
  }

  function showBreathingGuidance() {
    const guidance = document.createElement('div');
    guidance.id = 'breathing-guidance';
    guidance.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(10, 10, 18, 0.95);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      z-index: 10000;
      font-family: var(--font-sans);
    `;
    guidance.innerHTML = `
      <h3 style="color: #D4AF37; margin-bottom: 20px;">Conscious Breathing</h3>
      <p style="color: rgba(230, 230, 250, 0.8); margin-bottom: 10px;">Inhale for 4 counts...</p>
      <p style="color: rgba(230, 230, 250, 0.8); margin-bottom: 10px;">Hold for 4 counts...</p>
      <p style="color: rgba(230, 230, 250, 0.8); margin-bottom: 10px;">Exhale for 4 counts...</p>
      <p style="color: rgba(230, 230, 250, 0.8); margin-bottom: 30px;">Hold for 4 counts...</p>
      <button id="close-breathing" style="
        background: transparent;
        border: 1px solid #D4AF37;
        color: #D4AF37;
        padding: 10px 20px;
        cursor: pointer;
        font-family: var(--font-sans);
      ">Close</button>
    `;
    
    elements.body.appendChild(guidance);
    
    document.getElementById('close-breathing').addEventListener('click', () => {
      guidance.remove();
      state.isBreathing = false;
    });
  }

  // ==========================================================================
  // INITIALIZE
  // ==========================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

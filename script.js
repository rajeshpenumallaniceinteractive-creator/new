/**
 * RAJESH — CINEMATIC SCROLL-DRIVEN PORTFOLIO HERO
 * HEADER & LOGO VIDEO INTRO TRANSITION EDITION
 * 60 Frames Sequence | Vanilla JS + GSAP ScrollTrigger
 */

(function () {
  'use strict';

  /* ==========================================================================
     CONFIGURATION
     ========================================================================== */
  const CONFIG = {
    totalFrames: 60,
    getFramePath: function (index) {
      const paddedIndex = String(index + 1).padStart(2, '0');
      return `frames/${paddedIndex}.png`;
    }
  };

  /* ==========================================================================
     DOM ELEMENTS
     ========================================================================== */
  const logoIntroOverlay = document.getElementById('logo-intro-overlay');
  const introLogoBox = document.getElementById('intro-logo-box');
  const introLogoVideo = document.getElementById('intro-logo-video');
  const introLogoImg = document.getElementById('intro-logo-img');

  const headerLogoSlot = document.getElementById('header-logo-slot');
  const headerLogoFinal = document.getElementById('header-logo-final');
  const headerNav = document.getElementById('header-nav');

  const heroScrollTrack = document.getElementById('hero-scroll-track');
  const heroPinnedViewport = document.getElementById('hero-pinned-viewport');
  const fireGlowCore = document.getElementById('fire-glow-core');

  const personCanvasContainer = document.getElementById('person-canvas-container');
  const personCanvas = document.getElementById('person-canvas');
  const personCtx = personCanvas.getContext('2d', { alpha: true });
  const volumetricBacklight = document.getElementById('volumetric-backlight');
  const groundSmokeGlow = document.getElementById('ground-smoke-glow');

  const sparksCanvas = document.getElementById('fire-sparks-canvas');
  const sparksCtx = sparksCanvas.getContext('2d');

  const bgLetters = document.querySelectorAll('.bg-title-rajesh .letter');
  const headingPill = document.querySelector('.heading-pill');

  /* ==========================================================================
     STATE
     ========================================================================== */
  const frameImages = [];
  const sequenceState = {
    frame: 0
  };
  let currentRenderedFrame = -1;
  let lastScrollY = window.scrollY;
  let scrollSpeedBonus = 0;
  let isIntroFinished = false;

  /* ==========================================================================
     PHYSICS-BASED FIRE SPARKS ENGINE
     ========================================================================== */
  const sparks = [];
  const SPARK_COUNT = 90;

  function createSpark(initY) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const spawnY = initY !== undefined ? initY : h + Math.random() * 40;
    
    const centralBias = (Math.random() + Math.random()) / 2;
    const x = (w * 0.15) + centralBias * (w * 0.7);

    const colors = [
      { r: 255, g: 245, b: 180 }, // White-hot
      { r: 255, g: 170, b: 30 },  // Golden amber
      { r: 255, g: 85,  b: 0 },   // Neon orange
      { r: 240, g: 20,  b: 20 }   // Burning crimson
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
      x: x,
      y: spawnY,
      size: Math.random() * 2.8 + 0.8,
      color: color,
      alpha: Math.random() * 0.8 + 0.2,
      baseSpeedY: Math.random() * 1.8 + 0.8,
      windFreq: Math.random() * 0.03 + 0.015,
      windAmp: Math.random() * 1.6 + 0.6,
      phase: Math.random() * Math.PI * 2,
      flickerSpeed: Math.random() * 0.15 + 0.05,
      life: 0,
      maxLife: Math.random() * 260 + 140
    };
  }

  function initFireSparks() {
    resizeSparksCanvas();
    sparks.length = 0;
    const h = window.innerHeight;
    for (let i = 0; i < SPARK_COUNT; i++) {
      sparks.push(createSpark(Math.random() * h));
    }
    renderFireSparks();
  }

  function resizeSparksCanvas() {
    const dpr = window.devicePixelRatio || 1;
    sparksCanvas.width = window.innerWidth * dpr;
    sparksCanvas.height = window.innerHeight * dpr;
    sparksCanvas.style.width = `${window.innerWidth}px`;
    sparksCanvas.style.height = `${window.innerHeight}px`;
    sparksCtx.scale(dpr, dpr);
  }

  function renderFireSparks() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    sparksCtx.clearRect(0, 0, w, h);

    scrollSpeedBonus *= 0.94;

    for (let i = 0; i < sparks.length; i++) {
      const p = sparks[i];
      p.life++;

      const currentSpeedY = p.baseSpeedY + (scrollSpeedBonus * 0.08);
      p.y -= currentSpeedY;
      p.x += Math.sin(p.life * p.windFreq + p.phase) * p.windAmp;

      if (p.y < -20 || p.life > p.maxLife) {
        sparks[i] = createSpark();
        continue;
      }

      const flicker = Math.sin(p.life * p.flickerSpeed) * 0.2;
      const lifeRatio = 1 - (p.life / p.maxLife);
      const currentAlpha = Math.max(0, Math.min(1, (p.alpha + flicker) * lifeRatio));

      sparksCtx.save();
      sparksCtx.beginPath();
      sparksCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      sparksCtx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha})`;
      sparksCtx.shadowBlur = p.size > 2 ? 16 : 8;
      sparksCtx.shadowColor = `rgba(255, 90, 0, ${currentAlpha * 0.9})`;
      sparksCtx.fill();
      sparksCtx.restore();
    }

    requestAnimationFrame(renderFireSparks);
  }

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = Math.abs(currentScrollY - lastScrollY);
    scrollSpeedBonus = Math.min(25, scrollSpeedBonus + delta * 0.4);
    lastScrollY = currentScrollY;
  }, { passive: true });

  /* ==========================================================================
     FRAME PRELOADER
     ========================================================================== */
  function preloadFrames() {
    return new Promise((resolve) => {
      let loadedCount = 0;
      const total = CONFIG.totalFrames;

      for (let i = 0; i < total; i++) {
        const img = new Image();
        img.src = CONFIG.getFramePath(i);

        img.onload = () => {
          loadedCount++;
          if (loadedCount === total) resolve();
        };

        img.onerror = () => {
          console.warn(`Frame failed to load: ${img.src}`);
          loadedCount++;
          if (loadedCount === total) resolve();
        };

        frameImages.push(img);
      }
    });
  }

  /* ==========================================================================
     CANVAS SIZING & RENDERING
     ========================================================================== */
  function resizePersonCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    personCanvas.width = width * dpr;
    personCanvas.height = height * dpr;
    personCanvas.style.width = `${width}px`;
    personCanvas.style.height = `${height}px`;
    personCtx.scale(dpr, dpr);

    currentRenderedFrame = -1;
    drawFrame(Math.round(sequenceState.frame));
  }

  function drawFrame(frameIndex) {
    const clampedIndex = Math.max(0, Math.min(CONFIG.totalFrames - 1, frameIndex));
    const img = frameImages[clampedIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    if (currentRenderedFrame === clampedIndex) return;
    currentRenderedFrame = clampedIndex;

    const width = window.innerWidth;
    const height = window.innerHeight;

    personCtx.clearRect(0, 0, width, height);

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const screenAspect = width / height;

    let drawWidth, drawHeight;
    const targetRatio = width < 768 ? 0.80 : 0.88;

    if (screenAspect > imgAspect) {
      drawHeight = height * targetRatio;
      drawWidth = drawHeight * imgAspect;
    } else {
      drawWidth = width * 0.92;
      drawHeight = drawWidth / imgAspect;
      if (drawHeight > height * targetRatio) {
        drawHeight = height * targetRatio;
        drawWidth = drawHeight * imgAspect;
      }
    }

    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2 + (height * 0.035);

    personCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  /* ==========================================================================
     LOGO VIDEO INTRO -> HEADER POSITION TRANSITION
     ========================================================================== */
  function setupLogoIntroTransition() {
    if (!introLogoVideo) return;

    // Trigger video playback
    introLogoVideo.play().catch(() => {
      // If autoplay was paused by browser, continue immediately
      transitionLogoToHeader();
    });

    // When video ends, execute transition to header
    introLogoVideo.addEventListener('ended', () => {
      transitionLogoToHeader();
    });

    // Safety timeout: transition if video stalls or finishes (max 4.5s)
    setTimeout(() => {
      if (!isIntroFinished) {
        transitionLogoToHeader();
      }
    }, 4500);
  }

  function transitionLogoToHeader() {
    if (isIntroFinished) return;
    isIntroFinished = true;

    // 1. Calculate coordinates from current centered position to header slot
    const startRect = introLogoBox.getBoundingClientRect();
    const destRect = headerLogoSlot.getBoundingClientRect();

    // Fix current position in absolute px so GSAP can smoothly translate
    gsap.set(introLogoBox, {
      top: startRect.top,
      left: startRect.left,
      width: startRect.width,
      height: startRect.height,
      x: 0,
      y: 0,
      transform: 'none'
    });

    // 2. Create transition timeline to fly video from center to header logo slot
    const transitionTl = gsap.timeline({
      onComplete: () => {
        // Dock static JPG inside final header slot
        if (headerLogoFinal) {
          headerLogoFinal.style.opacity = '1';
        }
        // Remove intro overlay
        if (logoIntroOverlay) {
          logoIntroOverlay.style.display = 'none';
        }
        // Refresh ScrollTrigger to ensure all markers are in sync
        ScrollTrigger.refresh();
      }
    });

    // Animate video box to header slot with smooth scale and coordinates
    transitionTl.to(introLogoBox, {
      top: destRect.top,
      left: destRect.left,
      width: destRect.width,
      height: destRect.height,
      borderRadius: '10px',
      duration: 1.15,
      ease: 'power3.inOut'
    }, 0);

    // As the video arrives at the header logo position (around 80% mark), switch to logo.jpg!
    if (introLogoImg) {
      transitionTl.to(introLogoImg, {
        opacity: 1,
        duration: 0.25,
        ease: 'power2.out'
      }, 0.85);
    }

    // Fade out black intro overlay to reveal the hero section underneath
    transitionTl.to(logoIntroOverlay, {
      opacity: 0,
      duration: 0.9,
      ease: 'power2.out'
    }, 0.25);

    // Reveal header navigation items smoothly
    if (headerNav) {
      transitionTl.to(headerNav, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out'
      }, 0.7);
    }
  }

  /* ==========================================================================
     GSAP SCROLLTRIGGER CHOREOGRAPHY — SHADOW-TO-LIGHT REVEAL
     ========================================================================== */
  function initScrollAnimation() {
    gsap.registerPlugin(ScrollTrigger);

    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: heroScrollTrack,
        start: 'top top',
        end: 'bottom bottom',
        pin: heroPinnedViewport,
        scrub: 1.2,
        anticipatePin: 1
      }
    });

    /* --------------------------------------------------------------------------
       1. FRAME SEQUENCE PLAYBACK (0 to 59 frames)
       -------------------------------------------------------------------------- */
    masterTl.to(sequenceState, {
      frame: CONFIG.totalFrames - 1,
      ease: 'none',
      duration: 100,
      onUpdate: () => {
        drawFrame(Math.round(sequenceState.frame));
      }
    }, 0);

    /* --------------------------------------------------------------------------
       2. CINEMATIC SHADOW-TO-LIGHT REVEAL (NO MASK LINES / NO CUTS)
       -------------------------------------------------------------------------- */
    masterTl.fromTo(personCanvasContainer,
      {
        opacity: 0.15,
        scale: 0.88,
        y: 40,
        filter: 'brightness(0.04) contrast(2.2) drop-shadow(0 0 35px rgba(255, 75, 0, 0.95)) drop-shadow(0 0 70px rgba(240, 0, 10, 0.4))'
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: 'brightness(1) contrast(1) drop-shadow(0 15px 35px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 20px rgba(255, 60, 0, 0.15))',
        ease: 'power2.out',
        duration: 25
      },
      0
    );

    // Volumetric Backlight strikes from behind silhouette
    if (volumetricBacklight) {
      masterTl.fromTo(volumetricBacklight,
        {
          opacity: 0.15,
          scale: 0.65
        },
        {
          opacity: 0.95,
          scale: 1.25,
          ease: 'power2.out',
          duration: 18
        },
        0
      ).to(volumetricBacklight, {
        opacity: 0.5,
        scale: 1.1,
        ease: 'power1.out',
        duration: 25
      }, 18);
    }

    // Ground Smoke Glow rolls around feet
    if (groundSmokeGlow) {
      masterTl.fromTo(groundSmokeGlow,
        {
          opacity: 0.1,
          scale: 0.7
        },
        {
          opacity: 0.85,
          scale: 1.15,
          ease: 'power2.out',
          duration: 24
        },
        2
      );
    }

    /* --------------------------------------------------------------------------
       3. 3D MONUMENTAL "RAJESH" TYPOGRAPHY REVEAL (Behind Person)
       -------------------------------------------------------------------------- */
     masterTl.fromTo(bgLetters,
      {
        opacity: 0,
        y: 130,
        z: -260,
        rotateX: 65,
        scale: 0.62,
        filter: 'blur(26px)'
      },
      {
        opacity: 1,
        y: 0,
        z: 0,
        rotateX: 0,
        scale: 1,
        filter: 'blur(0px)',
        stagger: 3.2,
        ease: 'power3.out',
        duration: 30
      },
      12
    );

    // Volumetric Fire Glow Core expansion behind letters
    if (fireGlowCore) {
      masterTl.fromTo(fireGlowCore,
        { opacity: 0.2, scale: 0.75 },
        { opacity: 0.95, scale: 1.25, ease: 'power2.out', duration: 35 },
        14
      );
    }

    /* --------------------------------------------------------------------------
       4. TOP HEADING REVEAL
       -------------------------------------------------------------------------- */
    if (headingPill) {
      masterTl.fromTo(headingPill,
        {
          opacity: 0,
          y: -25,
          scale: 0.92
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: 'power2.out',
          duration: 22
        },
        20
      );
    }
  }

  /* ==========================================================================
     CINEMATIC ABOUT SECTION (180 Walking Frames from about-video-frames)
     Reveal on the backside of his moving body
     ========================================================================== */
  const ABOUT_CONFIG = {
    totalFrames: 180,
    getFramePath: function (index) {
      const paddedIndex = String(index + 1).padStart(3, '0');
      return `videos/about-video-frames/ezgif-frame-${paddedIndex}.jpg`;
    }
  };

  const aboutCanvas = document.getElementById('about-canvas');
  const aboutCtx = aboutCanvas ? aboutCanvas.getContext('2d') : null;
  const aboutFrameImages = [];
  const aboutSequenceState = {
    frame: 0
  };
  let currentRenderedAboutFrame = -1;
  let aboutMasterTl = null;
  let isAboutAutoPlaying = false;
  let autoPlayTween = null;

  function preloadAboutFrames() {
    return new Promise((resolve) => {
      let loadedCount = 0;
      for (let i = 0; i < ABOUT_CONFIG.totalFrames; i++) {
        const img = new Image();
        img.src = ABOUT_CONFIG.getFramePath(i);
        img.onload = () => {
          loadedCount++;
          if (loadedCount === 1) {
            drawAboutFrame(0);
          }
          if (loadedCount === ABOUT_CONFIG.totalFrames) {
            resolve();
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === ABOUT_CONFIG.totalFrames) {
            resolve();
          }
        };
        aboutFrameImages[i] = img;
      }
    });
  }

  function resizeAboutCanvas() {
    if (!aboutCanvas || !aboutCtx) return;
    const stage = document.getElementById('about-stage') || aboutCanvas.parentElement || document.body;
    const dpr = window.devicePixelRatio || 1;
    const width = stage.clientWidth || Math.round(window.innerWidth * 0.7);
    const height = stage.clientHeight || window.innerHeight;

    aboutCanvas.width = width * dpr;
    aboutCanvas.height = height * dpr;
    aboutCanvas.style.width = `${width}px`;
    aboutCanvas.style.height = `${height}px`;
    aboutCtx.scale(dpr, dpr);

    currentRenderedAboutFrame = -1;
    drawAboutFrame(Math.round(aboutSequenceState.frame));
  }

  function getPersonBackPercent(frameIndex) {
    if (frameIndex <= 24) return 0;
    if (frameIndex >= 155) return 64;

    const keyframes = [
      { f: 24, p: 0 },
      { f: 40, p: 6.3 },
      { f: 60, p: 18.8 },
      { f: 80, p: 30.3 },
      { f: 100, p: 40.6 },
      { f: 120, p: 51.9 },
      { f: 140, p: 60.6 },
      { f: 155, p: 64.0 }
    ];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (frameIndex >= keyframes[i].f && frameIndex <= keyframes[i + 1].f) {
        const t = (frameIndex - keyframes[i].f) / (keyframes[i + 1].f - keyframes[i].f);
        return keyframes[i].p + t * (keyframes[i + 1].p - keyframes[i].p);
      }
    }
    return 64;
  }

  function updateAboutTextMask(frameIndex, drawWidth, offsetX) {
    const container = document.querySelector('.about-editorial-container');
    if (!container) return;

    if (frameIndex < 24) {
      container.style.clipPath = 'inset(0% 100% 0% 0%)';
      container.style.webkitClipPath = 'inset(0% 100% 0% 0%)';
      container.style.opacity = '0';
      return;
    }

    // Exact pixel X of Rajesh's back inside .about-stage
    const backRatio = getPersonBackPercent(frameIndex) / 100;
    const backPixelX = offsetX + backRatio * drawWidth;

    // Left offset of text within .about-stage (matches padding-left of about-content-wrapper)
    const textWrapper = document.querySelector('.about-content-wrapper');
    const textStartX = textWrapper ? parseInt(window.getComputedStyle(textWrapper).paddingLeft, 10) || 44 : 44;
    const containerWidth = container.offsetWidth || 560;

    // Only uncover text that has already been cleared behind his back
    const unmaskedWidth = Math.max(0, backPixelX - textStartX);
    const unmaskedPercent = Math.min(100, Math.max(0, (unmaskedWidth / containerWidth) * 100));

    if (unmaskedPercent <= 0) {
      container.style.clipPath = 'inset(0% 100% 0% 0%)';
      container.style.webkitClipPath = 'inset(0% 100% 0% 0%)';
      container.style.opacity = '0';
    } else {
      const remainingClip = (100 - unmaskedPercent).toFixed(1);
      container.style.clipPath = `inset(0% ${remainingClip}% 0% 0%)`;
      container.style.webkitClipPath = `inset(0% ${remainingClip}% 0% 0%)`;
      container.style.opacity = '1';
    }
  }

  function drawAboutFrame(frameIndex) {
    if (!aboutCanvas || !aboutCtx) return;
    const clampedIndex = Math.max(0, Math.min(ABOUT_CONFIG.totalFrames - 1, frameIndex));
    const img = aboutFrameImages[clampedIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    if (currentRenderedAboutFrame === clampedIndex) return;
    currentRenderedAboutFrame = clampedIndex;

    const stage = document.getElementById('about-stage') || aboutCanvas.parentElement || document.body;
    const width = stage.clientWidth || Math.round(window.innerWidth * 0.7);
    const height = stage.clientHeight || window.innerHeight;

    aboutCtx.clearRect(0, 0, width, height);

    // Fit entire 1280x720 frame so person is 100% fully visible without clipping
    const scaleByWidth = (width * 0.98) / 1280;
    const scaleByHeight = (height * 0.92) / 720;
    const scale = Math.min(scaleByWidth, scaleByHeight);

    const drawWidth = 1280 * scale;
    const drawHeight = 720 * scale;

    const offsetX = (width - drawWidth) / 2;
    // Set person height comfortably from top (clean distance from head to top)
    const offsetY = Math.max(35, (height - drawHeight) * 0.35);

    aboutCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    // Reveal text strictly on the backside of his body
    updateAboutTextMask(clampedIndex, drawWidth, offsetX);
  }

  function initAboutScrollAnimation() {
    const aboutScrollTrack = document.getElementById('about');
    const aboutPinnedViewport = document.getElementById('about-pinned-viewport');

    if (!aboutScrollTrack || !aboutPinnedViewport) return;

    aboutMasterTl = gsap.timeline({
      scrollTrigger: {
        trigger: aboutScrollTrack,
        start: 'top top',
        end: 'bottom bottom',
        pin: aboutPinnedViewport,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    // Scrub 180 frames across normalized duration 100
    aboutMasterTl.to(aboutSequenceState, {
      frame: ABOUT_CONFIG.totalFrames - 1,
      ease: 'none',
      duration: 100,
      onUpdate: () => {
        const f = Math.round(aboutSequenceState.frame);
        drawAboutFrame(f);
      }
    }, 0);
  }

  /* ==========================================================================
     CINEMATIC 3D IMAGE CAROUSEL CONTROLLER (#works)
     Perspective Depth, Layered Orbiting, Infinite Looping & Touch Navigation
     ========================================================================== */
  function init3DImageCarousel() {
    const stage = document.getElementById('carousel-stage');
    const card0 = document.getElementById('carousel-card-0');
    const card1 = document.getElementById('carousel-card-1');
    const card2 = document.getElementById('carousel-card-2');
    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');
    const indicators = document.querySelectorAll('.indicator-dot');

    if (!stage || !card0 || !card1 || !card2) return;

    const cards = [card0, card1, card2];
    const TOTAL_SLIDES = 3;
    const TRANSITION_DURATION = 850; // Milliseconds, synchronized with CSS token

    let activeIndex = 0;
    let isTransitioning = false;
    let transitTimer = null;

    /**
     * Render 3D slots with spatial depth and passage priority
     * @param {'next'|'prev'|'direct'} direction
     */
    function renderCarousel(direction) {
      // Clear any temporary interactive transforms
      cards.forEach(c => {
        c.style.transform = '';
      });

      cards.forEach((card, idx) => {
        // Compute relative cyclic offset from the active center index (0: Center, 1: Right, 2: Left)
        const slot = (idx - activeIndex + TOTAL_SLIDES) % TOTAL_SLIDES;

        card.classList.remove('is-center', 'is-left', 'is-right', 'is-passing-behind');

        if (slot === 0) {
          card.classList.add('is-center');
          card.setAttribute('aria-hidden', 'false');
          card.setAttribute('tabindex', '0');
        } else if (slot === 1) {
          card.classList.add('is-right');
          card.setAttribute('aria-hidden', 'false');
          card.setAttribute('tabindex', '-1');
        } else if (slot === 2) {
          card.classList.add('is-left');
          card.setAttribute('aria-hidden', 'false');
          card.setAttribute('tabindex', '-1');
        }

        // Manage background passing priority to prevent visual collisions
        if (direction === 'next' && slot === 1) {
          // Card moving from Left (slot 2) across the back to Right (slot 1)
          card.classList.add('is-passing-behind');
        } else if (direction === 'prev' && slot === 2) {
          // Card moving from Right (slot 1) across the back to Left (slot 2)
          card.classList.add('is-passing-behind');
        }
      });

      // Update pagination indicators
      indicators.forEach((dot, idx) => {
        const isActive = idx === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Clear passing-behind flag once the 3D transition finishes
      clearTimeout(transitTimer);
      transitTimer = setTimeout(() => {
        cards.forEach(c => c.classList.remove('is-passing-behind'));
        isTransitioning = false;
      }, TRANSITION_DURATION);
    }

    /**
     * Navigate to a target slide index
     */
    function goToSlide(targetIndex, direction) {
      if (isTransitioning || targetIndex === activeIndex) return;
      isTransitioning = true;

      if (!direction) {
        direction = ((targetIndex - activeIndex + TOTAL_SLIDES) % TOTAL_SLIDES === 1) ? 'next' : 'prev';
      }

      activeIndex = (targetIndex + TOTAL_SLIDES) % TOTAL_SLIDES;
      renderCarousel(direction);
    }

    function nextSlide() {
      goToSlide((activeIndex + 1) % TOTAL_SLIDES, 'next');
    }

    function prevSlide() {
      goToSlide((activeIndex - 1 + TOTAL_SLIDES) % TOTAL_SLIDES, 'prev');
    }

    // Previous and Next arrow buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
      });
    }

    // Direct card click interaction (clicking side images moves them to center)
    cards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        if (card.classList.contains('is-left')) {
          prevSlide();
        } else if (card.classList.contains('is-right')) {
          nextSlide();
        }
      });
    });

    // Pagination dot clicks
    indicators.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
      });
    });

    // Keyboard arrow controls (Left / Right)
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
      }
    });

    // Mobile touch swiping gesture support
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isTrackingTouch = false;

    stage.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchEndX = touchStartX;
        touchEndY = touchStartY;
        isTrackingTouch = true;
      }
    }, { passive: true });

    stage.addEventListener('touchmove', (e) => {
      if (!isTrackingTouch || e.touches.length !== 1) return;
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    }, { passive: true });

    stage.addEventListener('touchend', () => {
      if (!isTrackingTouch) return;
      isTrackingTouch = false;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Minimum swipe threshold: 45px and predominantly horizontal
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
        if (deltaX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }, { passive: true });

    // Subtle 3D dynamic tilt response on active center card for desktop mouse movement
    stage.addEventListener('mousemove', (e) => {
      if (isTransitioning) return;
      const centerCard = stage.querySelector('.carousel-card.is-center');
      if (!centerCard) return;

      const rect = centerCard.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      // Subtle tilt angles (max +/- 4deg)
      const tiltX = -(mouseY / (rect.height / 2)) * 4.5;
      const tiltY = (mouseX / (rect.width / 2)) * 6.5;

      centerCard.style.transform = `translate3d(-50%, -50%, 40px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale(1)`;
    });

    stage.addEventListener('mouseleave', () => {
      const centerCard = stage.querySelector('.carousel-card.is-center');
      if (centerCard && !isTransitioning) {
        centerCard.style.transform = '';
      }
    });

    // Initialize initial active state
    renderCarousel('direct');
  }

  /* ==========================================================================
     CINEMATIC FOOTER CONTROLLER (#contact)
     Live Clock, Copy-to-Clipboard & Smooth Back to Top
     ========================================================================== */
  function initFooterFeatures() {
    // 1. Live Indian Standard Time (IST) Clock
    const timeClock = document.getElementById('footer-local-time');
    if (timeClock) {
      function updateTime() {
        try {
          const now = new Date();
          const options = {
            timeZone: 'Asia/Kolkata',
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          };
          const formatter = new Intl.DateTimeFormat('en-US', options);
          timeClock.textContent = `${formatter.format(now)} IST`;
        } catch (e) {
          timeClock.textContent = new Date().toLocaleTimeString() + ' IST';
        }
      }
      updateTime();
      setInterval(updateTime, 1000);
    }

    // 2. Click-to-Copy Email Action
    const copyEmailBtn = document.getElementById('footer-copy-email-btn');
    const copyBadge = document.getElementById('copy-email-badge');
    const emailToCopy = 'rajeshpenumalla@gmail.com';

    if (copyEmailBtn && copyBadge) {
      copyEmailBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(emailToCopy);
          copyEmailBtn.classList.add('is-copied');
          copyBadge.textContent = 'COPIED!';
          setTimeout(() => {
            copyEmailBtn.classList.remove('is-copied');
            copyBadge.textContent = 'Copy';
          }, 2400);
        } catch (err) {
          window.location.href = `mailto:${emailToCopy}`;
        }
      });
    }

    // 3. Back to Top Smooth Scroll
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  /* ==========================================================================
     INITIALIZATION LIFECYCLE
     ========================================================================== */
  async function init() {
    try {
      initFireSparks();
      resizePersonCanvas();
      resizeAboutCanvas();

      // Start logo video intro transition listener
      setupLogoIntroTransition();

      // Preload 60 character frames in background
      await preloadFrames();
      drawFrame(0);

      // Preload 180 walking frames for About section
      preloadAboutFrames();

      // Initialize GSAP scroll timeline for Hero
      initScrollAnimation();

      // Initialize GSAP scroll timeline for Cinematic About Section
      initAboutScrollAnimation();

      // Initialize 3D Image Carousel
      init3DImageCarousel();

      // Initialize Footer Interactive Features (Live Clock, Copy Email, Back to Top)
      initFooterFeatures();

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          resizePersonCanvas();
          resizeAboutCanvas();
          resizeSparksCanvas();
          ScrollTrigger.refresh();
        }, 150);
      });
    } catch (err) {
      console.error('Initialization error:', err);
      transitionLogoToHeader();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();


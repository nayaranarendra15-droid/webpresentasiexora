document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const progressFill = document.getElementById('progressFill');
  const currentSlideNum = document.getElementById('currentSlideNum');
  const totalSlideNum = document.getElementById('totalSlideNum');
  const navDotsContainer = document.getElementById('navDots');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnStartDeck = document.getElementById('btnStartDeck');
  const btnRestart = document.getElementById('btnRestart');
  const btnFullscreen = document.getElementById('btnFullscreen');
  const btnOverview = document.getElementById('btnOverview');
  const btnCloseOverview = document.getElementById('btnCloseOverview');
  const overviewModal = document.getElementById('overviewModal');
  const overviewGrid = document.getElementById('overviewGrid');

  // Lightbox elements
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxBody = document.getElementById('lightboxBody');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const btnCloseLightbox = document.getElementById('btnCloseLightbox');
  const btnToggleZoom = document.getElementById('btnToggleZoom');

  let currentIndex = 0;
  const totalSlides = slides.length;

  totalSlideNum.textContent = String(totalSlides).padStart(2, '0');

  // 1. Typing Effect on Cover Subtitle
  const typingEl = document.getElementById('typingSubtitle');
  if (typingEl) {
    const fullText = typingEl.dataset.text || typingEl.textContent;
    typingEl.textContent = '';
    let charIdx = 0;
    const typeInterval = setInterval(() => {
      typingEl.textContent += fullText.charAt(charIdx);
      charIdx++;
      if (charIdx >= fullText.length) clearInterval(typeInterval);
    }, 34);
  }

  // 2. Interactive Cursor Aura & Spotlight Cards
  const cursorAura = document.getElementById('cursorAura');
  const spotlightCards = document.querySelectorAll('.spotlight-card');

  document.addEventListener('mousemove', (e) => {
    if (cursorAura) {
      cursorAura.style.left = `${e.clientX}px`;
      cursorAura.style.top = `${e.clientY}px`;
    }

    spotlightCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 3. Ambient Monochrome Particle Network Canvas
  const canvas = document.getElementById('bgParticles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const mouse = { x: -9999, y: -9999 };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    const particleCount = Math.min(48, Math.floor((width * height) / 28000));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6
    }));

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.fill();

        // Subtle connecting lines to nearby particles & cursor
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist / 130) * 0.06})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        const mouseDist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (mouseDist < 160) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - mouseDist / 160) * 0.14})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  // 4. Generate Navigation Dots & Overview Grid Items
  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Slide ${index + 1}: ${slide.dataset.title || ''}`);
    dot.addEventListener('click', () => goToSlide(index));
    navDotsContainer.appendChild(dot);

    const card = document.createElement('div');
    card.className = 'overview-item';
    card.innerHTML = `
      <span>SLIDE ${String(index + 1).padStart(2, '0')}</span>
      <h4>${slide.dataset.title || `Slide ${index + 1}`}</h4>
    `;
    card.addEventListener('click', () => {
      goToSlide(index);
      toggleOverview(false);
    });
    overviewGrid.appendChild(card);
  });

  const dots = Array.from(navDotsContainer.querySelectorAll('.dot'));
  const overviewItems = Array.from(overviewGrid.querySelectorAll('.overview-item'));

  function updateUI() {
    slides.forEach((slide, idx) => {
      slide.classList.remove('prev-exit');
      if (idx < currentIndex) {
        slide.classList.add('prev-exit');
      }
      slide.classList.toggle('active', idx === currentIndex);
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    overviewItems.forEach((item, idx) => {
      item.classList.toggle('active', idx === currentIndex);
    });

    currentSlideNum.textContent = String(currentIndex + 1).padStart(2, '0');
    const progressPercent = ((currentIndex + 1) / totalSlides) * 100;
    progressFill.style.width = `${progressPercent}%`;

    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === totalSlides - 1;
  }

  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    currentIndex = index;
    updateUI();
  }

  function nextSlide() {
    if (currentIndex < totalSlides - 1) goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    if (currentIndex > 0) goToSlide(currentIndex - 1);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function toggleOverview(forceState) {
    const isOpen = typeof forceState === 'boolean'
      ? forceState
      : !overviewModal.classList.contains('open');
    overviewModal.classList.toggle('open', isOpen);
    overviewModal.setAttribute('aria-hidden', String(!isOpen));
  }

  // 5. Lightbox with 1.6x Zoom Toggle
  function setLightboxZoom(isZoomed) {
    lightboxBody.classList.toggle('zoomed', isZoomed);
    btnToggleZoom.textContent = isZoomed ? 'Perkecil (Fit)' : 'Perbesar 1.6x';
  }

  function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxCaption.textContent = caption || 'Preview Gambar';
    setLightboxZoom(false);
    lightboxModal.classList.add('open');
    lightboxModal.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    lightboxModal.classList.remove('open');
    lightboxModal.setAttribute('aria-hidden', 'true');
    setLightboxZoom(false);
  }

  document.querySelectorAll('.zoomable-shot').forEach((img) => {
    img.addEventListener('click', () => {
      if (img.style.display !== 'none') {
        openLightbox(img.src, img.dataset.caption || img.alt);
      }
    });
  });

  btnToggleZoom.addEventListener('click', () => {
    setLightboxZoom(!lightboxBody.classList.contains('zoomed'));
  });

  lightboxImg.addEventListener('click', () => {
    setLightboxZoom(!lightboxBody.classList.contains('zoomed'));
  });

  btnCloseLightbox.addEventListener('click', closeLightbox);
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) closeLightbox();
  });

  // 6. Interactive Role Matrix Highlight (Slide 3)
  const roleTriggers = document.querySelectorAll('.role-trigger');
  const matrixTable = document.getElementById('matrixTable');
  let activeRoleFilter = null;

  roleTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const target = trigger.dataset.roleTarget;
      if (activeRoleFilter === target) {
        activeRoleFilter = null;
        roleTriggers.forEach((t) => t.classList.remove('selected'));
        matrixTable.classList.remove('highlight-admin', 'highlight-anggota');
      } else {
        activeRoleFilter = target;
        roleTriggers.forEach((t) => t.classList.toggle('selected', t.dataset.roleTarget === target));
        matrixTable.classList.remove('highlight-admin', 'highlight-anggota');
        matrixTable.classList.add(`highlight-${target}`);
      }
    });
  });

  // Button Events
  btnPrev.addEventListener('click', prevSlide);
  btnNext.addEventListener('click', nextSlide);
  if (btnStartDeck) btnStartDeck.addEventListener('click', nextSlide);
  if (btnRestart) btnRestart.addEventListener('click', () => goToSlide(0));
  btnFullscreen.addEventListener('click', toggleFullscreen);
  btnOverview.addEventListener('click', () => toggleOverview());
  btnCloseOverview.addEventListener('click', () => toggleOverview(false));

  // Keyboard Controls
  document.addEventListener('keydown', (e) => {
    if (lightboxModal.classList.contains('open')) {
      if (e.key === 'Escape') closeLightbox();
      return;
    }

    if (overviewModal.classList.contains('open')) {
      if (e.key === 'Escape' || e.key.toLowerCase() === 'g') {
        toggleOverview(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        goToSlide(0);
        break;
      case 'End':
        goToSlide(totalSlides - 1);
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'g':
      case 'G':
        toggleOverview(true);
        break;
    }
  });

  // Touch Swipe Support
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
  }, { passive: true });

  // UML Part 1 Tabs (Slide 5: Use Case & Activity)
  const uml1Tabs = document.querySelectorAll('[data-uml1]');
  const umlPart1Container = document.getElementById('umlPart1Container');
  uml1Tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      uml1Tabs.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      umlPart1Container.className = `uml-showcase mode-${btn.dataset.uml1}`;
    });
  });

  // UML Part 2 Tabs (Slide 6: Sequence & Class)
  const uml2Tabs = document.querySelectorAll('[data-uml2]');
  const umlPart2Container = document.getElementById('umlPart2Container');
  uml2Tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      uml2Tabs.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      umlPart2Container.className = `uml-showcase mode-${btn.dataset.uml2}`;
    });
  });

  // Dashboard View Switcher (Slide 8)
  const dashTabs = document.querySelectorAll('[data-view]');
  const showcaseContainer = document.getElementById('showcaseContainer');
  dashTabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      dashTabs.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      showcaseContainer.className = `showcase-container view-${btn.dataset.view}`;
    });
  });

  updateUI();
});
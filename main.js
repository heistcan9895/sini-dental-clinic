/* ============================================================
   BRIGHTSMILE DENTAL — main.js
   Scene-based animation system with typing headline
   ============================================================ */

'use strict';

// ─── SCENE 1 — TYPING HEADLINE (50ms per character) ──────────
/*
  Implementation Plan:
  Scene 1 — Navbar + Badge fade in (0–0.4s)
  Scene 2 — Headline types out char-by-char at 50ms each (~2.2s for 44 chars)
  Scene 3 — Blinking cursor fades out; subtitle slides up (stagger 200ms)
  Scene 4 — CTA buttons slide up (stagger 200ms after subtitle)
  Scene 5 — Trust numbers slide up + count animation starts
*/

const HEADLINE_LINE1 = 'Your Perfect Smile';
const HEADLINE_LINE2 = 'Starts Here';
const CHAR_DELAY     = 50;   // ms per character

const titleEl   = document.getElementById('heroTitle');
const cursorEl  = document.getElementById('heroCursor');
const subtitleEl = document.getElementById('heroSubtitle');
const ctasEl     = document.getElementById('heroCtas');
const trustEl    = document.getElementById('heroTrust');

// Place cursor next to title initially
function syncCursorPosition() {
  if (!titleEl || !cursorEl) return;
  titleEl.parentNode.insertBefore(cursorEl, titleEl.nextSibling);
}
syncCursorPosition();

function typeHeadline() {
  if (!titleEl) return;

  // Full text with a newline marker between the two lines
  const fullText = HEADLINE_LINE1 + '\n' + HEADLINE_LINE2;
  let charIndex  = 0;
  titleEl.innerHTML = '';

  // Build DOM structure first (line 1 span + br + line 2 span)
  const line1El = document.createElement('span');
  line1El.className = 'headline-line1';
  const brEl    = document.createElement('br');
  const line2El = document.createElement('span');
  line2El.className = 'headline-line2 gradient-text';
  titleEl.appendChild(line1El);
  titleEl.appendChild(brEl);
  titleEl.appendChild(line2El);

  const line1Chars = HEADLINE_LINE1.length;
  const line2Chars = HEADLINE_LINE2.length;
  const totalChars = line1Chars + line2Chars;

  function typeNext() {
    if (charIndex < totalChars) {
      if (charIndex < line1Chars) {
        line1El.textContent += HEADLINE_LINE1[charIndex];
      } else {
        line2El.textContent += HEADLINE_LINE2[charIndex - line1Chars];
      }
      charIndex++;
      setTimeout(typeNext, CHAR_DELAY);
    } else {
      // Typing done — Scene 3
      onTypingComplete();
    }
  }

  // Small delay before typing starts (Scene 1 badge already faded in)
  setTimeout(typeNext, 600);
}

function onTypingComplete() {
  // Hide cursor after short pause
  setTimeout(() => {
    if (cursorEl) cursorEl.classList.add('hidden');
  }, 500);

  // Scene 3 — subtitle slides up (300ms after typing ends)
  setTimeout(() => {
    subtitleEl && subtitleEl.classList.add('revealed');
  }, 300);

  // Scene 4 — CTAs slide up (600ms after typing ends)
  setTimeout(() => {
    ctasEl && ctasEl.classList.add('revealed');
  }, 600);

  // Scene 5 — Trust stats slide up + count (900ms after typing ends)
  setTimeout(() => {
    trustEl && trustEl.classList.add('revealed');
    startCounters();
  }, 900);
}

// Kick off on load
window.addEventListener('load', () => {
  typeHeadline();
});


// ─── 2. COUNTER ANIMATION ────────────────────────────────────
const counterEls       = document.querySelectorAll('.trust-number');
let   countersStarted  = false;

function animateCounter(el, target, duration = 1600) {
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;
  counterEls.forEach(el => animateCounter(el, parseInt(el.dataset.target, 10)));
}


// ─── 3. NAVBAR SCROLL ────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


// ─── 4. HERO PARTICLES ───────────────────────────────────────
(function spawnParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top:  ${Math.random() * 100}%;
      width:  ${Math.random() * 3 + 1.5}px;
      height: ${Math.random() * 3 + 1.5}px;
      opacity: ${Math.random() * 0.2 + 0.05};
      animation-duration: ${Math.random() * 5 + 3}s;
      animation-delay:    ${Math.random() * 4}s;
    `;
    container.appendChild(p);
  }
})();


// ─── 5. SCROLL-DRIVEN SVG JOURNEY LINE ───────────────────────
const journeyLine    = document.getElementById('journeyLine');
const journeyDot     = document.getElementById('journeyDot');
const journeyDotInner = document.getElementById('journeyDotInner');
const journeyWrapper = document.getElementById('journeyWrapper');
const journeySteps   = document.querySelectorAll('.journey-step');

let pathLength = 0;
const stepTriggers = [0.05, 0.3, 0.58, 0.82];

function initPathLength() {
  if (!journeyLine) return;
  pathLength = journeyLine.getTotalLength();
  journeyLine.style.strokeDasharray  = pathLength;
  journeyLine.style.strokeDashoffset = pathLength;
}

function updateJourneyLine() {
  if (!journeyWrapper || !journeyLine) return;

  const rect     = journeyWrapper.getBoundingClientRect();
  const wHeight  = window.innerHeight;
  const progress = Math.min(Math.max((wHeight - rect.top) / (rect.height + wHeight), 0), 1);

  journeyLine.style.strokeDashoffset = pathLength - progress * pathLength;

  // Mesh shift dynamic parallax
  document.body.style.setProperty('--scroll-y', `${window.scrollY}px`);

  if (pathLength > 0) {
    try {
      const pt = journeyLine.getPointAtLength(progress * pathLength);
      journeyDot.setAttribute('cx', pt.x);
      journeyDot.setAttribute('cy', pt.y);
      journeyDotInner.setAttribute('cx', pt.x);
      journeyDotInner.setAttribute('cy', pt.y);
      const vis = progress > 0.01 ? '1' : '0';
      journeyDot.setAttribute('opacity', vis);
      journeyDotInner.setAttribute('opacity', vis);

      // Interactive micro-animation: expand dot when scaling near step markers
      let nearStep = false;
      stepTriggers.forEach(trig => {
        if (Math.abs(progress - trig) < 0.04) nearStep = true;
      });

      if (nearStep) {
        journeyDot.setAttribute('r', '12');
        journeyDotInner.setAttribute('r', '6');
      } else {
        journeyDot.setAttribute('r', '8');
        journeyDotInner.setAttribute('r', '4');
      }
    } catch(e) {}
  }

  journeySteps.forEach((step, i) => {
    if (progress >= stepTriggers[i]) step.classList.add('visible');
  });
}

window.addEventListener('scroll',  updateJourneyLine, { passive: true });
window.addEventListener('resize',  () => { initPathLength(); updateJourneyLine(); });

window.addEventListener('load', () => {
  initPathLength();
  updateJourneyLine();
});

setTimeout(() => { initPathLength(); updateJourneyLine(); }, 250);


// ─── 6. INTERSECTION OBSERVER REVEALS ───────────────────────
// Service cards, review cards etc.
const revealEls = document.querySelectorAll('.service-card, .review-card');
revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  el.classList.add(`reveal-delay-${(i % 5) + 1}`);
});

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
revealEls.forEach(el => revealObs.observe(el));

// Section labels
const labels   = document.querySelectorAll('.section-label, .section-title, .section-sub, .cta-content');
const labelObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity   = '1';
      e.target.style.transform = 'translateY(0)';
      labelObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
labels.forEach(lbl => {
  lbl.style.opacity    = '0';
  lbl.style.transform  = 'translateY(14px)';
  lbl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  labelObs.observe(lbl);
});


// ─── 7. CARD 3D TILT ────────────────────────────────────────
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform  = `translateY(-5px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
    card.style.transition = 'transform 0.08s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform 0.4s ease';
  });
});


// ─── 8. BUTTON RIPPLE ───────────────────────────────────────
const rippleCSS = document.createElement('style');
rippleCSS.textContent = `@keyframes ripple-out { to { transform: scale(2.5); opacity: 0; } }`;
document.head.appendChild(rippleCSS);

document.querySelectorAll('.btn-primary, .btn-secondary, .btn-whatsapp, .btn-outline-white').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rp   = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    rp.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      background:rgba(255,255,255,0.18);
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top  - size/2}px;
      transform:scale(0); animation:ripple-out 0.5s ease-out forwards;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(rp);
    setTimeout(() => rp.remove(), 600);
  });
});


// ─── 9. FLOATING WHATSAPP & MOBILE STICKY CTA VISIBILITY ─────
const floatingBtn = document.getElementById('floating-whatsapp');
const mobileCta   = document.getElementById('mobile-sticky-cta');
const heroSection = document.getElementById('hero');

function checkFloat() {
  if (!heroSection) return;
  const past = heroSection.getBoundingClientRect().bottom < 0;
  const isMobile = window.innerWidth <= 768;

  // Manage desktop round WhatsApp float visibility
  if (floatingBtn) {
    if (isMobile) {
      // Fully hide desktop floating WhatsApp button on mobile, sticky CTA bar takes over!
      floatingBtn.style.opacity       = '0';
      floatingBtn.style.pointerEvents = 'none';
      floatingBtn.style.transform     = 'scale(0.7)';
    } else {
      floatingBtn.style.opacity       = past ? '1' : '0';
      floatingBtn.style.pointerEvents = past ? 'all' : 'none';
      floatingBtn.style.transform     = past ? 'scale(1)' : 'scale(0.7)';
    }
  }

  // Manage mobile sticky CTA bar visibility
  if (mobileCta) {
    if (isMobile && past) {
      mobileCta.classList.add('active');
    } else {
      mobileCta.classList.remove('active');
    }
  }
}
floatingBtn && (floatingBtn.style.transition = 'opacity 0.4s ease, transform 0.4s ease');
window.addEventListener('scroll', checkFloat, { passive: true });
window.addEventListener('resize', checkFloat, { passive: true });
checkFloat();


// ─── 10. CTA MOUSE PARALLAX ─────────────────────────────────
const ctaOrb1 = document.querySelector('.cta-orb-1');
const ctaOrb2 = document.querySelector('.cta-orb-2');
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth  - 0.5) * 28;
  const y = (e.clientY / window.innerHeight - 0.5) * 18;
  if (ctaOrb1) ctaOrb1.style.transform = `translate(${x}px,${y}px)`;
  if (ctaOrb2) ctaOrb2.style.transform = `translate(${-x}px,${-y}px)`;
}, { passive: true });


// ─── 11. LUXURY DARK/LIGHT MODE SWITCHER ────────────────────
const themeToggleBtn = document.getElementById('theme-toggle');

function initTheme() {
  // Force reset cached dark theme states to guarantee the user sees the new Light Skin Gold aesthetic
  if (!localStorage.getItem('v3_reset')) {
    localStorage.removeItem('theme');
    localStorage.setItem('v3_reset', 'true');
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    // Enable haptic/click scale effect
    themeToggleBtn.style.transform = 'scale(0.9) rotate(45deg)';
    setTimeout(() => {
      themeToggleBtn.style.transform = '';
    }, 150);

    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
}
initTheme();


// ─── 12. HIGH-CONVERTING LIVE BOOKING NOTIFICATION ──────────
const bookingToast = document.getElementById('live-booking-toast');
const toastAvatar  = document.getElementById('toastAvatar');
const toastTitle   = document.getElementById('toastTitle');
const toastDesc    = document.getElementById('toastDesc');
const toastClose   = document.getElementById('toastCloseBtn');

const bookings = [
  { name: 'Dr. Sajan (Dental Specialist)', desc: 'Just accepted an Orthodontic gap correction consultation request from Dhyan Ajeesh!', initial: 'S' },
  { name: 'Nandana Mohanan', desc: 'Scheduled a complete modern dental checkup and teeth cleaning.', initial: 'N' },
  { name: 'Dr. Sajan (Dental Specialist)', desc: 'Completed a gentle and thorough child tooth filling for Neethumol Mathew.', initial: 'S' },
  { name: 'Dhyan Ajeesh', desc: 'Just booked a professional diagnostic checkup session via WhatsApp.', initial: 'D' },
  { name: 'Neethumol Mathew', desc: 'Scheduled a dental checkup and orthodontic consultation slot.', initial: 'N' },
  { name: 'Nandana Mohanan', desc: 'Just booked a gentle cosmetic assessment via direct call.', initial: 'N' }
];

let bookingTimeout = null;

function showBookingNotification() {
  if (!bookingToast) return;
  
  // Pick a random notification
  const data = bookings[Math.floor(Math.random() * bookings.length)];
  if (toastAvatar) toastAvatar.textContent = data.initial;
  if (toastTitle) toastTitle.textContent = data.name;
  if (toastDesc) toastDesc.textContent = data.desc;
  
  // Slide in
  bookingToast.classList.add('active');
  
  // Automatically slide out after 7 seconds
  bookingTimeout = setTimeout(() => {
    hideBookingNotification();
  }, 7000);
}

function hideBookingNotification() {
  if (!bookingToast) return;
  bookingToast.classList.remove('active');
  if (bookingTimeout) {
    clearTimeout(bookingTimeout);
    bookingTimeout = null;
  }
}

if (toastClose) {
  toastClose.addEventListener('click', hideBookingNotification);
}

// Queue first notification after 6 seconds, then trigger periodically
setTimeout(() => {
  showBookingNotification();
  
  setInterval(() => {
    // Only show if not already showing
    if (!bookingToast.classList.contains('active')) {
      showBookingNotification();
    }
  }, 32000); // Trigger every 32 seconds
}, 6000);


// ─── 13. HERO DYNAMIC CARD SWAP SHOWCASE (GSAP) ────────────────
(function initHeroCardSwap() {
  const container = document.getElementById('cardSwapContainer');
  if (!container) return;

  const cards = Array.from(container.querySelectorAll('.swap-card'));
  if (cards.length < 2) return;

  // Configuration (matches React code parameters)
  const isMobile = window.innerWidth <= 768;
  const cardDistance = isMobile ? 16 : 45;
  const verticalDistance = isMobile ? 18 : 45;
  const skewAmount = isMobile ? 2 : 4;
  const delay = 2000; // Delay in milliseconds between swaps (2 seconds)

  const config = {
    ease: 'elastic.out(0.6, 0.9)',
    durDrop: 2.0,
    durMove: 2.0,
    durReturn: 2.0,
    promoteOverlap: 0.9,
    returnDelay: 0.05
  };

  let order = Array.from({ length: cards.length }, (_, i) => i);
  let tl = null;
  let intervalId = null;

  // Calculate coordinates for slot stacked depth perception
  function makeSlot(i, distX, distY, total) {
    return {
      x: i * distX,
      y: -i * distY,
      z: -i * distX * 1.5,
      zIndex: total - i
    };
  }

  // Set card positions immediately using hardware-accelerated transforms
  function placeCard(el, slot, skew) {
    gsap.set(el, {
      x: slot.x,
      y: slot.y,
      z: slot.z,
      xPercent: -50,
      yPercent: -50,
      skewY: skew,
      transformOrigin: 'center center',
      zIndex: slot.zIndex,
      force3D: true
    });
  }

  // Position cards initially
  function setupInitialPositions() {
    const total = cards.length;
    cards.forEach((card, i) => {
      placeCard(card, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
    });
  }
  setupInitialPositions();

  // Swap front card with elastic returning animation
  function swap() {
    if (order.length < 2) return;
    const front = order[0];
    const rest = order.slice(1);
    const elFront = cards[front];
    if (!elFront) return;

    tl = gsap.timeline();

    // 1. Front card drops down
    tl.to(elFront, {
      y: '+=500',
      duration: config.durDrop,
      ease: config.ease
    });

    // 2. Promote the remaining cards forward in parallel
    tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
    rest.forEach((idx, i) => {
      const el = cards[idx];
      if (!el) return;
      const slot = makeSlot(i, cardDistance, verticalDistance, cards.length);
      
      tl.set(el, { zIndex: slot.zIndex }, 'promote');
      tl.to(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        duration: config.durMove,
        ease: config.ease
      }, `promote+=${i * 0.15}`);
    });

    // 3. Front card returns to the back
    const backSlot = makeSlot(cards.length - 1, cardDistance, verticalDistance, cards.length);
    tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
    
    tl.call(() => {
      gsap.set(elFront, { zIndex: backSlot.zIndex });
    }, null, 'return');

    tl.to(elFront, {
      x: backSlot.x,
      y: backSlot.y,
      z: backSlot.z,
      duration: config.durReturn,
      ease: config.ease
    }, 'return');

    tl.call(() => {
      order = [...rest, front];
    });
  }

  // Set autoplay loop
  intervalId = setInterval(swap, delay);

  // Pause on hover
  container.addEventListener('mouseenter', () => {
    tl?.pause();
    clearInterval(intervalId);
  });

  container.addEventListener('mouseleave', () => {
    tl?.play();
    intervalId = setInterval(swap, delay);
  });

  // Handle active touchscreen tap scaling feedback
  cards.forEach(card => {
    card.addEventListener('mousedown', () => {
      gsap.to(card, { scale: 0.96, duration: 0.1 });
    });
    card.addEventListener('mouseup', () => {
      gsap.to(card, { scale: 1, duration: 0.2 });
    });
  });

  // Support responsive mobile resize updates with debouncing
  window.addEventListener('resize', gsap.utils.debounce(() => {
    const mobileNow = window.innerWidth <= 768;
    const newDistX = mobileNow ? 16 : 45;
    const newDistY = mobileNow ? 18 : 45;
    const newSkew = mobileNow ? 2 : 4;
    
    // Position cards to match new viewports smoothly
    order.forEach((idx, i) => {
      const el = cards[idx];
      const slot = makeSlot(i, newDistX, newDistY, cards.length);
      gsap.to(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        skewY: newSkew,
        zIndex: slot.zIndex,
        duration: 0.5
      });
    });
  }, 250));

})();

const menu = document.querySelector('.menu');
const mobileLinks = document.querySelector('.mobile-links');
menu?.addEventListener('click', () => {
  const open = mobileLinks.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
mobileLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileLinks.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open menu');
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

document.querySelectorAll('.sticker').forEach(sticker => {
  sticker.innerHTML = `<span>${sticker.innerHTML}</span>`;
});
const stickerObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('sticker-visible');
    stickerObserver.unobserve(entry.target);
  });
}, { threshold: .35 });
document.querySelectorAll('.sticker').forEach(sticker => stickerObserver.observe(sticker));

const stagedSections = [
  ['.press', ['.sticker', 'h2', '.press-card>img', '.press-card>div', '.press-card em', '.press-card h3', '.press-card p', '.press-card .button']],
  ['.experience', ['.center .sticker', '.center h2', '.center p', '.effect-scroll']],
  ['.coming', ['.section-title .sticker', '.section-title h2', '.cards']],
  ['.location', ['.location-panel', '.location-panel .sticker', '.location-panel h2', '.location-panel p', '.area', '.area .button']],
  ['.gallery', ['.gallery-head .sticker', '.gallery-head h2', '.gallery-head p', '.filters', '.gallery-grid']],
  ['.faq', ['.faq-intro .sticker', '.faq-intro h2', '.faq-intro p', '.accordion']],
  ['.updates', ['.updates-content .sticker', '.updates-content h2', '.updates-content>p', '.updates-content form']]
];
const sequenceObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('sequence-visible');
    sequenceObserver.unobserve(entry.target);
  });
}, { threshold: .14 });
stagedSections.forEach(([sectionSelector, itemSelectors]) => {
  const section = document.querySelector(sectionSelector);
  if (!section) return;
  section.classList.add('sequence-section');
  itemSelectors.forEach((selector, index) => {
    section.querySelectorAll(selector).forEach(item => {
      item.classList.add('stage-item');
      item.style.setProperty('--stage-delay', `${index * 130}ms`);
    });
  });
  sequenceObserver.observe(section);
});
document.querySelectorAll('.gallery-grid>*').forEach((card, index) => {
  card.classList.add('gallery-stage-card');
  card.style.setProperty('--card-delay', `${520 + index * 145}ms`);
});

document.querySelectorAll('.accordion details').forEach(detail => {
  const answer = detail.querySelector('p');
  if (!answer) return;
  const shell = document.createElement('div');
  shell.className = 'faq-answer';
  answer.before(shell);
  shell.append(answer);
  if (detail.open) detail.classList.add('is-open');
});
const closeFaq = detail => {
  detail.classList.remove('is-open');
  clearTimeout(detail._closeTimer);
  detail._closeTimer = setTimeout(() => { detail.open = false; }, 700);
};
document.querySelectorAll('.accordion summary').forEach(summary => {
  summary.addEventListener('click', event => {
    event.preventDefault();
    const detail = summary.parentElement;
    const wasOpen = detail.classList.contains('is-open');
    document.querySelectorAll('.accordion details.is-open').forEach(openDetail => {
      if (openDetail !== detail) closeFaq(openDetail);
    });
    if (wasOpen) closeFaq(detail);
    else {
      clearTimeout(detail._closeTimer);
      detail.open = true;
      requestAnimationFrame(() => detail.classList.add('is-open'));
    }
  });
});

const pressTrack = document.querySelector('.press-track');
const pressSlides = pressTrack ? [...pressTrack.querySelectorAll('.press-card')] : [];
const pressIndicators = [...document.querySelectorAll('.press-indicators button')];
let pressIndex = 0;
let pressTimer = 0;
const showPressSlide = index => {
  if (!pressTrack || !pressSlides.length) return;
  pressIndex = index % pressSlides.length;
  pressTrack.style.transform = `translate3d(-${pressSlides[pressIndex].offsetLeft}px,0,0)`;
  pressIndicators.forEach((indicator, indicatorIndex) => {
    const active = indicatorIndex === pressIndex;
    indicator.classList.toggle('active', active);
    if (active) indicator.setAttribute('aria-current', 'true');
    else indicator.removeAttribute('aria-current');
  });
};
const startPressCarousel = () => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || pressTimer || pressSlides.length < 2) return;
  pressTimer = setInterval(() => showPressSlide(pressIndex + 1), 5200);
};
const stopPressCarousel = () => { clearInterval(pressTimer); pressTimer = 0; };
document.querySelector('.press-carousel')?.addEventListener('mouseenter', stopPressCarousel);
document.querySelector('.press-carousel')?.addEventListener('mouseleave', startPressCarousel);
pressIndicators.forEach((indicator, index) => indicator.addEventListener('click', () => {
  stopPressCarousel();
  showPressSlide(index);
  setTimeout(startPressCarousel, 1800);
}));
startPressCarousel();
addEventListener('resize', () => showPressSlide(pressIndex));

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero = document.querySelector('.hero');

const effectScene = document.querySelector('.effect-scroll');
const effectCards = effectScene ? [...effectScene.querySelectorAll('.effect-card')] : [];
const effectSideCards = effectScene ? [...effectScene.querySelectorAll('.effect-side')] : [];

if (effectScene && effectCards.length && window.gsap && window.ScrollTrigger && window.Lenis) {
  gsap.registerPlugin(ScrollTrigger);

  if (reducedMotion) {
    gsap.set(effectScene, {
      '--effect-progress': 1,
      '--effect-intro': 1,
      '--effect-expand': 1,
      '--effect-content': 1,
      '--effect-deck-y': '0px'
    });
  } else {
    const lenis = new Lenis({
      duration: 1.15,
      easing: t => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: .9,
      touchMultiplier: 1.2,
      anchors: true
    });

    lenis.on('scroll', ScrollTrigger.update);
    const lenisTick = time => lenis.raf(time * 1000);
    gsap.ticker.add(lenisTick);
    gsap.ticker.lagSmoothing(0);

    gsap.set(effectCards, {
      force3D: true,
      willChange: 'transform'
    });

    const motionMedia = gsap.matchMedia();
    const createExperienceTimeline = ({ mobile = false } = {}) => {
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: effectScene,
          start: 'top 85%',
          end: '+=800',
          scrub: .8,
          invalidateOnRefresh: true,
          anticipatePin: 1
        }
      });

      timeline
        .to(effectScene, {
          '--effect-progress': 1,
          duration: 1
        }, 0)
        .to(effectScene, {
          '--effect-intro': 1,
          duration: mobile ? .24 : .28
        }, .06)
        .to(effectScene, {
          '--effect-expand': mobile ? .88 : .92,
          duration: .54
        }, .08)
        .to(effectScene, {
          '--effect-expand': 1,
          duration: .32
        }, .62)
        .to(effectScene, {
          '--effect-content': 1,
          duration: .27
        }, .55)
        .fromTo(effectSideCards, {
          y: 45
        }, {
          y: 0,
          duration: .94,
          immediateRender: true
        }, 0);

      if (!mobile) {
        timeline.fromTo(effectScene, {
          '--effect-deck-y': () => `${(-innerHeight * .265 + 35).toFixed(2)}px`
        }, {
          '--effect-deck-y': '0px',
          duration: .86,
          immediateRender: true
        }, .08);
      }

      return () => timeline.kill();
    };

    motionMedia.add('(min-width: 768px)', () => createExperienceTimeline());
    motionMedia.add('(max-width: 767px)', () => createExperienceTimeline({ mobile: true }));

    const refreshExperience = () => ScrollTrigger.refresh();
    addEventListener('load', refreshExperience, { once: true });
    document.fonts?.ready.then(refreshExperience);

    const cleanupExperienceMotion = () => {
      motionMedia.revert();
      gsap.ticker.remove(lenisTick);
      lenis.destroy();
    };
    addEventListener('pagehide', cleanupExperienceMotion, { once: true });
  }
}

const playerStory = document.querySelector('.no-golf');
const playerImages = [...document.querySelectorAll('.player-backgrounds img')];
const playerItems = [...document.querySelectorAll('.no-golf li')];
let playerFrame = 0;
let activePlayer = -1;
const updatePlayerStory = () => {
  playerFrame = 0;
  if (!playerStory || !playerItems.length) return;
  const rect = playerStory.getBoundingClientRect();
  const distance = Math.max(1, rect.height - innerHeight);
  const entrance = Math.min(1, Math.max(0, (innerHeight - rect.top) / innerHeight));
  const easedEntrance = entrance * entrance * (3 - 2 * entrance);
  playerStory.style.setProperty('--player-enter', easedEntrance.toFixed(4));
  const contentReveal = Math.min(1, Math.max(0, (entrance - .48) / .38));
  playerStory.style.setProperty('--player-content', (contentReveal * contentReveal * (3 - 2 * contentReveal)).toFixed(4));
  const progress = Math.min(1, Math.max(0, -rect.top / distance));
  const nextPlayer = Math.min(playerItems.length - 1, Math.floor(progress * playerItems.length));
  if (nextPlayer === activePlayer) return;
  activePlayer = nextPlayer;
  playerImages.forEach((image, index) => image.classList.toggle('active', index === activePlayer));
  playerItems.forEach((item, index) => {
    item.classList.toggle('active', index === activePlayer);
    if (index === activePlayer) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
};
const requestPlayerStory = () => {
  if (!playerFrame) playerFrame = requestAnimationFrame(updatePlayerStory);
};
addEventListener('scroll', requestPlayerStory, { passive: true });
addEventListener('resize', requestPlayerStory);
updatePlayerStory();

const cardsCarousel = document.querySelector('.cards');
const carouselCards = cardsCarousel ? [...cardsCarousel.querySelectorAll('article')] : [];
let carouselTimer = 0;
let carouselIndex = 0;
let carouselResumeTimer = 0;
let carouselSyncTimer = 0;
let carouselAnimationFrame = 0;
let carouselDragging = false;
let carouselStartX = 0;
let carouselStartScroll = 0;
let carouselLastX = 0;
let carouselLastTime = 0;
let carouselVelocity = 0;
const goToCarouselCard = index => {
  if (!cardsCarousel || !carouselCards.length) return;
  carouselIndex = index % carouselCards.length;
  const from = cardsCarousel.scrollLeft;
  const to = carouselCards[carouselIndex].offsetLeft - cardsCarousel.offsetLeft;
  const distance = to - from;
  const duration = 1100;
  const started = performance.now();
  cancelAnimationFrame(carouselAnimationFrame);
  const animate = now => {
    const progress = Math.min((now - started) / duration, 1);
    const eased = progress < .5 ? 4 * progress ** 3 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    cardsCarousel.scrollLeft = from + distance * eased;
    if (progress < 1) carouselAnimationFrame = requestAnimationFrame(animate);
  };
  carouselAnimationFrame = requestAnimationFrame(animate);
};
const startCarousel = () => {
  if (!cardsCarousel || reducedMotion || carouselTimer) return;
  carouselTimer = setInterval(() => goToCarouselCard(carouselIndex + 1), 3200);
};
const stopCarousel = () => {
  clearInterval(carouselTimer);
  carouselTimer = 0;
};
const syncCarouselIndex = () => {
  if (!cardsCarousel || !carouselCards.length) return;
  carouselIndex = carouselCards.reduce((nearest, card, index) =>
    Math.abs(card.offsetLeft - cardsCarousel.scrollLeft) < Math.abs(carouselCards[nearest].offsetLeft - cardsCarousel.scrollLeft) ? index : nearest, 0);
};
const resumeCarouselSoon = () => {
  clearTimeout(carouselResumeTimer);
  carouselResumeTimer = setTimeout(() => { syncCarouselIndex(); startCarousel(); }, 1800);
};
cardsCarousel?.addEventListener('mouseenter', stopCarousel);
cardsCarousel?.addEventListener('mouseleave', () => { if (!carouselDragging) startCarousel(); });
cardsCarousel?.addEventListener('pointerdown', event => {
  carouselDragging = true;
  carouselStartX = event.clientX;
  carouselStartScroll = cardsCarousel.scrollLeft;
  carouselLastX = event.clientX;
  carouselLastTime = performance.now();
  carouselVelocity = 0;
  cardsCarousel.classList.add('dragging');
  cardsCarousel.setPointerCapture(event.pointerId);
  cancelAnimationFrame(carouselAnimationFrame);
  stopCarousel();
});
cardsCarousel?.addEventListener('pointermove', event => {
  if (!carouselDragging) return;
  const now = performance.now();
  const elapsed = Math.max(now - carouselLastTime, 1);
  carouselVelocity = carouselVelocity * .72 + ((carouselLastX - event.clientX) / elapsed) * .28;
  cardsCarousel.scrollLeft = carouselStartScroll - (event.clientX - carouselStartX);
  carouselLastX = event.clientX;
  carouselLastTime = now;
});
const finishCarouselDrag = event => {
  if (!carouselDragging) return;
  carouselDragging = false;
  cardsCarousel.classList.remove('dragging');
  if (cardsCarousel.hasPointerCapture(event.pointerId)) cardsCarousel.releasePointerCapture(event.pointerId);
  const from = cardsCarousel.scrollLeft;
  const maxScroll = cardsCarousel.scrollWidth - cardsCarousel.clientWidth;
  const to = Math.max(0, Math.min(maxScroll, from + carouselVelocity * 320));
  const distance = to - from;
  const started = performance.now();
  const duration = Math.min(850, 420 + Math.abs(distance) * .55);
  cancelAnimationFrame(carouselAnimationFrame);
  const coast = now => {
    const progress = Math.min((now - started) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    cardsCarousel.scrollLeft = from + distance * eased;
    if (progress < 1) carouselAnimationFrame = requestAnimationFrame(coast);
    else syncCarouselIndex();
  };
  carouselAnimationFrame = requestAnimationFrame(coast);
  resumeCarouselSoon();
};
cardsCarousel?.addEventListener('pointerup', finishCarouselDrag);
cardsCarousel?.addEventListener('pointercancel', finishCarouselDrag);
cardsCarousel?.addEventListener('scroll', () => {
  clearTimeout(carouselSyncTimer);
  carouselSyncTimer = setTimeout(syncCarouselIndex, 180);
}, { passive: true });
cardsCarousel?.addEventListener('focusin', stopCarousel);
cardsCarousel?.addEventListener('focusout', startCarousel);
document.addEventListener('visibilitychange', () => document.hidden ? stopCarousel() : startCarousel());
startCarousel();

const googleMapStyles = [
  { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#202c3e' }] },
  { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ gamma: 0.01 }, { lightness: 20 }, { weight: '1.39' }, { color: '#ffffff' }] },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ weight: '0.96' }, { saturation: '9' }, { visibility: 'on' }, { color: '#000000' }] },
  { featureType: 'all', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.country', elementType: 'labels.icon', stylers: [{ visibility: 'on' }, { color: '#b91212' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ lightness: 30 }, { saturation: '9' }, { color: '#2a3859' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry.fill', stylers: [{ color: '#050786' }] },
  { featureType: 'landscape.natural.landcover', elementType: 'all', stylers: [{ saturation: '0' }, { lightness: '7' }] },
  { featureType: 'landscape.natural.landcover', elementType: 'geometry.fill', stylers: [{ color: '#050786' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ saturation: 20 }] },
  { featureType: 'poi', elementType: 'geometry.fill', stylers: [{ color: '#050786' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ lightness: 20 }, { saturation: -20 }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ lightness: 10 }, { saturation: -30 }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#01ffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ saturation: 25 }, { lightness: 25 }, { weight: '0.01' }] },
  { featureType: 'water', elementType: 'all', stylers: [{ lightness: '-44' }, { color: '#0f172a' }] }
];
const initRiyadhMap = () => {
  const mapElement = document.querySelector('#riyadh-map');
  if (!mapElement || !window.google?.maps) return;
  const location = { lat: 24.7242, lng: 46.6225 };
  const map = new google.maps.Map(mapElement, { center: location, zoom: 14, styles: googleMapStyles, disableDefaultUI: true, zoomControl: true, gestureHandling: 'cooperative', backgroundColor: '#202c3e' });
  new google.maps.Marker({ position: location, map, title: 'King Saud University Area, Riyadh' });
};
const mapsApiKey = document.querySelector('meta[name="google-maps-api-key"]')?.content.trim();
if (mapsApiKey && mapsApiKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
  window.initRiyadhMap = initRiyadhMap;
  const mapsScript = document.createElement('script');
  mapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(mapsApiKey)}&callback=initRiyadhMap`;
  mapsScript.async = true;
  mapsScript.defer = true;
  document.head.appendChild(mapsScript);
}

document.querySelectorAll('.accordion details').forEach(detail => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('.accordion details').forEach(other => {
      if (other !== detail) other.open = false;
    });
  });
});

document.querySelectorAll('.filters button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const category = button.dataset.filter;
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) galleryGrid.dataset.layout = category;
    document.querySelectorAll('.filters button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  });
});

const signupForm = document.querySelector('#signup-form');
const smsPreference = document.querySelector('#sms-preference');
const smsField = document.querySelector('.sms-field');
const mobileNumber = smsField?.querySelector('input[name="mobileNumber"]');

const syncSmsField = () => {
  const active = Boolean(smsPreference?.checked);
  smsField?.classList.toggle('visible', active);
  smsField?.setAttribute('aria-hidden', String(!active));
  if (mobileNumber) {
    mobileNumber.required = active;
    if (!active) mobileNumber.value = '';
  }
};

smsPreference?.addEventListener('change', syncSmsField);
signupForm?.addEventListener('reset', () => requestAnimationFrame(syncSmsField));
syncSmsField();

signupForm?.addEventListener('submit', event => {
  event.preventDefault();
  event.currentTarget.querySelector('.status').textContent = 'You’re on the list. Watch this space.';
  event.currentTarget.reset();
});

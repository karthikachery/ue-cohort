import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Generates star rating HTML.
 * @param {string} ratingText The rating text (e.g. "4.8/5")
 * @returns {string} HTML string for stars
 */
function buildStars(ratingText) {
  const match = ratingText.match(/([\d.]+)\s*\/\s*(\d+)/);
  if (!match) return '';
  const rating = parseFloat(match[1]);
  const max = parseInt(match[2], 10);
  let stars = '';
  for (let i = 1; i <= max; i += 1) {
    if (i <= Math.floor(rating)) {
      stars += '<span class="testimonials-star testimonials-star-full" aria-hidden="true">&#9733;</span>';
    } else if (i - rating < 1 && i - rating > 0) {
      stars += '<span class="testimonials-star testimonials-star-half" aria-hidden="true">&#9733;</span>';
    } else {
      stars += '<span class="testimonials-star testimonials-star-empty" aria-hidden="true">&#9734;</span>';
    }
  }
  return stars;
}

/**
 * loads and decorates the testimonials block
 * @param {Element} block The testimonials block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const track = document.createElement('div');
  track.className = 'testimonials-track';

  const slides = [];

  rows.forEach((row) => {
    const slide = document.createElement('div');
    slide.className = 'testimonials-slide';
    moveInstrumentation(row, slide);

    const cols = [...row.children];
    // AEM delivers 4 columns:
    // Col 0: quote text
    // Col 1: avatar image (reference + altText collapsed into one cell)
    // Col 2: customer name
    // Col 3: rating & badge

    const quote = cols[0]?.textContent?.trim() || '';
    const avatarPic = cols[1]?.querySelector('picture');
    const avatarImg = avatarPic?.querySelector('img');
    const name = cols[2]?.textContent?.trim() || '';
    const ratingAndBadge = cols[3]?.textContent?.trim() || '';

    // Parse rating and badge from combined field
    const parts = ratingAndBadge.split('·').map((s) => s.trim());
    const ratingText = parts[0] || '';
    const badge = parts[1] || '';

    // Build quote
    const quoteEl = document.createElement('blockquote');
    quoteEl.className = 'testimonials-quote';
    quoteEl.textContent = `\u201C${quote}\u201D`;

    // Build author section
    const authorEl = document.createElement('div');
    authorEl.className = 'testimonials-author';

    if (avatarPic) {
      if (avatarImg) {
        const altText = avatarImg.alt || name;
        const optimized = createOptimizedPicture(avatarImg.src, altText, false, [{ width: '80' }]);
        optimized.className = 'testimonials-avatar';
        authorEl.append(optimized);
      }
    }

    const infoEl = document.createElement('div');
    infoEl.className = 'testimonials-info';

    const nameEl = document.createElement('p');
    nameEl.className = 'testimonials-name';
    nameEl.textContent = name;
    infoEl.append(nameEl);

    if (ratingText) {
      const ratingEl = document.createElement('p');
      ratingEl.className = 'testimonials-rating';
      ratingEl.innerHTML = `${buildStars(ratingText)} <span class="testimonials-score">${ratingText}</span>`;
      if (badge) {
        ratingEl.innerHTML += ` &middot; <span class="testimonials-badge">${badge}</span>`;
      }
      ratingEl.setAttribute('aria-label', `Rating: ${ratingText}${badge ? `, ${badge}` : ''}`);
      infoEl.append(ratingEl);
    }

    authorEl.append(infoEl);

    const card = document.createElement('div');
    card.className = 'testimonials-card';
    card.append(quoteEl, authorEl);
    slide.append(card);
    track.append(slide);
    slides.push(slide);
  });

  // Build carousel controls
  const nav = document.createElement('div');
  nav.className = 'testimonials-nav';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'testimonials-btn testimonials-btn-prev';
  prevBtn.setAttribute('aria-label', 'Previous testimonial');
  prevBtn.innerHTML = '&#8249;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'testimonials-btn testimonials-btn-next';
  nextBtn.setAttribute('aria-label', 'Next testimonial');
  nextBtn.innerHTML = '&#8250;';

  const dots = document.createElement('div');
  dots.className = 'testimonials-dots';
  dots.setAttribute('role', 'tablist');
  dots.setAttribute('aria-label', 'Testimonial navigation');

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testimonials-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    if (i === 0) dot.classList.add('active');
    dots.append(dot);
  });

  nav.append(prevBtn, dots, nextBtn);

  // Clear block and build final structure
  block.textContent = '';
  block.append(track, nav);

  // Carousel logic
  let currentIndex = 0;
  let autoplayInterval = null;
  const totalSlides = slides.length;

  function updateSlide() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.querySelectorAll('.testimonials-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
    });
  }

  function goToSlide(index) {
    currentIndex = (index + totalSlides) % totalSlides;
    updateSlide();
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);
  }

  prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
    stopAutoplay();
    startAutoplay();
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
    stopAutoplay();
    startAutoplay();
  });

  dots.querySelectorAll('.testimonials-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      stopAutoplay();
      startAutoplay();
    });
  });

  // Pause autoplay on hover/focus
  block.addEventListener('mouseenter', stopAutoplay);
  block.addEventListener('mouseleave', startAutoplay);
  block.addEventListener('focusin', stopAutoplay);
  block.addEventListener('focusout', startAutoplay);

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  block.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  block.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToSlide(currentIndex + 1);
      else goToSlide(currentIndex - 1);
    }
    startAutoplay();
  }, { passive: true });

  // Start autoplay
  if (totalSlides > 1) startAutoplay();
}

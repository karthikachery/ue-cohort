import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Builds a slide element from a row of authored content.
 * Expected columns per row (from the content model):
 * Col 0: background image (picture element)
 * Col 1: richtext content (eyebrow paragraph, heading, description, CTA links)
 * Col 2: side image (optional picture element for two-column layout)
 */
function buildSlide(row) {
  const cols = [...row.children];
  const slide = document.createElement('div');
  slide.className = 'hero-carousel-slide';
  moveInstrumentation(row, slide);

  // Col 0: Background image
  const bgPicture = cols[0]?.querySelector('picture');
  const bgImg = bgPicture?.querySelector('img');

  // Col 1: Richtext content
  const contentCol = cols[1];

  // Col 2: Side image (optional)
  const sidePicture = cols[2]?.querySelector('picture');
  const sideImg = sidePicture?.querySelector('img');

  // Background image
  if (bgImg) {
    const optimizedBg = createOptimizedPicture(bgImg.src, bgImg.alt || '', false, [{ width: '1600' }]);
    optimizedBg.className = 'hero-carousel-bg';
    slide.append(optimizedBg);
  }

  // Gradient overlay
  const overlay = document.createElement('div');
  overlay.className = 'hero-carousel-overlay';
  slide.append(overlay);

  // Content container
  const hasSideImage = sideImg && sideImg.src;
  const content = document.createElement('div');
  content.className = hasSideImage
    ? 'hero-carousel-content hero-carousel-content-grid'
    : 'hero-carousel-content';

  // Text column - parse richtext content
  const textCol = document.createElement('div');
  textCol.className = 'hero-carousel-text';

  if (contentCol) {
    // Collect all content elements: check direct children first,
    // but if there's a single wrapper div (no semantic meaning), look inside it.
    let children = [...contentCol.children];
    if (children.length === 1 && children[0].tagName === 'DIV') {
      children = [...children[0].children];
    }
    let headingFound = false;

    children.forEach((child) => {
      const clone = child.cloneNode(true);
      // Style eyebrow: first <p> that has no links and is short text
      if (clone.tagName === 'P' && !clone.querySelector('a') && clone.textContent.trim().length < 80 && !headingFound) {
        clone.className = 'hero-carousel-eyebrow';
      }
      // Style headings
      if (/^H[1-6]$/.test(clone.tagName)) {
        clone.className = 'hero-carousel-heading';
        headingFound = true;
      }
      // Style description paragraphs (non-link paragraphs after heading)
      if (clone.tagName === 'P' && !clone.querySelector('a') && headingFound) {
        clone.className = 'hero-carousel-description';
      }
      // Style CTA links in paragraphs
      if (clone.tagName === 'P' && clone.querySelector('a')) {
        clone.className = 'hero-carousel-ctas';
        const links = clone.querySelectorAll('a');
        links.forEach((link, idx) => {
          link.className = idx === 0
            ? 'hero-carousel-btn hero-carousel-btn-primary'
            : 'hero-carousel-btn hero-carousel-btn-secondary';
        });
      }
      textCol.append(clone);
    });
  }

  content.append(textCol);

  // Side image column
  if (hasSideImage) {
    const sideCol = document.createElement('div');
    sideCol.className = 'hero-carousel-side-image';
    const optimizedSide = createOptimizedPicture(sideImg.src, sideImg.alt || '', false, [{ width: '600' }]);
    sideCol.append(optimizedSide);
    content.append(sideCol);
  }

  slide.append(content);
  return slide;
}

/**
 * loads and decorates the hero-carousel block
 * @param {Element} block The hero-carousel block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const track = document.createElement('div');
  track.className = 'hero-carousel-track';
  track.setAttribute('aria-live', 'polite');

  const slides = [];

  rows.forEach((row) => {
    const slide = buildSlide(row);
    track.append(slide);
    slides.push(slide);
  });

  // Mark first slide as active
  if (slides.length > 0) {
    slides[0].classList.add('active');
  }

  // Dot navigation
  const dotsContainer = document.createElement('div');
  dotsContainer.className = 'hero-carousel-dots';
  dotsContainer.setAttribute('role', 'tablist');
  dotsContainer.setAttribute('aria-label', 'Slide navigation');

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'hero-carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    if (i === 0) dot.classList.add('active');
    dotsContainer.append(dot);
  });

  // Clear block and rebuild
  block.textContent = '';
  block.append(track, dotsContainer);

  // Carousel logic
  let currentIndex = 0;
  let autoplayInterval = null;
  const totalSlides = slides.length;

  function goToSlide(index) {
    slides[currentIndex].classList.remove('active');
    currentIndex = (index + totalSlides) % totalSlides;
    slides[currentIndex].classList.add('active');

    dotsContainer.querySelectorAll('.hero-carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
    });
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => goToSlide(currentIndex + 1), 6000);
  }

  dotsContainer.querySelectorAll('.hero-carousel-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      stopAutoplay();
      startAutoplay();
    });
  });

  // Pause on hover/focus
  block.addEventListener('mouseenter', stopAutoplay);
  block.addEventListener('mouseleave', startAutoplay);
  block.addEventListener('focusin', stopAutoplay);
  block.addEventListener('focusout', startAutoplay);

  // Touch/swipe support
  let touchStartX = 0;

  block.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  block.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToSlide(currentIndex + 1);
      else goToSlide(currentIndex - 1);
    }
    startAutoplay();
  }, { passive: true });

  // Start autoplay
  if (totalSlides > 1) startAutoplay();
}

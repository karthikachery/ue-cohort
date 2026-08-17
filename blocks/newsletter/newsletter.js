/**
 * loads and decorates the newsletter block
 * @param {Element} block The newsletter block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Extract fields from rows (4 cells: eyebrow, heading, placeholder, buttonLabel)
  const eyebrow = rows[0]?.textContent?.trim() || '';
  const heading = rows[1]?.textContent?.trim() || '';
  const placeholder = rows[2]?.textContent?.trim() || 'Email address';
  const buttonLabel = rows[3]?.textContent?.trim() || 'Join';

  block.textContent = '';

  // Build layout wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'newsletter-layout';

  // Text content
  const textContent = document.createElement('div');
  textContent.className = 'newsletter-text';

  if (eyebrow) {
    const eyebrowEl = document.createElement('p');
    eyebrowEl.className = 'newsletter-eyebrow';
    eyebrowEl.textContent = eyebrow;
    textContent.append(eyebrowEl);
  }

  if (heading) {
    const headingEl = document.createElement('h2');
    headingEl.className = 'newsletter-heading';
    headingEl.textContent = heading;
    textContent.append(headingEl);
  }

  // Form
  const form = document.createElement('form');
  form.className = 'newsletter-form';
  form.setAttribute('aria-label', 'Newsletter signup');

  const input = document.createElement('input');
  input.type = 'email';
  input.placeholder = placeholder;
  input.setAttribute('aria-label', placeholder);
  input.required = true;

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = buttonLabel;

  form.append(input, button);
  wrapper.append(textContent, form);
  block.append(wrapper);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}

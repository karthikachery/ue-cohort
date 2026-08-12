/**
 * loads and decorates the newsletter block
 * @param {Element} block The newsletter block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const placeholder = rows[0]?.textContent?.trim() || 'Email address';
  const buttonLabel = rows[1]?.textContent?.trim() || 'Join';

  block.textContent = '';

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
  block.append(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}

import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Appends a newsletter signup form to the last column of the footer.
 * @param {Element} footer The footer element
 */
function addNewsletterForm(footer) {
  const columns = footer.querySelector('.columns');
  if (!columns) return;

  const lastCol = columns.querySelector(':scope > div > div:last-child');
  if (!lastCol) return;

  const form = document.createElement('form');
  form.className = 'footer-newsletter';
  form.setAttribute('aria-label', 'Newsletter signup');

  const input = document.createElement('input');
  input.type = 'email';
  input.placeholder = 'Email address';
  input.setAttribute('aria-label', 'Email address');
  input.required = true;

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Join';

  form.append(input, button);
  lastCol.append(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  addNewsletterForm(footer);
  block.append(footer);
}

import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const STYLE_OPTIONS = ['rounded-corners', 'link-style-black'];

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      // multiselect renders as <div><ul><li>value</li>...</ul></div>
      // single-select renders as plain text in the div
      const nestedList = div.querySelector(':scope > ul');
      const values = nestedList
        ? [...nestedList.children].map((item) => item.textContent.trim())
        : [div.textContent.trim()];

      const matchedStyles = values.filter((v) => STYLE_OPTIONS.includes(v));

      if (matchedStyles.length && matchedStyles.length === values.length) {
        li.classList.add(...matchedStyles);
        div.remove();
      }
    });

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.replaceChildren(ul);
}

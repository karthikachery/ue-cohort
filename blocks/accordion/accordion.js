/*
 * Accordion Block
 * Expects the block authored in a doc/sheet as a table:
 *
 * | Accordion    |
 * |--------------|
 * | Question 1   | Answer 1 content |
 * | Question 2   | Answer 2 content |
 *
 * Each row becomes one <dl> item with a button (dt) that toggles
 * the visibility of the answer (dd).
 */

export default function decorate(block) {
  const rows = [...block.children];

  const dl = document.createElement('dl');
  dl.className = 'accordion-list';

  rows.forEach((row, i) => {
    const [label, body] = [...row.children];

    // label / summary column
    const dt = document.createElement('dt');
    dt.className = 'accordion-item-label';

    const button = document.createElement('button');
    button.className = 'accordion-item-button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('type', 'button');
    button.id = `accordion-trigger-${i}`;

    // move the authored label content into the button
    while (label.firstChild) button.append(label.firstChild);
    dt.append(button);

    // body / answer column
    const dd = document.createElement('dd');
    dd.className = 'accordion-item-body';
    dd.setAttribute('aria-labelledby', button.id);
    dd.hidden = true;

    while (body.firstChild) dd.append(body.firstChild);

    button.setAttribute('aria-controls', `accordion-panel-${i}`);
    dd.id = `accordion-panel-${i}`;

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      dd.hidden = expanded;
    });

    dl.append(dt, dd);
  });

  block.textContent = '';
  block.append(dl);
}

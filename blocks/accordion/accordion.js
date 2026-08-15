import { moveInstrumentation } from "../../scripts/scripts.js";

export default function decorate(block) {
  const rows = [...block.children];

  const dl = document.createElement("dl");
  dl.className = "accordion-list";

  rows.forEach((row, i) => {
    const [label, body] = [...row.children];

    // wrapper that will carry the item-level (data-aue-resource) instrumentation
    const item = document.createElement("div");
    item.className = "accordion-item";

    const dt = document.createElement("dt");
    dt.className = "accordion-item-label";

    const button = document.createElement("button");
    button.className = "accordion-item-button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("type", "button");
    button.id = `accordion-trigger-${i}`;

    // move label field instrumentation from the original cell to its new home
    moveInstrumentation(label, button);
    while (label.firstChild) button.append(label.firstChild);
    dt.append(button);

    const dd = document.createElement("dd");
    dd.className = "accordion-item-body";
    dd.setAttribute("aria-labelledby", button.id);
    dd.hidden = true;

    // move body field instrumentation
    moveInstrumentation(body, dd);
    while (body.firstChild) dd.append(body.firstChild);

    button.setAttribute("aria-controls", `accordion-panel-${i}`);
    dd.id = `accordion-panel-${i}`;

    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      dd.hidden = expanded;
    });

    // move the item/row-level instrumentation onto the wrapper
    moveInstrumentation(row, item);
    item.append(dt, dd);
    dl.append(item);
  });

  block.textContent = "";
  block.append(dl);
}

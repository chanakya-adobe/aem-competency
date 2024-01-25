import { createElementWithClasses } from '../../scripts/utils.js';

/**
 * loads and decorates the image gallery component
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const elemtList = [];
  const parentElem = block.querySelector('picture').parentElement;
  let parts = '';
  block.querySelectorAll('picture').forEach((pic) => {
    elemtList.push(pic);
  });
  parts = elemtList.length / 2;
  const picCollection = Array.from(
    { length: Math.ceil(elemtList.length / parts) },
    (v, i) => elemtList.slice(i * parts, i * parts + parts),
  );
  parentElem.innerHTML = '';
  picCollection.forEach((elem) => {
    const picContainer = createElementWithClasses('div', 'pic-container');
    elem.forEach((pic) => {
      picContainer.appendChild(pic);
    });
    parentElem.appendChild(picContainer);
  });
}

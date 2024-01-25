import { loadScript } from './aem.js';

const animationValues = new Map([
  ['animation-mousescroll', '../../resources/mouse_scroll.json'],
  ['animation-3droll', '../../resources/3D_roll.json'],
]);

/**
 * Add classes to elements.
 * @param {String} tag Element tag
 * @param {Array} classes classlist
 */
export function addClassToElement(element, ...classes) {
  classes.forEach((className) => {
    if (className) {
      element.classList.add(className);
    }
  });
}

/**
 * create element with class.
 * @param {String} tag Element tag
 * @param {Array} classes classlist
 */
export function createElementWithClasses(tag, ...classes) {
  const element = document.createElement(tag);
  addClassToElement(element, ...classes);
  return element;
}

/**
 * load animation from lottie json.
 * @param {String} elementid Element Id
 * @param {String} path JSON path
 */
async function loadAnimation(elem) {
  try {
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.7.4/lottie.min.js', { async: true, defer: true });
    /* global lottie */
    lottie.loadAnimation({
      container: document.getElementById(elem),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: animationValues.get(elem),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading Lottie:', error);
  }
}

/**
 * Wraps images followed by links within a matching <a> tag.
 * @param {Element} container The container element
 */
export function wrapImgsInLinks(container) {
  const pictures = container.querySelectorAll('picture');
  pictures.forEach((pic) => {
    const link = pic.nextElementSibling;
    if (link && link.tagName === 'A' && link.href) {
      link.innerHTML = pic.outerHTML;
      pic.replaceWith(link);
    }
  });
}

export default loadAnimation;

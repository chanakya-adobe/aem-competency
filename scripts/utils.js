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

/**
 * Add a link tag around img tag if image is following by a tag
 * @param {*} container
 */
export function decorateLinkedPictures(container) {
  [...container.querySelectorAll('picture + br + a')]
    .filter((a) => {
      try {
        // ignore domain in comparison
        return new URL(a.href).pathname;
      } catch (e) {
        return false;
      }
    })
    .forEach((a) => {
      const picture = a.previousElementSibling.previousElementSibling;
      picture.remove();
      const br = a.previousElementSibling;
      br.remove();
      const txt = a.innerHTML;
      a.innerHTML = picture.outerHTML;
      a.setAttribute('aria-label', txt);
      a.setAttribute('title', txt);
    });
}

/**
 * Checks whether device is desktop or not.
 */
export function isDesktop() {
  return window.innerWidth >= 1280;
}

const TEMPLATE_COL_LEFT = '.section.template-left-column';
const TEMPLATE_COL_RIGHT = '.section.template-right-column';

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
/**
 * Generate ul list based on page tags
 *
 * @param {*} tags
 * @param {*} prefix
 */
export function getTagList(tags, prefix = '') {
  const tagContainer = document.createElement('ul');
  tagContainer.className = `${prefix}tags`;
  const tagsList = JSON.parse(tags);
  tagsList.forEach((tag) => {
    const tagItem = document.createElement('li');
    tagItem.innerHTML = tag;
    tagContainer.append(tagItem);
  });

  return tagContainer;
}

/**
 * Decorate page with two columns
 *
 * @param {} main
 */
export function decorateTwoColTemplate(main) {
  const leftContainer = document.createElement('div');
  leftContainer.className = 'template-left-container';
  [...main.querySelectorAll(TEMPLATE_COL_LEFT)]
    .forEach((section) => {
      leftContainer.append(section);
    });

  const rightContainer = document.createElement('div');
  rightContainer.className = 'template-right-container';
  [...main.querySelectorAll(TEMPLATE_COL_RIGHT)]
    .forEach((section) => {
      rightContainer.append(section);
    });

  const templateContainer = document.createElement('div');
  templateContainer.className = 'template-two-col-container';
  templateContainer.append(leftContainer);
  templateContainer.append(rightContainer);

  main.append(templateContainer);
}

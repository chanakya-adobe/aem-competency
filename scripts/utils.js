import { toCamelCase } from './aem.js';

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
 * Generate ul list based on page tags (random list)
 *
 * @param {*} tags
 * @param {*} prefix
 */
export function getTagList(tags, prefix = '') {
  const tagContainer = document.createElement('ul');
  tagContainer.className = `${prefix}tags`;
  const tagsList = JSON.parse(tags);
  const randomList = tagsList.sort(() => 0.5 - Math.random());
  const remain = tagsList.length - 3;
  let i = 0;
  let exitLoop = false;
  randomList.forEach((tag) => {
    const tagItem = document.createElement('li');
    if (exitLoop) {
      return true;
    }
    if (i < 3) {
      tagItem.innerHTML = tag;
      tagContainer.append(tagItem);
    }
    if (i === 3 && remain > 0) {
      tagItem.className = 'tag-count';
      tagItem.innerHTML = '+'.concat(remain);
      tagContainer.append(tagItem);
      exitLoop = true;
    }
    i += 1;
    return false;
  });
  return tagContainer;
}

/**
 * Generate author image url by author name.
 *
 * @param {*} author
 * @param {*} placeholder
 * @returns
 */
export function getAuthorImage(author, placeholder) {
  const authorIdentifier = toCamelCase(`user-${author}`);

  return placeholder[authorIdentifier];
}

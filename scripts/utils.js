import { toCamelCase, toClassName } from './aem.js';
import { CATEGORY_BIGBETS, CATEGORY_FORUM, CATEGORY_MENTORING } from './scripts.js';

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
export function getTagList(tags, prefix = '', showTagCount = false) {
  const tagContainer = document.createElement('ul');
  tagContainer.className = `${prefix}tags`;
  const tagsList = JSON.parse(tags);
  const remain = tagsList.length - 3;
  let i = 0;
  let exitLoop = false;
  tagsList.forEach((tag) => {
    const tagItem = document.createElement('li');
    if (exitLoop) {
      return true;
    }
    if (!showTagCount || i < 3) {
      tagItem.innerHTML = tag;
      tagContainer.append(tagItem);
    }
    if (showTagCount && i === 3 && remain > 0) {
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

/**
 * Check if category is valid supported category
 *
 * @param {*} category
 * @returns true/false
 */
export function isValidCategory(category) {
  const categories = [CATEGORY_BIGBETS, CATEGORY_FORUM, CATEGORY_MENTORING];

  return category && categories.includes(category) > 0;
}

/**
 * Extracts the config from a block.
 * @param {Element} block The block element
 * @returns {object} The block config
 */
// eslint-disable-next-line import/prefer-default-export
export function readBlockConfigHTML(block) {
  const config = {};
  block.querySelectorAll(':scope > div').forEach((row) => {
    if (row.children) {
      const cols = [...row.children];
      if (cols[1]) {
        const col = cols[1];
        const name = toClassName(cols[0].textContent);
        let value = '';
        if (col.querySelector('img') && !col.querySelector('.icon')) {
          const imgs = [...col.querySelectorAll('img')];
          if (imgs.length === 1) {
            value = imgs[0].src;
          } else {
            value = imgs.map((img) => img.src);
          }
        } else value = row.children[1].innerHTML;
        config[name] = value;
      }
    }
  });
  return config;
}

import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  getMetadata,
  toClassName,
  buildBlock,
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list
const TEMPLATE_LIST = {
  bigbet: 'big-bet',
};

export const PLACEHOLDER_REGEX = /({{.*}})/;

export const CATEGORY_BIGBETS = 'Big Bets';
export const CATEGORY_FORUM = 'Forum';
export const CATEGORY_MENTORING = 'Mentoring';

const SECTION_BG_MOBILE = 'bg-mobile';
const SECTION_BG_DESKTOP = 'bg-desktop';
const THEME_COL_LEFT = '.section.left-column';
const THEME_COL_RIGHT = '.section.right-column';

const isMobile = window.matchMedia('(max-width: 767px)').matches;

/**
 * Add a wrapper to icons parent element.
 * @param {Element} [element] Element containing icons
 * @param {string} [prefix] prefix to be added to icon the src
 */
function decorateIconsWrapper(element) {
  const icons = [...element.querySelectorAll('span.icon')];
  icons.forEach((span) => {
    span.parentElement.classList.add('icon-container');
  });
}

export function createPicture(props) {
  const desktopImgUrl = props[SECTION_BG_DESKTOP];
  const mobileImgUrl = props[SECTION_BG_MOBILE];
  const picture = document.createElement('picture');
  if (desktopImgUrl) {
    const sourceDesktop = document.createElement('source');
    const { pathname } = new URL(desktopImgUrl, window.location.href);
    sourceDesktop.type = 'image/webp';
    sourceDesktop.srcset = `${pathname}?width=1920&format=webply&optimize=medium`;
    sourceDesktop.media = '(min-width: 1280px)';
    picture.appendChild(sourceDesktop);
  }

  if (mobileImgUrl) {
    const sourceMobile = document.createElement('source');
    const { pathname } = new URL(mobileImgUrl, window.location.href);
    sourceMobile.type = 'image/webp';
    sourceMobile.srcset = `${pathname}?width=600&format=webply&optimize=medium`;
    picture.appendChild(sourceMobile);
  }

  const img = document.createElement('img');
  const { pathname } = new URL(mobileImgUrl, window.location.href);
  img.src = `${pathname}?width=600&format=webply&optimize=medium`;
  img.alt = props.alt || '';
  img.className = 'banner-img';
  img.loading = props.loading || 'lazy';
  img.width = isMobile ? '560' : '800';
  img.height = isMobile ? '598' : '920';

  if (mobileImgUrl && desktopImgUrl) {
    picture.appendChild(img);
  } else {
    return img;
  }
  return picture;
}

/**
 * Builds Full width Banner in a container element.
 * @param {Element} main The container element
 */
function buildSectionBanners(main) {
  const elements = main.querySelectorAll('.full-width-banner');
  if (elements && elements?.length) {
    elements.forEach((elem, index) => {
      const pictureProps = {
        alt: '',
        loading: (index === 0) ? 'eager' : 'lazy',
        'bg-mobile': elem.dataset.mobileImage || elem.dataset.desktopImage,
        'bg-desktop': elem.dataset.desktopImage,
      };
      const picture = createPicture(pictureProps);
      elem.append(picture);
    });
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function buildHeadings(main) {
  [...main.querySelectorAll('p + h2')]
    .forEach((element) => {
      const container = element.parentElement;

      const headingContainer = document.createElement('div');
      headingContainer.className = 'heading';
      headingContainer.append(element.previousElementSibling);
      headingContainer.append(element);

      container.prepend(headingContainer);
    });
}

function buildBreadcrumb(main) {
  const noBreadcrumb = getMetadata('nobreadcrumb');
  const alreadyBreadcrumb = main.querySelector('.breadcrumb');

  if (!alreadyBreadcrumb && (!noBreadcrumb || noBreadcrumb === 'false')) {
    const breadcrumbBlock = document.createElement('div');
    const blockEl = buildBlock('breadcrumb', { elems: [] });
    breadcrumbBlock.append(blockEl);
    main.prepend(breadcrumbBlock);
  }
}

function renderMessage() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const splitAfternoon = 12; // 24hr time to split the afternoon
  const splitEvening = 17; // 24hr time to split the evening
  let message = 'Good Morning';
  if (currentHour >= splitAfternoon && currentHour <= splitEvening) {
    // Between 12 PM and 5PM
    message = 'Good Afternoon';
  }
  if (currentHour >= splitEvening) {
    // Between 5PM and Midnight
    message = 'Good Evening';
  }
  // Between dawn and noon
  return message;
}

function setGreetingMessage(main) {
  const greetingsHeading = main.querySelector('h1');
  if (greetingsHeading) {
    const greetingText = greetingsHeading.textContent;
    const updatedGreeting = greetingText.replace(PLACEHOLDER_REGEX, renderMessage());
    greetingsHeading.textContent = updatedGreeting;
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildBreadcrumb(main);
    setGreetingMessage(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorate page with two columns
 *
 * @param {} main
 */
function decorateTwoColTemplate(main) {
  let status = false;
  const leftContainer = document.createElement('div');
  leftContainer.className = 'theme-left-container';
  [...main.querySelectorAll(THEME_COL_LEFT)]
    .forEach((section) => {
      status = true;
      leftContainer.append(section);
    });

  const rightContainer = document.createElement('div');
  rightContainer.className = 'theme-right-container';
  [...main.querySelectorAll(THEME_COL_RIGHT)]
    .forEach((section) => {
      status = true;
      rightContainer.append(section);
    });

  if (status) {
    const templateContainer = document.createElement('div');
    templateContainer.className = 'theme-two-col-container';
    templateContainer.append(leftContainer);
    templateContainer.append(rightContainer);

    main.append(templateContainer);
  }
}

/**
 * Setup different themes
 * @param {*} main
 */
async function buildTheme(main) {
  if (document.body.classList.contains('two-column-page')) {
    decorateTwoColTemplate(main);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main, loadAutoBlock = true) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  decorateIconsWrapper(main);
  if (loadAutoBlock) {
    buildAutoBlocks(main);
  }
  decorateSections(main);
  buildTheme(main);
  decorateBlocks(main);
  buildSectionBanners(main);
  buildHeadings(main);
}

/**
 * Include template specific css/js
 *
 * @param {*} main
 */
async function decorateTemplates(main) {
  try {
    const template = toClassName(getMetadata('template'));
    const templates = Object.keys(TEMPLATE_LIST);
    if (templates.includes(template)) {
      const templateName = TEMPLATE_LIST[template];
      loadCSS(`${window.hlx.codeBasePath}/templates/${templateName}/${templateName}.css`);
      const mod = await import(`../templates/${templateName}/${templateName}.js`);
      if (mod.default) {
        await mod.default(main);
      }
      document.body.classList.add(templateName);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Updates all section status in a container element.
 * @param {Element} main The container element
 */
async function updateSectionsStatus(main) {
  const sections = [...main.querySelectorAll('div.section')];
  for (let i = 0; i < sections.length; i += 1) {
    const section = sections[i];
    const status = section.dataset.sectionStatus;
    if (status !== 'loaded') {
      const loadingBlock = section.querySelector(
        '.block[data-block-status="initialized"], .block[data-block-status="loading"]',
      );
      if (loadingBlock) {
        section.dataset.sectionStatus = 'loading';
        break;
      } else {
        section.dataset.sectionStatus = 'loaded';
        section.style.display = null;
      }
    }
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Adds background color to header based on the presence of hero banner
 * @param {Element} header The header element
 * @param {Element} main The main element
 */
function decorateHeaderBackground(header, main) {
  const hasHeroBanner = main.querySelector('.hero-banner') != null;
  if (!hasHeroBanner) {
    header.classList.add('has-bg-color');
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  const header = doc.querySelector('header');
  decorateHeaderBackground(header, main);
  await loadBlocks(main);
  await updateSectionsStatus(main);
  await decorateTemplates(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(header);
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

/**
 * Helper function to create DOM elements
 * @param {string} tag DOM element to be created
 * @param {Object} attributes attributes to be added
 * @param {HTMLElement|SVGElement|string} html HTML or SVG to append to/after new element
 */
export function createTag(tag, attributes, html = undefined) {
  const el = document.createElement(tag);
  if (html) {
    if (html instanceof HTMLElement || html instanceof SVGElement) {
      el.append(html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  return el;
}

/**
 * Fetch filtered search results
 * @param {*} cat The category filter
 *   CATEGORY_BIGBETS, CATEGORY_FORUM, CATEGORY_MENTORING
 * @returns List of search results
 */
export async function fetchSearch(category = '') {
  window.searchData = window.searchData || {};
  if (Object.keys(window.searchData).length === 0) {
    const path = '/query-index.json?limit=500&offset=0';

    const resp = await fetch(path);
    window.searchData = JSON.parse(await resp.text()).data;
  }

  if (category !== '') {
    return window.searchData.filter((el) => el.category === category);
  }

  return window.searchData;
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

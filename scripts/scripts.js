import {
  sampleRUM,
  // buildBlock,
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
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

export const BASE_URL = window.location.origin !== 'null' ? window.location.origin : window.parent.location.origin;

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

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  // To do
}

/**
 * Decorates all synthetic blocks in a container element with reveal animations.
 * @param {Element} main The container element
 */
function decorateAnimation(main) {
  // Function to handle the intersection changes
  function handleIntersection(entries, observer) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
      }
    });
  }

  // Create an Intersection Observer
  const observer = new IntersectionObserver(handleIntersection);

  // Target the elements to observe
  const sections = main.querySelectorAll('main > .section');

  // Start observing each target element
  sections.forEach((section, key) => {
    if (key === 0) {
      return;
    }
    // Set transform to none to avoid the issues with position fixed child elements
    section.addEventListener('transitionend', () => {
      section.style.transform = 'none';
    });

    observer.observe(section);
  });
}

/*
 * Picture Block
 * Show image and gifs directly on your page
 */

export function createPictureTag(content) {
  const {
    desktop,
    mobile,
    alt,
    minWidth,
  } = content;

  let picture;
  // If desktop and mobile images are configured, create images sources accordingly
  if (mobile && desktop) {
    picture = document.createElement('picture');
    const sourceDesktop = document.createElement('source');
    sourceDesktop.media = `(min-width: ${minWidth}px)`;
    sourceDesktop.srcset = desktop.replaceAll('format=png', 'format=webply');
    sourceDesktop.type = 'image/webp';
    picture.appendChild(sourceDesktop);

    const sourceDesktop2 = document.createElement('source');
    sourceDesktop2.media = `(min-width: ${minWidth}px)`;
    sourceDesktop2.srcset = desktop;
    sourceDesktop2.type = 'image/png';
    picture.appendChild(sourceDesktop2);

    if (mobile) {
      const sourceMobile = document.createElement('source');
      sourceMobile.type = 'image/webp';
      sourceMobile.srcset = mobile.replaceAll('format=png', 'format=webply');
      picture.appendChild(sourceMobile);
    }
  }

  // create image tag
  const img = document.createElement('img');
  img.src = desktop || mobile;
  img.alt = '';
  img.width = '1024';
  img.height = '750';
  img.alt = alt;
  img.loading = 'lazy';

  // if only one image is configured, return it
  // else append img and return picture tag
  if (mobile && desktop) {
    picture.appendChild(img);
  } else {
    return img;
  }

  return picture;
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateAnimation(main);
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
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
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

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

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
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

const SECTION_BG_MOBILE = 'bg-mobile';
const SECTION_BG_DESKTOP = 'bg-desktop';

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
  // img.width = isMobile ? '360' : '600';
  // img.height = isMobile ? '298' : '620';

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
        'bg-mobile': elem.dataset.mobileImage,
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

function buildBreadcrumbs(doc, breadcrumbs) {
  const main = doc.querySelector('main');
  const $div = doc.createElement('div');
  $div.classList.add('breadcrumb-wrapper');
  if (main) {
   while (breadcrumbs.length) {
    const step = breadcrumbs.shift();
    const $ul = doc.createElement('ul');
    const $li = doc.createElement('li');
    $ul.append($li);
    let $wrap = $li;
    if (step.link) {
      $wrap = doc.createElement('a');
      $wrap.href = step.link;
      $li.append($wrap);
    }
    const $span = doc.createElement('span');
    $wrap.append($span);
    $span.textContent = step.text;
    $div.append($ul);
  }
  main.insertBefore($div, main.firstChild);
  }
}

function createBreadcrumb(doc) {
  const path = window.location.pathname;
  const breadCrumbArr = path.split('/');
  const breadcrumbs = [{
    text: 'Home',
    link: window.location.origin,
  }];

  const toTitleCase = (phrase) => {
    return phrase
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

   breadCrumbArr.forEach((item, index) => {
     const linkPath = breadCrumbArr.slice( 0, index + 1 ).join('/');
     if (item != '' && index != breadCrumbArr.length - 1) {
         breadcrumbs.push({
            text : toTitleCase(item.replace(/-/g, ' ')),
            link : (window.location.origin).concat(linkPath)
         });
       } else if (item != '' && index == breadCrumbArr.length - 1) {
          breadcrumbs.push({
            text : getMetadata('og:title'),
            link : (window.location.origin).concat(linkPath)
          });
       }
   })
   buildBreadcrumbs(doc, breadcrumbs)
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 function buildAutoBlocks(main) {
  try {
    // TBD
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}
*/

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  // buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);

  buildSectionBanners(main);
  buildHeadings(main);
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
function loadDelayed(doc) {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
  createBreadcrumb(doc);
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed(document);
}

loadPage();

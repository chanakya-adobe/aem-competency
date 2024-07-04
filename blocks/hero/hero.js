import { getMetadata, fetchPlaceholders } from '../../scripts/aem.js';
import { createPicture } from '../../scripts/scripts.js';
import { readBlockConfigHTML, getAuthorImage } from '../../scripts/utils.js';

const metaVisibilityHTML = (visibility) => `<div class="icon-container"><span class="icon icon-globe"><img data-icon-name="globe" src="/icons/globe-black.svg" alt="" loading="lazy"></span>${visibility}</div>`;
const metaStatusHTML = (status) => `<div class="status">Status: <strong>${status}</strong></div>`;
const metaAuthorImgHTML = (author, authorImg) => `<div class="owner">Owner: <img src="${authorImg}" alt="${author}" width="24" height="24"> <strong>${author}</strong></div>`;
const metaAuthorHTML = (author) => `<div class="owner">Owner:&nbsp;<strong>${author}</strong></div>`;

async function renderBigBetDataMetadata() {
  const placeholder = await fetchPlaceholders();
  const visibility = getMetadata('visibility');
  const status = getMetadata('status');
  const author = getMetadata('author');
  const authorImg = getAuthorImage(author, placeholder);

  const metaContainer = document.createElement('div');
  metaContainer.className = 'big-bet-meta';
  metaContainer.insertAdjacentHTML('beforeend', metaVisibilityHTML(visibility));
  if (authorImg) {
    metaContainer.insertAdjacentHTML('beforeend', metaAuthorImgHTML(author, authorImg));
  } else {
    metaContainer.insertAdjacentHTML('beforeend', metaAuthorHTML(author, authorImg));
  }
  metaContainer.insertAdjacentHTML('beforeend', metaStatusHTML(status));

  return metaContainer;
}

/** Generate tag list from current page */
function generateTagListCurrentPage() {
  const tags = getMetadata('article:tag');
  if (tags && tags.length) {
    const tagList = tags.split(',');

    const tagListContainer = document.createElement('ul');
    tagListContainer.classList.add('tags');

    tagList.forEach((tag) => {
      const tagItem = document.createElement('li');
      tagItem.innerHTML = tag;
      tagListContainer.append(tagItem);
    });

    return tagListContainer;
  }
  return '';
}

async function renderHeroBlock(block, config) {
  const picture = createPicture(config.imgProperty);
  block.append(picture);

  const container = document.createElement('div');
  container.className = 'hero-content';
  container.innerHTML = config.content;

  if (config.showBigbetMeta) {
    container.append(await renderBigBetDataMetadata());
  }

  if (config.showTags) {
    container.append(generateTagListCurrentPage());
  }

  if (config.links) {
    const linksContainer = document.createElement('div');
    linksContainer.className = 'links-container';
    linksContainer.innerHTML = config.links;
    container.append(linksContainer);
  }
  block.append(container);
}

function getConfig(block) {
  const config = {};
  const blockConfig = readBlockConfigHTML(block);

  config.content = blockConfig.content || getMetadata('og:title');
  config.desktopImg = blockConfig['desktop-image'];
  config.mobileImg = blockConfig['mobile-image'] || config.desktopImg;
  config.links = blockConfig.links;
  config.showBigbetMeta = block.classList.contains('bigbets');
  config.showTags = block.classList.contains('tags');

  config.imgProperty = {
    alt: getMetadata('og:title'),
    loading: 'eager',
    'bg-mobile': config.mobileImg,
    'bg-desktop': config.desktopImg,
    media: '(min-width: 768px)',
  };

  block.textContent = '';
  return config;
}

export default async function decorate(block) {
  const config = getConfig(block);

  renderHeroBlock(block, config);
}

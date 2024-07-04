import {
  fetchPlaceholders, createOptimizedPicture, readBlockConfig,
} from '../../scripts/aem.js';
import { fetchSearch, CATEGORY_BIGBETS } from '../../scripts/scripts.js';
import { getTagList, getAuthorImage } from '../../scripts/utils.js';

const VIEW_TEASER = 'teaser-view';
const VIEW_FULL = 'list-view';
const getListHTML = (row) => `<div class="bb-content"><h3>${row.title}</h3><p class="bb-description">${row.description}</p></div>`;
const getButtonHTML = (row, joinLabel) => `<button class="button-container button primary">${joinLabel}</button>`;
const metaVisibilityHTML = (row) => `<div class="icon-container"><span class="icon icon-globe-white"><img data-icon-name="globe-white" src="/icons/globe-white.svg" alt="" loading="lazy" width="14" height="14"></span><span class="icon icon-globe"><img data-icon-name="globe" src="/icons/globe.svg" alt="" loading="lazy" width="14" height="14"></span> ${row.visibility}</div>`;
const metaStatusHTML = (row) => `<div class="status">Status:&nbsp;${row.status}</div>`;
const metaAuthorImgHTML = (row, authorImg) => `<div class="owner">Owner: <img src="${authorImg}" title="${row.author}" width="24" height="24" /> ${row.author}</div>`;
const metaAuthorHTML = (row) => `<div class="owner">Owner:&nbsp; ${row.author}</div>`;
const viewAllLinkHTML = (config) => `<a href="${config.viewAllLink}" title="${config.viewAllLabel}" class="button secondary">${config.viewAllLabel}</a>`;
const viewLoadMoreLinkHTML = (config) => `<button class="button secondary">${config.viewAllLabel}</button>`;

function createCardImage(src, alt, config) {
  const cardImg = document.createElement('div');
  cardImg.className = 'bb-image';
  let imgSrc = src;
  if (window.location.origin === 'null') {
    imgSrc = window.parent.location.origin + src;
  }
  let eagerImg = false;
  if (config.type === VIEW_FULL) {
    eagerImg = true;
  }

  cardImg.append(createOptimizedPicture(imgSrc, alt, eagerImg, [{ width: '500' }]));
  cardImg.querySelector('img').width = 500;
  cardImg.querySelector('img').height = 300;

  return cardImg;
}

function buildBlock(slicedResults, containerDiv, placeholder, config) {
  slicedResults.every((row) => {
    const cardDiv = document.createElement('div');
    // cardDiv.classList.add('bb-card ${config.type}');
    cardDiv.className = `bb-card ${config.type}`;

    const cardLink = document.createElement('a');
    cardLink.className = 'bb-card-link';
    cardLink.href = row.path;
    cardLink.title = row.title;

    cardLink.append(createCardImage(row.image, row.title, config));
    cardLink.insertAdjacentHTML('beforeend', getListHTML(row));

    const metaContainer = document.createElement('div');
    const authorImg = getAuthorImage(row.author, placeholder);

    metaContainer.className = 'big-bet-meta';
    metaContainer.insertAdjacentHTML('beforeend', metaVisibilityHTML(row));

    if (authorImg) {
      metaContainer.insertAdjacentHTML('beforeend', metaAuthorImgHTML(row, authorImg));
    } else {
      metaContainer.insertAdjacentHTML('beforeend', metaAuthorHTML(row, authorImg));
    }

    metaContainer.insertAdjacentHTML('beforeend', metaStatusHTML(row));
    cardLink.querySelector('.bb-content').insertAdjacentElement('beforeend', metaContainer);

    if (row.tags) {
      cardLink.querySelector('.bb-content').append(getTagList(row.tags, '', true));
    }
    cardLink.querySelector('.bb-content').insertAdjacentHTML('beforeend', getButtonHTML(row, config.cardCTALabel));
    cardDiv.append(cardLink);
    containerDiv.append(cardDiv);
    return true;
  });
}

/**
 * The below function is leveraged for View More button functionality
 * eslint-disable-next-line
 */
async function loadMoreResults(
  block,
  containerDiv,
  results,
  placeholder,
  config,
  loadMoreContainer,
  chunk,
) {
  const currentResults = document.querySelectorAll('.bb-card').length;
  const slicedResults = results.slice(currentResults, currentResults + chunk);
  buildBlock(slicedResults, containerDiv, placeholder, config);
  if ((results.length - currentResults) > chunk) {
    block.append(loadMoreContainer);
  } else loadMoreContainer.remove();
}

/**
 * Method for paginataed/non-paginated view
 */
async function loadResults(block, containerDiv, results, placeholder, config) {
  let slicedResults = 0;
  let loadMoreContainer = 0;
  let currentResults = 0;
  const chunk = config.count;

  if (config.type === VIEW_FULL) {
    if (results.length > chunk) {
      currentResults = document.querySelectorAll('.bb-card').length;
      slicedResults = results.slice(currentResults, currentResults + chunk);

      loadMoreContainer = document.createElement('div');
      loadMoreContainer.className = `view-all ${config.type}`;
      loadMoreContainer.innerHTML = viewLoadMoreLinkHTML(config);

      loadMoreContainer.addEventListener('click', () => {
        loadMoreResults(
          block,
          containerDiv,
          results,
          placeholder,
          config,
          loadMoreContainer,
          chunk,
        );
      });
    } else {
      slicedResults = results.slice(currentResults, currentResults + chunk);
    }
    buildBlock(slicedResults, containerDiv, placeholder, config);
    block.append(containerDiv);
    if ((results.length - currentResults) > chunk) {
      block.append(loadMoreContainer);
    } else loadMoreContainer.remove();
  } else {
    const randomList = results.sort(() => 0.5 - Math.random());
    slicedResults = randomList.slice(currentResults, currentResults + chunk);
    buildBlock(slicedResults, containerDiv, placeholder, config);
    block.append(containerDiv);

    loadMoreContainer = document.createElement('div');
    loadMoreContainer.className = `view-all ${config.type}`;
    loadMoreContainer.innerHTML = viewAllLinkHTML(config);
    block.append(loadMoreContainer);
  }
}

function getConfig(block, placeholder) {
  const config = {};
  const blockConfig = readBlockConfig(block);

  config.type = blockConfig.type || VIEW_TEASER;
  config.cardCTALabel = placeholder.bigbetCtaLabel || 'Join me';
  config.viewAllLabel = blockConfig.viewalllabel || placeholder.bigbetViewall || 'View all';
  config.viewAllLink = blockConfig.viewalllink || '/';
  config.count = 3;
  if (config.type === VIEW_FULL) {
    config.viewAllLink = '#';
    config.count = blockConfig.count || 4;
  }
  return config;
}

export default async function decorate(block) {
  const placeholder = await fetchPlaceholders();
  const config = getConfig(block, placeholder);

  block.textContent = '';
  const results = await fetchSearch(CATEGORY_BIGBETS);

  const containerDiv = document.createElement('div');
  containerDiv.className = `bb-container ${config.type}`;
  await loadResults(block, containerDiv, results, placeholder, config);
}

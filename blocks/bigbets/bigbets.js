import {
  fetchPlaceholders, toCamelCase, createOptimizedPicture, readBlockConfig,
} from '../../scripts/aem.js';
import { fetchSearch, CATEGORY_BIGBETS } from '../../scripts/scripts.js';
import { getTagList } from '../../scripts/utils.js';

const getListHTML = (row) => `
<div class="bb-content">
  <h3>${row.title}</h3>
  <p class="bb-description">${row.description}</p>
  </div>`;

const getButtonHTML = (row, joinLabel) => `<p class='button-container'><a href="${row.path}" class="button primary" title="${row.title}">${joinLabel}</a><p>`;
const metaVisibilityHTML = (row) => `<div class="icon-container"><span class="icon icon-globe"><img data-icon-name="globe" src="/icons/globe.svg" alt="" loading="lazy"></span> ${row.visibility}</div>`;
const metaStatusHTML = (row) => `<div class="status">Status:&nbsp;<strong> ${row.status}</strong></div>`;
const metaAuthorImgHTML = (row, authorImg) => `<div class="owner">Owner: <img src="${authorImg}" title="${row.author}" width="24" height="24" /> <strong>${row.author}</strong></div>`;
const metaAuthorHTML = (row) => `<div class="owner">Owner:&nbsp;<strong> ${row.author}</strong></div>`;
const viewAllLinkHTML = (config) => `<a href="${config.viewAllLink}" title="${config.viewAllLabel}" class="button secondary">${config.viewAllLabel}</a>`;

function getAuthorImage(author, placeholder) {
  const authorIdentifier = toCamelCase(`user-${author}`);

  return placeholder[authorIdentifier];
}

function createCardImage(src, alt) {
  const cardImg = document.createElement('div');
  cardImg.className = 'bb-image';
  cardImg.append(createOptimizedPicture(src, alt));
  cardImg.querySelector('img').width = 600;
  cardImg.querySelector('img').height = 300;

  return cardImg;
}

async function printList(list, placeholder, config) {
  let printCount = 0;
  const containerDiv = document.createElement('div');
  containerDiv.classList.add('bb-container');

  const randomList = list.sort(() => 0.5 - Math.random());

  randomList.every((row) => {
    if (printCount > 2) {
      return false;
    }
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('bb-card');
    cardDiv.append(createCardImage(row.image, row.title));
    cardDiv.insertAdjacentHTML('beforeend', getListHTML(row));

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
    cardDiv.querySelector('.bb-content').insertAdjacentElement('beforeend', metaContainer);

    if (row.tags) {
      cardDiv.querySelector('.bb-content').append(getTagList(row.tags, 'bb'));
    }

    cardDiv.querySelector('.bb-content').insertAdjacentHTML('beforeend', getButtonHTML(row, config.cardCTALabel));
    containerDiv.append(cardDiv);
    printCount += 1;

    return true;
  });

  return containerDiv;
}

function getConfig(block, placeholder) {
  const config = {};
  const blockConfig = readBlockConfig(block);

  config.type = blockConfig.type || 'teaser-view';
  config.cardCTALabel = placeholder.bigbetCtaLabel || 'Join me';
  config.viewAllLabel = blockConfig.viewalllabel || placeholder.bigbetViewall || 'View all 1';
  config.viewAllLink = blockConfig.viewalllink || '/';
  if (config.type === 'full-view') {
    config.viewAllLink = '#';
  }
  return config;
}

export default async function decorate(block) {
  const placeholder = await fetchPlaceholders();
  const config = getConfig(block, placeholder);

  block.textContent = '';
  const list = await fetchSearch(CATEGORY_BIGBETS);

  const objects = await printList(list, placeholder, config);
  block.append(objects);

  const viewAllContainer = document.createElement('div');
  viewAllContainer.className = `view-all ${config.type}`;
  viewAllContainer.innerHTML = viewAllLinkHTML(config);

  block.append(viewAllContainer);
}

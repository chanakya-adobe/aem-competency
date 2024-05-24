import { decorateTwoColTemplate } from '../../scripts/utils.js';
import { getMetadata, fetchPlaceholders, toCamelCase } from '../../scripts/aem.js';

const metaVisibilityHTML = (visibility) => `<div class="icon-container"><span class="icon icon-globe"><img data-icon-name="globe" src="/icons/globe.svg" alt="" loading="lazy"></span>${visibility}</div>`;
const metaStatusHTML = (status) => `<div class="status">Status: <strong>${status}</strong></div>`;
const metaAuthorImgHTML = (author, authorImg) => `<div class="owner">Owner: <img src="${authorImg}" alt="${author}" width="24" height="24"> <strong>${author}</strong></div>`;
const metaAuthorHTML = (author) => `<div class="owner">Owner:&nbsp;<strong>${author}</strong></div>`;

function getAuthorImage(author, placeholder) {
  const authorIdentifier = toCamelCase(`user-${author}`);

  return placeholder[authorIdentifier];
}

function autoBlockBigBetData(main, placeholder) {
  const mainHeading = main.querySelector('h1');
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

  mainHeading.insertAdjacentElement('afterend', metaContainer);
}

export default async function decorate(main) {
  const placeholder = await fetchPlaceholders();
  decorateTwoColTemplate(main);

  autoBlockBigBetData(main, placeholder);
}

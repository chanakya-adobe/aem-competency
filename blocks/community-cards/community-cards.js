import {
  fetchSearch, CATEGORY_BIGBETS, CATEGORY_FORUM, CATEGORY_MENTORING,
} from '../../scripts/scripts.js';
import { getTagList } from '../../scripts/utils.js';
import { fetchPlaceholders, toCamelCase } from '../../scripts/aem.js';

async function getCommunityCards(communityList, itemsPath) {
  const arr = [];
  itemsPath.forEach((item) => {
    // filter if the itemsPath has valid category path
    const cardItem = communityList.filter((listItem) => listItem.path === item)
      .map((listItem) => listItem);
    if (cardItem[0]) {
      arr.push(cardItem[0]);
    }
  });

  // not more than 3 cards are allowed
  return arr.length >= 3 ? arr.splice(0, 3) : arr.splice(0, arr.length);
}

const metaAuthorImgHTML = (card, authorImg) => `<div class="owner card-meta-items">Owner: <img src="${authorImg}" title="${card.author}" width="24px" height="24px" /> <strong>${card.author}</strong><span class="meta-separator">|</span></div>`;
const metaAuthorHTML = (card) => `<div class="owner card-meta-items">Owner:&nbsp;<strong> ${card.author}</strong><span class="meta-separator">|</span></div>`;

const getAuthorImage = (card, placeholder) => {
  const authorImage = placeholder[toCamelCase(`user-${card.author}`)];
  if (authorImage) {
    return metaAuthorImgHTML(card, authorImage);
  }
  return metaAuthorHTML(card, authorImage);
};

const generateBigBetsCard = (card, placeholder) => {
  const bigBetsContainer = document.createElement('div');
  bigBetsContainer.classList.add('card');
  bigBetsContainer.classList.add('big-bets-content');
  const authorImage = getAuthorImage(card, placeholder);
  const bigBetContent = `
      <div class="card-header">
      <h3>${card.title}</h3>
      <div class="card-category">${card.category}</div>
      </div>
      <p class="card-description">${card.description}</p>
      <div class="card-meta">
      <div class="card-meta-first-section">
        <div class="visibility card-meta-items icon-container"><span class="icon icon-globe"><img data-icon-name="globe" src="/icons/globe.svg" alt="" loading="lazy"></span>${card.visibility}
          <span class="meta-separator">|</span>
        </div>
        ${authorImage}
      </div>  
        <div class="status">Status: <strong>${card.status}</strong></div>
      </div>`;
  bigBetsContainer.innerHTML = bigBetContent;
  bigBetsContainer.append(getTagList(card.tags));
  const ctaButtonHtml = `<a href="${card.path}" class="button primary" title="${card.title}">Learn More</a>`;
  const ctaButtonEl = document.createElement('div');
  ctaButtonEl.className = 'button-container';
  ctaButtonEl.innerHTML = ctaButtonHtml;
  bigBetsContainer.append(ctaButtonEl);
  return bigBetsContainer;
};

const generateForumCard = (card) => {
  // TODO: update the logic for rendering forum card
  generateBigBetsCard(card);
};

const generateMentoringCard = (card) => {
  // TODO: update the logic for rendering forum card
  generateBigBetsCard(card);
};

const getCardListHtml = (cards, cardContainer, placeholder) => {
  while (cards.length > 0) {
    const card = cards.splice(0, 1)[0];
    switch (card.category) {
      case CATEGORY_BIGBETS: cardContainer.append(generateBigBetsCard(card, placeholder)); break;
      case CATEGORY_FORUM: cardContainer.append(generateForumCard(card, placeholder)); break;
      case CATEGORY_MENTORING: cardContainer.append(generateMentoringCard(card, placeholder));
        break;
      default:
    }
  }
};

const getCommunityCardItemsPath = (block) => {
  const cardItemsPath = [];
  block.querySelectorAll(':scope > div').forEach((row) => {
    // checking if row is having child div
    if (row.children) {
      const cols = [...row.children];
      if (cols && cols.length > 0) {
        const col = cols[0];
        const itemPath = col.querySelector('p')?.textContent;
        if (itemPath) {
          cardItemsPath.push(itemPath);
        }
      }
    }
  });
  return cardItemsPath;
};

export default async function decorate(block) {
  const itemsPath = getCommunityCardItemsPath(block);
  block.textContent = '';
  const communityList = await fetchSearch();
  const cards = await getCommunityCards(communityList, itemsPath);
  const cardContainer = document.createElement('div');
  cardContainer.className = 'cc-container';
  const placeholder = await fetchPlaceholders();
  getCardListHtml(cards, cardContainer, placeholder);

  block.append(cardContainer);
}

import {
  fetchSearch, CATEGORY_BIGBETS, CATEGORY_FORUM, CATEGORY_MENTORING,
} from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/aem.js';
import { getTagList } from '../../scripts/utils.js';

async function getCommunityCards(communityList, block) {
  const blockConfig = readBlockConfig(block);
  const sortedCardItems = Object.keys(blockConfig).sort().map((key) => blockConfig[key]);
  const arr = Array.from(Array(sortedCardItems.length));
  communityList.filter((item) => sortedCardItems.includes(item.path)).forEach((item) => {
    const position = sortedCardItems.indexOf(item.path);
    arr[position] = item;
  });
  return arr;
}

const generateBigBetsCard = (card) => {
  const bigBetsContainer = document.createElement('div');
  bigBetsContainer.classList.add('card');
  bigBetsContainer.classList.add('big-bets-content');
  const bigBetContent = `
      <div class="card-header">
      <h3>${card.title}</h3>
      <div class="card-category">${card.category}</div>
      </div>
      <p class="card-description">${card.description}</p>
      <div class="card-meta">
      <div class="card-meta-first-section">
        <div class="visibility card-meta-items icon-container"><span class="icon icon-globe"><img data-icon-name="globe" src="/icons/globe.svg" alt="" loading="lazy"></span>${card.visibility}</div>
        <div class="owner card-meta-items">Owner <img src="https://main--aem-competency--aem-comp.hlx.live/assets/users/media_15e8d069f911ce3c77611de6ae5818e6445deaf30.png"></img><strong>${card.author}</strong></div>
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
  
};

const generateMentoringCard = (card) => {

};

const getCardListHtml = (cards, cardContainer) => {
  while (cards.length > 0) {
    const card = cards.splice(0, 1)[0];
    switch (card.category) {
      case CATEGORY_BIGBETS: cardContainer.append(generateBigBetsCard(card)); break;
      case CATEGORY_FORUM: cardContainer.append(generateForumCard(card)); break;
      case CATEGORY_MENTORING: cardContainer.append(generateMentoringCard(card)); break;
      default:
    }
  }
};

export default async function decorate(block) {
  const communityList = await fetchSearch();
  const cards = await getCommunityCards(communityList, block);
  block.textContent = '';
  const cardContainer = document.createElement('div');
  cardContainer.className = 'cc-container';
  getCardListHtml(cards, cardContainer);

  block.append(cardContainer);
}

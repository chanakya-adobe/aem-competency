import {
  fetchSearch, CATEGORY_BIGBETS, CATEGORY_FORUM, CATEGORY_MENTORING,
} from '../../scripts/scripts.js';
import { readBlockConfig } from '../../scripts/aem.js';

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

const generateBigBetsCard = (card) => `<div class="card big-bets-content">
    <div class="card-header">
    <h3>${card.title}</h3>
    <div class="card-category">${card.category}</div>
    </div>
    <p class="card-description">${card.description}</p>
    <div class="card-meta">
      <div class="visibility"><img src="https://main--aem-competency--aem-comp.hlx.live/assets/users/media_15e8d069f911ce3c77611de6ae5818e6445deaf30.png" /> ${card.visibility}</div>
      <div class="owner">Owner: <img src="https://main--aem-competency--aem-comp.hlx.live/assets/users/media_15e8d069f911ce3c77611de6ae5818e6445deaf30.png"/ > <strong>${card.author}</strong></div>
      <div class="status">Status: <strong>${card.status}</strong></div>
    </div> 
    <div class='button-container'><a href="${card.path}" class="button primary" title="${card.title}">Learn More</a></div>
    </div>`;

const generateForumCard = (card) => {

};

const generateMentoringCard = (card) => {

};

const getCardListHtml = (cards) => {
  let list = '';
  while (cards.length > 0) {
    const card = cards.splice(0, 1)[0];
    switch (card.category) {
      case CATEGORY_BIGBETS: list += generateBigBetsCard(card); break;
      case CATEGORY_FORUM: list += generateForumCard(card); break;
      case CATEGORY_MENTORING: list += generateMentoringCard(card); break;
      default:
    }
  }
  return list;
};

export default async function decorate(block) {
  const communityList = await fetchSearch();
  const cards = await getCommunityCards(communityList, block);
  block.textContent = '';
  const cardContainer = document.createElement('div');
  cardContainer.className = 'cc-container';
  cardContainer.innerHTML = getCardListHtml(cards, cardContainer);

  block.append(cardContainer);
}

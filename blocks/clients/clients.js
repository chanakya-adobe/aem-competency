import { readBlockConfig, createOptimizedPicture } from '../../scripts/aem.js';

const VIEW_TEASER = 'teaser';

const listHTML = (row, brandImg, config) => `<div class="teaser">
  <div class="teaser-img">${brandImg}</div>
  <p class="teaser-title">${row.Title}</p>
  <p>${row.Description}</p>
  <a href="${row.Link}" title="${row.Title}"><strong>${config.teaserlinklabel}</strong></a>
</div>`;

const viewAllLinkHTML = (config) => `<a href="${config.viewAllLink}" title="${config.viewAllLabel}" class="button secondary">${config.viewAllLabel}</a>`;

async function fetchData(config) {
  const dataUrl = `${config.clientsData}?sheet=${config.dataType}&limit=${config.count}`;
  const resp = await fetch(dataUrl);
  const list = JSON.parse(await resp.text()).data;

  return list;
}

async function printList(list, config) {
  const ul = document.createElement('ul');

  list.forEach((row) => {
    const li = document.createElement('li');
    const brandImg = createOptimizedPicture(row.Image, row.Title, false, [{ width: '600' }]);
    brandImg.querySelector('img').width = 200;
    brandImg.querySelector('img').height = 50;
    li.className = `brand-${row.Brand}`;
    li.innerHTML = listHTML(row, brandImg.outerHTML, config);
    ul.append(li);
  });
  return ul;
}

function getConfig(block) {
  const config = {};
  const blockConfig = readBlockConfig(block);

  config.clientsData = '/clients.json';
  config.dataType = blockConfig.type ?? 'casestudies';
  config.view = blockConfig.view ?? VIEW_TEASER;
  config.teaserlinklabel = blockConfig.teaserlinklabel ?? 'Know more';

  if (config.view === VIEW_TEASER) {
    config.count = blockConfig.count ?? 3;
    config.viewAllLabel = blockConfig.viewalllabel ?? 'View all';
    config.viewAllLink = blockConfig.viewalllink ?? '/';
  } else {
    config.count = blockConfig.count ?? 500;
  }

  return config;
}

export default async function decorate(block) {
  const config = getConfig(block);
  const list = await fetchData(config);

  block.textContent = '';
  if (list.length > 0) {
    const objects = await printList(list, config);
    block.append(objects);

    if (config.view === VIEW_TEASER) {
      const viewAllContainer = document.createElement('div');
      viewAllContainer.className = 'view-all';
      viewAllContainer.innerHTML = viewAllLinkHTML(config);

      block.append(viewAllContainer);
    }
  } else {
    block.append('no result found');
  }
}

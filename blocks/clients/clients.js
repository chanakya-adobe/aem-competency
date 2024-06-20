import { fetchPlaceholders, readBlockConfig } from '../../scripts/aem.js';

const VIEW_TEASER = 'teaser';

const listHTML = (row, brandImg, config) => `<div class="teaser">
  <div class="teaser-img"><img alt="${row.Title}" loading="lazy" src="${brandImg}" width="200" height="59"></div>
  <h4>${row.Title}</h4>
  <p>${row.Description}</p>
  <strong><a href="${row.Link}" title="${row.Title}">${config.teaserlinklabel}</a></strong>
</div>`;

const viewAllLinkHTML = (config) => `<a href="${config.viewAllLink}" title="${config.viewAllLabel}" class="button secondary">${config.viewAllLabel}</a>`;

async function fetchData(config) {
  const dataUrl = `${config.clientsData}?sheet=${config.dataType}&limit=${config.count}`;
  const resp = await fetch(dataUrl);
  const list = JSON.parse(await resp.text()).data;

  return list;
}

async function printList(list, config, placeholder) {
  const ul = document.createElement('ul');

  list.forEach((row) => {
    const brandImg = placeholder[`brand${row.Brand}`];
    const li = document.createElement('li');
    li.className = `brand-${row.Brand}`;
    li.innerHTML = listHTML(row, brandImg, config);

    ul.append(li);
  });
  return ul;
}

function getConfig(block, placeholder) {
  const config = {};
  const blockConfig = readBlockConfig(block);

  config.clientsData = placeholder.clientsData ?? '/clients.json';
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
  const placeholder = await fetchPlaceholders();
  const config = getConfig(block, placeholder);
  const list = await fetchData(config);

  block.textContent = '';
  if (list.length > 0) {
    const objects = await printList(list, config, placeholder);
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

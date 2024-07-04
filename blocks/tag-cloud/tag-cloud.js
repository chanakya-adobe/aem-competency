import { readBlockConfig, getMetadata } from '../../scripts/aem.js';
import { fetchSearch } from '../../scripts/scripts.js';
import { isValidCategory } from '../../scripts/utils.js';

const CATEGORY_USER = 'User';

/**
 * Print the tag list
 *
 * @param {*} block
 * @param {*} tagsList
 * @param {*} config
 */
function printTagList(block, tagsList, config) {
  if (config.heading) {
    const heading = document.createElement('h2');
    heading.innerHTML = config.heading;
    block.append(heading);
  }

  const tagListContainer = document.createElement('ul');
  tagListContainer.classList.add('tags');

  tagsList.forEach((tag, index) => {
    const tagItem = document.createElement('li');
    tagItem.innerHTML = tag;
    if (config.viewMoreCTA && (index + 1) > config.tagCount) {
      tagItem.className = 'view-more';
    }
    tagListContainer.append(tagItem);
  });

  if (config.viewMoreCTA && tagsList.length > config.tagCount) {
    // Create the input element
    const inputElement = document.createElement('input');
    inputElement.type = 'checkbox';
    inputElement.hidden = true;
    inputElement.className = 'view-more-state';
    inputElement.id = 'view-more';

    // Create the first label element
    const labelClosed = document.createElement('label');
    labelClosed.setAttribute('for', 'view-more');
    labelClosed.className = 'view-more-closed btn tertiary';
    labelClosed.innerText = 'View more';

    // Create the second label element
    const labelOpened = document.createElement('label');
    labelOpened.setAttribute('for', 'view-more');
    labelOpened.className = 'view-more-opened btn tertiary';
    labelOpened.innerText = 'View less';

    block.append(inputElement, tagListContainer, labelClosed, labelOpened);
  } else {
    block.append(tagListContainer);
  }
}

/**
 * Generate tags list from search filters
 * @param {*} config
 * @returns list of filtered tags
 */
async function generateTagList(config) {
  let categoryList = {};
  const tags = new Set();
  if (config.userTags && !config.userName) {
    return categoryList;
  }

  const category = isValidCategory(config.category) ? config.category : '';
  categoryList = await fetchSearch(category);

  if (config.userTags && config.userName) {
    categoryList = await categoryList.filter((item) => item.author === config.userName);
  }
  if (categoryList && categoryList.length > 0) {
    categoryList.forEach((row) => {
      if (row.tags) {
        const itemTags = JSON.parse(row.tags);
        itemTags.forEach((tag) => {
          tags.add(tag);
        });
      }
    });
  }

  return Array.from(tags);
}

/** Generate tag list from current page */
function generateTagListCurrentPage() {
  const tags = getMetadata('article:tag');
  if (tags && tags.length) {
    const tagList = tags.split(',');

    return tagList;
  }
  return null;
}

/**
 * Read block config
 * @param {*} block
 * @returns
 */
function getConfig(block) {
  const config = {};
  const blockConfig = readBlockConfig(block);

  config.heading = blockConfig.heading ?? '';
  config.category = blockConfig.category ?? '';
  config.type = blockConfig.type ?? '';
  config.viewMoreCTA = !!blockConfig.showviewmore;
  config.tagCount = blockConfig.tagcount ?? 6;
  config.userTags = config.type === CATEGORY_USER;
  config.currentPageTags = !config.category && !config.userTags;
  if (config.userTags) {
    config.userName = blockConfig.name;
  }

  block.textContent = '';
  return config;
}

export default async function decorate(block) {
  const config = getConfig(block);
  let tagsList = {};
  if (config.currentPageTags) {
    tagsList = generateTagListCurrentPage();
  } else {
    tagsList = await generateTagList(config);
  }

  printTagList(block, tagsList, config);

  return block;
}

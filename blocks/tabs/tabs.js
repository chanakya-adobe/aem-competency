// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}
function createTablist() {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');
  return tablist;
}

/**
 * Creates a tab button element.
 * @param {string} id - The unique ID for the tab button.
 * @param {string} innerHTML - The inner HTML of the tab button.
 * @param {boolean} isSelected - Whether the tab button is selected.
 * @returns {HTMLElement} The tab button element.
 */
function createTabButton(id, innerHTML, isSelected) {
  const button = document.createElement('button');
  button.className = 'tabs-tab';
  button.id = `tab-${id}`;
  button.innerHTML = innerHTML;
  button.setAttribute('aria-controls', `tabpanel-${id}`);
  button.setAttribute('aria-selected', isSelected);
  button.setAttribute('role', 'tab');
  button.setAttribute('type', 'button');
  return button;
}
/**
 * Adds click event listener to a tab button.
 * @param {HTMLElement} button - The tab button element.
 * @param {HTMLElement} tabpanel - The tabpanel element.
 * @param {HTMLElement} block - The block element containing the tabs.
 * @param {HTMLElement} tablist - The tablist element.
 */
function addTabButtonClickListener(button, tabpanel, block, tablist) {
  button.addEventListener('click', () => {
    block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
      panel.setAttribute('aria-hidden', true);
    });
    tablist.querySelectorAll('button').forEach((btn) => {
      btn.setAttribute('aria-selected', false);
    });
    tabpanel.setAttribute('aria-hidden', false);
    button.setAttribute('aria-selected', true);
  });
}

/**
 * Loads content for fragment tabs.
 * @param {HTMLElement} block - The block element containing the tabs.
 */
async function loadFragmentTabs(block) {
  const links = block.querySelectorAll('[role=tabpanel] a');

  links.forEach(async (link) => {
    const path = link ? link.getAttribute('href') : '';
    if (path !== '' && path.includes('/fragments')) {
      const tabPanel = link.closest('[role=tabpanel]');
      tabPanel.innerHTML = '';
      const fragment = await loadFragment(path);
      const content = document.createElement('div');
      content.append(fragment);
      tabPanel.append(content);
    }
  });
}
export default async function decorate(block) {
  // build tablist
  const tablist = createTablist();
  const isFragment = block.classList.contains('fragment');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = `${toClassName(tab.textContent)}-${Math.floor(Math.random() * 999)}`;
    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');
    if (!isFragment && !hasWrapper(tabpanel.lastElementChild)) {
      tabpanel.lastElementChild.innerHTML = `${tabpanel.lastElementChild.innerHTML}`;
    }

    // build tab button
    const button = createTabButton(id, tab.innerHTML, !i);
    addTabButtonClickListener(button, tabpanel, block, tablist);
    tablist.append(button);
    tab.remove();
  });

  // if tab is fragment type then the content is loaded from fragment
  if (isFragment) {
    await loadFragmentTabs(block);
  }
  block.prepend(tablist);
}

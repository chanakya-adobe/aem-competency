import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';


/**
 * add dropdown show hide event listener
 * @param {Element} footer 
 */
function addShowHideEvent(footer) {
  footer.addEventListener('click', (e) => {
    let target = e.target;
      target = target.parentNode.classList.contains('has-dropdown') ? target.parentNode : target
    if (target.classList.contains('has-dropdown')) {
        target.classList.toggle('show-dropdown');
    }
  });
}


/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment

  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-container';

  while (fragment.firstElementChild) {
    footer.append(fragment.firstElementChild);
  }

  const footerNav = footer.children[0];
  const navLists = footerNav.children[0].children[0];
  navLists.classList.add('nav-lists');

  //add dropdown menu and icon element
  [...navLists.children].forEach(child => {
    [...child.children].filter(grandChild => grandChild.tagName === 'UL')
      .forEach(grandChild => grandChild.parentNode.classList.add('has-dropdown'));
    if (child.classList.contains('has-dropdown')) {
      const accordionArrow = document.createElement('i');
      accordionArrow.className = 'arrow';
      child.insertBefore(accordionArrow, child.firstChild);
    }
  })
  
  //add show hide event for mobile
  addShowHideEvent(footer);

  block.append(footer);
}

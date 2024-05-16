import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';


/**
 * add dropdown show hide event listener
 * @param {Element} footer 
 */
function addShowHideEvent(footer) {
  footer.addEventListener('click', (e) => {
    let target = e.target;
    target = target.parentNode.parentNode.classList.contains('nav-lists-with-child') ? target.parentNode : target
    if (target.parentNode.classList.contains('nav-lists-with-child')) {
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

  const navListsClasses = ['nav-lists-with-child', 'nav-lists-without-child'];
  navListsClasses.forEach((item, index) => {
    const footerNav = footer.children[0];
    const navLists = footerNav.children[0].children[index];
    navLists.classList.add(item);
    navLists.classList.add("nav-lists");
  });

  //add dropdown menu and icon element
  const navListWithChildren = footer.querySelector('.nav-lists-with-child');
  [...navListWithChildren.children].forEach(child => {
    const accordionArrow = document.createElement('i');
    accordionArrow.className = 'arrow';
    child.insertBefore(accordionArrow, child.firstChild);  
  });

  //add show hide event for mobile and tablet
  if(window.innerWidth < 1280){
    addShowHideEvent(footer);
  }

  block.append(footer);
}

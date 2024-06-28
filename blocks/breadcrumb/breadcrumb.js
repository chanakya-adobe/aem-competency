import { getMetadata } from '../../scripts/aem.js';
import { createTag } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const regex = '^/(.*?)/?$';
  const toTitleCase = (phrase) => (
    phrase
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/-/g, ' ')
  );

  const pathSegments = window.location.pathname.replace(regex, '$1').split('/');
  pathSegments.pop(); // Current Breadcrumb value comes from page title.

  const list = createTag('ol', { class: 'breadcrumb' });
  let segments = window.location.origin;

  pathSegments.forEach((page, index) => {
    segments += (index !== pathSegments.length - 1) ? `${page}/` : `${page}`;
    const label = toTitleCase(page || 'Home');
    const anchor = createTag('a', { href: `${segments}` }, label);
    const crumb = createTag('li', { class: 'crumb' }, anchor);
    list.append(crumb);
  });

  const navTitle = getMetadata('og:title');
  const crumb = createTag('li', { class: 'crumb' }, navTitle);
  list.append(crumb);
  block.innerHTML = list.outerHTML;
}

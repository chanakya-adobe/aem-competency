// eslint-disable-next-line import/no-cycle
import { sampleRUM, getMetadata } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
function buildBreadcrumbs(breadcrumbs) {
  const main = document.querySelector('main');
  if (main && breadcrumbs.length > 1) {
    const $div = document.createElement('div');
    $div.classList.add('breadcrumb-wrapper');
    const $ul = document.createElement('ul');
    while (breadcrumbs.length) {
      const step = breadcrumbs.shift();
      const $li = document.createElement('li');
      $ul.append($li);
      let $wrap = $li;
      if (step.link) {
        $wrap = document.createElement('a');
        $wrap.classList.add('breadcrumb-link');
        $wrap.href = step.link;
        $li.append($wrap);
      }
      const $span = document.createElement('span');
      $wrap.append($span);
      $span.textContent = step.text;
      $div.append($ul);
    }
    main.insertBefore($div, main.firstChild);
  }
}

function createBreadcrumb() {
  const path = window.location.pathname;
  const breadCrumbArr = path.split('/');
  const breadcrumbs = [
    {
      text: 'Home',
      link: window.location.origin,
    },
  ];

  const toTitleCase = (phrase) => (
    phrase
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );

  breadCrumbArr.forEach((item, index) => {
    const linkPath = breadCrumbArr.slice(0, index + 1).join('/');
    if (item !== '' && index !== breadCrumbArr.length - 1) {
      breadcrumbs.push({
        text: toTitleCase(item.replace(/-/g, ' ')),
        link: window.location.origin.concat(linkPath),
      });
    } else if (item !== '' && index === breadCrumbArr.length - 1) {
      breadcrumbs.push({
        text: getMetadata('og:title'),
        link: window.location.origin.concat(linkPath),
      });
    }
  });
  buildBreadcrumbs(breadcrumbs);
}

createBreadcrumb();

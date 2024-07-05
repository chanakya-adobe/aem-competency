// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

function externalLinks() {
  let links = document.getElementsByTagName('a');
  let index = 0;
  while (index < links.length) {
    const redirect = links[index];
    redirect.getAttribute('href') && redirect.hostname !== window.location.hostname && (redirect.target = '_blank');
    index = index + 1;
  }
};

externalLinks();
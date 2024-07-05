// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

function externalLinks() {
  const links = document.getElementsByTagName('a');
  let index = 0;
  while (index < links.length) {
    const redirect = links[index];
    if (redirect.getAttribute('href') && redirect.hostname !== window.location.hostname) {
      redirect.target = '_blank';
    }
    index += 1;
  }
}

externalLinks();

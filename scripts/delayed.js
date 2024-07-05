// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

function externalLinks() {
  for (var c = document.getElementsByTagName("a"), a = 0; a < c.length; a++) {
    let b = c[a];
    b.getAttribute('href') && b.hostname !== location.hostname && (b.target = '_blank')
  }
}

externalLinks();
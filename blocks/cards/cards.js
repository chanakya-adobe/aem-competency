import { createOptimizedPicture } from '../../scripts/aem.js';
import { wrapImgsInLinks } from '../../scripts/utils.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  const videoVariations = block.classList.contains('cards-video');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    if (videoVariations) {
      const video = document.createElement('video');
      video.autoplay = true;
      video.controls = false;
      video.muted = true;
      video.loop = true;
      const source = document.createElement('source');
      source.src = row.firstElementChild.firstChild.title;
      source.type = 'video/mp4';
      video.appendChild(source);
      block.innerHTML = '';
      row.firstElementChild.innerHTML = '';
      row.firstElementChild.appendChild(video);
    }
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.querySelector(videoVariations ? 'video' : 'picture')) div.className = videoVariations ? 'card-video' : 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  if (!videoVariations) {
    ul.querySelectorAll('img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  }
  block.textContent = '';
  block.append(ul);
  wrapImgsInLinks(block);
}

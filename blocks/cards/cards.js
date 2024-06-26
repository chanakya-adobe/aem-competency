import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const isTrainingBlock = block.classList.contains('training');
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else {
        div.className = 'cards-card-body';
        // Progressbar in Trainingblock
        if (isTrainingBlock && div.querySelector('li')) {
          const liTraining = div.querySelector('li');
          const percentage = liTraining.textContent.split('%')[0] ? liTraining.textContent.split('%')[0] : 0;
          const progress = document.createElement('progress');
          progress.value = percentage;
          progress.max = 100;
          liTraining.append(progress);
        }
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => {
    const newPic = createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 768px)', width: '750' }, { width: '600' }]);
    const newImg = newPic.getElementsByTagName('img')[0];
    newImg.width = 500;
    newImg.height = 300;

    img.closest('picture').replaceWith(newPic);
  });
  block.textContent = '';
  block.append(ul);
}

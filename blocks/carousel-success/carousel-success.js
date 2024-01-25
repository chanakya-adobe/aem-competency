let counter = 0;

function controlsAndCaption(block) {
  const nextBtn = document.createElement('span');
  const prevBtn = document.createElement('span');
  const dotsContainer = document.createElement('div');
  const controlsContainer = document.createElement('div');
  const captionsContainer = document.createElement('div');
  const captionContent = document.createElement('p');
  const nextImage = document.createElement('img');
  const prevImage = document.createElement('img');

  nextBtn.classList.add('carousel-next-button');
  prevBtn.classList.add('carousel-prev-button');
  dotsContainer.classList.add('carousel-dot');
  controlsContainer.classList.add('controls');
  captionsContainer.classList.add('caption-container');
  captionContent.classList.add('current-caption', 'caption');

  nextImage.src = '/images/carousel-next.svg';
  prevImage.src = '/images/carousel-pre.svg';

  nextBtn.appendChild(nextImage);
  prevBtn.appendChild(prevImage);

  controlsContainer.appendChild(prevBtn);
  controlsContainer.appendChild(dotsContainer);
  controlsContainer.appendChild(nextBtn);
  captionsContainer.appendChild(captionContent);

  block.insertAdjacentElement('afterend', captionsContainer);
  block.insertAdjacentElement('afterend', controlsContainer);
}

function moveCarousel(imagesContainer) {
  const newImageWidth = document.querySelector('.image-wrapper').clientWidth + 10;
  imagesContainer.style.transform = `translateX(${-newImageWidth * counter}px)`;
}

function showHideCaption(block) {
  const currentCaption = block.parentElement.querySelector('.current-caption');
  const captions = block.parentElement.querySelectorAll('.caption');
  captions.forEach((caption, index) => {
    if (index === counter) {
      currentCaption.textContent = caption.textContent;
    } else {
      caption.style.display = 'none';
    }
  });
}

function setActiveDot(block) {
  const dots = block.nextElementSibling.querySelectorAll('.carousel-button');
  dots.forEach((dot, index) => {
    if (index === counter) {
      dot.classList.add('button-selected');
    } else {
      dot.classList.remove('button-selected');
    }
  });
}

function getClickHandler(i, imagesContainer, block) {
  return () => {
    counter = i;
    moveCarousel(imagesContainer);
    setActiveDot(block);
    showHideCaption(block);
  };
}

function createDots(block, imageCount, imagesContainer) {
  const dotsContainer = block.nextElementSibling.querySelector('.carousel-dot');
  for (let i = 0; i < imageCount; i += 1) {
    const dot = document.createElement('div');
    dot.classList.add('carousel-button');
    dot.addEventListener('click', getClickHandler(i, imagesContainer, block));
    dotsContainer.appendChild(dot);
  }

  setActiveDot(block);
}

/**
 * loads and decorates the carousel-success
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const divs = Array.from(block.children);

  controlsAndCaption(block);

  const nextBtn = block.nextElementSibling.querySelector('.carousel-next-button');
  const prevBtn = block.nextElementSibling.querySelector('.carousel-prev-button');
  const imagesContainer = block;

  divs.forEach((row) => {
    const picture = row.querySelector('picture');
    const caption = row.querySelector('div:nth-child(2)');
    row.innerHTML = '';
    row.appendChild(picture);
    row.appendChild(caption);

    row.classList.add('image-wrapper');
    row.querySelector('div:nth-child(2)').classList.add('caption');
  });

  const imageCount = block.querySelectorAll('.image-wrapper').length;

  // block.querySelector('.image-wrapper').clientWidth + 10;

  createDots(block, imageCount, imagesContainer);
  showHideCaption(block);

  nextBtn.addEventListener('click', () => {
    counter += 1;
    if (counter >= imageCount) {
      counter = 0;
    }
    moveCarousel(imagesContainer);
    setActiveDot(block);
    showHideCaption(block);
  });

  prevBtn.addEventListener('click', () => {
    if (counter <= 0) {
      counter = imageCount - 1;
    } else {
      counter -= 1;
    }
    moveCarousel(imagesContainer);
    setActiveDot(block);
    showHideCaption(block);
  });
}

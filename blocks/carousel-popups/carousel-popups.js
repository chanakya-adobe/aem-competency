import { createElementWithClasses, addClassToElement } from '../../scripts/utils.js';

const isBlockedCarousel = [...document.querySelectorAll('.carousel-block')].length > 0;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

function setupCarousel(block) {
  const slides = block.querySelectorAll('.slides .slide');
  const dotsContainer = block.querySelector('.slider-dots');

  slides.forEach((slide, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === 0) {
      dot.classList.add('active');
    }
    dotsContainer.appendChild(dot);
  });
}

function addPopupsModel(block) {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.id = 'sliderModal';
  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');
  const close = document.createElement('div');
  close.classList.add('close');
  modalContent.appendChild(close);
  modal.appendChild(modalContent);
  const slides = block.querySelector('.slides');
  slides.appendChild(modal);
}

let startX;
let startY;
let currentSlide = 0;

function addEventListeners(block) {
  const slides = block.querySelectorAll('.slides .slide');
  const prevButton = block.querySelector('.slider-buttons .prev');
  const nextButton = block.querySelector('.slider-buttons .next');
  const dots = block.querySelectorAll('.slider-dots .dot');

  const updateSlide = (direction) => {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  };

  nextButton.addEventListener('click', () => updateSlide(1));
  prevButton.addEventListener('click', () => updateSlide(-1));

  block.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX;
    startY = e.touches[0].pageY;
  });

  block.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].pageX;
    const endY = e.changedTouches[0].pageY;
    const differenceX = startX - endX;
    const differenceY = startY - endY;

    if (Math.abs(differenceX) > 80) {
      if (Math.abs(differenceX) > Math.abs(differenceY)) {
        if (differenceX > 0) {
          updateSlide(1);
        } else {
          updateSlide(-1);
        }
      }
    }

    startX = null;
    startY = null;
  });

  // add click event listeners to all the images
  const images = block.querySelectorAll('.slider-image');
  if (!isBlockedCarousel) {
    images.forEach((image, index) => {
      image.addEventListener('click', () => {
        document.body.style.overflow = 'hidden';
        const modal = block.querySelector('#sliderModal');
        const modalContent = modal.querySelector('.modal-content');
        const popup = block.querySelector(`.slider-popup-${index}`);
        [...modalContent.children].forEach((child) => {
          if (!child.classList.contains('close')) {
            modalContent.removeChild(child);
          }
        });
        [...popup.children].forEach((child) => {
          modalContent.appendChild(child.cloneNode(true));
        });
        const downloadLink = modalContent.querySelector('a');
        downloadLink.setAttribute('download', '');
        modal.style.display = 'block';
      });
    });
  }

  // add click event listener to the close button
  const close = block.querySelector('.close');
  close.addEventListener('click', () => {
    document.body.style.overflow = 'auto';
    const modal = block.querySelector('#sliderModal');
    modal.style.display = 'none';
  });
}

function chunkArray(array, chunkSize) {
  let chunk = [];
  const chunks = array.reduce((acc, item, index) => {
    chunk.push(item);
    if ((index + 1) % chunkSize === 0) {
      acc.push(chunk);
      chunk = [];
    }
    return acc;
  }, []);

  if (chunk.length > 0) {
    chunks.push(chunk);
  }

  return chunks;
}

function addSliderButtons(block) {
  const buttonsDiv = createElementWithClasses('div', 'slider-buttons');
  buttonsDiv.appendChild(createElementWithClasses('a', 'prev'));
  buttonsDiv.appendChild(createElementWithClasses('div', 'slider-dots'));
  buttonsDiv.appendChild(createElementWithClasses('a', 'next'));
  block.appendChild(buttonsDiv);
}

/**
 * loads and decorates the carousel-popups
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const divs = Array.from(block.children);
  divs.forEach((row, index) => {
    addClassToElement(row.firstElementChild, 'slider-image', `slider-image-${index}`);
    addClassToElement(row.lastElementChild, 'slider-popup', `slider-popup-${index}`);
  });
  let slideCount = 6;
  if (isMobile && isBlockedCarousel) {
    slideCount = 1;
  } else if (isBlockedCarousel) {
    slideCount = 4;
  } else {
    slideCount = 6;
  }
  const sliders = chunkArray(divs, slideCount);
  sliders.forEach((currentSlider, index) => {
    const sliderDiv = createElementWithClasses('div', 'slide', `slider-${index + 1}`, index === 0 ? 'active' : '');
    currentSlider.forEach((div) => sliderDiv.appendChild(div));
    block.appendChild(sliderDiv);
  });

  const slidesDiv = createElementWithClasses('div', 'slides');
  Array.from(block.children)
    .filter((child) => child.classList.contains('slide'))
    .forEach((child) => slidesDiv.appendChild(child));
  block.appendChild(slidesDiv);

  addSliderButtons(block);

  setupCarousel(block);

  addPopupsModel(block);

  addEventListeners(block);
}

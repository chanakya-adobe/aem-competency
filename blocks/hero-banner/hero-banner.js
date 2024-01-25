import { createPictureTag } from '../../scripts/scripts.js';
import loadAnimation from '../../scripts/utils.js';
import { fetchPlaceholders } from '../../scripts/aem.js';

const CLASS_NAMES = {
  carouselNav: 'carousel-nav',
  buttonsContainer: 'carousel-dot',
  prevButton: 'carousel-prev-button',
  nextButton: 'carousel-next-button',
  bannerCarousel: 'hero-banner-carousel',
  bannerItem: 'banner-carousel-item',
  bannerImg: 'hero-banner__image',
  bannerContentSec: 'hero-banner-carousel-data',
  teaserClass: 'hero-banner__teaser',
  heroBannerIcon: 'hero-banner-icon',
  heroBannerVideo: 'banner-video',
};

function getPictureElement(row) {
  const images = Array.from(row.querySelectorAll('img'));
  const [mobileImage, desktopImage] = images.map(({ src }) => src);
  const isReachOutSection = row.closest('.hero-banner').classList.contains('reach-out-section');
  const mobileWidth = isReachOutSection ? 769 : 600;
  const content = {
    desktop: desktopImage,
    mobile: mobileImage,
    alt: '',
    minWidth: mobileWidth,
  };

  return createPictureTag(content);
  // return createPictureTag(CLASS_NAMES.bannerImg, mobileImage, desktopImage, true, mobileWidth);
}

async function initCarousel(element, items) {
  const placeholders = await fetchPlaceholders();
  const buttonsHtml = items.map(() => '<span class="carousel-button"></span>');
  element.insertAdjacentHTML('beforeend', `
    <div class='${CLASS_NAMES.carouselNav}'> 
      <span class='${CLASS_NAMES.prevButton}'><img src="${placeholders.carouselPre}"></span>
      <div class='${CLASS_NAMES.buttonsContainer}'>
        ${buttonsHtml.join('')}
      </div>
      <span class='${CLASS_NAMES.nextButton}'><img src="${placeholders.carouselNext}"></span>
    </div>
  `);

  const buttonsContainer = element.querySelector(`.${CLASS_NAMES.buttonsContainer}`);
  const prevButton = element.querySelector(`.${CLASS_NAMES.prevButton}`);
  const nextButton = element.querySelector(`.${CLASS_NAMES.nextButton}`);

  let autoRotateInterval;

  const changeSlide = (index) => {
    items.forEach((item, i) => {
      const isSelected = i === index;
      item.classList.toggle('item-selected', isSelected);
      buttonsContainer.children[i].classList.toggle('button-selected', isSelected);
    });
  };

  const startAutoRotate = () => {
    autoRotateInterval = setInterval(() => {
      const currentIndex = items.findIndex((item) => item.classList.contains('item-selected'));
      const newIndex = (currentIndex + 1) % items.length;
      changeSlide(newIndex);
    }, 6000);
  };

  const stopAutoRotate = () => {
    clearInterval(autoRotateInterval);
  };

  buttonsContainer.addEventListener('click', (event) => {
    const buttonIndex = Array.from(buttonsContainer.children).indexOf(event.target);
    if (buttonIndex !== -1) {
      changeSlide(buttonIndex);
      stopAutoRotate();
    }
  });

  prevButton.addEventListener('click', () => {
    const currentIndex = items.findIndex((item) => item.classList.contains('item-selected'));
    const newIndex = (currentIndex - 1 + items.length) % items.length;
    changeSlide(newIndex);
    stopAutoRotate();
  });

  nextButton.addEventListener('click', () => {
    const currentIndex = items.findIndex((item) => item.classList.contains('item-selected'));
    const newIndex = (currentIndex + 1) % items.length;
    changeSlide(newIndex);
    stopAutoRotate();
  });

  startAutoRotate();
  changeSlide(0);
  element.addEventListener('mouseenter', stopAutoRotate);
  element.addEventListener('mouseleave', startAutoRotate);
}

function createBannerContent(row) {
  const bannerContentSec = document.createElement('div');
  const children = Array.from(row.children);
  const filteredChildren = children.filter((child) => !child.querySelector('picture, video'));

  bannerContentSec.classList.add(CLASS_NAMES.bannerContentSec);
  bannerContentSec.appendChild(filteredChildren[0]);

  return bannerContentSec;
}

export default async function decorate(block) {
  if (block.children.length > 0) {
    const bannerCarousel = document.createElement('div');
    bannerCarousel.classList.add(CLASS_NAMES.bannerCarousel);

    Array.from(block.children).forEach((row) => {
      const bannerImg = getPictureElement(row);
      const bannerItem = document.createElement('div');
      bannerItem.classList.add(CLASS_NAMES.bannerItem);
      bannerItem.append(bannerImg);

      const bannerContentSec = createBannerContent(row);
      const animationName = Array.from(block.classList).find((className) => className.includes('animation-'));
      if (animationName) {
        const lottieDiv = document.createElement('div');
        lottieDiv.classList.add('lottie');
        lottieDiv.id = animationName;
        bannerContentSec.querySelector('h2').insertAdjacentElement('afterend', lottieDiv);
        loadAnimation(animationName);
      }

      bannerItem.append(bannerContentSec);
      bannerCarousel.append(bannerItem);
    });

    block.textContent = '';
    block.append(bannerCarousel);

    if (bannerCarousel.children.length === 1) {
      bannerCarousel.classList.replace(CLASS_NAMES.bannerCarousel, CLASS_NAMES.teaserClass);
    } else {
      initCarousel(bannerCarousel, Array.from(bannerCarousel.querySelectorAll(`.${CLASS_NAMES.bannerItem}`)));
    }
  }
}

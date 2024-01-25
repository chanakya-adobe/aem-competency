import { createElementWithClasses } from '../../scripts/utils.js';

let tabVarient = false;
let multicardCenter = false;
let multicardRight = false;
let current = 1;
let startX;
let startY;

function getvarient(block) {
  tabVarient = false;
  multicardCenter = false;
  multicardRight = false;
  if (block.classList.contains('carousel-tab')) {
    tabVarient = true;
  } else if (block.classList.contains('multicard-center')) {
    multicardCenter = true;
  } else if (block.classList.contains('multicard-right')) {
    multicardRight = true;
  }
}

function getActiveSlide() {
  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  const isTablet = window.matchMedia('(max-width: 1024px)').matches;
  let activeSlide;
  if (multicardCenter) {
    if (isMobile) {
      activeSlide = 2;
    } else if (isTablet) {
      activeSlide = 2;
    } else {
      activeSlide = 3;
    }
    return activeSlide;
  }
  return 1;
}

function addSliderButtons(block) {
  const buttonsDiv = createElementWithClasses('div', 'slider-buttons');
  buttonsDiv.appendChild(createElementWithClasses('a', 'prev'));
  buttonsDiv.appendChild(createElementWithClasses('div', 'slider-dots'));
  buttonsDiv.appendChild(createElementWithClasses('a', 'next'));
  block.parentElement.appendChild(buttonsDiv);
}

function setupCarousel(block) {
  getvarient(block);
  let carouselItems = block.querySelectorAll('.carousel-item');
  if (tabVarient) {
    carouselItems = block.querySelectorAll('.tab-container-item.active .carousel-item');
  }
  const dotsContainer = block.parentElement.querySelector('.slider-dots');
  dotsContainer.textContent = '';
  carouselItems.forEach((slide, index) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (index === getActiveSlide() - 1) {
      dot.classList.add('active');
    }
    dot.setAttribute('data-slide-index', index + 1);
    dotsContainer.appendChild(dot);
  });
}

function updateItem(block, i, order) {
  getvarient(block);
  let item = block.querySelector(`.carousel-item[data-position='${i}']`);
  let dot = block.parentElement.querySelector(`.dot[data-slide-index='${i}']`);
  if (tabVarient) {
    item = block.querySelector(`.tab-container-item.active .carousel-item[data-position='${i}']`);
    dot = block.closest('.card-carousel-wrapper').querySelector(`.dot[data-slide-index='${i}']`);
  }
  item.classList.remove('center');
  dot.classList.remove('active');
  if (order === getActiveSlide()) {
    item.classList.add('center');
    dot.classList.add('active');
  }
  item.style.order = order;
}

function getCarouselItems(block) {
  return tabVarient
    ? block.querySelectorAll('.tab-container-item.active .carousel-item')
    : block.querySelectorAll('.carousel-item img');
}

function setTransition(element, transitionClass, translation) {
  element.classList.add(transitionClass);
  element.style.transform = `translate3d(${translation}, 0px, 0px)`;
}

function resetTransition(element) {
  element.classList.remove('slide-transition-right', 'slide-transition-left');
  element.style.transform = 'translate3d(0px, 0px, 0px)';
}

function updateOrder(block, numItems) {
  let order = 1;
  for (let i = current; i <= numItems; i += 1) {
    updateItem(block, i, order);
    order += 1;
  }

  for (let i = 1; i < current; i += 1) {
    updateItem(block, i, order);
    order += 1;
  }

  const carouselItem = getCarouselItems(block);
  carouselItem.forEach((element) => {
    resetTransition(element);
  });
}

function handleTransitionEnd(block, numItems) {
  updateOrder(block, numItems);
  // Remove event listener after handling transition
  block.removeEventListener('transitionend', handleTransitionEnd);
}
function gotoNext(block) {
  const carouselItem = getCarouselItems(block);
  const numItems = carouselItem.length;
  current = current === numItems ? 1 : current + 1;

  carouselItem.forEach((element) => {
    setTransition(element, 'slide-transition-right', '-100%');
  });

  block.addEventListener('transitionend', () => handleTransitionEnd(block, numItems), { once: true });
}

function gotoPrevious(block) {
  const carouselItem = getCarouselItems(block);
  const numItems = carouselItem.length;
  current = current === 1 ? numItems : current - 1;

  carouselItem.forEach((element) => {
    setTransition(element, 'slide-transition-left', '100%');
  });

  block.addEventListener('transitionend', () => handleTransitionEnd(block, numItems), { once: true });
}

function addEvents(block) {
  const carouselItem = getCarouselItems(block);
  const numItems = carouselItem.length;
  block.parentElement.querySelector('.next').removeEventListener('click', gotoNext);
  block.parentElement.querySelector('.prev').removeEventListener('click', gotoPrevious);

  block.parentElement.querySelector('.next').addEventListener('click', () => {
    gotoNext(block, numItems);
  });

  block.parentElement.querySelector('.prev').addEventListener('click', () => {
    gotoPrevious(block, numItems);
  });

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
          gotoNext(block, numItems);
        } else {
          gotoPrevious(block, numItems);
        }
      }
    }

    startX = null;
    startY = null;
  });
}

function deactivateContents(content) {
  content.classList.remove('active');
}

function addTabEventListener(block) {
  const tabContents = document.querySelectorAll('.tab-container .tab-container-item');
  const tabItem = document.querySelectorAll('.tab-items .tab-item');
  tabContents.forEach(deactivateContents);
  tabItem[0].classList.add('active');
  tabContents[0].classList.add('active');
  tabItem.forEach((tab) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      tabItem.forEach(deactivateContents);
      const slides = block.querySelectorAll('.carousel-section.active .carousel-item');
      slides.forEach(deactivateContents);
      tab.classList.add('active');
      tabContents.forEach(deactivateContents);
      const currentCointainer = document.querySelector(`.carousel-${tab.innerText}`);
      currentCointainer.classList.add('active');
      const selectedItem = currentCointainer.querySelector('.carousel-item');
      selectedItem.classList.add('center');
      setupCarousel(block);
      // currentCointainer.style.height = `${selectedItem.offsetHeight}px`;
    });
  });
}

function handleResize(block) {
  getvarient(block);
  getActiveSlide();
  block.querySelector('.carousel-item.center').classList.remove('center');
  block.querySelectorAll('.carousel-item').forEach((element, index) => {
    if (index === getActiveSlide() - 1) {
      element.classList.add('center');
    }
    element.style.order = index + 1;
  });
}

function addResizeEvent(block) {
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize(block), 1000);
  });
}

export default async function decorate(block) {
  getvarient(block);
  const rows = Array.from(block.children);
  let tabName = '';
  const tabItems = createElementWithClasses('div', 'tab-items');
  const tabContainer = createElementWithClasses('div', 'tab-container');
  let tabCount = 0;
  let containerCount = 0;
  let carouselblock;
  block.textContent = '';
  let itemCount = 0;
  rows.forEach((row, key) => {
    if (tabVarient) {
      const isEmpty = row.lastElementChild.innerHTML === '';
      if (isEmpty) {
        tabName = row.firstElementChild?.innerText;
        const tabItem = createElementWithClasses('div', 'tab-item', `tab-${tabName}`);
        tabItem.innerText = tabName;
        tabItems.appendChild(tabItem);
        tabCount += 1;
        itemCount = 0;
      } else {
        itemCount += 1;
        const carouselItem = createElementWithClasses('div', 'carousel-item');
        carouselItem.setAttribute('data-position', itemCount);
        carouselItem.append(row);
        if (containerCount !== tabCount) {
          carouselblock = createElementWithClasses('div', 'carousel-section');
          const tabContantItem = createElementWithClasses('div', 'tab-container-item', `carousel-${tabName}`);
          tabContantItem.appendChild(carouselblock);
          tabContainer.appendChild(tabContantItem);
          containerCount += 1;
        }
        if (carouselblock && carouselItem) {
          carouselblock.appendChild(carouselItem);
          if (containerCount === 1) {
            carouselblock.firstElementChild.classList.add('center');
          }
        }
      }
    } else if (multicardCenter || multicardRight) {
      const link = row.querySelector('a');
      if (link) {
        const linkCaed = createElementWithClasses('a', 'carousel-item');
        linkCaed.setAttribute('data-position', key + 1);
        const picture = row.querySelector('picture');
        linkCaed.append(picture);
        linkCaed.setAttribute('href', link.href);
        linkCaed.appendChild(link);
        block.append(linkCaed);
        row.textContent = '';
      }
    }
  });
  if (tabVarient) {
    block.appendChild(tabItems);
    block.appendChild(tabContainer);
    addTabEventListener(block);
  } else {
    block.classList.add('carousel-section');
    block.querySelectorAll('.carousel-item').forEach((element, index) => {
      if (index === getActiveSlide() - 1) {
        element.classList.add('center');
      }
      element.style.order = index + 1;
    });
  }
  addSliderButtons(block);
  setupCarousel(block);
  addEvents(block);
  addResizeEvent(block);
}

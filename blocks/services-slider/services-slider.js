import { createElementWithClasses } from '../../scripts/utils.js';

const auditArray = [
  { rowText: 1, colText: 5 },
  {
    rowText: 3, colText: 1, rowImg: 2, colImg: 2, pos: 'tr',
  },
  {
    rowText: 4, colText: 2, rowImg: 3, colImg: 3, pos: 'tr',
  },
  {
    rowText: 2, colText: 4, rowImg: 3, colImg: 5, pos: 'br',
  },
  {
    rowText: 2, colText: 6, rowImg: 2, colImg: 8, pos: 'cr',
  },
  {
    rowText: 3, colText: 7, rowImg: 4, colImg: 6, pos: 'bl',
  },
  {
    rowText: 3, colText: 9, rowImg: 4, colImg: 8, pos: 'bl',
  },
  {
    rowText: 2, colText: 10, rowImg: 2, colImg: 12, pos: 'cr',
  },
  {
    rowText: 3, colText: 11, rowImg: 4, colImg: 12, pos: 'br',
  }];

const designArray = [
  { rowText: 1, colText: 23 },
  {
    rowText: 3, colText: 15, rowImg: 3, colImg: 13, pos: 'cl',
  },
  {
    rowText: 4, colText: 16, rowImg: 4, colImg: 14, pos: 'cl',
  },
  {
    rowText: 3, colText: 17, rowImg: 2, colImg: 16, pos: 'tl',
  },
  {
    rowText: 3, colText: 19, rowImg: 4, colImg: 18, pos: 'bl',
  },
  {
    rowText: 4, colText: 20, rowImg: 4, colImg: 22, pos: 'cr',
  },
  {
    rowText: 3, colText: 21, rowImg: 2, colImg: 20, pos: 'tl',
  },
  {
    rowText: 2, colText: 22, rowImg: 3, colImg: 23, pos: 'br',
  },
  {
    rowText: 2, colText: 24, rowImg: 2, colImg: 26, pos: 'cr',
  },
  {
    rowText: 3, colText: 25, rowImg: 4, colImg: 26, pos: 'br',
  },
  {
    rowText: 4, colText: 28, rowImg: 3, colImg: 27, pos: 'tl',
  },
  {
    rowText: 2, colText: 28, rowImg: 2, colImg: 30, pos: 'cr',
  },
  {
    rowText: 3, colText: 29, rowImg: 4, colImg: 30, pos: 'br',
  },
  {
    rowText: 4, colText: 32, rowImg: 3, colImg: 31, pos: 'tl',
  },
  {
    rowText: 2, colText: 32, rowImg: 3, colImg: 33, pos: 'br',
  }];

const creativesArray = [
  { rowText: 1, colText: 37 },
  {
    rowText: 2, colText: 34, rowImg: 2, colImg: 36, pos: 'cr',
  },
  {
    rowText: 3, colText: 35, rowImg: 3, colImg: 37, pos: 'cr',
  },
  {
    rowText: 4, colText: 38, rowImg: 4, colImg: 36, pos: 'cl',
  },
  {
    rowText: 2, colText: 38, rowImg: 3, colImg: 39, pos: 'br',
  },
  {
    rowText: 3, colText: 41, rowImg: 2, colImg: 40, pos: 'tl',
  }];

const cellType = ['yellow-cell', 'sea-green-cell', 'macaroni-and-cheese-cell'];

const combineArrays = (arrays) => {
  const combinedArray = [];
  arrays.forEach((array) => {
    array.forEach((item) => {
      const row = item.rowText;
      const col = item.colText;
      combinedArray.push({ row, col });
      if (item.rowImg !== undefined && item.colImg !== undefined) {
        combinedArray.push({ row: item.rowImg, col: item.colImg });
      }
    });
  });
  return combinedArray;
};

function addPopupsModel(block) {
  const modal = createElementWithClasses('div', 'modal');
  modal.id = 'sliderModal';
  const modalContent = createElementWithClasses('div', 'modal-content');
  const close = createElementWithClasses('div', 'close');
  modal.appendChild(close);
  modal.appendChild(modalContent);
  block.appendChild(modal);
}

function addScrollAction(block) {
  const sliderAction = createElementWithClasses('div', 'scroll-action');
  const sliderRightAction = createElementWithClasses('div', 'scroll-right');
  sliderAction.appendChild(sliderRightAction);
  const sliderLeftAction = createElementWithClasses('div', 'scroll-left');
  sliderAction.appendChild(sliderLeftAction);
  block.parentElement.appendChild(sliderAction);
}

function generateCSS({ row, col }) {
  return `
    .honeycomb-cell.row-${row}.col-${col} {
      grid-row-start: ${row};
      grid-column: ${col} / span 2;
    }
  `;
}

function addStyles() {
  const combinedArray = combineArrays([auditArray, designArray, creativesArray]);
  const dynamicCSS = combinedArray.map(generateCSS).join('\n');
  const styleElement = document.createElement('style');
  styleElement.textContent = dynamicCSS;
  document.head.appendChild(styleElement);
}

function addEventListeners(block) {
  const images = block.querySelectorAll('.slider-image');
  images.forEach((image) => {
    image.addEventListener('click', (event) => {
      document.body.style.overflow = 'hidden';
      const modal = block.querySelector('#sliderModal');
      const modalContent = modal.querySelector('.modal-content');
      const popup = event.currentTarget.nextElementSibling;
      if (popup) {
        modalContent.innerHTML = popup.outerHTML;
        modal.style.display = 'block';
      }
    });
  });

  // add click event listener to the close button
  const close = block.querySelector('.close');
  close.addEventListener('click', () => {
    document.body.style.overflow = 'auto';
    const modal = block.querySelector('#sliderModal');
    modal.style.display = 'none';
  });
}

function createHexagonalBlock(block) {
  const rows = Array.from(block.children);
  let blockCount = -1;
  const hexagonalBlockContainer = createElementWithClasses('div', 'block');
  let rowKey = -1;
  const parentDiv = createElementWithClasses('div', 'honeycomb', cellType[blockCount]);
  block.appendChild(parentDiv);
  function processRow(row, key) {
    const isEmpty = row.lastElementChild.innerHTML === '';
    blockCount = isEmpty ? blockCount + 1 : blockCount;
    if (isEmpty) {
      rowKey = -1;
    }

    const firstChild = row.firstElementChild;
    const lastChild = row.lastElementChild;

    if (!isEmpty) {
      firstChild.firstElementChild?.classList.add('honeycomb-cell-title');
      firstChild.lastElementChild?.classList.add('honeycomb-cell-text');
      const PosDiv = createElementWithClasses('span', 'pos-bee');
      firstChild.appendChild(PosDiv);
      const pictureElm = lastChild.querySelectorAll('picture');
      const popupLink = lastChild.querySelector('a');
      const sliderData = createElementWithClasses('div', 'honeycomb-cell-image', 'slider-image', `slider-image-${key}`);
      sliderData.appendChild(pictureElm[0]);
      const popupData = createElementWithClasses('div', 'slider-popup', `slider-popup-${key}`);
      popupData.appendChild(pictureElm[1]);
      if (popupLink) {
        popupLink.setAttribute('download', '');
        popupData.appendChild(popupLink);
      }
      lastChild.textContent = '';
      lastChild.appendChild(sliderData);
      lastChild.appendChild(popupData);
    }

    const textDiv = createElementWithClasses('div', 'honeycomb-cell', cellType[blockCount]);
    const imgDiv = createElementWithClasses('div', 'honeycomb-cell', cellType[blockCount]);

    rowKey += 1;

    if (blockCount >= 0 && blockCount <= 2) {
      let structureArr;
      switch (blockCount) {
        case 0:
          structureArr = auditArray;
          break;
        case 1:
          structureArr = designArray;
          break;
        case 2:
          structureArr = creativesArray;
          break;
        default:
          structureArr = auditArray;
      }
      const pos = structureArr[rowKey]?.pos ? `pos-${structureArr[rowKey]?.pos}` : 'main-title';
      textDiv.classList.add(`row-${structureArr[rowKey]?.rowText}`, `col-${structureArr[rowKey]?.colText}`, pos);
      imgDiv.classList.add(`row-${structureArr[rowKey]?.rowImg}`, `col-${structureArr[rowKey]?.colImg}`);
    }

    if (lastChild.innerHTML !== '') {
      imgDiv.appendChild(lastChild);
      parentDiv.appendChild(imgDiv);
    }
    textDiv.appendChild(firstChild);
    parentDiv.appendChild(textDiv);

    hexagonalBlockContainer.appendChild(parentDiv);
  }
  rows.forEach((row, key) => {
    processRow(row, key);
  });

  return hexagonalBlockContainer;
}

let startX;
let startY;

function initScroll(block) {
  const scrollRight = document.querySelector('.scroll-right');
  const scrollLeft = document.querySelector('.scroll-left');
  const productListContainer = document.querySelector('.services-slider-wrapper .block');
  const scrollByAmount = 0.4 * window.innerWidth;
  const scroll = (direction) => {
    productListContainer.scrollBy({
      top: 0,
      left: direction * scrollByAmount,
      behavior: 'smooth',
    });
  };

  scrollRight.addEventListener('click', () => scroll(-1));
  scrollLeft.addEventListener('click', () => scroll(1));

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
          scroll(1);
        } else {
          scroll(-1);
        }
      }
    }

    startX = null;
    startY = null;
  });
}

/**
 * loads and decorates the scroller Popup
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const createdDiv = createHexagonalBlock(block);
  block.textContent = '';
  block.appendChild(createdDiv);
  addScrollAction(block);
  addPopupsModel(block);
  addEventListeners(block);
  addStyles();
  initScroll(block);
}

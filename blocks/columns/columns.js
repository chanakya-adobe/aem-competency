const counterAnimate = (target, start, end, suffix = '', duration = 1000) => {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    target.innerText = `${Math.floor(progress * (end - start) + start)}${suffix}`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
};

const triggerAnimation = (block) => {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const target = col.querySelector('p');
      let count = target.innerText;
      let suffix = '';
      if (Number.isNaN(Number(count))) {
        const len = count.length;
        count = target.innerText.substring(0, len - 1);
        suffix = target.innerText.substr(len - 1, 1);
      }
      counterAnimate(target, 0, count, suffix);
      target.innerText = `${count}${suffix}`;
    });
  });
};

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  if (block.classList.contains('counter')) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        triggerAnimation(block);
      }
    });
    observer.observe(block);
  }
}

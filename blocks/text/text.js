import loadAnimation from '../../scripts/utils.js';

// if the block contains animation call loadAnimation
export default async function decorate(block) {
  const animationName = Array.from(block.classList).find((className) => className.includes('animation-'));
  if (animationName) {
    const lottieDiv = document.createElement('div');
    lottieDiv.classList.add('lottie');
    lottieDiv.id = animationName;
    block.insertAdjacentElement('beforebegin', lottieDiv);
    loadAnimation(animationName);
  }
}

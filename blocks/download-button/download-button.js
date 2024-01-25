/**
 * loads and decorates the button to act as download
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const buttonLink = block.querySelector('a');
  const twoup = buttonLink.parentElement.parentElement;
  buttonLink.className = 'button secondary';
  twoup.classList.add('button-container');
  buttonLink.setAttribute('download', '');
}

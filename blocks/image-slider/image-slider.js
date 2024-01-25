export default async function decorate(block) {
  const parent = block.querySelector('picture').parentElement;
  const pictures = parent.querySelectorAll('picture');
  // duplicate pictures to create a slideshow
  pictures.forEach((picture) => {
    const clone = picture.cloneNode(true);
    parent.appendChild(clone);
  });
}

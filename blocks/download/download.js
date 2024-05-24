function addIcontoLink(links) {
  const parentElement = links.closest('.section.download');
  if (parentElement) {
    const spanIcon = document.createElement('span');
    spanIcon.classList.add('icon', 'icon-download');
    links.insertBefore(spanIcon, links.firstChild);
  }
}

function joinLinkstoOne(links) {
  if (links.length > 1 && links.every((link) => link.getAttribute('href') === links[0].getAttribute('href'))) {
    const firstChild = links[0];
    const parentNode = firstChild.parentNode.tagName === 'EM' ? firstChild.parentNode.parentNode : firstChild.parentNode;
    const singleLink = document.createElement('a');
    singleLink.href = firstChild.href;
    const span = document.createElement('span');

    // Move all child nodes of the <a> elements to the new <span> element
    links.forEach((link) => {
      const contentNode = link.parentNode.tagName === 'EM' ? document.createElement('em') : document.createElement('span');
      contentNode.innerHTML = link.innerHTML;
      span.appendChild(contentNode);
    });

    singleLink.appendChild(span);
    addIcontoLink(singleLink);
    singleLink.target = '_blank';
    parentNode.innerHTML = '';
    parentNode.appendChild(singleLink);
  } else if (links.length === 1) {
    const anchorElement = links[0];
    const spanElement = document.createElement('span');
    spanElement.innerHTML = anchorElement.innerHTML;
    anchorElement.innerHTML = '';
    anchorElement.target = '_blank';
    anchorElement.appendChild(spanElement);
    addIcontoLink(anchorElement);
  }
}

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

      // combine individual 'a' links to single 'a' link
      const links = Array.from(col.querySelectorAll('div>a,div>em>a'));
      joinLinkstoOne(links);
      const pTags = Array.from(col.querySelectorAll('div>p'));
      pTags.forEach((pTag) => {
        const pLinks = Array.from(pTag.querySelectorAll('a,em>a'));
        joinLinkstoOne(pLinks);
      });
    });
  });
}

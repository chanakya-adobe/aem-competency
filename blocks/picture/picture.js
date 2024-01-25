export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.children[1].classList.add(row.children[0].innerText);
    block.replaceChild(row.children[1], row);
  });
}

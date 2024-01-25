const createVideo = (block) => {
  if (block.classList.contains('video-is-loaded')) {
    return;
  }
  const content = {};
  [...block.children].forEach((row) => {
    if (row.children[0].innerText === 'poster') {
      content.poster = row.querySelector('img').src;
      return;
    }
    content[row.children[0].innerText] = row.querySelector('a')?.href;
  });
  content.mobile = content.mobile !== '' ? content.mobile : content.desktop;
  const isMobile = window.matchMedia('(max-width: 600px)').matches;
  const video = document.createElement('video');
  video.autoplay = true;
  video.controls = false;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.poster = content.poster.replace('format=png', 'format=webply');
  const source = document.createElement('source');
  source.src = isMobile ? content.mobile : content.desktop;
  source.type = 'video/mp4';
  video.appendChild(source);
  block.textContent = '';
  block.appendChild(video);
  block.classList.add('video-is-loaded');
};

export default function decorate(block) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      observer.disconnect();
      createVideo(block);
    }
  });
  observer.observe(block);
}

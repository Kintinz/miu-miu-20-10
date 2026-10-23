import { formatPhotoCounter, getAdjacentPhotoIndex } from './src/interaction-state.js';

const memoryPhotos = [
  { src: 'assets/memories/01-non-la.jpg', alt: 'Cô ấy đội nón lá giữa khung cảnh núi xanh', title: 'Một chuyến đi có em', caption: 'Đi đâu cũng thành một chuyến đi đáng nhớ khi có em.' },
  { src: 'assets/memories/02-le-thanh-hon.png', alt: 'Hai người đứng cạnh nhau trong ngày lễ thành hôn', title: 'Ngày mình về chung một nhà', caption: 'Một ngày thật đẹp, nơi câu chuyện của mình bước sang trang mới.' },
  { src: 'assets/memories/03-selfie-dem.jpg', alt: 'Hai người chụp selfie buổi tối bên những tòa tháp ánh sáng', title: 'Một buổi tối rất vui', caption: 'Chỉ cần đứng cạnh nhau, một buổi tối bình thường cũng đủ ấm áp.' },
  { src: 'assets/memories/04-cung-tren-may-bay.jpg', alt: 'Hai người ngồi cạnh nhau trên máy bay', title: 'Cùng nhau đi thật xa', caption: 'Có những chuyến bay ngắn nhưng lại mang theo rất nhiều kỷ niệm.' },
  { src: 'assets/memories/05-anh-cuoi.jpg', alt: 'Hai người trong trang phục cưới giữa không gian hoa trắng', title: 'Ngày hạnh phúc của mình', caption: 'Anh muốn giữ nụ cười này thật lâu, thật lâu nữa.' },
  { src: 'assets/memories/06-co-ay-ao-do.jpg', alt: 'Cô ấy mặc áo đỏ giữa những lá cờ Việt Nam', title: 'Cô gái anh thương nhất', caption: 'Dù em mặc màu gì, trong mắt anh em vẫn luôn rực rỡ.' },
  { src: 'assets/memories/07-phao-hoa.jpg', alt: 'Hai người đứng cạnh nhau dưới ánh pháo hoa màu tím', title: 'Một bầu trời đầy ánh sáng', caption: 'Có em bên cạnh, khoảnh khắc nào cũng trở nên lung linh hơn.' },
  { src: 'assets/memories/08-em-va-bup-be.jpg', alt: 'Cô ấy mỉm cười cùng những món đồ chơi đáng yêu', title: 'Em và những điều dễ thương', caption: 'Nhìn em vui vẻ là một trong những điều anh thích nhất.' },
  { src: 'assets/memories/09-nu-cuoi-cua-em.jpg', alt: 'Cô ấy mỉm cười trong một quán cà phê', title: 'Nụ cười anh muốn ngắm mãi', caption: 'Chỉ một nụ cười của em cũng đủ làm ngày của anh dịu lại.' },
  { src: 'assets/memories/10-ngay-cuoi-ruc-ro.jpg', alt: 'Hai người nắm tay nhau trong không gian lễ cưới rực rỡ', title: 'Ngày mình thật rực rỡ', caption: 'Anh vẫn nhớ cảm giác được cùng em bước qua những ánh đèn ấy.' },
  { src: 'assets/memories/11-em-mac-ao-hong.jpg', alt: 'Cô ấy mỉm cười trong chiếc áo màu hồng', title: 'Em dịu dàng như một buổi chiều', caption: 'Mỗi phiên bản của em đều là phiên bản anh thương.' },
  { src: 'assets/memories/12-bau-troi-cua-doi-minh.jpg', alt: 'Hai người chụp ảnh cùng nhau dưới bầu trời xanh', title: 'Một bầu trời có đôi mình', caption: 'Sau này mình sẽ còn lưu thêm thật nhiều khoảnh khắc như thế này.' },
];

const playlist = [
  { title: 'Chăm Em Một Đời', artist: 'Đức Phúc', src: 'assets/audio/cham-em-mot-doi.mp3' },
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const elements = {
  musicAudio: document.querySelector('#background-audio'),
  musicIndicator: document.querySelector('#music-indicator'),
  musicPlaylist: document.querySelector('#music-playlist'),
  musicPlaylistClose: document.querySelector('#music-playlist-close'),
  musicCurrentTrack: document.querySelector('#music-current-track'),
  musicTrackList: document.querySelector('#music-track-list'),
  musicPrevious: document.querySelector('#music-previous'),
  musicNext: document.querySelector('#music-next'),
  memoryCards: [...document.querySelectorAll('.memory-card')],
  photoButtons: [...document.querySelectorAll('[data-photo-index]')],
  photoModal: document.querySelector('#photo-modal'),
  photoModalClose: document.querySelector('#photo-modal-close'),
  photoModalImage: document.querySelector('#photo-modal-image'),
  photoModalCounter: document.querySelector('#photo-modal-counter'),
  photoModalTitle: document.querySelector('#photo-modal-title'),
  photoModalCaption: document.querySelector('#photo-modal-caption'),
  photoModalPrevious: document.querySelector('#photo-modal-previous'),
  photoModalNext: document.querySelector('#photo-modal-next'),
  letterEnvelope: document.querySelector('#letter-envelope'),
  letterModal: document.querySelector('#letter-modal'),
  letterModalClose: document.querySelector('#letter-modal-close'),
  letterModalStatus: document.querySelector('#letter-modal-status'),
  letterAnimationStage: document.querySelector('#letter-animation-stage'),
  finalButton: document.querySelector('#final-gift-button'),
  finalMessage: document.querySelector('#final-message'),
};

let activePhotoIndex = 0;
let photoModalReturnFocus = null;
let memoryObserver = null;
let letterOpened = false;
let letterFlight = null;
let letterTimers = [];
let activeTrackIndex = 0;

function updatePhotoModal() {
  const photo = memoryPhotos[activePhotoIndex];
  elements.photoModalImage.src = photo.src;
  elements.photoModalImage.alt = photo.alt;
  elements.photoModalCounter.textContent = formatPhotoCounter(activePhotoIndex, memoryPhotos.length);
  elements.photoModalTitle.textContent = photo.title;
  elements.photoModalCaption.textContent = photo.caption;
}

function openPhotoModal(photoIndex) {
  activePhotoIndex = photoIndex;
  updatePhotoModal();
  photoModalReturnFocus = document.activeElement;
  elements.photoModal.showModal();
  elements.photoModalClose.focus();
}

function closePhotoModal() {
  if (elements.photoModal.open) {
    elements.photoModal.close();
  }
}

function movePhoto(direction) {
  activePhotoIndex = getAdjacentPhotoIndex(activePhotoIndex, memoryPhotos.length, direction);
  updatePhotoModal();
}

function revealMemoryCard(card, observer) {
  card.classList.add('is-visible');
  observer?.unobserve(card);
}

function startMemoryReveal() {
  if (memoryObserver !== null || elements.memoryCards.length === 0) {
    return;
  }

  if (!('IntersectionObserver' in window)) {
    elements.memoryCards.forEach((card) => revealMemoryCard(card));
    return;
  }

  memoryObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        revealMemoryCard(entry.target, observer);
      }
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });

  elements.memoryCards.forEach((card) => memoryObserver.observe(card));
}

function updatePlaylistSelection() {
  const activeTrack = playlist[activeTrackIndex];
  elements.musicCurrentTrack.textContent = `${activeTrack.title} · ${activeTrack.artist}`;

  elements.musicTrackList.querySelectorAll('[data-track-index]').forEach((trackButton) => {
    const isActive = Number(trackButton.dataset.trackIndex) === activeTrackIndex;
    trackButton.classList.toggle('is-active', isActive);
    trackButton.setAttribute('aria-current', String(isActive));
  });
}

function renderPlaylist() {
  elements.musicTrackList.innerHTML = playlist.map((track, index) => `
    <button class="music-track" type="button" data-track-index="${index}" aria-current="${index === activeTrackIndex}" role="option">
      <span><strong>${track.title}</strong><small>${track.artist}</small></span>
      <span aria-hidden="true">♫</span>
    </button>
  `).join('');

  elements.musicTrackList.querySelectorAll('[data-track-index]').forEach((trackButton) => {
    trackButton.addEventListener('click', handleTrackSelect);
  });
  updatePlaylistSelection();
}

function loadTrack(trackIndex, shouldPlay = true) {
  activeTrackIndex = (trackIndex + playlist.length) % playlist.length;
  const track = playlist[activeTrackIndex];
  elements.musicAudio.src = track.src;
  elements.musicAudio.load();
  updatePlaylistSelection();

  if (shouldPlay) {
    tryStartMusic();
  }
}

function handleTrackSelect(event) {
  loadTrack(Number(event.currentTarget.dataset.trackIndex));
}

function handlePlaylistToggle() {
  const willOpen = elements.musicPlaylist.hidden;
  elements.musicPlaylist.hidden = !willOpen;
  elements.musicIndicator.setAttribute('aria-expanded', String(willOpen));
}

function handlePlaylistClose() {
  elements.musicPlaylist.hidden = true;
  elements.musicIndicator.setAttribute('aria-expanded', 'false');
}

function handleTrackEnded() {
  loadTrack(activeTrackIndex + 1);
}

function updateMusicIndicator(isPlaying) {
  const activeTrack = playlist[activeTrackIndex];
  elements.musicIndicator.setAttribute('aria-label', isPlaying
    ? `Đang phát ${activeTrack.title}. Mở danh sách nhạc`
    : 'Mở danh sách nhạc nền');
  elements.musicIndicator.classList.toggle('is-playing', isPlaying);
}

async function tryStartMusic() {
  elements.musicAudio.volume = 0.28;

  try {
    await elements.musicAudio.play();
    updateMusicIndicator(true);
  } catch {
    updateMusicIndicator(false);
  }
}

function revealLetter() {
  letterOpened = true;
  elements.letterAnimationStage.hidden = true;
  elements.finalMessage.hidden = false;
  elements.letterModal.classList.add('is-reading');
  elements.letterModalStatus.textContent = '';
  elements.finalButton.textContent = 'Đọc lại lá thư ♡';
  elements.finalMessage.focus({ preventScroll: true });
}

function scheduleLetterStep(callback, delay) {
  letterTimers.push(window.setTimeout(() => {
    if (elements.letterModal.open) {
      callback();
    }
  }, delay));
}

function handleLetterClick() {
  if (elements.letterModal.open) {
    return;
  }

  const sourceRect = elements.letterEnvelope.getBoundingClientRect();
  elements.letterModal.showModal();
  document.documentElement.classList.add('letter-modal-open');
  elements.finalButton.setAttribute('aria-expanded', 'true');
  elements.letterModalClose.focus({ preventScroll: true });

  if (letterOpened || prefersReducedMotion) {
    revealLetter();
    return;
  }

  const envelope = elements.letterEnvelope.cloneNode(true);
  envelope.removeAttribute('id');
  elements.letterAnimationStage.replaceChildren(envelope);
  elements.letterAnimationStage.hidden = false;
  elements.letterEnvelope.classList.add('is-in-modal');
  elements.letterModalStatus.textContent = 'Phong thư đang mở…';

  const targetRect = envelope.getBoundingClientRect();
  const deltaX = sourceRect.left + sourceRect.width / 2 - targetRect.left - targetRect.width / 2;
  const deltaY = sourceRect.top + sourceRect.height / 2 - targetRect.top - targetRect.height / 2;
  const scale = sourceRect.width / targetRect.width;
  const animation = envelope.animate([
    { transform: `translate(${deltaX}px, ${deltaY}px) scale(${scale}) rotate(10deg)` },
    { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
  ], { duration: 450, easing: 'cubic-bezier(.22, .75, .25, 1)', fill: 'backwards' });
  letterFlight = animation;

  animation.finished.then(() => {
    if (!elements.letterModal.open || letterFlight !== animation) {
      return;
    }

    envelope.classList.add('is-opening');
    scheduleLetterStep(() => {
      envelope.classList.add('is-open');
      scheduleLetterStep(revealLetter, 450);
    }, 650);
  }).catch(() => {
    // Closing the dialog cancels the flight before the letter is revealed.
  });
}

function closeLetterModal() {
  elements.letterModal.close();
}

function resetLetterModal() {
  letterFlight?.cancel();
  letterFlight = null;
  letterTimers.forEach(timer => window.clearTimeout(timer));
  letterTimers = [];
  elements.letterAnimationStage.replaceChildren();
  elements.letterAnimationStage.hidden = true;
  elements.letterEnvelope.classList.remove('is-in-modal');
  elements.finalMessage.hidden = true;
  elements.letterModal.classList.remove('is-reading');
  elements.letterModalStatus.textContent = '';
  document.documentElement.classList.remove('letter-modal-open');
  elements.finalButton.setAttribute('aria-expanded', 'false');
  elements.finalButton.focus({ preventScroll: true });
}

let musicInteractionHandled = false;
function startMusicAfterFirstInteraction() {
  if (musicInteractionHandled) {
    return;
  }

  musicInteractionHandled = true;
  tryStartMusic();
}

elements.photoButtons.forEach((button) => {
  button.addEventListener('click', () => openPhotoModal(Number(button.dataset.photoIndex)));
});
elements.photoModalClose.addEventListener('click', closePhotoModal);
elements.photoModalPrevious.addEventListener('click', () => movePhoto(-1));
elements.photoModalNext.addEventListener('click', () => movePhoto(1));
elements.photoModal.addEventListener('click', (event) => {
  if (event.target === elements.photoModal) {
    closePhotoModal();
  }
});
elements.photoModal.addEventListener('close', () => {
  if (photoModalReturnFocus && !photoModalReturnFocus.disabled) {
    photoModalReturnFocus.focus();
  }

  photoModalReturnFocus = null;
});
elements.musicIndicator.addEventListener('click', handlePlaylistToggle);
elements.musicPlaylistClose.addEventListener('click', handlePlaylistClose);
elements.musicPrevious.addEventListener('click', () => loadTrack(activeTrackIndex - 1));
elements.musicNext.addEventListener('click', () => loadTrack(activeTrackIndex + 1));
elements.musicAudio.addEventListener('ended', handleTrackEnded);
elements.finalButton.addEventListener('click', handleLetterClick);
elements.letterModalClose.addEventListener('click', closeLetterModal);
elements.letterModal.addEventListener('close', resetLetterModal);
elements.letterModal.addEventListener('click', (event) => {
  if (event.target === elements.letterModal) {
    closeLetterModal();
  }
});
document.addEventListener('pointerdown', startMusicAfterFirstInteraction, { once: true, passive: true });
document.addEventListener('keydown', startMusicAfterFirstInteraction, { once: true });

elements.memoryCards.forEach((card) => card.classList.remove('is-visible'));
startMemoryReveal();
renderPlaylist();
updateMusicIndicator(false);
tryStartMusic();

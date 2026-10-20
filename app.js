import {
  collectHeart,
  createModalContent,
  createInitialState,
  getAdjacentPhotoIndex,
  getFinalImageContent,
  getJourneyStep,
  formatPhotoCounter,
  isMemoryComplete,
  isFinalGiftUnlocked,
  openGift,
  openFinalGift,
  viewPhoto,
} from './src/interaction-state.js';

const giftCount = 3;
const heartCount = 5;
const photoCount = 12;
let missionState = createInitialState(giftCount, heartCount, photoCount);
let pendingJourneyScroll = null;
let memoryObserver = null;

const elements = {
  startButton: document.querySelector('#start-button'),
  mission: document.querySelector('#mission'),
  memorySection: document.querySelector('.memory-section'),
  heartSection: document.querySelector('.heart-section'),
  memoryProgress: document.querySelector('#memory-progress'),
  liveStatus: document.querySelector('#live-status'),
  progressLabel: document.querySelector('#progress-label'),
  progressPercent: document.querySelector('#progress-percent'),
  giftProgressFill: document.querySelector('#gift-progress-fill'),
  giftButtons: [...document.querySelectorAll('[data-gift-id]')],
  giftCards: [...document.querySelectorAll('[data-gift-card]')],
  heartButtons: [...document.querySelectorAll('[data-heart-id]')],
  heartCountLabel: document.querySelector('#heart-count-label'),
  heartRow: document.querySelector('#heart-row'),
  heartMessage: document.querySelector('#heart-message'),
  finalSection: document.querySelector('#final-gift'),
  finalCat: document.querySelector('#final-character-frame'),
  finalTitle: document.querySelector('#final-title'),
  finalDescription: document.querySelector('#final-description'),
  finalButton: document.querySelector('#final-gift-button'),
  finalMessage: document.querySelector('#final-message'),
  finalImage: document.querySelector('#final-character-image'),
  messageModal: document.querySelector('#message-modal'),
  messageModalClose: document.querySelector('#message-modal-close'),
  messageModalIcon: document.querySelector('#message-modal-icon'),
  messageModalKicker: document.querySelector('#message-modal-kicker'),
  messageModalTitle: document.querySelector('#message-modal-title'),
  messageModalBody: document.querySelector('#message-modal-body'),
  messageModalAction: document.querySelector('#message-modal-action'),
  musicAudio: document.querySelector('#background-audio'),
  musicIndicator: document.querySelector('#music-indicator'),
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
  siteFooter: document.querySelector('#site-footer'),
};

const heartMessages = [
  'Em rất quan trọng với anh.',
  'Ở bên em, ngày bình thường cũng thành ngày vui.',
  'Anh thích cả những lúc em hơi khó tính.',
  'Cảm ơn em vì luôn là chính mình.',
  'Anh yêu em nhiều hơn những gì Miu Miu nói được.',
];

const memoryPhotos = [
  {
    src: 'assets/memories/01-non-la.jpg',
    alt: 'Cô ấy đội nón lá giữa khung cảnh núi xanh',
    title: 'Một chuyến đi có em',
    caption: 'Đi đâu cũng thành một chuyến đi đáng nhớ khi có em.',
  },
  {
    src: 'assets/memories/02-le-thanh-hon.png',
    alt: 'Hai người đứng cạnh nhau trong ngày lễ thành hôn',
    title: 'Ngày mình về chung một nhà',
    caption: 'Một ngày thật đẹp, nơi câu chuyện của mình bước sang trang mới.',
  },
  {
    src: 'assets/memories/03-selfie-dem.jpg',
    alt: 'Hai người chụp selfie buổi tối bên những tòa tháp ánh sáng',
    title: 'Một buổi tối rất vui',
    caption: 'Chỉ cần đứng cạnh nhau, một buổi tối bình thường cũng đủ ấm áp.',
  },
  {
    src: 'assets/memories/04-cung-tren-may-bay.jpg',
    alt: 'Hai người ngồi cạnh nhau trên máy bay',
    title: 'Cùng nhau đi thật xa',
    caption: 'Có những chuyến bay ngắn nhưng lại mang theo rất nhiều kỷ niệm.',
  },
  {
    src: 'assets/memories/05-anh-cuoi.jpg',
    alt: 'Hai người trong trang phục cưới giữa không gian hoa trắng',
    title: 'Ngày hạnh phúc của mình',
    caption: 'Anh muốn giữ nụ cười này thật lâu, thật lâu nữa.',
  },
  {
    src: 'assets/memories/06-co-ay-ao-do.jpg',
    alt: 'Cô ấy mặc áo đỏ giữa những lá cờ Việt Nam',
    title: 'Cô gái anh thương nhất',
    caption: 'Dù em mặc màu gì, trong mắt anh em vẫn luôn rực rỡ.',
  },
  {
    src: 'assets/memories/07-phao-hoa.jpg',
    alt: 'Hai người đứng cạnh nhau dưới ánh pháo hoa màu tím',
    title: 'Một bầu trời đầy ánh sáng',
    caption: 'Có em bên cạnh, khoảnh khắc nào cũng trở nên lung linh hơn.',
  },
  {
    src: 'assets/memories/08-em-va-bup-be.jpg',
    alt: 'Cô ấy mỉm cười cùng những món đồ chơi đáng yêu',
    title: 'Em và những điều dễ thương',
    caption: 'Nhìn em vui vẻ là một trong những điều anh thích nhất.',
  },
  {
    src: 'assets/memories/09-nu-cuoi-cua-em.jpg',
    alt: 'Cô ấy mỉm cười trong một quán cà phê',
    title: 'Nụ cười anh muốn ngắm mãi',
    caption: 'Chỉ một nụ cười của em cũng đủ làm ngày của anh dịu lại.',
  },
  {
    src: 'assets/memories/10-ngay-cuoi-ruc-ro.jpg',
    alt: 'Hai người nắm tay nhau trong không gian lễ cưới rực rỡ',
    title: 'Ngày mình thật rực rỡ',
    caption: 'Anh vẫn nhớ cảm giác được cùng em bước qua những ánh đèn ấy.',
  },
  {
    src: 'assets/memories/11-em-mac-ao-hong.jpg',
    alt: 'Cô ấy mỉm cười trong chiếc áo màu hồng',
    title: 'Em dịu dàng như một buổi chiều',
    caption: 'Mỗi phiên bản của em đều là phiên bản anh thương.',
  },
  {
    src: 'assets/memories/12-bau-troi-cua-doi-minh.jpg',
    alt: 'Hai người chụp ảnh cùng nhau dưới bầu trời xanh',
    title: 'Một bầu trời có đôi mình',
    caption: 'Sau này mình sẽ còn lưu thêm thật nhiều khoảnh khắc như thế này.',
  },
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let modalReturnFocus = null;
let photoModalReturnFocus = null;
let activePhotoIndex = 0;

function announce(message) {
  elements.liveStatus.textContent = message;
}

function openMessageModal(type, content) {
  const modalContent = createModalContent(type, content);

  elements.messageModalIcon.textContent = modalContent.icon;
  elements.messageModalKicker.textContent = modalContent.kicker;
  elements.messageModalTitle.textContent = modalContent.title;
  elements.messageModalBody.textContent = modalContent.body;
  elements.messageModalAction.textContent = modalContent.actionLabel;
  modalReturnFocus = document.activeElement;
  elements.messageModal.showModal();
}

function closeMessageModal() {
  if (elements.messageModal.open) {
    elements.messageModal.close();
  }
}

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

function scrollToSection(section) {
  section.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
}

function unlockNextJourneySection(shouldScroll = false) {
  const journeySections = {
    mission: elements.mission,
    memory: elements.memorySection,
    hearts: elements.heartSection,
    final: elements.finalSection,
  };
  const nextSection = journeySections[getJourneyStep(missionState)];

  if (!nextSection) {
    return;
  }

  nextSection.hidden = false;
  nextSection.classList.add('is-unlocked');

  if (shouldScroll) {
    pendingJourneyScroll = nextSection;
  }

  if (nextSection === elements.memorySection) {
    startMemoryReveal();
  }
}

function flushPendingJourneyScroll() {
  if (!pendingJourneyScroll) {
    return;
  }

  const nextSection = pendingJourneyScroll;
  pendingJourneyScroll = null;
  scrollToSection(nextSection);
}

function startMemoryReveal() {
  if (memoryObserver !== null || elements.memoryCards.length === 0) {
    return;
  }

  if (!('IntersectionObserver' in window)) {
    elements.memoryCards.forEach((card) => {
      card.classList.add('is-visible');
      const photoButton = card.querySelector('[data-photo-index]');
      recordViewedPhoto(Number(photoButton.dataset.photoIndex));
    });
    return;
  }

  memoryObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const card = entry.target;
      const photoButton = card.querySelector('[data-photo-index]');
      card.classList.add('is-visible');
      observer.unobserve(card);
      recordViewedPhoto(Number(photoButton.dataset.photoIndex));
    });
  }, {
    threshold: 0.55,
    rootMargin: '0px 0px -8% 0px',
  });

  elements.memoryCards.forEach((card) => memoryObserver.observe(card));
}

function recordViewedPhoto(photoIndex) {
  const nextState = viewPhoto(missionState, `photo-${photoIndex + 1}`);

  if (nextState === missionState) {
    return;
  }

  missionState = nextState;
  updateMemoryProgress();
  announce(`Đã xem ${missionState.viewedPhotos.length} trên ${photoCount} ảnh kỷ niệm.`);

  if (isMemoryComplete(missionState)) {
    unlockNextJourneySection(true);
    announce('Đã xem đủ 12 ảnh kỷ niệm. Phần thu thập trái tim đã mở khóa.');

    if (!elements.photoModal.open && !elements.messageModal.open) {
      window.setTimeout(flushPendingJourneyScroll, prefersReducedMotion ? 0 : 360);
    }
  }
}

function updateMemoryProgress() {
  elements.memoryProgress.textContent = `Đã xem ${missionState.viewedPhotos.length}/${photoCount} ảnh`;
}

function updateGiftProgress() {
  const openedCount = missionState.openedGifts.length;
  const percent = Math.round((openedCount / giftCount) * 100);

  elements.progressLabel.textContent = `Đã mở ${openedCount}/${giftCount} hộp quà`;
  elements.progressPercent.textContent = `${percent}%`;
  elements.giftProgressFill.style.width = `${percent}%`;
}

function updateHeartProgress() {
  const collectedCount = missionState.collectedHearts.length;
  const heartSymbols = Array.from({ length: heartCount }, (_, index) =>
    index < collectedCount ? '♥' : '♡',
  );

  elements.heartCountLabel.textContent = `${collectedCount}/${heartCount} trái tim`;
  elements.heartRow.textContent = heartSymbols.join(' ');
}

function updateFinalGiftState() {
  if (!isFinalGiftUnlocked(missionState)) {
    return;
  }

  elements.finalButton.disabled = false;
  elements.finalSection.classList.add('is-unlocked');
  elements.finalTitle.textContent = 'Miu Miu đã sẵn sàng!';
  elements.heartMessage.textContent = 'Meo! Đủ yêu thương để mở quà rồi!';
  unlockNextJourneySection(true);
  announce('Đã đủ yêu thương. Hộp quà cuối cùng đã được mở khóa.');
}

function handleStart() {
  document.body.classList.add('mission-started');
  elements.startButton.textContent = 'Đã bắt đầu · đi thôi!';
  elements.startButton.disabled = true;
  unlockNextJourneySection();
  announce('Nhiệm vụ bắt đầu. Hãy mở ba hộp quà nhỏ nhé.');
  scrollToSection(elements.mission);
}

function handleGiftClick(event) {
  const button = event.currentTarget;
  const giftId = button.dataset.giftId;
  const nextState = openGift(missionState, giftId);

  if (nextState === missionState) {
    return;
  }

  missionState = nextState;
  const card = document.querySelector(`[data-gift-card="${giftId}"]`);
  card.classList.add('is-open');
  button.disabled = true;
  updateGiftProgress();

  const openedCount = missionState.openedGifts.length;
  announce(`Đã mở hộp quà ${openedCount} trên ${giftCount}.`);
  document.body.classList.add('cat-helping');
  const showGiftMessage = () => {
    const giftMessage = giftId === 'thanks'
      ? card.querySelector('.gift-open-message')
      : card.querySelector('.gift-message');

    openMessageModal('gift', {
      icon: card.querySelector('.gift-card-icon').dataset.giftIcon,
      title: card.querySelector('h3').textContent.trim(),
      body: giftMessage.textContent.trim(),
    });
  };

  if (giftId === 'thanks' && !prefersReducedMotion) {
    window.setTimeout(showGiftMessage, 720);
  } else {
    showGiftMessage();
  }

  if (openedCount === giftCount) {
    unlockNextJourneySection(true);
    announce('Đã mở đủ 3 hộp quà. Góc kỷ niệm đã mở khóa.');
  }
}

function handleHeartClick(event) {
  const button = event.currentTarget;
  const heartId = button.dataset.heartId;
  const heartIndex = Number(heartId.replace('heart-', '')) - 1;
  const nextState = collectHeart(missionState, heartId);

  if (nextState === missionState) {
    return;
  }

  missionState = nextState;
  button.classList.add('is-collected');
  button.disabled = true;
  elements.heartMessage.textContent = heartMessages[heartIndex];
  updateHeartProgress();
  announce(`Đã thu thập ${missionState.collectedHearts.length} trên ${heartCount} trái tim.`);

  if (isFinalGiftUnlocked(missionState)) {
    updateFinalGiftState();
  }

  openMessageModal('heart', {
    icon: '♥',
    title: 'Một điều anh muốn nói',
    body: heartMessages[heartIndex],
  });
}

function handleFinalGiftClick() {
  if (!isFinalGiftUnlocked(missionState)) {
    return;
  }

  missionState = openFinalGift(missionState);
  elements.finalButton.disabled = true;
  elements.finalButton.textContent = 'Đã mở quà ♥';
  elements.finalMessage.hidden = false;
  elements.finalSection.classList.add('is-complete');
  const finalImageContent = getFinalImageContent(true);
  elements.finalImage.src = finalImageContent.src;
  elements.finalImage.alt = finalImageContent.alt;
  elements.finalCat.setAttribute('aria-label', finalImageContent.alt);
  elements.siteFooter.hidden = false;
  document.body.classList.add('cat-celebrating');
  announce('Miu Miu đã hoàn thành nhiệm vụ. Chúc mừng 20/10!');
  openMessageModal('final', {
    icon: '▣',
    title: elements.finalMessage.querySelector('h2').textContent.trim(),
    body: [...elements.finalMessage.querySelectorAll('p:not(.eyebrow)')]
      .map((paragraph) => paragraph.textContent.trim())
      .join(' '),
  });
}

function updateMusicIndicator(isPlaying) {
  elements.musicIndicator.setAttribute('aria-label', isPlaying ? 'Nhạc nền đang phát' : 'Nhạc nền đang chờ phát');
  elements.musicIndicator.classList.toggle('is-playing', isPlaying);
}

async function tryStartMusic() {
  elements.musicAudio.volume = 0.28;

  try {
    await elements.musicAudio.play();
    updateMusicIndicator(true);
    announce('Nhạc nền đang bật.');
  } catch {
    updateMusicIndicator(false);
    announce('Nhạc nền sẽ tự phát sau tương tác đầu tiên.');
  }
}

let musicInteractionHandled = false;

function startMusicAfterFirstInteraction() {
  if (musicInteractionHandled) {
    return;
  }

  musicInteractionHandled = true;
  tryStartMusic();
}

elements.startButton.addEventListener('click', handleStart);
elements.giftButtons.forEach((button) => button.addEventListener('click', handleGiftClick));
elements.heartButtons.forEach((button) => button.addEventListener('click', handleHeartClick));
elements.finalButton.addEventListener('click', handleFinalGiftClick);
document.addEventListener('pointerdown', startMusicAfterFirstInteraction, { once: true, passive: true });
document.addEventListener('keydown', startMusicAfterFirstInteraction, { once: true });
elements.photoButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const photoIndex = Number(button.dataset.photoIndex);
    openPhotoModal(photoIndex);
  });
});
elements.messageModalClose.addEventListener('click', closeMessageModal);
elements.messageModalAction.addEventListener('click', closeMessageModal);
elements.messageModal.addEventListener('click', (event) => {
  if (event.target === elements.messageModal) {
    closeMessageModal();
  }
});
elements.messageModal.addEventListener('close', () => {
  if (modalReturnFocus && !modalReturnFocus.disabled) {
    modalReturnFocus.focus();
  }

  modalReturnFocus = null;
  flushPendingJourneyScroll();
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
  flushPendingJourneyScroll();
});

updateGiftProgress();
updateHeartProgress();
updateMemoryProgress();
updateMusicIndicator(false);
tryStartMusic();

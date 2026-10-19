import {
  collectHeart,
  createInitialState,
  isFinalGiftUnlocked,
  openGift,
} from './src/interaction-state.js';

const giftCount = 3;
const heartCount = 5;
let missionState = createInitialState(giftCount, heartCount);

const elements = {
  startButton: document.querySelector('#start-button'),
  mission: document.querySelector('#mission'),
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
  finalTitle: document.querySelector('#final-title'),
  finalDescription: document.querySelector('#final-description'),
  finalButton: document.querySelector('#final-gift-button'),
  finalMessage: document.querySelector('#final-message'),
};

const heartMessages = [
  'Em rất quan trọng với anh.',
  'Ở bên em, ngày bình thường cũng thành ngày vui.',
  'Anh thích cả những lúc em hơi khó tính.',
  'Cảm ơn em vì luôn là chính mình.',
  'Anh yêu em nhiều hơn những gì Miu Miu nói được.',
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function announce(message) {
  elements.liveStatus.textContent = message;
}

function scrollToMission() {
  elements.mission.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
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
  elements.finalDescription.textContent = 'Đủ yêu thương rồi. Em bấm mở chiếc hộp cuối cùng nhé.';
  elements.heartMessage.textContent = 'Meo! Đủ yêu thương để mở quà rồi!';
  announce('Đã đủ yêu thương. Hộp quà cuối cùng đã được mở khóa.');
}

function handleStart() {
  document.body.classList.add('mission-started');
  elements.startButton.textContent = 'Đã bắt đầu · đi thôi!';
  elements.startButton.disabled = true;
  announce('Nhiệm vụ bắt đầu. Hãy mở ba hộp quà nhỏ nhé.');
  scrollToMission();
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
}

function handleFinalGiftClick() {
  if (!isFinalGiftUnlocked(missionState)) {
    return;
  }

  elements.finalButton.disabled = true;
  elements.finalButton.textContent = 'Đã mở quà ♥';
  elements.finalMessage.hidden = false;
  elements.finalSection.classList.add('is-complete');
  document.body.classList.add('cat-celebrating');
  announce('Miu Miu đã hoàn thành nhiệm vụ. Chúc mừng 20/10!');

  elements.finalMessage.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'center',
  });
}

elements.startButton.addEventListener('click', handleStart);
elements.giftButtons.forEach((button) => button.addEventListener('click', handleGiftClick));
elements.heartButtons.forEach((button) => button.addEventListener('click', handleHeartClick));
elements.finalButton.addEventListener('click', handleFinalGiftClick);

updateGiftProgress();
updateHeartProgress();

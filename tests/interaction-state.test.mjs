import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  collectHeart,
  createModalContent,
  createInitialState,
  getAdjacentPhotoIndex,
  formatPhotoCounter,
  getFinalImageContent,
  getJourneyStep,
  isMemoryComplete,
  isFinalGiftUnlocked,
  openGift,
  openFinalGift,
  viewPhoto,
} from '../src/interaction-state.mjs';

const indexMarkup = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const appMarkup = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const stylesMarkup = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('uses simple line icons for gift cards and the final gift button', () => {
  const giftCardIcons = [...indexMarkup.matchAll(/<div class="gift-card-icon\b[\s\S]*?<\/div>/g)];
  const finalGiftButton = indexMarkup.match(/<button[^>]*id="final-gift-button"[\s\S]*?<\/button>/);

  assert.equal(giftCardIcons.length, 3);
  giftCardIcons.forEach(([markup]) => {
    assert.match(markup, /<svg\b/);
    assert.doesNotMatch(markup, /🌷|📸|💌/);
  });
  assert.ok(finalGiftButton);
  assert.match(finalGiftButton[0], /final-gift-icon/);
  assert.doesNotMatch(finalGiftButton[0], /🎁/);
});

test('uses transparent cutout assets for the separate male and female characters', () => {
  assert.match(indexMarkup, /assets\/characters\/anh-nam-cutout\.png/);
  assert.match(indexMarkup, /assets\/characters\/anh-nu-cutout\.png/);
});

test('models the thank-you card as an envelope with a letter to reveal', () => {
  const thanksCard = indexMarkup.match(/<article class="gift-card" data-gift-card="thanks">[\s\S]*?<\/article>/);

  assert.ok(thanksCard);
  assert.match(thanksCard[0], /thanks-envelope/);
  assert.match(thanksCard[0], /class="thanks-envelope-flap"/);
  assert.match(thanksCard[0], /class="thanks-envelope-letter"/);
  assert.match(thanksCard[0], />\s*Mở thư\s*</);
});

test('uses the full final letter message when the thank-you gift opens', () => {
  const thanksCard = indexMarkup.match(/<article class="gift-card" data-gift-card="thanks">[\s\S]*?<\/article>/);

  assert.ok(thanksCard);
  assert.match(thanksCard[0], /class="gift-open-message"/);
  assert.match(thanksCard[0], /Gửi vợ yêu của anh/);
  assert.match(thanksCard[0], /Anh thương em rất nhiều, và anh sẽ cố gắng trở thành người chồng tốt hơn mỗi ngày/);
  assert.match(appMarkup, /gift-open-message/);
  assert.match(
    stylesMarkup,
    /\.message-modal-body\s*\{[\s\S]*?white-space:\s*pre-line;/,
  );
});

test('uses a polished responsive scrollbar for the page and final message popup', () => {
  assert.match(stylesMarkup, /html::-webkit-scrollbar\s*\{/);
  assert.match(stylesMarkup, /html::-webkit-scrollbar-thumb\s*\{/);
  assert.match(
    stylesMarkup,
    /\.message-modal\s*\{[\s\S]*?max-height:\s*min\(calc\(100dvh - 24px\), 760px\);[\s\S]*?overflow-y:\s*auto;/,
  );
  assert.match(stylesMarkup, /\.message-modal::-webkit-scrollbar-thumb\s*\{/);
  assert.match(stylesMarkup, /\.message-modal\s*\{[\s\S]*?scrollbar-width:\s*thin;/);
});

test('keeps the final image uncropped and lets the thank-you envelope animate before its popup', () => {
  assert.doesNotMatch(
    stylesMarkup,
    /\.final-section\.is-complete\s+\.final-character-image[\s\S]*?object-fit:\s*cover;/,
  );

  const giftHandler = appMarkup.match(
    /function handleGiftClick\(event\) \{[\s\S]*?\n\}\n\nfunction handleHeartClick/,
  );

  assert.ok(giftHandler);
  assert.match(giftHandler[0], /giftId === 'thanks'/);
  assert.match(giftHandler[0], /setTimeout/);
  assert.match(giftHandler[0], /720/);
});

test('gives the memory heading enough horizontal space beside its aside', () => {
  assert.match(
    stylesMarkup,
    /\.section-heading-inline\s*\{[\s\S]*?max-width:\s*none;/,
  );
  assert.match(
    stylesMarkup,
    /\.section-heading-inline\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(220px,\s*250px\);/,
  );
});

test('reveals memory photos from scrolling instead of counting photo clicks', () => {
  assert.match(indexMarkup, /Lướt xuống để xem từng kỷ niệm/);
  assert.doesNotMatch(indexMarkup, /Bấm vào từng tấm ảnh để Miu Miu kể lại/);
  assert.match(appMarkup, /new IntersectionObserver\(/);
  assert.match(appMarkup, /memoryCards\.forEach\(\(card\) => memoryObserver\.observe\(card\)\)/);

  const photoClickHandler = appMarkup.match(
    /elements\.photoButtons\.forEach\(\(button\) => \{[\s\S]*?\n\}\);/,
  );

  assert.ok(photoClickHandler);
  assert.doesNotMatch(photoClickHandler[0], /recordViewedPhoto/);
  assert.match(photoClickHandler[0], /openPhotoModal\(photoIndex\)/);
  assert.doesNotMatch(
    appMarkup.match(/function movePhoto\([\s\S]*?\n\}/)?.[0] ?? '',
    /recordViewedPhoto/,
  );
});

test('keeps separate mobile and desktop memory layouts', () => {
  assert.match(
    stylesMarkup,
    /@media\s*\(max-width:\s*859px\)[\s\S]*?\.memory-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr;/,
  );
  assert.match(
    stylesMarkup,
    /@media\s*\(min-width:\s*860px\)[\s\S]*?\.section-heading-inline\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(220px,\s*250px\);/,
  );
});

test('creates a closed mission with configured gift, photo, and heart counts', () => {
  const state = createInitialState(3, 5, 12);

  assert.deepEqual(state, {
    openedGifts: [],
    viewedPhotos: [],
    collectedHearts: [],
    giftCount: 3,
    photoCount: 12,
    heartCount: 5,
    finalGiftOpened: false,
  });
});

test('renders a non-interactive music indicator with flying notes and fallback autoplay', () => {
  assert.match(indexMarkup, /id="music-indicator"/);
  assert.doesNotMatch(indexMarkup, /id="music-toggle"/);
  assert.equal([...indexMarkup.matchAll(/class="music-note\b/g)].length, 3);
  assert.match(indexMarkup, /aria-label="Nhạc nền đang phát"/);
  assert.match(stylesMarkup, /\.music-note[\s\S]*?opacity:\s*0;/);
  assert.match(stylesMarkup, /@keyframes music-note-float/);
  assert.doesNotMatch(appMarkup, /getMusicToggleContent/);
  assert.doesNotMatch(appMarkup, /handleMusicToggle/);
  assert.doesNotMatch(appMarkup, /elements\.musicToggle\.addEventListener/);
  assert.match(appMarkup, /pointerdown/);
});

test('selects the man image before completion and the couple image after opening the final gift', () => {
  assert.deepEqual(getFinalImageContent(false), {
    src: 'assets/characters/anh-nam-cutout.png',
    alt: 'Anh cầm hoa và hộp quà trong không gian hồng',
  });

  assert.deepEqual(getFinalImageContent(true), {
    src: 'assets/characters/hai-nguoi.png',
    alt: 'Hai người bên nhau trong lời chúc 20/10',
  });
});

test('opening the same gift twice only counts it once', () => {
  const initialState = createInitialState();
  const openedOnce = openGift(initialState, 'compliment');
  const openedTwice = openGift(openedOnce, 'compliment');

  assert.deepEqual(openedOnce.openedGifts, ['compliment']);
  assert.deepEqual(openedTwice.openedGifts, ['compliment']);
  assert.deepEqual(initialState.openedGifts, []);
});

test('viewing the same memory photo twice only counts it once', () => {
  const initialState = createInitialState(3, 5, 2);
  const viewedOnce = viewPhoto(initialState, 'photo-1');
  const viewedTwice = viewPhoto(viewedOnce, 'photo-1');

  assert.deepEqual(viewedOnce.viewedPhotos, ['photo-1']);
  assert.deepEqual(viewedTwice.viewedPhotos, ['photo-1']);
  assert.deepEqual(initialState.viewedPhotos, []);
});

test('memory section unlocks only after every configured photo is viewed', () => {
  let state = createInitialState(3, 5, 2);

  assert.equal(isMemoryComplete(state), false);
  state = viewPhoto(state, 'photo-1');
  assert.equal(isMemoryComplete(state), false);
  state = viewPhoto(state, 'photo-2');
  assert.equal(isMemoryComplete(state), true);
});

test('journey advances one section at a time', () => {
  let state = createInitialState(2, 2, 2);

  assert.equal(getJourneyStep(state), 'mission');
  state = openGift(state, 'gift-1');
  state = openGift(state, 'gift-2');
  assert.equal(getJourneyStep(state), 'memory');
  state = viewPhoto(state, 'photo-1');
  state = viewPhoto(state, 'photo-2');
  assert.equal(getJourneyStep(state), 'hearts');
  state = collectHeart(state, 'heart-1');
  state = collectHeart(state, 'heart-2');
  assert.equal(getJourneyStep(state), 'final');
  state = openFinalGift(state);
  assert.equal(getJourneyStep(state), 'complete');
});

test('collecting the same heart twice only counts it once', () => {
  const initialState = createInitialState();
  const collectedOnce = collectHeart(initialState, 'heart-1');
  const collectedTwice = collectHeart(collectedOnce, 'heart-1');

  assert.deepEqual(collectedOnce.collectedHearts, ['heart-1']);
  assert.deepEqual(collectedTwice.collectedHearts, ['heart-1']);
  assert.deepEqual(initialState.collectedHearts, []);
});

test('lets the heart garden accept any heart without a hinted target', () => {
  assert.match(indexMarkup, /Chọn bất kỳ trái tim nào/);
  assert.doesNotMatch(appMarkup, /startHeartHints|showNextHeartHint|is-hinted/);
  assert.doesNotMatch(stylesMarkup, /\.heart-button\.is-hinted|heart-hint/);

  let state = createInitialState(3, 5, 12);
  for (const heartId of ['heart-5', 'heart-2', 'heart-4', 'heart-1', 'heart-3']) {
    state = collectHeart(state, heartId);
  }

  assert.equal(isFinalGiftUnlocked(state), true);
});

test('wraps photo navigation from the first photo to the last photo', () => {
  assert.equal(getAdjacentPhotoIndex(0, 6, -1), 5);
});

test('wraps photo navigation from the last photo to the first photo', () => {
  assert.equal(getAdjacentPhotoIndex(5, 6, 1), 0);
});

test('moves one position when photo navigation stays within the gallery', () => {
  assert.equal(getAdjacentPhotoIndex(2, 6, 1), 3);
  assert.equal(getAdjacentPhotoIndex(2, 6, -1), 1);
});

test('formats the photo counter for an expanded gallery', () => {
  assert.equal(formatPhotoCounter(0, 12), 'Ảnh 1/12');
  assert.equal(formatPhotoCounter(11, 12), 'Ảnh 12/12');
});

test('creates the correct popup framing for each interaction type', () => {
  assert.deepEqual(createModalContent('gift', {
    icon: '🌷',
    title: 'Điều anh thích ở em',
    body: 'Cách em luôn quan tâm đến những điều rất nhỏ.',
  }), {
    icon: '🌷',
    kicker: 'Miu Miu mở một hộp quà',
    title: 'Điều anh thích ở em',
    body: 'Cách em luôn quan tâm đến những điều rất nhỏ.',
    actionLabel: 'Tiếp tục',
  });

  assert.equal(createModalContent('heart', {
    icon: '♥',
    title: 'Một điều anh muốn nói',
    body: 'Em rất quan trọng với anh.',
  }).actionLabel, 'Tìm tiếp');

  assert.equal(createModalContent('final', {
    icon: '🎁',
    title: 'Chúc mừng 20/10',
    body: 'Cảm ơn em.',
  }).kicker, 'Nhiệm vụ hoàn thành');

});

test('final gift unlocks only after all configured hearts are collected', () => {
  let state = createInitialState(3, 2);

  assert.equal(isFinalGiftUnlocked(state), false);
  state = collectHeart(state, 'heart-1');
  assert.equal(isFinalGiftUnlocked(state), false);
  state = collectHeart(state, 'heart-2');
  assert.equal(isFinalGiftUnlocked(state), true);
});

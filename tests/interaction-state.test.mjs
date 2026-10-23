import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  formatPhotoCounter,
  getAdjacentPhotoIndex,
} from '../src/interaction-state.mjs';

const indexMarkup = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const appMarkup = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const moreMemoriesMarkup = readFileSync(new URL('../more-memories.html', import.meta.url), 'utf8');
const moreMemoriesAppMarkup = readFileSync(new URL('../more-memories.js', import.meta.url), 'utf8');
const extraMemoriesManifest = readFileSync(new URL('../assets/memories-extra/manifest.js', import.meta.url), 'utf8');
const stylesMarkup = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('publishes the selected social preview metadata', () => {
  assert.match(indexMarkup, /<meta property="og:type" content="website" \/>/);
  assert.match(indexMarkup, /content="https:\/\/kintinz\.github\.io\/miu-miu-20-10\/assets\/social-preview\.png"/);
  assert.match(indexMarkup, /<meta name="twitter:card" content="summary_large_image" \/>/);
});

test('renders the public page as a directly visible memory archive', () => {
  assert.match(indexMarkup, />\s*Kho lưu trữ kỷ niệm\s*</);
  assert.match(indexMarkup, />\s*Những ngày mình đã đi qua\s*</);
  assert.match(indexMarkup, />\s*12 kỷ niệm được lưu lại\s*</);
  assert.match(indexMarkup, /<section class="memory-section archive-section section-wrap"[^>]*aria-labelledby="memory-title"[^>]*>/);
  assert.doesNotMatch(indexMarkup, /class="mission-section/);
  assert.doesNotMatch(indexMarkup, /class="heart-section/);
  assert.equal([...indexMarkup.matchAll(/data-photo-index="\d+"/g)].length, 12);
});

test('keeps the couple and separate character assets available', () => {
  assert.match(indexMarkup, /assets\/characters\/hai-nguoi\.png/);
  assert.match(indexMarkup, /assets\/characters\/anh-nu-cutout\.png/);
});

test('keeps the 12 memory cards as scroll-revealed cards without click counting', () => {
  assert.match(indexMarkup, /Lướt xuống để xem từng mảnh ghép/);
  assert.match(appMarkup, /new IntersectionObserver\(/);
  assert.match(appMarkup, /memoryCards\.forEach\(\(card\) => memoryObserver\.observe\(card\)\)/);
  assert.doesNotMatch(appMarkup, /recordViewedPhoto|viewPhoto\(/);
  assert.doesNotMatch(appMarkup, /missionState|getJourneyStep|unlockNextJourneySection/);
});

test('provides a separate empty-ready page for future memory uploads', () => {
  assert.match(indexMarkup, /href="more-memories\.html"/);
  assert.match(moreMemoriesMarkup, /Kho ảnh bổ sung/);
  assert.match(moreMemoriesMarkup, /id="extra-memory-grid"/);
  assert.match(moreMemoriesMarkup, /id="extra-memory-empty"/);
  assert.match(moreMemoriesMarkup, /src="\.\/more-memories\.js"/);
  assert.match(moreMemoriesAppMarkup, /import { extraMemories } from '\.\/assets\/memories-extra\/manifest\.js';/);
  assert.match(moreMemoriesAppMarkup, /extraMemories\.length/);
  assert.match(extraMemoriesManifest, /export const extraMemories = \[\];/);
});

test('keeps separate mobile and desktop memory layouts', () => {
  assert.match(stylesMarkup, /@media\s*\(max-width:\s*859px\)[\s\S]*?\.memory-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr;/);
  assert.match(stylesMarkup, /\.scrapbook-page \.memory-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\);/);
  assert.match(stylesMarkup, /@media\s*\(max-width:\s*859px\)[\s\S]*?\.scrapbook-page \.memory-grid\s*\{[^}]*grid-template-columns:\s*1fr;/);
});

test('renders the music disc with flying notes and autoplay fallback', () => {
  assert.match(indexMarkup, /id="background-audio" autoplay/);
  assert.equal([...indexMarkup.matchAll(/class="music-note\b/g)].length, 3);
  assert.match(stylesMarkup, /@keyframes music-note-float/);
  assert.match(appMarkup, /document\.addEventListener\('pointerdown', startMusicAfterFirstInteraction/);
});

test('exposes a selectable playlist without a music-off control', () => {
  assert.match(indexMarkup, /id="music-indicator"[^>]*aria-controls="music-playlist"/);
  assert.match(indexMarkup, /id="music-playlist"/);
  assert.match(indexMarkup, /assets\/audio\/cham-em-mot-doi\.mp3/);
  assert.match(indexMarkup, /data-track-index="0"[^>]*aria-current="true"/);
  assert.match(indexMarkup, /id="music-previous"/);
  assert.match(indexMarkup, /id="music-next"/);
  assert.doesNotMatch(indexMarkup, /id="music-toggle"/);
  assert.match(appMarkup, /const playlist = \[/);
  assert.match(appMarkup, /handleTrackSelect/);
});

test('renders the final wish as a directly accessible envelope letter', () => {
  assert.match(indexMarkup, /id="final-letter"/);
  assert.doesNotMatch(indexMarkup, /id="final-letter"[^>]*\shidden/);
  assert.match(indexMarkup, /class="letter-envelope-flap"/);
  assert.match(indexMarkup, /class="letter-paper"/);
  assert.match(indexMarkup, /id="final-gift-button"[^>]*aria-controls="letter-modal"[^>]*aria-expanded="false"[^>]*>[\s\S]*Mở lá thư/);
  assert.match(indexMarkup, /Anh thương em rất nhiều, và anh sẽ cố gắng trở thành người chồng tốt hơn mỗi ngày/);
  assert.doesNotMatch(indexMarkup, /Món quà thật của em đang chờ ở ngoài đời/);
  assert.match(indexMarkup, /<dialog[^>]*id="letter-modal"/);
  assert.match(indexMarkup, /id="letter-modal-close"/);
  assert.match(appMarkup, /finalButton\.setAttribute\('aria-expanded', 'true'\)/);
  assert.doesNotMatch(appMarkup, /finalButton\.disabled = true/);
  assert.match(stylesMarkup, /\.letter-envelope\.is-open \.letter-paper/);
});

test('keeps the photo lightbox controls and responsive scrollbar styling', () => {
  assert.match(indexMarkup, /id="photo-modal"/);
  assert.match(indexMarkup, /id="photo-modal-previous"/);
  assert.match(indexMarkup, /id="photo-modal-next"/);
  assert.match(stylesMarkup, /html::-webkit-scrollbar\s*\{/);
  assert.match(stylesMarkup, /html::-webkit-scrollbar-thumb\s*\{/);
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

test('formats the photo counter for the 12-photo archive', () => {
  assert.equal(formatPhotoCounter(0, 12), 'Ảnh 1/12');
  assert.equal(formatPhotoCounter(11, 12), 'Ảnh 12/12');
});

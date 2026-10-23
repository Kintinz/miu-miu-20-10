import { formatPhotoCounter, getAdjacentPhotoIndex } from './src/interaction-state.js';
import { extraMemories } from './assets/memories-extra/manifest.js';

const elements = {
  grid: document.querySelector('#extra-memory-grid'),
  emptyState: document.querySelector('#extra-memory-empty'),
  modal: document.querySelector('#extra-photo-modal'),
  modalClose: document.querySelector('#extra-photo-close'),
  modalImage: document.querySelector('#extra-photo-image'),
  modalCounter: document.querySelector('#extra-photo-counter'),
  modalTitle: document.querySelector('#extra-photo-title'),
  modalCaption: document.querySelector('#extra-photo-caption'),
  modalPrevious: document.querySelector('#extra-photo-previous'),
  modalNext: document.querySelector('#extra-photo-next'),
};

let activePhotoIndex = 0;
let modalReturnFocus = null;

function updateModal() {
  const photo = extraMemories[activePhotoIndex];
  elements.modalImage.src = photo.src;
  elements.modalImage.alt = photo.alt;
  elements.modalCounter.textContent = formatPhotoCounter(activePhotoIndex, extraMemories.length);
  elements.modalTitle.textContent = photo.title;
  elements.modalCaption.textContent = photo.caption;
}

function openModal(photoIndex) {
  activePhotoIndex = photoIndex;
  updateModal();
  modalReturnFocus = document.activeElement;
  elements.modal.showModal();
  elements.modalClose.focus();
}

function closeModal() {
  if (elements.modal.open) {
    elements.modal.close();
  }
}

function movePhoto(direction) {
  activePhotoIndex = getAdjacentPhotoIndex(activePhotoIndex, extraMemories.length, direction);
  updateModal();
}

function renderExtraMemories() {
  elements.grid.replaceChildren();
  elements.emptyState.hidden = extraMemories.length > 0;

  extraMemories.forEach((photo, index) => {
    const card = document.createElement('article');
    card.className = 'extra-memory-card';

    const button = document.createElement('button');
    button.className = 'memory-photo memory-photo-button';
    button.type = 'button';
    button.setAttribute('aria-label', `Mở ảnh: ${photo.title}`);
    button.addEventListener('click', () => openModal(index));

    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = photo.alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    button.append(image);

    const copy = document.createElement('div');
    copy.className = 'extra-memory-copy';

    const title = document.createElement('h3');
    title.textContent = photo.title;
    const caption = document.createElement('p');
    caption.textContent = photo.caption;
    copy.append(title, caption);
    card.append(button, copy);
    elements.grid.append(card);
  });
}

elements.modalClose.addEventListener('click', closeModal);
elements.modalPrevious.addEventListener('click', () => movePhoto(-1));
elements.modalNext.addEventListener('click', () => movePhoto(1));
elements.modal.addEventListener('click', (event) => {
  if (event.target === elements.modal) {
    closeModal();
  }
});
elements.modal.addEventListener('close', () => {
  if (modalReturnFocus && !modalReturnFocus.disabled) {
    modalReturnFocus.focus();
  }
  modalReturnFocus = null;
});

renderExtraMemories();

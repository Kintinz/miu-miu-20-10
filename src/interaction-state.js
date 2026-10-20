export function createInitialState(giftCount = 3, heartCount = 5, photoCount = 12) {
  return {
    openedGifts: [],
    viewedPhotos: [],
    collectedHearts: [],
    giftCount,
    photoCount,
    heartCount,
    finalGiftOpened: false,
  };
}

export function openGift(state, giftId) {
  if (state.openedGifts.includes(giftId)) {
    return state;
  }

  return {
    ...state,
    openedGifts: [...state.openedGifts, giftId],
  };
}

export function viewPhoto(state, photoId) {
  if (state.viewedPhotos.includes(photoId)) {
    return state;
  }

  return {
    ...state,
    viewedPhotos: [...state.viewedPhotos, photoId],
  };
}

export function collectHeart(state, heartId) {
  if (state.collectedHearts.includes(heartId)) {
    return state;
  }

  return {
    ...state,
    collectedHearts: [...state.collectedHearts, heartId],
  };
}

export function getAdjacentPhotoIndex(currentIndex, photoCount, direction) {
  return (currentIndex + direction + photoCount) % photoCount;
}

export function formatPhotoCounter(photoIndex, photoCount) {
  return `Ảnh ${photoIndex + 1}/${photoCount}`;
}

export function isMemoryComplete(state) {
  return state.viewedPhotos.length >= state.photoCount;
}

export function getFinalImageContent(isComplete) {
  return isComplete
    ? {
        src: 'assets/characters/hai-nguoi.png',
        alt: 'Hai người bên nhau trong lời chúc 20/10',
      }
    : {
        src: 'assets/characters/anh-nam-cutout.png',
        alt: 'Anh cầm hoa và hộp quà trong không gian hồng',
      };
}

export function createModalContent(type, content) {
  const modalDefaults = {
    gift: {
      kicker: 'Miu Miu mở một hộp quà',
      actionLabel: 'Tiếp tục',
    },
    heart: {
      kicker: 'Miu Miu nhặt được một trái tim',
      actionLabel: 'Tìm tiếp',
    },
    final: {
      kicker: 'Nhiệm vụ hoàn thành',
      actionLabel: 'Đóng lời chúc',
    },
  };

  return {
    ...content,
    ...modalDefaults[type],
  };
}

export function openFinalGift(state) {
  if (state.finalGiftOpened) {
    return state;
  }

  return {
    ...state,
    finalGiftOpened: true,
  };
}

export function isFinalGiftUnlocked(state) {
  return state.collectedHearts.length >= state.heartCount;
}

export function getJourneyStep(state) {
  if (state.openedGifts.length < state.giftCount) {
    return 'mission';
  }

  if (!isMemoryComplete(state)) {
    return 'memory';
  }

  if (!isFinalGiftUnlocked(state)) {
    return 'hearts';
  }

  if (!state.finalGiftOpened) {
    return 'final';
  }

  return 'complete';
}

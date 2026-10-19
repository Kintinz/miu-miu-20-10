export function createInitialState(giftCount = 3, heartCount = 5) {
  return {
    openedGifts: [],
    collectedHearts: [],
    giftCount,
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

export function collectHeart(state, heartId) {
  if (state.collectedHearts.includes(heartId)) {
    return state;
  }

  return {
    ...state,
    collectedHearts: [...state.collectedHearts, heartId],
  };
}

export function isFinalGiftUnlocked(state) {
  return state.collectedHearts.length >= state.heartCount;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  collectHeart,
  createInitialState,
  isFinalGiftUnlocked,
  openGift,
} from '../src/interaction-state.mjs';

test('creates a closed mission with configured gift and heart counts', () => {
  const state = createInitialState(3, 5);

  assert.deepEqual(state, {
    openedGifts: [],
    collectedHearts: [],
    giftCount: 3,
    heartCount: 5,
    finalGiftOpened: false,
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

test('collecting the same heart twice only counts it once', () => {
  const initialState = createInitialState();
  const collectedOnce = collectHeart(initialState, 'heart-1');
  const collectedTwice = collectHeart(collectedOnce, 'heart-1');

  assert.deepEqual(collectedOnce.collectedHearts, ['heart-1']);
  assert.deepEqual(collectedTwice.collectedHearts, ['heart-1']);
  assert.deepEqual(initialState.collectedHearts, []);
});

test('final gift unlocks only after all configured hearts are collected', () => {
  let state = createInitialState(3, 2);

  assert.equal(isFinalGiftUnlocked(state), false);
  state = collectHeart(state, 'heart-1');
  assert.equal(isFinalGiftUnlocked(state), false);
  state = collectHeart(state, 'heart-2');
  assert.equal(isFinalGiftUnlocked(state), true);
});

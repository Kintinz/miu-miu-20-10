import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../app.js', import.meta.url), 'utf8').replace(/^import[^\n]+\n/, '');

function setup(reducedMotion = false) {
  const timers = new Map();
  const animations = [];
  const nodes = new Map();
  let nextTimer = 0;
  let focused = null;

  class Element {
    constructor() {
      this.hidden = true;
      this.open = false;
      this.disabled = false;
      this.children = [];
      this.attributes = new Map();
      this.listeners = new Map();
      const classes = new Set();
      this.classList = { add: (...names) => names.forEach(name => classes.add(name)), remove: (...names) => names.forEach(name => classes.delete(name)), contains: name => classes.has(name), toggle: () => {} };
    }
    addEventListener(name, handler) { this.listeners.set(name, handler); }
    emit(name, event = {}) { this.listeners.get(name)?.({ target: this, ...event }); }
    querySelectorAll() { return []; }
    setAttribute(name, value) { this.attributes.set(name, value); }
    removeAttribute(name) { this.attributes.delete(name); }
    cloneNode() { return new Element(); }
    append(child) { this.children.push(child); }
    replaceChildren(...children) { this.children = children; }
    getBoundingClientRect() { return { left: 20, top: 100, width: 300, height: 210 }; }
    showModal() { this.open = true; }
    close() { this.open = false; this.emit('close'); }
    focus() { focused = this; }
    play() { return Promise.resolve(); }
    animate(keyframes, options) {
      let resolve;
      let reject;
      const finished = new Promise((yes, no) => { resolve = yes; reject = no; });
      const animation = { keyframes, options, finished, finish: resolve, cancel: () => reject(new Error('cancelled')) };
      animations.push(animation);
      return animation;
    }
  }

  const document = {
    querySelector: selector => {
      if (!nodes.has(selector)) nodes.set(selector, new Element());
      return nodes.get(selector);
    },
    querySelectorAll: () => [],
    documentElement: new Element(),
    addEventListener: () => {},
  };
  const window = {
    matchMedia: () => ({ matches: reducedMotion }),
    setTimeout: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
  };
  vm.runInNewContext(source, { document, window, formatPhotoCounter: () => '', getAdjacentPhotoIndex: () => 0 });

  return {
    get: selector => document.querySelector(selector),
    animations,
    timers,
    focused: () => focused,
    tick() {
      assert.equal(timers.size, 1, 'only the current letter stage should be scheduled');
      const [id, timer] = timers.entries().next().value;
      timers.delete(id);
      timer.callback();
      return timer.delay;
    },
  };
}

test('flies the envelope before opening and revealing the letter, then allows reading again', async () => {
  const ui = setup();
  ui.get('#final-gift-button').emit('click');
  assert.equal(ui.get('#letter-modal').open, true);
  assert.equal(ui.get('#final-message').hidden, true);
  assert.equal(ui.animations.length, 1);
  assert.equal(ui.animations[0].options.duration, 450);
  const envelope = ui.get('#letter-animation-stage').children[0];
  assert.equal(envelope.classList.contains('is-opening'), false);
  ui.animations[0].finish();
  await Promise.resolve();
  assert.equal(envelope.classList.contains('is-opening'), true);
  assert.equal(ui.tick(), 650);
  assert.equal(envelope.classList.contains('is-open'), true);
  assert.equal(ui.get('#final-message').hidden, true);
  assert.equal(ui.tick(), 450);
  assert.equal(ui.get('#final-message').hidden, false);
  assert.equal(ui.get('#final-gift-button').textContent, 'Đọc lại lá thư ♡');
  ui.get('#letter-modal-close').emit('click');
  assert.equal(ui.get('#letter-modal').open, false);
  assert.equal(ui.focused(), ui.get('#final-gift-button'));
  ui.get('#final-gift-button').emit('click');
  assert.equal(ui.get('#final-message').hidden, false);
  assert.equal(ui.animations.length, 1, 'reading again skips the opening sequence');
});

test('closing during animation cancels pending work and a new opening starts cleanly', async () => {
  const ui = setup();
  ui.get('#final-gift-button').emit('click');
  ui.get('#letter-modal').close();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(ui.get('#letter-envelope').classList.contains('is-in-modal'), false);
  assert.equal(ui.timers.size, 0);
  ui.get('#final-gift-button').emit('click');
  assert.equal(ui.animations.length, 2);
  ui.animations[1].finish();
  await Promise.resolve();
  ui.tick();
  ui.get('#letter-modal').close();
  assert.equal(ui.timers.size, 0);
  assert.equal(ui.get('#final-message').hidden, true);
  assert.equal(ui.get('#final-gift-button').attributes.get('aria-expanded'), 'false');
});

test('reduced motion shows the letter immediately without flight or timers', () => {
  const ui = setup(true);
  ui.get('#final-gift-button').emit('click');
  assert.equal(ui.get('#letter-modal').open, true);
  assert.equal(ui.get('#final-message').hidden, false);
  assert.equal(ui.animations.length, 0);
  assert.equal(ui.timers.size, 0);
  assert.equal(ui.get('#final-gift-button').disabled, false);
});

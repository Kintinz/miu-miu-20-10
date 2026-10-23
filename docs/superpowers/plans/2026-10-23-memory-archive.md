# Kho lưu trữ kỷ niệm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Chuyển trang 20/10 thành kho lưu trữ kỷ niệm với 12 ảnh chính, playlist chọn bài và một trang archive mở rộng để nhận thêm ảnh từ repo sau này.

**Architecture:** Giữ nền tảng static HTML/CSS/JS hiện tại. Trang chính bỏ mission/gating và render archive trực tiếp; playlist dùng một mảng cấu hình tĩnh với bài MP3 hiện có; `more-memories.html` đọc manifest tĩnh riêng để hiển thị ảnh bổ sung mà không ảnh hưởng 12 ảnh trên trang chính.

**Tech Stack:** HTML, CSS, vanilla JavaScript ES modules, Node built-in test runner, GitHub Pages static hosting.

**Spec:** `docs/superpowers/specs/2026-10-23-memory-archive-design.md`

## Continuation record — 2026-10-23

- Resumed the existing uncommitted archive implementation; no prior work was reset.
- User approved the new scrapbook reference while preserving real assets/content.
  This supersedes the previous three-column desktop layout: desktop now has four
  columns; mobile has horizontal text/photo cards in one column.
- Before editing, copied the affected existing files to
  `C:/Users/CNTT-006/AppData/Local/Temp/miu-archive-20261023-120057/`.
- Updated the existing responsive layout assertion and observed it fail before
  implementing the new layout; the full suite subsequently passed 14/14.
- Implemented the visual continuation in `index.html`, scoped rules in
  `styles.css`, and `assets/archive-botanical.svg`. No dependency or config changes.
- Browser verified: photo modal opens; previous from photo 1 wraps to 12; Escape
  closes and returns focus; playlist opens, selects the existing track, and its
  previous/next controls stay on the single valid track; letter reveals the full
  existing wording; extended archive displays its empty state.
- Browser verified all 12 cards reveal after scrolling. Responsive checks and
  screenshots use emulated browser viewports, not physical phones. Real-device
  playback and hosted GitHub Pages behavior remain unverified.
- Static review found no important functional regressions in the scrapbook changes.
- No commit, push or deployment performed.

## Global Constraints

- Trang chính thay trực tiếp trang hiện tại tại URL GitHub Pages, không tạo route mới.
- Trang chính giữ đúng 12 ảnh hiện có, cùng thứ tự, caption và alt text.
- Không còn mission, progress counter, click-counting, heart garden hoặc gating.
- Không tạo file âm thanh giả; playlist ban đầu chỉ dùng `assets/audio/cham-em-mot-doi.mp3`.
- Không upload hoặc ghi file vào repo từ trình duyệt.
- Ảnh bổ sung chỉ hiển thị ở `more-memories.html` qua `assets/memories-extra/manifest.js`.
- Không thêm dependency, không thay đổi social preview, character assets hoặc lời chúc đã chốt.
- Không push/deploy trong phạm vi plan này.
- Giữ `prefers-reduced-motion`, keyboard focus và responsive desktop/mobile.

## Review Focus

- Trang archive chính phải mở trực tiếp mà không phụ thuộc trạng thái mission cũ.
- Playlist một bài không làm hỏng nút trước/tiếp và không hiển thị mục không có file.
- Autoplay bị trình duyệt chặn vẫn có fallback ở tương tác đầu tiên.
- Manifest rỗng phải hiển thị empty state; manifest có ảnh phải render đúng alt/title/caption.
- Mobile không bị overflow bởi playlist panel, lightbox hoặc grid ảnh bổ sung.

---

### Task 1: Replace mission flow with the main memory archive

**Files:**
- Modify: `tests/interaction-state.test.mjs`
- Modify: `index.html`
- Modify: `app.js`
- Modify: `styles.css`
- Modify: `src/interaction-state.js` only if a pure helper is needed by the new tests

**Interfaces:**
- Consumes: existing 12 memory assets, current photo lightbox, final letter copy.
- Produces: a directly visible archive page with no mission/gating state; existing lightbox behavior remains available.

- [ ] **Step 1: Write failing source-contract tests**

  Add tests asserting that the main document has the archive copy (`Kho lưu trữ kỷ niệm`, `Những ngày mình đã đi qua`, `12 kỷ niệm được lưu lại`), the main memory section is not hidden, the mission/heart sections are absent from the active page, and the main page still has exactly twelve `data-photo-index` buttons.

- [ ] **Step 2: Run the focused test and confirm RED**

  Run: `node --test tests/interaction-state.test.mjs`

  Expected: FAIL because the current document still contains the hidden mission/heart/final-gift journey and old hero copy.

- [ ] **Step 3: Replace the main-page markup and initialization**

  Update `index.html` so the archive hero, 12-photo section, letter archive section, footer link, and playlist hooks are direct page content. Remove mission/heart gating markup from the active page while preserving the existing 12 memory cards, photo modal, letter copy, character assets, and social metadata.

  Update `app.js` to remove mission progression handlers and initialize the archive directly. Retain photo lightbox navigation, final letter opening behavior, reduced-motion handling, and audio fallback hooks.

- [ ] **Step 4: Implement the responsive archive layout**

  Update `styles.css` for the archive visual hierarchy: warm archive hero, staggered desktop memory grid, single-column mobile memory cards, direct letter card, and a visible link to `more-memories.html`. Preserve the existing scrollbar and accessibility styles.

- [ ] **Step 5: Run focused tests and syntax checks**

  Run: `node --test tests/interaction-state.test.mjs` and `node --check app.js`

  Expected: archive source tests and JavaScript syntax pass; no mission/gating assertions remain active.

---

### Task 2: Add the selectable music playlist

**Files:**
- Modify: `tests/interaction-state.test.mjs`
- Modify: `index.html`
- Modify: `app.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: `assets/audio/cham-em-mot-doi.mp3` and the existing background audio element.
- Produces: `playlist` configuration, playlist panel open/close behavior, active-track selection, previous/next controls, and autoplay fallback.

- [ ] **Step 1: Write failing playlist contract tests**

  Add tests asserting that the document has a playlist toggle/panel, a real first track pointing to `assets/audio/cham-em-mot-doi.mp3`, accessible active-track markup, previous/next controls, and no music-off toggle. Assert that `app.js` contains a playlist configuration and selection handler.

- [ ] **Step 2: Run the focused test and confirm RED**

  Run: `node --test tests/interaction-state.test.mjs`

  Expected: FAIL because only the non-interactive disc exists today.

- [ ] **Step 3: Implement the playlist behavior**

  Add a single real-track configuration in `app.js`, render/select tracks through DOM buttons, update the audio source and active item, keep previous/next stable for a one-item playlist, and preserve the existing `tryStartMusic` fallback. Opening/closing the playlist must not stop the audio.

- [ ] **Step 4: Style desktop and mobile playlist states**

  Add panel styling anchored to the music disc on desktop and a bounded bottom sheet/panel on mobile. Keep the disc/note animations and ensure the panel has visible focus states and readable track text.

- [ ] **Step 5: Run the focused playlist tests and syntax checks**

  Run: `node --test tests/interaction-state.test.mjs` and `node --check app.js`

  Expected: playlist assertions pass and syntax remains valid.

---

### Task 3: Add the extended archive page and empty manifest

**Files:**
- Create: `more-memories.html`
- Create: `more-memories.js`
- Create: `assets/memories-extra/manifest.js`
- Modify: `tests/interaction-state.test.mjs`
- Modify: `styles.css` or add a scoped stylesheet only if existing styles cannot support the page without unrelated changes

**Interfaces:**
- Consumes: `extraMemories` exported by `assets/memories-extra/manifest.js`.
- Produces: a static page that renders an empty state with zero entries and renders each future manifest object with `src`, `title`, `caption`, and `alt`.

- [ ] **Step 1: Write failing manifest/page contract tests**

  Add tests asserting that `more-memories.html` exists, imports `more-memories.js`, references the manifest, has a dedicated page title, and includes the empty-state hook/lightbox hook. Assert that the manifest starts with an empty exported array and that the main page links to `more-memories.html`.

- [ ] **Step 2: Run the focused test and confirm RED**

  Run: `node --test tests/interaction-state.test.mjs`

  Expected: FAIL because the extended page and manifest do not yet exist.

- [ ] **Step 3: Implement the static manifest and extended page**

  Create the empty `extraMemories` export, the page shell, and `more-memories.js` renderer. Render an accessible empty state for zero items and a responsive card grid/lightbox for future items. Do not add upload controls or pretend to write to GitHub.

- [ ] **Step 4: Add the main-page navigation link and scoped styles**

  Add one clear link from the main archive to the extended archive. Reuse existing design tokens/classes where possible; add only the page-specific responsive rules required for the extended grid and lightbox.

- [ ] **Step 5: Run extended-page tests and syntax checks**

  Run: `node --test tests/interaction-state.test.mjs` and `node --check more-memories.js`

  Expected: manifest/page assertions pass and the empty archive renders from a valid module.

---

### Task 4: Integrate the letter interaction and perform final verification

**Files:**
- Modify: `tests/interaction-state.test.mjs`
- Modify: `index.html`
- Modify: `app.js`
- Modify: `styles.css`

**Interfaces:**
- Consumes: the direct archive page from Task 1 and the playlist/page hooks from Tasks 2–3.
- Produces: a directly accessible animated envelope with the final Vietnamese letter and complete verified static output.

- [ ] **Step 1: Write failing letter behavior tests**

  Add source-contract assertions that the letter card is directly available, uses the existing final wish text, has the envelope/flap/letter hooks, and does not contain the removed real-gift invitation.

- [ ] **Step 2: Run the focused test and confirm RED**

  Run: `node --test tests/interaction-state.test.mjs`

  Expected: FAIL where the current final section is still hidden/mission-gated or the new direct letter hooks are absent.

- [ ] **Step 3: Implement direct envelope opening**

  Update `app.js` so the letter button opens the envelope without mission state, applies the open/completed class, reveals the final message after the envelope transition, and keeps the existing full final wording. Update CSS for natural flap/paper animation and reduced-motion behavior.

- [ ] **Step 4: Run the full verification suite**

  Run: `npm test`, `node --check app.js`, `node --check more-memories.js`, and `git diff --check`.

  Expected: all tests pass, both JavaScript files parse successfully, and the diff has no whitespace errors.

- [ ] **Step 5: Manual static preview check**

  Serve the repository locally and inspect the page at desktop and mobile widths. Verify the archive starts visible, the 12 cards reveal on scroll, the playlist opens/selects the current track, the letter opens, and the extended page shows its empty state. Record browser/device limitations separately from source-test evidence.

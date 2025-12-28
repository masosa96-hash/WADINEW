# Kivo Mobile 2.0 Implementation Plan

## 1. Visual Mockup

- [x] Generate UI Mockup (in progress)

## 2. Mobile Responsive UI (apps/kivo/www/)

- [ ] **Layout**:
  - [ ] Update `style.css` for iMessage/WhatsApp style bubbles.
  - [ ] Ensure fixed input bar with `position: sticky` or `fixed`.
  - [ ] Add smooth scrolling and entry animations.
- [ ] **Responsive CSS**:
  - [ ] Add media queries for mobile portrait/landscape and tablets.
  - [ ] Optimize typography and spacing.
- [ ] **Behavior**:
  - [ ] Prevent zoom on input focus.
  - [ ] Handle virtual keyboard layout shifts.

## 3. Android App via Capacitor

- [ ] **Configuration**:
  - [ ] Update `capacitor.config.json` with new App ID and plugins.
- [ ] **Assets**:
  - [ ] Generate icons and splash screens.
- [ ] **Sync & Build**:
  - [ ] Run `npx cap sync`.
  - [ ] Verify Android project structure.

## 4. Full PWA Implementation

- [ ] **Manifest**:
  - [ ] Update `manifest.json` with full PWA properties (standalone, icons, colors).
- [ ] **Service Worker**:
  - [ ] Implement robust caching strategies in `sw.js`.
  - [ ] Add offline support.
- [ ] **Install Flow**:
  - [ ] Add "Install" button logic (optional/hidden by default but ready).

## 5. Verification

- [ ] Verify UI on mobile viewport.
- [ ] Verify PWA installability (Lighthouse/DevTools).
- [ ] Verify Android build readiness.

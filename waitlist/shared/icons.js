// Injects the shared SVG icon sprite into the document body.
// Must be called (or included) before any page HTML that uses <use href="#ico-*">.
(function () {
  const svg = `<svg style="display:none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <symbol id="ico-dashboard" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="8" height="8" rx="2.5" fill="currentColor"/>
    <rect x="13" y="3" width="8" height="8" rx="2.5" fill="currentColor" opacity=".35"/>
    <rect x="3" y="13" width="8" height="8" rx="2.5" fill="currentColor" opacity=".35"/>
    <rect x="13" y="13" width="8" height="8" rx="2.5" fill="currentColor"/>
  </symbol>
  <symbol id="ico-campaigns" viewBox="0 0 24 24" fill="none">
    <path d="M19 4V20L7 16V8L19 4Z" fill="currentColor" opacity=".85"/>
    <rect x="3" y="8" width="4" height="8" rx="1.5" fill="currentColor" opacity=".4"/>
    <path d="M7 16L9 21H11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/>
  </symbol>
  <symbol id="ico-discover" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/>
    <path d="M17 17L21 21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M9 13.5L10.5 9.5L14.5 8.5L13 12.5L9 13.5Z" fill="currentColor" opacity=".6"/>
  </symbol>
  <symbol id="ico-messages" viewBox="0 0 24 24" fill="none">
    <path d="M21 15C21 15.5 20.8 16 20.4 16.4C20 16.8 19.5 17 19 17H7L3 21V5C3 4.5 3.2 4 3.6 3.6C4 3.2 4.5 3 5 3H19C19.5 3 20 3.2 20.4 3.6C20.8 4 21 4.5 21 5V15Z" fill="currentColor" opacity=".2" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M8 10H16M8 14H13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </symbol>
  <symbol id="ico-analytics" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="14" width="4" height="7" rx="1.5" fill="currentColor" opacity=".4"/>
    <rect x="10" y="9" width="4" height="12" rx="1.5" fill="currentColor" opacity=".65"/>
    <rect x="17" y="4" width="4" height="17" rx="1.5" fill="currentColor"/>
    <path d="M2 21H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".25"/>
  </symbol>
  <symbol id="ico-wallet" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="6" width="20" height="14" rx="3" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="2"/>
    <path d="M2 10H22" stroke="currentColor" stroke-width="2"/>
    <path d="M6 6V4.5C6 3.7 6.7 3 7.5 3H16.5C17.3 3 18 3.7 18 4.5V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <rect x="15" y="14" width="5" height="3" rx="1.5" fill="currentColor"/>
  </symbol>
  <symbol id="ico-profile" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="7.5" r="3.5" fill="currentColor" opacity=".9"/>
    <path d="M4 21C4 17.1 7.6 14 12 14C16.4 14 20 17.1 20 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </symbol>
  <symbol id="ico-settings" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity=".9"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <symbol id="ico-exit" viewBox="0 0 24 24" fill="none">
    <path d="M9 21H5C4.5 21 4 20.8 3.6 20.4C3.2 20 3 19.5 3 19V5C3 4.5 3.2 4 3.6 3.6C4 3.2 4.5 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </symbol>
  <symbol id="ico-megaphone" viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5C3 8.4 3.9 7.5 5 7.5H7V15.5H5C3.9 15.5 3 14.6 3 13.5V9.5Z" fill="currentColor" opacity=".45"/>
    <path d="M7 7.5L18 4V19L7 15.5V7.5Z" fill="currentColor"/>
    <path d="M7 15.5L8.8 21H11L9.4 15.5" fill="currentColor" opacity=".45"/>
  </symbol>
  <symbol id="ico-eye" viewBox="0 0 24 24" fill="none">
    <path d="M1 12C4 7 7.5 5 12 5C16.5 5 20 7 23 12C20 17 16.5 19 12 19C7.5 19 4 17 1 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/>
    <circle cx="12" cy="12" r="3.5" fill="currentColor"/>
  </symbol>
  <symbol id="ico-bolt" viewBox="0 0 24 24" fill="none">
    <path d="M13 3L5 14H12L11 21L19 10H12L13 3Z" fill="currentColor"/>
  </symbol>
  <symbol id="ico-bill" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="13" rx="3" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="12" cy="13.5" r="2.8" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <circle cx="5" cy="11" r="1.2" fill="currentColor" opacity=".5"/>
    <circle cx="19" cy="11" r="1.2" fill="currentColor" opacity=".5"/>
    <circle cx="5" cy="16" r="1.2" fill="currentColor" opacity=".5"/>
    <circle cx="19" cy="16" r="1.2" fill="currentColor" opacity=".5"/>
  </symbol>
  <symbol id="ico-bar-chart" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="14" width="4" height="7" rx="1" fill="currentColor"/>
    <rect x="10" y="9" width="4" height="12" rx="1" fill="currentColor" opacity=".6"/>
    <rect x="17" y="5" width="4" height="16" rx="1" fill="currentColor" opacity=".35"/>
    <path d="M2 21H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".3"/>
  </symbol>
  <symbol id="ico-coin" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8.5" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.8"/>
    <path d="M14.5 9.5C13.7 8.7 12.8 8.5 12 8.5C9.8 8.5 8.5 10 8.5 12C8.5 14 9.8 15.5 12 15.5C12.8 15.5 13.7 15.3 14.5 14.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M8 11H13M8 13H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </symbol>
  <symbol id="ico-check-circle" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8.5" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.8"/>
    <path d="M8.5 12L11 14.5L15.5 9.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </symbol>
  <symbol id="ico-bank" viewBox="0 0 24 24" fill="none">
    <path d="M3 9L12 4L21 9H3Z" fill="currentColor"/>
    <rect x="5" y="9" width="3" height="8" rx="1" fill="currentColor" opacity=".5"/>
    <rect x="10.5" y="9" width="3" height="8" rx="1" fill="currentColor" opacity=".5"/>
    <rect x="16" y="9" width="3" height="8" rx="1" fill="currentColor" opacity=".5"/>
    <rect x="3" y="18" width="18" height="2.5" rx="1.2" fill="currentColor"/>
  </symbol>
  <symbol id="ico-hourglass" viewBox="0 0 24 24" fill="none">
    <path d="M6 3H18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M6 21H18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M8 3L12 10L16 3H8Z" fill="currentColor" opacity=".4"/>
    <path d="M8 21L12 14L16 21H8Z" fill="currentColor"/>
  </symbol>
  <symbol id="ico-bell" viewBox="0 0 24 24" fill="none">
    <path d="M18 13.5V9C18 6.2 15.3 4 12 4C8.7 4 6 6.2 6 9V13.5L4 16H20L18 13.5Z" fill="currentColor" opacity=".2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M10 16C10 17.1 10.9 18 12 18C13.1 18 14 17.1 14 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>
    <path d="M12 4V2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </symbol>
  <symbol id="ico-star" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L14.9 9H22.5L16.3 13.5L18.6 21L12 16.8L5.4 21L7.7 13.5L1.5 9H9.1L12 2Z" fill="currentColor"/>
  </symbol>
  <symbol id="ico-target" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" stroke-width="1.8" fill="none" opacity=".5"/>
    <circle cx="12" cy="12" r="1.8" fill="currentColor"/>
  </symbol>
  <symbol id="ico-credit-card" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="6" width="20" height="14" rx="3" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.8"/>
    <path d="M2 10H22" stroke="currentColor" stroke-width="2.5"/>
    <rect x="5" y="14" width="5" height="2" rx="1" fill="currentColor" opacity=".6"/>
    <rect x="13" y="14" width="3" height="2" rx="1" fill="currentColor" opacity=".3"/>
  </symbol>
  <symbol id="ico-link" viewBox="0 0 24 24" fill="none">
    <path d="M10 13C10.5 13.9 11.5 14.5 12.6 14.5C13.4 14.5 14.2 14.2 14.8 13.6L17.8 10.6C19 9.4 19 7.5 17.8 6.3C16.6 5.1 14.7 5.1 13.5 6.3L12 7.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M14 11C13.5 10.1 12.5 9.5 11.4 9.5C10.6 9.5 9.8 9.8 9.2 10.4L6.2 13.4C5 14.6 5 16.5 6.2 17.7C7.4 18.9 9.3 18.9 10.5 17.7L12 16.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
  </symbol>
  <symbol id="ico-gift" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="10" width="18" height="11" rx="2" fill="currentColor" opacity=".2" stroke="currentColor" stroke-width="1.8"/>
    <rect x="2" y="7" width="20" height="4" rx="2" fill="currentColor" opacity=".3" stroke="currentColor" stroke-width="1.8"/>
    <path d="M12 7V21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M12 7C11 5.5 9 5 8 5.5C7 6 6.5 7.5 8 8C9.5 8.5 12 7 12 7Z" fill="currentColor"/>
    <path d="M12 7C13 5.5 15 5 16 5.5C17 6 17.5 7.5 16 8C14.5 8.5 12 7 12 7Z" fill="currentColor"/>
  </symbol>
  <symbol id="ico-handshake" viewBox="0 0 24 24" fill="none">
    <path d="M9 10L5 14C4.4 14.6 4.4 15.6 5 16.2L6.8 18C7.4 18.6 8.4 18.6 9 18L13 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M15 10L19 14C19.6 14.6 19.6 15.6 19 16.2L17.2 18C16.6 18.6 15.6 18.6 15 18L11 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M9 10H15L14 6H10L9 10Z" fill="currentColor" opacity=".4"/>
  </symbol>
  <symbol id="ico-globe" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <ellipse cx="12" cy="12" rx="3.5" ry="8.5" stroke="currentColor" stroke-width="1.3" fill="none" opacity=".5"/>
    <path d="M3.5 9H20.5M3.5 15H20.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>
  </symbol>
  <symbol id="ico-rocket" viewBox="0 0 24 24" fill="none">
    <path d="M12 3C14 3 18 5 18 10V16L12 21L6 16V10C6 5 10 3 12 3Z" fill="currentColor" opacity=".2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="12" cy="10" r="2.5" fill="currentColor"/>
    <path d="M6 15L3 18M18 15L21 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
  </symbol>
  <symbol id="ico-instagram" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8" fill="none"/>
    <circle cx="17.5" cy="6.5" r="1.3" fill="currentColor"/>
  </symbol>
  <symbol id="ico-tiktok" viewBox="0 0 24 24" fill="none">
    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" fill="currentColor"/>
  </symbol>
  <symbol id="ico-youtube" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.8"/>
    <path d="M10 9L16 12L10 15V9Z" fill="currentColor"/>
  </symbol>
  <symbol id="ico-facebook" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.8"/>
    <path d="M14 8H12.5C11.7 8 11 8.7 11 9.5V11H9.5V13.5H11V20H13.5V13.5H15L15.5 11H13.5V9.8C13.5 9.3 13.8 9 14.2 9H15.5V8C15.5 8 14.8 8 14 8Z" fill="currentColor"/>
  </symbol>
  <symbol id="ico-fitness" viewBox="0 0 24 24" fill="none">
    <rect x="1.5" y="9.5" width="4" height="5" rx="1.5" fill="currentColor"/>
    <rect x="18.5" y="9.5" width="4" height="5" rx="1.5" fill="currentColor"/>
    <rect x="4" y="10.5" width="2.5" height="3" rx="1" fill="currentColor" opacity=".6"/>
    <rect x="17.5" y="10.5" width="2.5" height="3" rx="1" fill="currentColor" opacity=".6"/>
    <path d="M6.5 12H17.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </symbol>
  <symbol id="ico-food" viewBox="0 0 24 24" fill="none">
    <path d="M8 3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M5.5 3V9L8 11L10.5 9V3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M16 3C16 3 19 6 19 9.5C19 11.5 17.5 13 16 13V21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </symbol>
  <symbol id="ico-leaf" viewBox="0 0 24 24" fill="none">
    <path d="M12 21C12 21 5 16 5 9C5 6 7 4 12 4C17 4 19 6 19 9C19 16 12 21 12 21Z" fill="currentColor" opacity=".2" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M12 21V12M12 12C12 12 8.5 9 8 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </symbol>
  <symbol id="ico-travel" viewBox="0 0 24 24" fill="none">
    <path d="M21 13.5L14 10V5C14 4 13.1 3 12 3C10.9 3 10 4 10 5V10L3 13.5V15.5L10 13.5V17.5L7.5 18.8V20.5L12 19.5L16.5 20.5V18.8L14 17.5V13.5L21 15.5V13.5Z" fill="currentColor"/>
  </symbol>
  <symbol id="ico-sparkle" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor"/>
    <path d="M19 3L19.8 5.2L22 6L19.8 6.8L19 9L18.2 6.8L16 6L18.2 5.2L19 3Z" fill="currentColor" opacity=".6"/>
    <path d="M5 14L5.6 15.9L7.5 16.5L5.6 17.1L5 19L4.4 17.1L2.5 16.5L4.4 15.9L5 14Z" fill="currentColor" opacity=".5"/>
  </symbol>
  <symbol id="ico-heart" viewBox="0 0 24 24" fill="none">
    <path d="M12 21L3.5 12.5C2.5 11.5 2 10.1 2 8.5C2 5.5 4.5 3 7.5 3C9.2 3 10.7 3.8 12 5.2C13.3 3.8 14.8 3 16.5 3C19.5 3 22 5.5 22 8.5C22 10.1 21.5 11.5 20.5 12.5L12 21Z" fill="currentColor" opacity=".85"/>
  </symbol>
  <symbol id="ico-gaming" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="12" rx="4" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.8"/>
    <path d="M9 11V15M7 13H11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <circle cx="16" cy="12" r="1.3" fill="currentColor"/>
    <circle cx="14" cy="14.2" r="1.3" fill="currentColor" opacity=".6"/>
  </symbol>
  <symbol id="ico-coffee" viewBox="0 0 24 24" fill="none">
    <path d="M5 8H15V18C15 19.1 14.1 20 13 20H7C5.9 20 5 19.1 5 18V8Z" fill="currentColor" opacity=".2" stroke="currentColor" stroke-width="1.8"/>
    <path d="M15 10H18C19.7 10 21 11.3 21 13C21 14.7 19.7 16 18 16H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M8 5C8 5 8.5 3.5 10 4C11.5 4.5 11 6 12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  </symbol>
  <symbol id="ico-fashion" viewBox="0 0 24 24" fill="none">
    <path d="M8 3L4 8L8 10V21H16V10L20 8L16 3H14C14 5 12.7 6 12 6C11.3 6 10 5 10 3H8Z" fill="currentColor" opacity=".25" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
  </symbol>
  <symbol id="ico-building" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.8"/>
    <rect x="6" y="7" width="3" height="3" rx="1" fill="currentColor" opacity=".6"/>
    <rect x="10.5" y="7" width="3" height="3" rx="1" fill="currentColor" opacity=".6"/>
    <rect x="15" y="7" width="3" height="3" rx="1" fill="currentColor" opacity=".6"/>
    <rect x="6" y="12" width="3" height="3" rx="1" fill="currentColor" opacity=".4"/>
    <rect x="10.5" y="12" width="3" height="3" rx="1" fill="currentColor" opacity=".4"/>
    <rect x="15" y="12" width="3" height="3" rx="1" fill="currentColor" opacity=".4"/>
    <rect x="9" y="17" width="6" height="4" rx="1" fill="currentColor" opacity=".6"/>
  </symbol>
  <symbol id="ico-search" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
    <path d="M20 20L16.5 16.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </symbol>
  <symbol id="ico-x-circle" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="8.5" fill="currentColor" opacity=".12" stroke="currentColor" stroke-width="1.8"/>
    <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </symbol>
  <symbol id="ico-creator" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="3.5" fill="currentColor"/>
    <path d="M5 20C5 16.7 8.1 14 12 14C15.9 14 19 16.7 19 20" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" opacity=".5"/>
    <path d="M19 4L19.8 6.2L22 7L19.8 7.8L19 10L18.2 7.8L16 7L18.2 6.2L19 4Z" fill="currentColor" opacity=".7"/>
  </symbol>
  <symbol id="ico-pin" viewBox="0 0 24 24" fill="none">
    <path d="M12 2C8.7 2 6 4.7 6 8C6 12.5 12 21 12 21C12 21 18 12.5 18 8C18 4.7 15.3 2 12 2Z" fill="currentColor" opacity=".2" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="12" cy="8" r="2.5" fill="currentColor"/>
  </symbol>
  <symbol id="ico-trending" viewBox="0 0 24 24" fill="none">
    <path d="M3 17L8.5 11L13 14.5L18 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M14 7H20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M3 21H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity=".3"/>
  </symbol>
  <symbol id="ico-mobile" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="2" width="14" height="20" rx="3" fill="currentColor" opacity=".15" stroke="currentColor" stroke-width="1.8"/>
    <path d="M10 18H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </symbol>
</svg>`;
  document.body.insertAdjacentHTML('afterbegin', svg);
})();

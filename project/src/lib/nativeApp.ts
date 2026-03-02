export function preventPullToRefresh() {
  let startY = 0;

  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const currentY = e.touches[0].pageY;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

    if (currentY > startY && scrollTop === 0) {
      e.preventDefault();
    }
  }, { passive: false });
}

export function preventDoubleTapZoom() {
  let lastTouchEnd = 0;

  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
}

export function addHapticFeedback(element: HTMLElement, type: 'light' | 'medium' | 'heavy' = 'light') {
  element.addEventListener('click', () => {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(30);
          break;
      }
    }
  });
}

export function preventTextSelection() {
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement;
    if (!target.isContentEditable &&
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });
}

export function handleStatusBarColor(isDark: boolean) {
  const themeColor = isDark ? '#059669' : '#10b981';
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');

  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', themeColor);
  }
}

export function initNativeAppBehaviors() {
  if (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true) {
    preventPullToRefresh();
    preventDoubleTapZoom();
  }

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  handleStatusBarColor(isDark);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    handleStatusBarColor(e.matches);
  });
}

export function disableContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      e.preventDefault();
    }
  });
}

export function addSmoothTransitions() {
  const style = document.createElement('style');
  style.textContent = `
    * {
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }
  `;
  document.head.appendChild(style);
}

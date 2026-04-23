// Haptics — tiny wrapper around navigator.vibrate with a guard.
// Patterns tuned to feel like a premium restaurant pager, not a rumble pack.

(function () {
  const hasVibrate = typeof navigator !== 'undefined' &&
                     typeof navigator.vibrate === 'function';

  const safe = (pattern) => {
    if (!hasVibrate) return false;
    try { navigator.vibrate(pattern); return true; } catch { return false; }
  };

  window.haptics = {
    tick:      () => safe(8),          // keypress tick
    soft:      () => safe(12),         // toggle, small confirm
    pulse:     () => safe([18, 40, 22]),// tier change
    chaos:     () => safe([6,18,10,24,8,32,14,18,10,40,6,22]), // unhinged tier
    unhinged:  () => safe([80, 30, 80, 30, 160]),             // unhinged selection
  };
})();

window.LoveHeart = window.LoveHeart || {};

LoveHeart.CONFIG = {
  maxPoints: 650,
  basePoints: 300,
  pixelsPerPoint: 2400,

  fontScale: 0.042,
  wordGap: 7,
  fadeSpeed: 5,

  autoRotateSpeed: 0.2,
  inertiaDamping: 1.2,
  zoomSmoothing: 8,
  introDuration: 3.4,

  camera: 3.2,
  heartbeatSpeed: 1.6,
  heartbeatDepth: 0.022,

  zoom: { min: 0.6, max: 1.8 },
  tilt: { initial: -0.12, limit: 1.2, returnSpeed: 0.6 },
  dustCount: 70,
  hue: { base: 346, drift: 12, shimmer: 8 },

  startDate: { year: 2026, month: 8, day: 23 },

  specialWord: "Я тебя люблю",
  specialHintDelay: 25,

  intro: { fadeIn: 900, hold: 1700, fadeOut: 700, gap: 250, leaveDuration: 2600 }
};
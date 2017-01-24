import { play, Canvas } from './lib/game.js';
import { levels } from './lib/levels.js';
// import { CanvasDisplay } from './lib/canvas.js';

document.addEventListener("DOMContentLoaded", () => {
  play(levels, Canvas);
});

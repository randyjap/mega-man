import { play } from './lib/game.js';
import { levels } from './lib/levels.js';
import { Canvas } from './lib/canvas.js';

document.addEventListener("DOMContentLoaded", () => {
  play(levels, Canvas);
});

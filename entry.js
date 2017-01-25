import { play } from './lib/game.js';
import { levels } from './lib/levels.js';
import { Canvas } from './lib/canvas.js';

document.addEventListener("DOMContentLoaded", () => {
  play(levels, Canvas);
  let restartButton = document.getElementById("restart");
  restartButton.addEventListener("click", e => {
    e.preventDefault();

    let canvas = document.getElementById("canvas");
    if (canvas) {
      cancelAnimationFrame(window.animation);
      document.body.removeChild(canvas);
      play(levels, Canvas);
    } else {
      play(levels, Canvas);
    }
  });

  let proxy = document.getElementById("pause");
  proxy.addEventListener("click", e => {
    e.preventDefault();
  });
});

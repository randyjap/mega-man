import { play } from './lib/game.js';
import { levels } from './lib/levels.js';
import { Canvas } from './lib/canvas.js';

document.addEventListener("DOMContentLoaded", () => {
  window.pause = false;
  let runGame = play(levels, Canvas);
  runGame();
  let restartButton = document.getElementById("restart");
  restartButton.addEventListener("click", e => {
    e.preventDefault();

    let canvas = document.getElementById("canvas");
    if (canvas) {
      cancelAnimationFrame(window.animation);
      document.body.removeChild(canvas);
      runGame = play(levels, Canvas);
      runGame();
    } else {
      runGame = play(levels, Canvas);
      runGame();
    }
  });

  let proxy = document.getElementById("pause");
  proxy.addEventListener("click", e => {
    e.preventDefault();
    window.pause = !window.pause;
    if (!window.pause) runGame();
  });
});

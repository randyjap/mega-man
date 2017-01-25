import { play } from './lib/game.js';
import { levels } from './lib/levels.js';
import { Canvas } from './lib/canvas.js';
import { music, soundSprites } from './lib/sound.js';

document.addEventListener("DOMContentLoaded", () => {
  window.pause = false;
  let runGame = play(levels, Canvas, soundSprites, music);
  runGame();
  let restartButton = document.getElementById("restart");
  restartButton.addEventListener("click", e => {
    e.preventDefault();

    let canvas = document.getElementById("canvas");
    if (canvas) {
      cancelAnimationFrame(window.animation);
      document.body.removeChild(canvas);
      runGame = play(levels, Canvas, soundSprites, music);
      runGame();
    } else {
      runGame = play(levels, Canvas, soundSprites, music);
      runGame();
    }
  });

  let pause = document.getElementById("pause");
  pause.addEventListener("click", e => {
    e.preventDefault();
    window.pause = !window.pause;
    if (!window.pause) runGame();
  });

  let music_counter = 0;
  let muteStatus = false;
  music[music_counter].play();

  let muteButton = document.getElementById("mute");
  muteButton.addEventListener("click", e => {
    e.preventDefault();
    muteStatus = !muteStatus;
    music[music_counter].mute(muteStatus);
    soundSprites.mute(muteStatus);
  });

  let nextButton = document.getElementById("nextSong");
  nextButton.addEventListener("click", e => {
    e.preventDefault();
    music[music_counter].stop();
    music_counter = (music_counter + 1) % 3;
    music[music_counter].play();
  });
});

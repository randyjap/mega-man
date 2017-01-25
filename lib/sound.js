import { Howl } from 'howler';

let musicChibi = new Howl({
  src: 'sounds/music/chibi.mp3',
  autoplay: false,
  loop: true,
  volume: 1,
});

let musicDigital = new Howl({
  src: 'sounds/music/digital.mp3',
  autoplay: false,
  loop: true,
  volume: 1,
});

let musicResistors = new Howl({
  src: 'sounds/music/resistors.mp3',
  autoplay: false,
  loop: true,
  volume: 1,
});

let victory = new Howl({
  src: 'sounds/music/boss_defeated.mp3',
  autoplay: false,
  loop: false,
  volume: 1,
});

export const music = [musicChibi, musicDigital, musicResistors, victory];

export const soundSprites = new Howl({
  src: ['sounds/fx/sound_sprites.mp3'],
  sprite: {
    explosion: [0, 500],
    enemyDamage: [0, 500],
    megamanHurt: [0, 500],
    jump: [1300, 100],
    shoot: [1400, 250]
  }
});

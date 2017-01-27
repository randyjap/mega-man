import { VectorUtil } from './vector_util';
import { Boss, Bullet, Megaman, Henchman } from './sprites';

let arrowCodes = { 65: "left", 87: "up", 68: "right", 32: "shoot" };

function Game(plan, soundSprites, music) {
  this.grid = [];
  this.sprites = [];
  this.width = plan[0].length;
  this.height = plan.length;
  this.sound = soundSprites;
  this.music = music;
  this.gameStatus = null;
  this.score = 0;

  for (let y = 0; y < this.height; y++) {
    let row = plan[y], transformedRow = [];
    for (let x = 0; x < this.width; x++) {
      let chr = row[x];
      let fieldType = null;
      let Sprite = characters[chr];
      if (Sprite)
        this.sprites.push(new Sprite(new VectorUtil(x, y), chr));
      else if (chr === "#")
        fieldType = "block";
      else if (chr === "W")
        fieldType = "water";
      transformedRow.push(fieldType);
    }
    this.grid.push(transformedRow);
  }

  this.megaman = this.sprites.filter(player => {
    return player.type === "megaman";
  })[0];

  this.boss = this.sprites.filter(player => {
    return player.type === "boss";
  })[0];
}

let characters = {
  "M": Megaman,
  "B": Boss,
  "H": Henchman
};

Game.prototype.findCollision = function(pos, size) {
  let left = Math.floor(pos.x);
  let right = Math.ceil(pos.x + size.x);
  let top = Math.floor(pos.y);
  let bottom = Math.ceil(pos.y + size.y);

  if (left < 0 || right > this.width || top < 0) return "block";

  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      let fieldType = this.grid[y][x];
      if (fieldType) return fieldType;
    }
  }
};

Game.prototype.findOverlappingObject = function(player) {
  for (let i = 0; i < this.sprites.length; i++) {
    let other = this.sprites[i];
    if (other !== player &&
      player.pos.x + player.size.x > other.pos.x &&
      player.pos.x < other.pos.x + other.size.x &&
      player.pos.y + player.size.y > other.pos.y &&
      player.pos.y < other.pos.y + other.size.y)
    return other;
  }
};
let maxStep = 0.04;

Game.prototype.animate = function(step, keys) {
  while (step > 0) {
    let thisStep = Math.min(step, maxStep);
    this.sprites.forEach(function(player) {
      player.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
};

Game.prototype.spriteOverlapAction = function(type, player, sprite) {
  if (type === "water" && this.gameStatus === null) {
    if (this.megaman.hitPoints > 0) this.megaman.hitPoints -= 0.3;
    this.sound.play("megamanHurt");
    if (this.megaman.hitPoints <= 0) {
      this.gameStatus = "lost";
    }
    this.megaman.hit = true;
  } else if (type === "friendly-bullet" && sprite && sprite.type === "boss" && this.gameStatus === null) {
    sprite.hitPoints--;
    this.score += Math.round(100000 * Math.random());
    document.getElementById("score").innerHTML = `Score: ${this.score}`;
    sprite.hit = true;
    this.sound.play("enemyDamage");
    if (sprite.hitPoints <= 0) {
      this.gameStatus = "won";
      this.music[0].stop();
      this.music[1].stop();
      this.music[2].stop();
      this.music[3].play();
    }
  } else if (type === "friendly-bullet" && sprite && sprite.type === "henchman" && this.gameStatus === null) {
    if (sprite.hitPoints > 0) sprite.hitPoints--;
    this.score += Math.round(100000 * Math.random());
    document.getElementById("score").innerHTML = `Score: ${this.score}`;
    sprite.hit = true;
    this.sound.play("enemyDamage");
  } else if (type === "unfriendly-bullet" && sprite && sprite.type === "megaman" && this.gameStatus === null) {
    sprite.hitPoints--;
    sprite.hit = true;
    this.sound.play("megamanHurt");
    if (sprite.hitPoints <= 0) {
      this.gameStatus = "lost";
    }
  }
};

function trackKeys(codes) {
  let pressed = {};
  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      let down = event.type === "keydown";
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}

function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    let stop = false;
    if (lastTime !== null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = (frameFunc(timeStep) === false);
    }
    lastTime = time;
    if (!stop)
      window.animation = requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

let arrows = trackKeys(arrowCodes);

function start(level, Canvas) {
  let display = new Canvas(document.body, level);
  window.display = display;
  let runGame = () => {
    runAnimation(function(step) {
      level.animate(step, arrows);
      display.drawFrame(step);
      return !window.pause;
    });
  };
  return runGame;
}

export function play(plans, Canvas, soundSprites, music) {
  return start(new Game(plans[0], soundSprites, music), Canvas);
}

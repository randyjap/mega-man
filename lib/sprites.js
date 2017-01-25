import { VectorUtil } from './vector_util';

let gravity = 45;
let jumpSpeed = 18;
let megamanXSpeed = 6;
let bossFiringRate =  4 / 3;
let megamanFiringRate = 1 / 3;

export function Boss(pos) {
  this.pos = pos.plus(new VectorUtil(0, 0));
  this.size = new VectorUtil(1, 1);
  this.speed = new VectorUtil(0, 0);
  this.hitPoints = 100;
  this.lastFire = new Date();
  this.hit = false;
  this.destroyed = false;
}

Boss.prototype.type = "boss";

Boss.prototype.moveY = function(step, game) {
  this.speed.y += step * gravity;
  let motion = new VectorUtil(0, this.speed.y * step);
  let newPos = this.pos.plus(motion);
  let collidedObject = game.findCollision(newPos, this.size);
  if (collidedObject) {
    game.spriteOverlapAction(collidedObject);
    if (this.hitPoints > 0 && this.speed.y > 0) {
      this.speed.y = 0;
      this.speed.y = -(Math.random() * (20 - 5) + 5);
    } else {
      this.speed.y = 0;
    }
  } else {
    this.pos = newPos;
  }
};

Boss.prototype.act = function(step, game) {
  this.moveY(step, game);

  // this will slow down the firing rate to 3 a second
  if (!this.destroyed) {
    let cFire = new Date();
    if (((cFire - this.lastFire) / 1000) > bossFiringRate){
      let fireRight = true;
      if (this.pos.x > game.megaman.pos.x) fireRight = false;
      game.sprites.push(new Bullet(new VectorUtil(this.pos.x, this.pos.y), "unfriendly-bullet", fireRight));
      this.lastFire = cFire;
    }
  }

  let otherSprite = game.findOverlappingObject(this);
  if (otherSprite) {
    game.spriteOverlapAction(otherSprite.type, otherSprite, this);
  } else {
    this.hit = false;
  }

  if (game.gameStatus === "won") {
    this.destroyed = true;
  }
};

export function Bullet(pos, bulletType, fireRight) {
  this.pos = pos.plus(new VectorUtil(0, 0));
  this.size = new VectorUtil(1, 1);
  if (fireRight === true) {
    this.speed = new VectorUtil(10, 0);
  } else if (fireRight === false) {
    this.speed = new VectorUtil(-10, 0);
  } else if (window.display.facingRight) {
    this.speed = new VectorUtil(-10, 0);
  } else {
    this.speed = new VectorUtil(10, 0);
  }
  this.type = bulletType;
}

Bullet.prototype.moveX = function(step, game, keys) {
  let motion = new VectorUtil(this.speed.x * step, 0);
  let newPos = this.pos.plus(motion);
  this.pos = newPos;
};

Bullet.prototype.act = function(step, game) {
  this.moveX(step, game);
};

export function Megaman(pos) {
  this.pos = pos.plus(new VectorUtil(0, 0));
  this.size = new VectorUtil(1, 1);
  this.speed = new VectorUtil(0, 0);
  this.lastFire = new Date();
  this.hitPoints = 50;
  this.hit = false;
}

Megaman.prototype.type = "megaman";

Megaman.prototype.moveX = function(step, game, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= megamanXSpeed;
  if (keys.right) this.speed.x += megamanXSpeed;

  let motion = new VectorUtil(this.speed.x * step, 0);
  let newPos = this.pos.plus(motion);
  let collidedObject = game.findCollision(newPos, this.size);
  if (collidedObject) {
    game.spriteOverlapAction(collidedObject);
  } else if (this.hitPoints > 0) {
    this.hit = false;
    this.pos = newPos;
  }
};

Megaman.prototype.moveY = function(step, game, keys) {
  this.speed.y += step * gravity;
  let motion = new VectorUtil(0, this.speed.y * step);
  let newPos = this.pos.plus(motion);
  let collidedObject = game.findCollision(newPos, this.size);
  if (collidedObject) {
    game.spriteOverlapAction(collidedObject);
    if (keys.up && this.speed.y > 0) {
      this.speed.y = -jumpSpeed;
    } else {
      this.speed.y = 0;
    }
  } else if (this.hitPoints > 0) {
    this.pos = newPos;
  }
};

Megaman.prototype.act = function(step, game, keys) {
  this.moveX(step, game, keys);
  this.moveY(step, game, keys);
  if (keys.shoot && this.hitPoints > 0) {
    // this will slow down the firing rate to 3 a second
    let cFire = new Date();
    if (((cFire - this.lastFire) / 1000) > megamanFiringRate){
      game.sprites.push(new Bullet(new VectorUtil(this.pos.x, this.pos.y), "friendly-bullet"));
      this.lastFire = cFire;
    }
  }

  let otherSprite = game.findOverlappingObject(this);
  if (otherSprite) {
    game.spriteOverlapAction(otherSprite.type, otherSprite, this);
  }

  // Losing animation
  if (game.gameStatus === "lost") {
    this.hit = true;
  }
};

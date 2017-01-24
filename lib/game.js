let gravity = 45;
let jumpSpeed = 18;
let megamanXSpeed = 6;
let spriteSize = 50;
let spriteRoll = document.createElement("img");
let arrowCodes = { 65: "left", 87: "up", 68: "right", 32: "shoot" };
let firingRate =  1 / 3;

spriteRoll.src = "images/megaman.png";

function Level(plan) {
  this.grid = [];
  this.sprites = [];
  this.width = plan[0].length;
  this.height = plan.length;

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
  this.status = this.finishDelay = null;
}

Level.prototype.isFinished = function() {
  return this.status !== null && this.finishDelay < 0;
};

function VectorUtil(x, y) {
  this.x = x; this.y = y;
}
VectorUtil.prototype.plus = function(other) {
  return new VectorUtil(this.x + other.x, this.y + other.y);
};
VectorUtil.prototype.times = function(factor) {
  return new VectorUtil(this.x * factor, this.y * factor);
};

let characters = {
  "M": Megaman,
  "B": Boss
};

function Boss(pos) {
  this.pos = pos.plus(new VectorUtil(0, 0));
  this.size = new VectorUtil(1, 1);
  this.speed = new VectorUtil(0, 0);
  this.hitPoints = 100;
}

Boss.prototype.type = "boss";

Boss.prototype.moveY = function(step, level) {
  this.speed.y += step * gravity;
  let motion = new VectorUtil(0, this.speed.y * step);
  let newPos = this.pos.plus(motion);
  let collidedObject = level.findCollision(newPos, this.size);
  if (collidedObject) {
    level.spriteOverlapAction(collidedObject);
    if (this.speed.y > 0)
      this.speed.y = -(Math.random() * (20 - 5) + 5);
    else
      this.speed.y = 0;
  } else {
    this.pos = newPos;
  }
};

Boss.prototype.act = function(step, level) {
  this.moveY(step, level);

  let otherSprite = level.findOverlappingObject(this);
  if (otherSprite) {
    level.spriteOverlapAction(otherSprite.type, otherSprite, this);
  }

  if (level.status === "lost") {
    // TODO
  }
};

function Bullet(pos, facingRight) {
  this.pos = pos.plus(new VectorUtil(0, 0));
  this.size = new VectorUtil(1, 1);
  if (window.display.facingRight) {
    this.speed = new VectorUtil(-10, 0);
  } else {
    this.speed = new VectorUtil(10, 0);
  }
}

Bullet.prototype.type = "bullet";

Bullet.prototype.moveX = function(step, level, keys) {
  let motion = new VectorUtil(this.speed.x * step, 0);
  let newPos = this.pos.plus(motion);
  this.pos = newPos;
};

Bullet.prototype.act = function(step, level) {
  this.moveX(step, level);
};

function Megaman(pos) {
  this.pos = pos.plus(new VectorUtil(0, 0));
  this.size = new VectorUtil(1, 1);
  this.speed = new VectorUtil(0, 0);
  this.lastFire = new Date();
}

Megaman.prototype.type = "megaman";

Megaman.prototype.moveX = function(step, level, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= megamanXSpeed;
  if (keys.right) this.speed.x += megamanXSpeed;

  if (keys.shoot) {
    // this will slow down the firing rate to 3 a second
    let cFire = new Date();
    if (((cFire - this.lastFire) / 1000) > firingRate){
      level.sprites.push(new Bullet(new VectorUtil(this.pos.x, this.pos.y)));
      this.lastFire = cFire;
    }
  }
  let motion = new VectorUtil(this.speed.x * step, 0);
  let newPos = this.pos.plus(motion);
  let collidedObject = level.findCollision(newPos, this.size);
  if (collidedObject)
    level.spriteOverlapAction(collidedObject);
  else
    this.pos = newPos;
};

Megaman.prototype.moveY = function(step, level, keys) {
  this.speed.y += step * gravity;
  let motion = new VectorUtil(0, this.speed.y * step);
  let newPos = this.pos.plus(motion);
  let collidedObject = level.findCollision(newPos, this.size);
  if (collidedObject) {
    level.spriteOverlapAction(collidedObject);
    if (keys.up && this.speed.y > 0)
      this.speed.y = -jumpSpeed;
    else
      this.speed.y = 0;
  } else {
    this.pos = newPos;
  }
};

Megaman.prototype.act = function(step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);

  let otherSprite = level.findOverlappingObject(this);
  if (otherSprite)
    level.spriteOverlapAction(otherSprite.type, otherSprite);

  // Losing animation
  if (level.status === "lost") {
    this.pos.y += step;
    this.size.y -= step;
  }
};

Level.prototype.findCollision = function(pos, size) {
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

Level.prototype.findOverlappingObject = function(player) {
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

let maxStep = 0.05;

Level.prototype.animate = function(step, keys) {
  if (this.status !== null)
    this.finishDelay -= step;

  while (step > 0) {
    let thisStep = Math.min(step, maxStep);
    this.sprites.forEach(function(player) {
      player.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
};

Level.prototype.spriteOverlapAction = function(type, player, sprite) {
  if (type === "water" && this.status === null) {
    this.status = "lost";
    this.finishDelay = 1;
  } else if (type === "bullet" && sprite && sprite.type === "boss" && this.status === null) {
    sprite.hitPoints--;
    if (sprite.hitPoints <= 0) {
      this.status = "won";
      this.finishDelay = 1;
    }
  }
  //TODO Win Condition
};

function trackKeys(codes) {
  let pressed = Object.create(null);
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
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop)
      requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

let arrows = trackKeys(arrowCodes);

function runLevel(level, Display, gameContinues) {
  let display = new Display(document.body, level);
  window.display = display;
  runAnimation(function(step) {
    level.animate(step, arrows);
    display.drawFrame(step);
    if (level.isFinished()) {
      display.clear();
      if (gameContinues)
        gameContinues(level.status);
      return false;
    }
  });
}

export function play(plans, Display) {
  function startLevel(n) {
    runLevel(new Level(plans[n]), Display, function(status) {
      if (status === "lost")
        startLevel(n);
      else if (n < plans.length - 1)
        startLevel(n + 1);
    });
  }
  startLevel(0);
}

function flipHorizontally(context, around) {
  context.translate(around, 0);
  context.scale(-1, 1);
  context.translate(-around, 0);
}

export function Canvas(parent, level) {
  this.canvas = document.createElement("canvas");
  this.canvas.width = Math.min(600, level.width * spriteSize);
  this.canvas.height = Math.min(450, level.height * spriteSize);
  parent.appendChild(this.canvas);
  this.cx = this.canvas.getContext("2d");

  this.level = level;
  this.animationTime = 0;
  this.facingRight = false;

  this.viewport = {
    left: 0,
    top: 0,
    width: this.canvas.width / spriteSize,
    height: this.canvas.height / spriteSize
  };

  this.drawFrame(0);
}

Canvas.prototype.clear = function() {
  this.canvas.parentNode.removeChild(this.canvas);
};

Canvas.prototype.drawFrame = function(step) {
  this.animationTime += step;

  this.updateViewport();
  this.clearDisplay();
  this.drawBackground();
  this.drawSprites();
};

Canvas.prototype.updateViewport = function() {
  let view = this.viewport, margin = view.width / 3;
  let megaman = this.level.megaman;
  let center = megaman.pos.plus(megaman.size.times(0.5));

  if (center.x < view.left + margin)
    view.left = Math.max(center.x - margin, 0);
  else if (center.x > view.left + view.width - margin)
    view.left = Math.min(center.x + margin - view.width,
                         this.level.width - view.width);
  if (center.y < view.top + margin)
    view.top = Math.max(center.y - margin, 0);
  else if (center.y > view.top + view.height - margin)
    view.top = Math.min(center.y + margin - view.height,
                        this.level.height - view.height);
};

Canvas.prototype.clearDisplay = function() {
  if (this.level.status === "won") {
    //TODO
    console.log("YOU WON!");
  } else if (this.level.status === "lost") {
    //TODO
    console.log("YOU LOST!");
  } else {
    this.cx.fillStyle = "lightblue";
  }
  // Don't forget to make things transparent!
  this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

Canvas.prototype.drawBackground = function() {
  let view = this.viewport;
  let left = Math.floor(view.left);
  let right = Math.ceil(view.left + view.width);
  let top = Math.floor(view.top);
  let bottom = Math.ceil(view.top + view.height);

  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      let fieldType = this.level.grid[y][x];
      if (fieldType === null) continue;
      let xPosition = (x - view.left) * spriteSize;
      let yPosition = (y - view.top) * spriteSize;

      let spriteFrameNumber;
      if (fieldType === "water") spriteFrameNumber = 16;
      if (fieldType === "block") spriteFrameNumber = 15;

      this.cx.drawImage(
        spriteRoll,
        (spriteFrameNumber * spriteSize), 0, spriteSize, spriteSize,
        xPosition, yPosition, spriteSize, spriteSize);
    }
  }
};

Canvas.prototype.drawMegaMan = function(x, y, width, height) {
  let spriteFrameNumber = 0;
  let megaman = this.level.megaman;

  if (megaman.speed.x !== 0)
    this.facingRight = megaman.speed.x < 0;

  if (megaman.speed.y !== 0) {
    spriteFrameNumber = 11;
  } else if (megaman.speed.x !== 0) {
    spriteFrameNumber = Math.floor(this.animationTime * 12) % 10 + 1;
  }

  this.cx.save(); //keep drawing context intact
  if (this.facingRight)
    flipHorizontally(this.cx, x + width / 2);

  this.cx.drawImage(
    spriteRoll,
    (spriteFrameNumber * width), 0,
    width, height,
    x, y, width, height
  );

  this.cx.restore(); //restore drawing context
};

Canvas.prototype.drawBoss = function(x, y, width, height) {
  let spriteFrameNumber = 13;
  this.cx.drawImage(
    spriteRoll,
    (spriteFrameNumber * width), 0,
    width, height,
    x, y, width, height
  );
};

Canvas.prototype.drawBullet = function(x, y, width, height) {
  let spriteFrameNumber = 12;
  this.cx.drawImage(
    spriteRoll,
    (spriteFrameNumber * width), 0,
    width, height,
    x, y, width, height
  );
};

Canvas.prototype.drawSprites = function() {
  this.level.sprites.forEach(function(sprite) {
    let width = sprite.size.x * spriteSize;
    let height = sprite.size.y * spriteSize;
    let x = (sprite.pos.x - this.viewport.left) * spriteSize;
    let y = (sprite.pos.y - this.viewport.top) * spriteSize;
    if (sprite.type === "megaman") {
      this.drawMegaMan(x, y, width, height);
    } else if (sprite.type === "boss"){
      this.drawBoss(x, y, width, height);
    } else if (sprite.type === "bullet"){
      this.drawBullet(x, y, width, height);
    }
  }, this);
};

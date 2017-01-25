let spriteSize = 50;
let spriteRoll = document.createElement("img");
spriteRoll.src = "images/megaman.png";

function flipHorizontally(context, around) {
  context.translate(around, 0);
  context.scale(-1, 1);
  context.translate(-around, 0);
}

export function Canvas(parent, game) {
  this.canvas = document.createElement("canvas");
  this.canvas.id = "canvas";
  this.canvas.width = Math.min(window.innerWidth, game.width * spriteSize);
  this.canvas.height = Math.min(window.innerWidth / 3, game.height * spriteSize);
  parent.appendChild(this.canvas);
  this.cx = this.canvas.getContext("2d");

  this.game = game;
  this.animationTime = 0;
  this.facingRight = false;

  this.viewport = {
    left: 0,
    top: 0,
    width: this.canvas.width / spriteSize,
    height: this.canvas.height / spriteSize
  };

  this.start = new Date();
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
  let view = this.viewport, margin = view.width / 6;
  let megaman = this.game.megaman;
  let center = megaman.pos.plus(megaman.size.times(0.5));

  if (center.x < view.left + margin * 2) {
    view.left = Math.max(center.x - margin * 2, 0);
  }  else if (center.x > view.left + view.width - margin * 2) {
    view.left = Math.min(center.x + margin * 2 - view.width, this.game.width - view.width);
  }

  if (center.y < view.top + margin) {
    view.top = Math.max(center.y - margin, 0);
  }  else if (center.y > view.top + view.height - margin) {
    view.top = Math.min(center.y + margin - view.height, this.game.height - view.height);
  }
};

Canvas.prototype.clearDisplay = function() {
  if (this.game.gameStatus === "won") {
    //TODO
    console.log("YOU WON!");
  } else if (this.game.gameStatus === "lost") {
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
      let fieldType = this.game.grid[y][x];
      if (fieldType === null) continue;
      let xPosition = (x - view.left) * spriteSize;
      let yPosition = (y - view.top) * spriteSize;

      let spriteFrameNumber;
      if (fieldType === "water") spriteFrameNumber = 16;
      if (fieldType === "block") spriteFrameNumber = 15;

      this.cx.drawImage(
        spriteRoll,
        (spriteFrameNumber * spriteSize), 0, spriteSize, spriteSize,
        xPosition, yPosition, spriteSize, spriteSize
      );
    }
  }

  let farewellMessage = document.createElement("img");
  farewellMessage.src = "images/win-loss.png";
  let messageNumber;

  if (this.game.gameStatus === "lost") {
    messageNumber = 1;
    this.cx.drawImage(
      farewellMessage,
      (messageNumber * 400), 0,
      400, 200,
      400 + (right - left) / 2, 100 + (bottom - top) / 2,
      400, 200
    );
  } else if (this.game.gameStatus === "won") {
    messageNumber = 0;
    this.cx.drawImage(
      farewellMessage,
      (messageNumber * 400), 0,
      400, 200,
      400 + (right - left) / 2, 100 + (bottom - top) / 2,
      400, 200
    );
  } else if (new Date() - this.start < 7000) {
    messageNumber = 2;
    this.cx.drawImage(
      farewellMessage,
      (messageNumber * 400), 0,
      400, 200,
      400 + (right - left) / 2, 100 + (bottom - top) / 2,
      400, 200
    );
  }
};

Canvas.prototype.drawMegaMan = function(x, y, width, height) {
  let spriteFrameNumber = 0;
  let megaman = this.game.megaman;

  if (megaman.hitPoints > 0 && megaman.hitPoints < 50) megaman.hitPoints += 0.02;

  document.getElementById("megaman-health").innerHTML = `Megaman Health: ${Math.round(megaman.hitPoints)}`;

  if (megaman.speed.x !== 0) this.facingRight = megaman.speed.x < 0;

  if (megaman.hit) {
    spriteFrameNumber = 14;
  } else if (megaman.speed.y !== 0) {
    spriteFrameNumber = 11;
  } else if (megaman.speed.x !== 0) {
    spriteFrameNumber = Math.floor(this.animationTime * 12) % 10 + 1;
  }

  let rectangle = new Path2D();
  rectangle.rect(x, y - 20, 50 * megaman.hitPoints / 50, 20);
  this.cx.stroke(rectangle);
  this.cx.save(); //keep drawing context intact

  if (this.facingRight) flipHorizontally(this.cx, x + width / 2);
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
  let boss = this.game.boss;
  if (boss.destroyed) {
    spriteFrameNumber = [17, 18][Math.floor(Math.random() * [17, 18].length)];
  } else if (boss.hit) {
    spriteFrameNumber = [17, 18][Math.floor(Math.random() * [17, 18].length)];
  }

  if (!boss.destroyed && boss.hitPoints < 100) boss.hitPoints += 0.02;
  document.getElementById("boss-health").innerHTML = `Boss Health: ${Math.round(boss.hitPoints)}`;

  if (!boss.destroyed) {
    let rectangle = new Path2D();
    rectangle.rect(x, y - 20, 50 * boss.hitPoints / 50, 20);
    this.cx.stroke(rectangle);
  }

  this.cx.save(); //keep drawing context intact
  if (this.game.megaman.pos.x > this.game.boss.pos.x) flipHorizontally(this.cx, x + width / 2);

  this.cx.drawImage(
    spriteRoll,
    (spriteFrameNumber * width), 0,
    width, height,
    x, y, width, height
  );

  this.cx.restore(); //restore drawing context
};

Canvas.prototype.drawHenchman = function(x, y, width, height, henchman) {
  if (!henchman.destroyed) {
    let spriteFrameNumber = 20;
    if (henchman.hitPoints <= 0) henchman.destroyed = true;
    if (henchman.hit) {
      spriteFrameNumber = [17, 20][Math.floor(Math.random() * [17, 20].length)];
    }

    let rectangle = new Path2D();
    rectangle.rect(x, y - 20, 45 * henchman.hitPoints / 20, 20);
    this.cx.stroke(rectangle);

    this.cx.save(); //keep drawing context intact
    if (this.game.megaman.pos.x > henchman.pos.x) flipHorizontally(this.cx, x + width / 2);


    this.cx.drawImage(
      spriteRoll,
      (spriteFrameNumber * width), 0,
      width, height,
      x, y, width, height
    );

    this.cx.restore(); //restore drawing context
  }
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
  this.game.sprites.forEach(function(sprite) {
    let width = sprite.size.x * spriteSize;
    let height = sprite.size.y * spriteSize;
    let x = (sprite.pos.x - this.viewport.left) * spriteSize;
    let y = (sprite.pos.y - this.viewport.top) * spriteSize;
    if (sprite.type === "megaman") {
      this.drawMegaMan(x, y, width, height);
    } else if (sprite.type === "boss"){
      this.drawBoss(x, y, width, height);
    } else if (sprite.type === "henchman"){
      this.drawHenchman(x, y, width, height, sprite);
    } else if (sprite.type === "friendly-bullet"){
      this.drawBullet(x, y, width, height);
    } else if (sprite.type === "unfriendly-bullet"){
      this.drawBullet(x, y, width, height);
    }
  }, this);
};

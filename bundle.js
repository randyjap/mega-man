/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _game = __webpack_require__(1);
	
	var _levels = __webpack_require__(4);
	
	// import { CanvasDisplay } from './lib/canvas.js';
	
	document.addEventListener("DOMContentLoaded", function () {
	  (0, _game.play)(_levels.levels, _game.Canvas);
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.play = play;
	exports.Canvas = Canvas;
	var gravity = 45;
	var jumpSpeed = 18;
	var megamanXSpeed = 6;
	var spriteSize = 50;
	var spriteRoll = document.createElement("img");
	var arrowCodes = { 65: "left", 87: "up", 68: "right", 32: "shoot" };
	var firingRate = 1 / 3;
	
	spriteRoll.src = "images/megaman.png";
	
	function Level(plan) {
	  this.grid = [];
	  this.sprites = [];
	  this.width = plan[0].length;
	  this.height = plan.length;
	
	  for (var y = 0; y < this.height; y++) {
	    var row = plan[y],
	        transformedRow = [];
	    for (var x = 0; x < this.width; x++) {
	      var chr = row[x];
	      var fieldType = null;
	      var Sprite = characters[chr];
	      if (Sprite) this.sprites.push(new Sprite(new VectorUtil(x, y), chr));else if (chr === "#") fieldType = "block";else if (chr === "W") fieldType = "water";
	      transformedRow.push(fieldType);
	    }
	    this.grid.push(transformedRow);
	  }
	
	  this.megaman = this.sprites.filter(function (player) {
	    return player.type === "megaman";
	  })[0];
	  this.status = this.finishDelay = null;
	}
	
	Level.prototype.isFinished = function () {
	  return this.status !== null && this.finishDelay < 0;
	};
	
	function VectorUtil(x, y) {
	  this.x = x;this.y = y;
	}
	VectorUtil.prototype.plus = function (other) {
	  return new VectorUtil(this.x + other.x, this.y + other.y);
	};
	VectorUtil.prototype.times = function (factor) {
	  return new VectorUtil(this.x * factor, this.y * factor);
	};
	
	var characters = {
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
	
	Boss.prototype.moveY = function (step, level) {
	  this.speed.y += step * gravity;
	  var motion = new VectorUtil(0, this.speed.y * step);
	  var newPos = this.pos.plus(motion);
	  var collidedObject = level.findCollision(newPos, this.size);
	  if (collidedObject) {
	    level.spriteOverlapAction(collidedObject);
	    if (this.speed.y > 0) this.speed.y = -(Math.random() * (20 - 5) + 5);else this.speed.y = 0;
	  } else {
	    this.pos = newPos;
	  }
	};
	
	Boss.prototype.act = function (step, level) {
	  this.moveY(step, level);
	
	  var otherSprite = level.findOverlappingObject(this);
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
	
	Bullet.prototype.moveX = function (step, level, keys) {
	  var motion = new VectorUtil(this.speed.x * step, 0);
	  var newPos = this.pos.plus(motion);
	  this.pos = newPos;
	};
	
	Bullet.prototype.act = function (step, level) {
	  this.moveX(step, level);
	};
	
	function Megaman(pos) {
	  this.pos = pos.plus(new VectorUtil(0, 0));
	  this.size = new VectorUtil(1, 1);
	  this.speed = new VectorUtil(0, 0);
	  this.lastFire = new Date();
	}
	
	Megaman.prototype.type = "megaman";
	
	Megaman.prototype.moveX = function (step, level, keys) {
	  this.speed.x = 0;
	  if (keys.left) this.speed.x -= megamanXSpeed;
	  if (keys.right) this.speed.x += megamanXSpeed;
	
	  if (keys.shoot) {
	    // this will slow down the firing rate to 3 a second
	    var cFire = new Date();
	    if ((cFire - this.lastFire) / 1000 > firingRate) {
	      level.sprites.push(new Bullet(new VectorUtil(this.pos.x, this.pos.y)));
	      this.lastFire = cFire;
	    }
	  }
	  var motion = new VectorUtil(this.speed.x * step, 0);
	  var newPos = this.pos.plus(motion);
	  var collidedObject = level.findCollision(newPos, this.size);
	  if (collidedObject) level.spriteOverlapAction(collidedObject);else this.pos = newPos;
	};
	
	Megaman.prototype.moveY = function (step, level, keys) {
	  this.speed.y += step * gravity;
	  var motion = new VectorUtil(0, this.speed.y * step);
	  var newPos = this.pos.plus(motion);
	  var collidedObject = level.findCollision(newPos, this.size);
	  if (collidedObject) {
	    level.spriteOverlapAction(collidedObject);
	    if (keys.up && this.speed.y > 0) this.speed.y = -jumpSpeed;else this.speed.y = 0;
	  } else {
	    this.pos = newPos;
	  }
	};
	
	Megaman.prototype.act = function (step, level, keys) {
	  this.moveX(step, level, keys);
	  this.moveY(step, level, keys);
	
	  var otherSprite = level.findOverlappingObject(this);
	  if (otherSprite) level.spriteOverlapAction(otherSprite.type, otherSprite);
	
	  // Losing animation
	  if (level.status === "lost") {
	    this.pos.y += step;
	    this.size.y -= step;
	  }
	};
	
	Level.prototype.findCollision = function (pos, size) {
	  var left = Math.floor(pos.x);
	  var right = Math.ceil(pos.x + size.x);
	  var top = Math.floor(pos.y);
	  var bottom = Math.ceil(pos.y + size.y);
	
	  if (left < 0 || right > this.width || top < 0) return "block";
	
	  for (var y = top; y < bottom; y++) {
	    for (var x = left; x < right; x++) {
	      var fieldType = this.grid[y][x];
	      if (fieldType) return fieldType;
	    }
	  }
	};
	
	Level.prototype.findOverlappingObject = function (player) {
	  for (var i = 0; i < this.sprites.length; i++) {
	    var other = this.sprites[i];
	    if (other !== player && player.pos.x + player.size.x > other.pos.x && player.pos.x < other.pos.x + other.size.x && player.pos.y + player.size.y > other.pos.y && player.pos.y < other.pos.y + other.size.y) return other;
	  }
	};
	
	var maxStep = 0.05;
	
	Level.prototype.animate = function (step, keys) {
	  var _this = this;
	
	  if (this.status !== null) this.finishDelay -= step;
	
	  var _loop = function _loop() {
	    var thisStep = Math.min(step, maxStep);
	    _this.sprites.forEach(function (player) {
	      player.act(thisStep, this, keys);
	    }, _this);
	    step -= thisStep;
	  };
	
	  while (step > 0) {
	    _loop();
	  }
	};
	
	Level.prototype.spriteOverlapAction = function (type, player, sprite) {
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
	  var pressed = Object.create(null);
	  function handler(event) {
	    if (codes.hasOwnProperty(event.keyCode)) {
	      var down = event.type === "keydown";
	      pressed[codes[event.keyCode]] = down;
	      event.preventDefault();
	    }
	  }
	  addEventListener("keydown", handler);
	  addEventListener("keyup", handler);
	  return pressed;
	}
	
	function runAnimation(frameFunc) {
	  var lastTime = null;
	  function frame(time) {
	    var stop = false;
	    if (lastTime !== null) {
	      var timeStep = Math.min(time - lastTime, 100) / 1000;
	      stop = frameFunc(timeStep) === false;
	    }
	    lastTime = time;
	    if (!stop) requestAnimationFrame(frame);
	  }
	  requestAnimationFrame(frame);
	}
	
	var arrows = trackKeys(arrowCodes);
	
	function runLevel(level, Display, gameContinues) {
	  var display = new Display(document.body, level);
	  window.display = display;
	  runAnimation(function (step) {
	    level.animate(step, arrows);
	    display.drawFrame(step);
	    if (level.isFinished()) {
	      display.clear();
	      if (gameContinues) gameContinues(level.status);
	      return false;
	    }
	  });
	}
	
	function play(plans, Display) {
	  function startLevel(n) {
	    runLevel(new Level(plans[n]), Display, function (status) {
	      if (status === "lost") startLevel(n);else if (n < plans.length - 1) startLevel(n + 1);
	    });
	  }
	  startLevel(0);
	}
	
	function flipHorizontally(context, around) {
	  context.translate(around, 0);
	  context.scale(-1, 1);
	  context.translate(-around, 0);
	}
	
	function Canvas(parent, level) {
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
	
	Canvas.prototype.clear = function () {
	  this.canvas.parentNode.removeChild(this.canvas);
	};
	
	Canvas.prototype.drawFrame = function (step) {
	  this.animationTime += step;
	
	  this.updateViewport();
	  this.clearDisplay();
	  this.drawBackground();
	  this.drawSprites();
	};
	
	Canvas.prototype.updateViewport = function () {
	  var view = this.viewport,
	      margin = view.width / 3;
	  var megaman = this.level.megaman;
	  var center = megaman.pos.plus(megaman.size.times(0.5));
	
	  if (center.x < view.left + margin) view.left = Math.max(center.x - margin, 0);else if (center.x > view.left + view.width - margin) view.left = Math.min(center.x + margin - view.width, this.level.width - view.width);
	  if (center.y < view.top + margin) view.top = Math.max(center.y - margin, 0);else if (center.y > view.top + view.height - margin) view.top = Math.min(center.y + margin - view.height, this.level.height - view.height);
	};
	
	Canvas.prototype.clearDisplay = function () {
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
	
	Canvas.prototype.drawBackground = function () {
	  var view = this.viewport;
	  var left = Math.floor(view.left);
	  var right = Math.ceil(view.left + view.width);
	  var top = Math.floor(view.top);
	  var bottom = Math.ceil(view.top + view.height);
	
	  for (var y = top; y < bottom; y++) {
	    for (var x = left; x < right; x++) {
	      var fieldType = this.level.grid[y][x];
	      if (fieldType === null) continue;
	      var xPosition = (x - view.left) * spriteSize;
	      var yPosition = (y - view.top) * spriteSize;
	
	      var spriteFrameNumber = void 0;
	      if (fieldType === "water") spriteFrameNumber = 16;
	      if (fieldType === "block") spriteFrameNumber = 15;
	
	      this.cx.drawImage(spriteRoll, spriteFrameNumber * spriteSize, 0, spriteSize, spriteSize, xPosition, yPosition, spriteSize, spriteSize);
	    }
	  }
	};
	
	Canvas.prototype.drawMegaMan = function (x, y, width, height) {
	  var spriteFrameNumber = 0;
	  var megaman = this.level.megaman;
	
	  if (megaman.speed.x !== 0) this.facingRight = megaman.speed.x < 0;
	
	  if (megaman.speed.y !== 0) {
	    spriteFrameNumber = 11;
	  } else if (megaman.speed.x !== 0) {
	    spriteFrameNumber = Math.floor(this.animationTime * 12) % 10 + 1;
	  }
	
	  this.cx.save(); //keep drawing context intact
	  if (this.facingRight) flipHorizontally(this.cx, x + width / 2);
	
	  this.cx.drawImage(spriteRoll, spriteFrameNumber * width, 0, width, height, x, y, width, height);
	
	  this.cx.restore(); //restore drawing context
	};
	
	Canvas.prototype.drawBoss = function (x, y, width, height) {
	  var spriteFrameNumber = 13;
	  this.cx.drawImage(spriteRoll, spriteFrameNumber * width, 0, width, height, x, y, width, height);
	};
	
	Canvas.prototype.drawBullet = function (x, y, width, height) {
	  var spriteFrameNumber = 12;
	  this.cx.drawImage(spriteRoll, spriteFrameNumber * width, 0, width, height, x, y, width, height);
	};
	
	Canvas.prototype.drawSprites = function () {
	  this.level.sprites.forEach(function (sprite) {
	    var width = sprite.size.x * spriteSize;
	    var height = sprite.size.y * spriteSize;
	    var x = (sprite.pos.x - this.viewport.left) * spriteSize;
	    var y = (sprite.pos.y - this.viewport.top) * spriteSize;
	    if (sprite.type === "megaman") {
	      this.drawMegaMan(x, y, width, height);
	    } else if (sprite.type === "boss") {
	      this.drawBoss(x, y, width, height);
	    } else if (sprite.type === "bullet") {
	      this.drawBullet(x, y, width, height);
	    }
	  }, this);
	};

/***/ },
/* 2 */,
/* 3 */,
/* 4 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var levels = exports.levels = [["                                                                                    ", "                                                                                    ", "                                                                                    ", "                                                                                    ", "                                                                                    ", "                                                                                    ", "                                           ####               ######   ###  ########", "                                                                                    ", "                                                   #########                        ", "                                            #####                                   ", "     M   B       ###                                                                ", "WW############WWWWWWWWW########WWW####################WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW", "                                                                                    "]];

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map
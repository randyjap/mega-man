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
	
	var _levels = __webpack_require__(2);
	
	var _canvas = __webpack_require__(3);
	
	document.addEventListener("DOMContentLoaded", function () {
	  (0, _game.play)(_levels.levels, _canvas.Canvas);
	  var restartButton = document.getElementById("restart");
	  restartButton.addEventListener("click", function (e) {
	    e.preventDefault();
	
	    var canvas = document.getElementById("canvas");
	    if (canvas) {
	      cancelAnimationFrame(window.animation);
	      document.body.removeChild(canvas);
	      (0, _game.play)(_levels.levels, _canvas.Canvas);
	    } else {
	      (0, _game.play)(_levels.levels, _canvas.Canvas);
	    }
	  });
	
	  var proxy = document.getElementById("pause");
	  proxy.addEventListener("click", function (e) {
	    e.preventDefault();
	  });
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.play = play;
	
	var _vector_util = __webpack_require__(4);
	
	var _sprites = __webpack_require__(5);
	
	var arrowCodes = { 65: "left", 87: "up", 68: "right", 32: "shoot" };
	
	function Game(plan) {
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
	      if (Sprite) this.sprites.push(new Sprite(new _vector_util.VectorUtil(x, y), chr));else if (chr === "#") fieldType = "block";else if (chr === "W") fieldType = "water";
	      transformedRow.push(fieldType);
	    }
	    this.grid.push(transformedRow);
	  }
	
	  this.megaman = this.sprites.filter(function (player) {
	    return player.type === "megaman";
	  })[0];
	
	  this.boss = this.sprites.filter(function (player) {
	    return player.type === "boss";
	  })[0];
	
	  this.gameStatus = null;
	  this.score = 0;
	}
	
	var characters = {
	  "M": _sprites.Megaman,
	  "B": _sprites.Boss
	};
	
	Game.prototype.findCollision = function (pos, size) {
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
	
	Game.prototype.findOverlappingObject = function (player) {
	  for (var i = 0; i < this.sprites.length; i++) {
	    var other = this.sprites[i];
	    if (other !== player && player.pos.x + player.size.x > other.pos.x && player.pos.x < other.pos.x + other.size.x && player.pos.y + player.size.y > other.pos.y && player.pos.y < other.pos.y + other.size.y) return other;
	  }
	};
	
	var maxStep = 0.05;
	
	Game.prototype.animate = function (step, keys) {
	  var _this = this;
	
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
	
	Game.prototype.spriteOverlapAction = function (type, player, sprite) {
	  if (type === "water" && this.gameStatus === null) {
	    if (this.megaman.hitPoints > 0) this.megaman.hitPoints -= 0.3;
	    if (this.megaman.hitPoints <= 0) {
	      this.gameStatus = "lost";
	    }
	    this.megaman.hit = true;
	  } else if (type === "friendly-bullet" && sprite && sprite.type === "boss" && this.gameStatus === null) {
	    sprite.hitPoints--;
	    this.score += Math.round(100000 * Math.random());
	    document.getElementById("score").innerHTML = 'Score: ' + this.score;
	    sprite.hit = true;
	    if (sprite.hitPoints <= 0) {
	      this.gameStatus = "won";
	    }
	  } else if (type === "unfriendly-bullet" && sprite && sprite.type === "megaman" && this.gameStatus === null) {
	    sprite.hitPoints--;
	    sprite.hit = true;
	    if (sprite.hitPoints <= 0) {
	      this.gameStatus = "lost";
	    }
	  }
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
	    if (!stop) window.animation = requestAnimationFrame(frame);
	  }
	  requestAnimationFrame(frame);
	}
	
	var arrows = trackKeys(arrowCodes);
	
	function start(level, Canvas, gameContinues) {
	  var display = new Canvas(document.body, level);
	  window.display = display;
	  runAnimation(function (step) {
	    level.animate(step, arrows);
	    display.drawFrame(step);
	  });
	}
	
	function play(plans, Canvas) {
	  function startLevel(n) {
	    start(new Game(plans[n]), Canvas, function (gameStatus) {
	      if (gameStatus === "lost") console.log(gameStatus);else if (gameStatus === "won") console.log(gameStatus);
	    });
	  }
	  startLevel(0);
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var levels = exports.levels = [["                                                                                ", "                                                                                ", "                                                                                ", "                                                                                ", "                                                                                ", "                                                                                ", "                                                                                ", "                                                                                ", "                                                                                ", "                                         B                                      ", "     M           ###                   #####                ########            ", "WW############WWWWWWWWW####WWW########################WWWWWWWWWW#############WWW", "                                                                                "]];

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Canvas = Canvas;
	var spriteSize = 50;
	var spriteRoll = document.createElement("img");
	spriteRoll.src = "images/megaman.png";
	
	function flipHorizontally(context, around) {
	  context.translate(around, 0);
	  context.scale(-1, 1);
	  context.translate(-around, 0);
	}
	
	function Canvas(parent, game) {
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
	      margin = view.width / 6;
	  var megaman = this.game.megaman;
	  var center = megaman.pos.plus(megaman.size.times(0.5));
	
	  if (center.x < view.left + margin * 2) {
	    view.left = Math.max(center.x - margin * 2, 0);
	  } else if (center.x > view.left + view.width - margin * 2) {
	    view.left = Math.min(center.x + margin * 2 - view.width, this.game.width - view.width);
	  }
	
	  if (center.y < view.top + margin) {
	    view.top = Math.max(center.y - margin, 0);
	  } else if (center.y > view.top + view.height - margin) {
	    view.top = Math.min(center.y + margin - view.height, this.game.height - view.height);
	  }
	};
	
	Canvas.prototype.clearDisplay = function () {
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
	
	Canvas.prototype.drawBackground = function () {
	  var view = this.viewport;
	  var left = Math.floor(view.left);
	  var right = Math.ceil(view.left + view.width);
	  var top = Math.floor(view.top);
	  var bottom = Math.ceil(view.top + view.height);
	
	  for (var y = top; y < bottom; y++) {
	    for (var x = left; x < right; x++) {
	      var fieldType = this.game.grid[y][x];
	      if (fieldType === null) continue;
	      var xPosition = (x - view.left) * spriteSize;
	      var yPosition = (y - view.top) * spriteSize;
	
	      var spriteFrameNumber = void 0;
	      if (fieldType === "water") spriteFrameNumber = 16;
	      if (fieldType === "block") spriteFrameNumber = 15;
	
	      this.cx.drawImage(spriteRoll, spriteFrameNumber * spriteSize, 0, spriteSize, spriteSize, xPosition, yPosition, spriteSize, spriteSize);
	    }
	  }
	
	  var farewellMessage = document.createElement("img");
	  farewellMessage.src = "images/win-loss.png";
	  var messageNumber = void 0;
	
	  if (this.game.gameStatus === "lost") {
	    messageNumber = 1;
	    this.cx.drawImage(farewellMessage, messageNumber * 400, 0, 400, 200, 400 + (right - left) / 2, 100 + (bottom - top) / 2, 400, 200);
	  } else if (this.game.gameStatus === "won") {
	    messageNumber = 0;
	    this.cx.drawImage(farewellMessage, messageNumber * 400, 0, 400, 200, 400 + (right - left) / 2, 100 + (bottom - top) / 2, 400, 200);
	  } else if (new Date() - this.start < 7000) {
	    messageNumber = 2;
	    this.cx.drawImage(farewellMessage, messageNumber * 400, 0, 400, 200, 400 + (right - left) / 2, 100 + (bottom - top) / 2, 400, 200);
	  }
	};
	
	Canvas.prototype.drawMegaMan = function (x, y, width, height) {
	  var spriteFrameNumber = 0;
	  var megaman = this.game.megaman;
	
	  if (megaman.hitPoints > 0 && megaman.hitPoints < 50) megaman.hitPoints += 0.02;
	
	  document.getElementById("megaman-health").innerHTML = "Megaman Health: " + Math.round(megaman.hitPoints);
	
	  if (megaman.speed.x !== 0) this.facingRight = megaman.speed.x < 0;
	
	  if (megaman.hit) {
	    spriteFrameNumber = 14;
	  } else if (megaman.speed.y !== 0) {
	    spriteFrameNumber = 11;
	  } else if (megaman.speed.x !== 0) {
	    spriteFrameNumber = Math.floor(this.animationTime * 12) % 10 + 1;
	  }
	
	  var rectangle = new Path2D();
	  rectangle.rect(x, y - 20, 50 * megaman.hitPoints / 50, 20);
	  this.cx.stroke(rectangle);
	  this.cx.save(); //keep drawing context intact
	
	  if (this.facingRight) flipHorizontally(this.cx, x + width / 2);
	  this.cx.drawImage(spriteRoll, spriteFrameNumber * width, 0, width, height, x, y, width, height);
	
	  this.cx.restore(); //restore drawing context
	};
	
	Canvas.prototype.drawBoss = function (x, y, width, height) {
	  var spriteFrameNumber = 13;
	  var boss = this.game.boss;
	  if (boss.destroyed) {
	    spriteFrameNumber = [17, 18][Math.floor(Math.random() * [17, 18].length)];
	  } else if (boss.hit) {
	    spriteFrameNumber = [17, 18][Math.floor(Math.random() * [17, 18].length)];
	  }
	
	  if (!boss.destroyed && boss.hitPoints < 100) boss.hitPoints += 0.02;
	  document.getElementById("boss-health").innerHTML = "Boss Health: " + Math.round(boss.hitPoints);
	
	  var rectangle = new Path2D();
	  rectangle.rect(x, y - 20, 50 * boss.hitPoints / 50, 20);
	  this.cx.stroke(rectangle);
	
	  this.cx.save(); //keep drawing context intact
	  if (this.game.megaman.pos.x > this.game.boss.pos.x) flipHorizontally(this.cx, x + width / 2);
	
	  this.cx.drawImage(spriteRoll, spriteFrameNumber * width, 0, width, height, x, y, width, height);
	
	  this.cx.restore(); //restore drawing context
	};
	
	Canvas.prototype.drawBullet = function (x, y, width, height) {
	  var spriteFrameNumber = 12;
	  this.cx.drawImage(spriteRoll, spriteFrameNumber * width, 0, width, height, x, y, width, height);
	};
	
	Canvas.prototype.drawSprites = function () {
	  this.game.sprites.forEach(function (sprite) {
	    var width = sprite.size.x * spriteSize;
	    var height = sprite.size.y * spriteSize;
	    var x = (sprite.pos.x - this.viewport.left) * spriteSize;
	    var y = (sprite.pos.y - this.viewport.top) * spriteSize;
	    if (sprite.type === "megaman") {
	      this.drawMegaMan(x, y, width, height);
	    } else if (sprite.type === "boss") {
	      this.drawBoss(x, y, width, height);
	    } else if (sprite.type === "friendly-bullet") {
	      this.drawBullet(x, y, width, height);
	    } else if (sprite.type === "unfriendly-bullet") {
	      this.drawBullet(x, y, width, height);
	    }
	  }, this);
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.VectorUtil = VectorUtil;
	function VectorUtil(x, y) {
	  this.x = x;this.y = y;
	}
	VectorUtil.prototype.plus = function (other) {
	  return new VectorUtil(this.x + other.x, this.y + other.y);
	};
	VectorUtil.prototype.times = function (factor) {
	  return new VectorUtil(this.x * factor, this.y * factor);
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Boss = Boss;
	exports.Bullet = Bullet;
	exports.Megaman = Megaman;
	
	var _vector_util = __webpack_require__(4);
	
	var gravity = 45;
	var jumpSpeed = 18;
	var megamanXSpeed = 6;
	var bossFiringRate = 4 / 3;
	var megamanFiringRate = 1 / 3;
	
	function Boss(pos) {
	  this.pos = pos.plus(new _vector_util.VectorUtil(0, 0));
	  this.size = new _vector_util.VectorUtil(1, 1);
	  this.speed = new _vector_util.VectorUtil(0, 0);
	  this.hitPoints = 100;
	  this.lastFire = new Date();
	  this.hit = false;
	  this.destroyed = false;
	}
	
	Boss.prototype.type = "boss";
	
	Boss.prototype.moveY = function (step, game) {
	  this.speed.y += step * gravity;
	  var motion = new _vector_util.VectorUtil(0, this.speed.y * step);
	  var newPos = this.pos.plus(motion);
	  var collidedObject = game.findCollision(newPos, this.size);
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
	
	Boss.prototype.act = function (step, game) {
	  this.moveY(step, game);
	
	  // this will slow down the firing rate to 3 a second
	  if (!this.destroyed) {
	    var cFire = new Date();
	    if ((cFire - this.lastFire) / 1000 > bossFiringRate) {
	      var fireRight = true;
	      if (this.pos.x > game.megaman.pos.x) fireRight = false;
	      game.sprites.push(new Bullet(new _vector_util.VectorUtil(this.pos.x, this.pos.y), "unfriendly-bullet", fireRight));
	      this.lastFire = cFire;
	    }
	  }
	
	  var otherSprite = game.findOverlappingObject(this);
	  if (otherSprite) {
	    game.spriteOverlapAction(otherSprite.type, otherSprite, this);
	  } else {
	    this.hit = false;
	  }
	
	  if (game.gameStatus === "won") {
	    this.destroyed = true;
	  }
	};
	
	function Bullet(pos, bulletType, fireRight) {
	  this.pos = pos.plus(new _vector_util.VectorUtil(0, 0));
	  this.size = new _vector_util.VectorUtil(1, 1);
	  if (fireRight === true) {
	    this.speed = new _vector_util.VectorUtil(10, 0);
	  } else if (fireRight === false) {
	    this.speed = new _vector_util.VectorUtil(-10, 0);
	  } else if (window.display.facingRight) {
	    this.speed = new _vector_util.VectorUtil(-10, 0);
	  } else {
	    this.speed = new _vector_util.VectorUtil(10, 0);
	  }
	  this.type = bulletType;
	}
	
	Bullet.prototype.moveX = function (step, game, keys) {
	  var motion = new _vector_util.VectorUtil(this.speed.x * step, 0);
	  var newPos = this.pos.plus(motion);
	  this.pos = newPos;
	};
	
	Bullet.prototype.act = function (step, game) {
	  this.moveX(step, game);
	};
	
	function Megaman(pos) {
	  this.pos = pos.plus(new _vector_util.VectorUtil(0, 0));
	  this.size = new _vector_util.VectorUtil(1, 1);
	  this.speed = new _vector_util.VectorUtil(0, 0);
	  this.lastFire = new Date();
	  this.hitPoints = 50;
	  this.hit = false;
	}
	
	Megaman.prototype.type = "megaman";
	
	Megaman.prototype.moveX = function (step, game, keys) {
	  this.speed.x = 0;
	  if (keys.left) this.speed.x -= megamanXSpeed;
	  if (keys.right) this.speed.x += megamanXSpeed;
	
	  var motion = new _vector_util.VectorUtil(this.speed.x * step, 0);
	  var newPos = this.pos.plus(motion);
	  var collidedObject = game.findCollision(newPos, this.size);
	  if (collidedObject) {
	    game.spriteOverlapAction(collidedObject);
	  } else if (this.hitPoints > 0) {
	    this.hit = false;
	    this.pos = newPos;
	  }
	};
	
	Megaman.prototype.moveY = function (step, game, keys) {
	  this.speed.y += step * gravity;
	  var motion = new _vector_util.VectorUtil(0, this.speed.y * step);
	  var newPos = this.pos.plus(motion);
	  var collidedObject = game.findCollision(newPos, this.size);
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
	
	Megaman.prototype.act = function (step, game, keys) {
	  this.moveX(step, game, keys);
	  this.moveY(step, game, keys);
	  if (keys.shoot && this.hitPoints > 0) {
	    // this will slow down the firing rate to 3 a second
	    var cFire = new Date();
	    if ((cFire - this.lastFire) / 1000 > megamanFiringRate) {
	      game.sprites.push(new Bullet(new _vector_util.VectorUtil(this.pos.x, this.pos.y), "friendly-bullet"));
	      this.lastFire = cFire;
	    }
	  }
	
	  var otherSprite = game.findOverlappingObject(this);
	  if (otherSprite) {
	    game.spriteOverlapAction(otherSprite.type, otherSprite, this);
	  }
	
	  // Losing animation
	  if (game.gameStatus === "lost") {
	    this.hit = true;
	  }
	};

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map
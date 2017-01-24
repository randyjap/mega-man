/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports) {

	let cx = document.querySelector("canvas").getContext("2d");

	let img = document.createElement("img");
	img.src = "images/megaman.png";
	let widthOfSprite = 50, heightOfSprite = 50;
	img.addEventListener("load", () => {
	  let clipOffset = 0;
	  setInterval(() => {
	    document.querySelector("canvas").width = window.innerWidth;
	    document.querySelector("canvas").height = window.innerHeight;
	    cx.clearRect(
	      0, 0, // where to start clearing
	      window.innerWidth, window.innerHeight //where to end clear
	    );

	    // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
	    cx.drawImage(
	      img, //Image
	      clipOffset * widthOfSprite, 0, //Where to start clipping x and y
	      widthOfSprite, heightOfSprite, //Width of clipping in x height and y height
	      0, window.innerHeight - 50, // location on where to render on page
	      widthOfSprite, heightOfSprite); //X width and Y height to stretch or reduce
	      clipOffset = (clipOffset + 1) % 9;
	  }, 120);
	});


/***/ },
/* 2 */
/***/ function(module, exports) {

	

/***/ }
/******/ ]);
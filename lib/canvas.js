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

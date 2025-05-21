const boardSize = 19;
const marginPx = 20;
const canvasSize = 800;
let gridSize;

function setup() {
  createCanvas(canvasSize, canvasSize);
  gridSize = (canvasSize - 2 * marginPx) / (boardSize - 1);
}

function draw() {
  background(240, 230, 214);
  stroke(0);
  for (let i = 0; i < boardSize; i++) {
    let pos = marginPx + i * gridSize;
    line(marginPx, pos, width - marginPx, pos);
    line(pos, marginPx, pos, height - marginPx);
  }
}

const boardSize = 19;
const marginPx  = 20;
const canvasSize = 800;
let gridSize;

let board, currentPlayer;

function setup() {
  createCanvas(canvasSize, canvasSize);
  gridSize = (canvasSize - 2 * marginPx) / (boardSize - 1);
  board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
  currentPlayer = 1;  // 1=black, 2=white
}

function draw() {
  // draw the 19×19 grid:
  background(240, 230, 214);
  stroke(0);
  for (let i = 0; i < boardSize; i++) {
    let pos = marginPx + i * gridSize;
    line(marginPx, pos, canvasSize - marginPx, pos);
    line(pos, marginPx, pos, canvasSize - marginPx);
  }
  // then the stones:
  drawStones();
}

function mousePressed() {
  let i = round((mouseX - marginPx) / gridSize);
  let j = round((mouseY - marginPx) / gridSize);
  if (
    i >= 0 && i < boardSize &&
    j >= 0 && j < boardSize &&
    board[i][j] === 0
  ) {
    board[i][j] = currentPlayer;
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  }
}

function drawStones() {
  noStroke();
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] !== 0) {
        fill(board[i][j] === 1 ? 0 : 255);
        ellipse(
          marginPx + i * gridSize,
          marginPx + j * gridSize,
          gridSize * 0.9
        );
      }
    }
  }
}

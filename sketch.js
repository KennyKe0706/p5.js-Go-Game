// sketch.js (Version 3: grid + click stones + undo & restart)

const boardSize   = 19;
const marginPx    = 20;
const canvasSize  = 800;
let gridSize;
let board;
let currentPlayer;
let moveHistory = [];

function setup() {
  // Create & embed the canvas
  const c = createCanvas(canvasSize, canvasSize);
  c.parent('canvas-container');

  // Compute spacing & init game state
  gridSize      = (canvasSize - 2 * marginPx) / (boardSize - 1);
  board         = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
  currentPlayer = 1;  // 1 = Black, 2 = White

  // Hook up buttons
  select('#undo').mousePressed(undoMove);
  select('#restart').mousePressed(restartGame);

  // Initialize UI
  select('#player').html('Black');
}

function draw() {
  background(240, 230, 214);
  drawGrid();
  drawStones();
}

function drawGrid() {
  stroke(0);
  for (let i = 0; i < boardSize; i++) {
    let pos = marginPx + i * gridSize;
    line(marginPx, pos, canvasSize - marginPx, pos);
    line(pos, marginPx, pos, canvasSize - marginPx);
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

function mousePressed() {
  // Map mouse to nearest grid intersection
  let i = round((mouseX - marginPx) / gridSize);
  let j = round((mouseY - marginPx) / gridSize);

  // Check bounds & empty
  if (
    i >= 0 && i < boardSize &&
    j >= 0 && j < boardSize &&
    board[i][j] === 0
  ) {
    // Place stone & record history
    board[i][j] = currentPlayer;
    moveHistory.push({ i, j, player: currentPlayer });

    // Switch player & update UI
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    select('#player').html(currentPlayer === 1 ? 'Black' : 'White');
  }
}

function undoMove() {
  if (moveHistory.length === 0) return;
  const last = moveHistory.pop();

  // Remove the stone
  board[last.i][last.j] = 0;

  // Switch back to the mover & update UI
  currentPlayer = last.player;
  select('#player').html(currentPlayer === 1 ? 'Black' : 'White');
}

function restartGame() {
  // Reset board & history
  board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
  moveHistory = [];

  // Reset player & UI
  currentPlayer = 1;
  select('#player').html('Black');
}

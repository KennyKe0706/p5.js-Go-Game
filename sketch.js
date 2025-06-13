const boardSize = 19;
const marginPx = 20;
const svgSize = 800;

// Game state variables
let gridSize;
let board;
let currentPlayer;
let gameOver = false;
let lastMove = null;  // Tracks the most recent move
let moveHistory = []; // Stores moves for undo functionality
let blackCaptures = 0; // Tracks captured stones for Black
let whiteCaptures = 0; // Tracks captured stones for White

function setup() {
  let canvas = createCanvas(svgSize, svgSize);
  canvas.parent('canvas-container');
  gridSize = (svgSize - 2 * marginPx) / (boardSize - 1);
  board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
  currentPlayer = 1; // 1 = Black, 2 = White
  select('#restart').mousePressed(restartGame);
  select('#undo').mousePressed(undoMove);
}

function draw() {
  drawGrid();
  drawAllStones();
  if (lastMove) drawLastMoveHighlight();
}

function drawGrid() {
  background(240, 230, 214); // Light wooden color
  stroke(0);
  strokeWeight(1);
  for (let i = 0; i < boardSize; i++) {
    let pos = marginPx + i * gridSize;
    line(marginPx, pos, svgSize - marginPx, pos); // Horizontal lines
    line(pos, marginPx, pos, svgSize - marginPx); // Vertical lines
  }
}

function drawAllStones() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] !== 0) drawStone(i, j, board[i][j]);
    }
  }
}

function drawStone(i, j, player) {
  let x = marginPx + i * gridSize;
  let y = marginPx + j * gridSize;
  noStroke();
  fill(player === 1 ? 0 : 255); // Black or White
  ellipse(x, y, gridSize * 0.9);
}

function drawLastMoveHighlight() {
  let [i, j] = lastMove;
  let x = marginPx + i * gridSize;
  let y = marginPx + j * gridSize;
  noFill();
  stroke(255, 0, 0); // Red highlight
  strokeWeight(2);
  ellipse(x, y, gridSize * 0.9 + 4);
}

function mousePressed() {
  if (gameOver) return;
  if (mouseX < marginPx - 5 || mouseX > svgSize - marginPx + 5 ||
      mouseY < marginPx - 5 || mouseY > svgSize - marginPx + 5) return;

  let i = round((mouseX - marginPx) / gridSize);
  let j = round((mouseY - marginPx) / gridSize);

  if (isValidMove(i, j)) {
    placeStone(i, j);
    const result = checkCaptures(i, j);
    if (result.valid) {
      moveHistory.push({
        player: currentPlayer,
        position: [i, j],
        captured: result.captured
      });
      if (currentPlayer === 1) {
        blackCaptures += result.captured.length;
      } else {
        whiteCaptures += result.captured.length;
      }
      currentPlayer = currentPlayer === 1 ? 2 : 1;
      select('#player').html(currentPlayer === 1 ? 'Black' : 'White');
      select('#black-captures').html(blackCaptures);
      select('#white-captures').html(whiteCaptures);
    } else {
      console.log("Invalid move: suicide");
    }
  }
}

function isValidMove(i, j) {
  return i >= 0 && i < boardSize && j >= 0 && j < boardSize && board[i][j] === 0;
}

function placeStone(i, j) {
  board[i][j] = currentPlayer;
  lastMove = [i, j];
}

function checkCaptures(i, j) {
  const directions = [[1,0], [-1,0], [0,1], [0,-1]];
  const opponent = currentPlayer === 1 ? 2 : 1;
  let capturedStones = [];

  // Check adjacent opponent groups
  for (let [dx, dy] of directions) {
    const x = i + dx;
    const y = j + dy;
    if (x >= 0 && x < boardSize && y >= 0 && y < boardSize && board[x][y] === opponent) {
      const group = findGroup(x, y);
      if (!hasLiberties(group)) {
        const removed = removeGroup(group);
        capturedStones = capturedStones.concat(removed);
      }
    }
  }

  // Check if new stone has liberties (prevent suicide)
  const newGroup = findGroup(i, j);
  if (!hasLiberties(newGroup)) {
    removeGroup(newGroup);
    return { valid: false, captured: [] };
  } else {
    return { valid: true, captured: capturedStones };
  }
}

function findGroup(x, y, visited = new Set()) {
  const color = board[x][y];
  const stack = [[x, y]];
  const group = [];
  
  while (stack.length > 0) {
    const [i, j] = stack.pop();
    const key = `${i},${j}`;
    
    if (!visited.has(key) && board[i][j] === color) {
      visited.add(key);
      group.push([i, j]);
      
      for (let [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
        const ni = i + dx;
        const nj = j + dy;
        if (ni >= 0 && ni < boardSize && nj >= 0 && nj < boardSize) {
          stack.push([ni, nj]);
        }
      }
    }
  }
  return group;
}

function hasLiberties(group) {
  for (let [i, j] of group) {
    for (let [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
      const x = i + dx;
      const y = j + dy;
      if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
        if (board[x][y] === 0) return true;
      }
    }
  }
  return false;
}

function removeGroup(group) {
  const removed = [];
  for (let [i, j] of group) {
    removed.push([i, j]);
    board[i][j] = 0;
  }
  return removed;
}

function undoMove() {
  if (moveHistory.length === 0) return;
  const lastMoveData = moveHistory.pop();
  const { player, position, captured } = lastMoveData;
  const [i, j] = position;

  // Remove the stone placed
  board[i][j] = 0;

  // Restore captured stones
  for (let [x, y] of captured) {
    board[x][y] = player === 1 ? 2 : 1; // Opponent's stones
  }

  // Adjust capture counts
  if (player === 1) {
    blackCaptures -= captured.length;
  } else {
    whiteCaptures -= captured.length;
  }

  // Switch back to the previous player
  currentPlayer = player;

  // Update the display
  select('#player').html(currentPlayer === 1 ? 'Black' : 'White');
  select('#black-captures').html(blackCaptures);
  select('#white-captures').html(whiteCaptures);

  // Update lastMove
  if (moveHistory.length > 0) {
    lastMove = moveHistory[moveHistory.length - 1].position;
  } else {
    lastMove = null;
  }
}

function restartGame() {
  board = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
  currentPlayer = 1;
  gameOver = false;
  lastMove = null;
  moveHistory = [];
  blackCaptures = 0;
  whiteCaptures = 0;
  select('#player').html('Black');
  select('#black-captures').html(0);
  select('#white-captures').html(0);
}
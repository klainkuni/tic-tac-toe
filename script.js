// script.js

const board = document.getElementById('game-board');
const statusText = document.getElementById('status');
const winMessage = document.getElementById('win-message');
const playerWins = document.getElementById('player-wins');
const aiWins = document.getElementById('ai-wins');
const draws = document.getElementById('draws');

const moveSound = document.getElementById('move-sound');
const winSound = document.getElementById('win-sound');
const drawSound = document.getElementById('draw-sound');
const soundToggle = document.getElementById('sound-toggle');

let currentPlayer = 'X';
let gameBoard = [];
let gameOver = false;
let aiDifficulty = 'hard';
let fieldSize = 3;

function setBackground() {
  const bg = document.getElementById('background-select').value;

  if (bg === 'default') {
    document.body.style.backgroundImage = 'url("https://images.unsplash.com/photo-1596497898413-fd2f6e0b8a6c")'; 
    document.body.style.backgroundColor = '';
  } else if (bg === 'light') {
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '#f0f0f0';
  } else if (bg === 'dark') {
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '#1e1e2f';
  } else if (bg === 'green') {
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '#a8e6cf';
  }
}

function setDifficulty() {
  aiDifficulty = document.getElementById('difficulty-select').value;
}

function setFieldSize() {
  fieldSize = parseInt(document.getElementById('field-size-select').value);
  resetGame();
}

document.getElementById('background-select').addEventListener('change', setBackground);
document.getElementById('difficulty-select').addEventListener('change', setDifficulty);
document.getElementById('field-size-select').addEventListener('change', setFieldSize);

setBackground();

function playSound(sound) {
  if (soundToggle.checked) {
    setTimeout(() => {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    }, 100); // Delay to let browser load audio
  }
}

function createBoard() {
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${fieldSize}, 100px)`;
  board.style.gridTemplateRows = `repeat(${fieldSize}, 100px)`;

  gameBoard = Array(fieldSize * fieldSize).fill(null);

  for (let i = 0; i < fieldSize * fieldSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', () => handleMove(i));
    board.appendChild(cell);
  }
}

function handleMove(index) {
  if (gameOver || gameBoard[index]) return;

  gameBoard[index] = currentPlayer;
  const cell = board.children[index];
  cell.textContent = currentPlayer;
  cell.classList.add('show');
  playSound(moveSound);

  if (checkWin()) {
    statusText.textContent = `${currentPlayer} wins!`;
    updateStats(currentPlayer);
    gameOver = true;
    playSound(winSound);
    return;
  }

  if (gameBoard.every(cell => cell)) {
    statusText.textContent = "It's a draw!";
    updateStats('draw');
    gameOver = true;
    playSound(drawSound);
    return;
  }

  currentPlayer = 'O';
  statusText.textContent = "AI's turn...";
  setTimeout(() => aiMove(), 500);
}

function aiMove() {
  let move;

  if (aiDifficulty === 'easy') {
    move = getEasyMove();
  } else {
    move = getHardMove();
  }

  if (move === -1) return;

  gameBoard[move] = 'O';
  const cell = board.children[move];
  cell.textContent = 'O';
  cell.classList.add('show');
  playSound(moveSound);

  if (checkWin()) {
    statusText.textContent = 'AI is thinking...';
    winMessage.style.display = 'block';
    setTimeout(() => {
      statusText.textContent = 'AI wins!';
      updateStats('AI');
      gameOver = true;
      playSound(winSound);
    }, 2000);
    return;
  }

  currentPlayer = 'X';
  statusText.textContent = "Your turn (X)";
}

function updateStats(winner) {
  if (winner === 'X') {
    playerWins.textContent = parseInt(playerWins.textContent) + 1;
  } else if (winner === 'O' || winner === 'AI') {
    aiWins.textContent = parseInt(aiWins.textContent) + 1;
  } else if (winner === 'draw') {
    draws.textContent = parseInt(draws.textContent) + 1;
  }
}

function checkWin() {
  const totalCells = fieldSize * fieldSize;
  const winPatterns = [];

  // Rows
  for (let r = 0; r < fieldSize; r++) {
    const row = [];
    for (let c = 0; c < fieldSize; c++) {
      row.push(r * fieldSize + c);
    }
    winPatterns.push(row);
  }

  // Columns
  for (let c = 0; c < fieldSize; c++) {
    const col = [];
    for (let r = 0; r < fieldSize; r++) {
      col.push(r * fieldSize + c);
    }
    winPatterns.push(col);
  }

  // Diagonals
  if (fieldSize >= 3) {
    const diag1 = [];
    const diag2 = [];
    for (let i = 0; i < fieldSize; i++) {
      diag1.push(i * fieldSize + i);
      diag2.push(i * fieldSize + (fieldSize - 1 - i));
    }
    winPatterns.push(diag1, diag2);
  }

  return winPatterns.some(pattern => {
    const [a,b,c] = pattern;
    return gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c];
  });
}

function getEasyMove() {
  const emptyCells = gameBoard.map((val, i) => val === null ? i : -1).filter(i => i !== -1);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function getHardMove() {
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < fieldSize * fieldSize; i++) {
    if (!gameBoard[i]) {
      gameBoard[i] = 'O';
      let score = minimax(gameBoard, 0, false);
      gameBoard[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board, depth, isMaximizing) {
  const winner = checkWinner(board);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (board.every(cell => cell)) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = 'O';
        const eval = minimax(board, depth + 1, false);
        board[i] = null;
        maxEval = Math.max(maxEval, eval);
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (!board[i]) {
        board[i] = 'X';
        const eval = minimax(board, depth + 1, true);
        board[i] = null;
        minEval = Math.min(minEval, eval);
      }
    }
    return minEval;
  }
}

function checkWinner(board) {
  const totalCells = fieldSize * fieldSize;
  const winPatterns = [];

  // Rows
  for (let r = 0; r < fieldSize; r++) {
    const row = [];
    for (let c = 0; c < fieldSize; c++) {
      row.push(r * fieldSize + c);
    }
    winPatterns.push(row);
  }

  // Columns
  for (let c = 0; c < fieldSize; c++) {
    const col = [];
    for (let r = 0; r < fieldSize; r++) {
      col.push(r * fieldSize + c);
    }
    winPatterns.push(col);
  }

  // Diagonals
  if (fieldSize >= 3) {
    const diag1 = [];
    const diag2 = [];
    for (let i = 0; i < fieldSize; i++) {
      diag1.push(i * fieldSize + i);
      diag2.push(i * fieldSize + (fieldSize - 1 - i));
    }
    winPatterns.push(diag1, diag2);
  }

  for (const pattern of winPatterns) {
    const [a,b,c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function resetGame() {
  gameBoard = [];
  currentPlayer = 'X';
  gameOver = false;
  statusText.textContent = "Your turn (X)";
  winMessage.style.display = 'none';
  createBoard();
}

createBoard();

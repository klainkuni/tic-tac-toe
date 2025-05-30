// script.js

const board = document.getElementById('game-board');
const statusText = document.getElementById('status');
const winMessage = document.getElementById('win-message');
const backgroundSelect = document.getElementById('background-select');
const difficultySelect = document.getElementById('difficulty-select');

let currentPlayer = 'X';
let gameBoard = Array(9).fill(null);
let gameOver = false;
let aiDifficulty = 'hard'; // Default is hard

function setBackground() {
  const bg = backgroundSelect.value;

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
  aiDifficulty = difficultySelect.value;
}

backgroundSelect.addEventListener('change', setBackground);
difficultySelect.addEventListener('change', setDifficulty);

setBackground();

// Easy AI: pick a random empty cell
function getEasyMove() {
  const emptyCells = gameBoard.map((val, i) => val === null ? i : -1).filter(i => i !== -1);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Hard AI: use Minimax
function getHardMove() {
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < 9; i++) {
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

function createBoard() {
  board.innerHTML = '';
  for (let i = 0; i < 9; i++) {
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
  updateCell(index);

  if (checkWin()) {
    statusText.textContent = `${currentPlayer} wins!`;
    gameOver = true;
    return;
  }

  if (gameBoard.every(cell => cell)) {
    statusText.textContent = "It's a draw!";
    gameOver = true;
    return;
  }

  currentPlayer = 'O';
  statusText.textContent = "AI's turn...";
  setTimeout(() => aiMove(), 500); // Delay for visual effect
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
  updateCell(move);

  if (checkWin()) {
    statusText.textContent = 'AI is thinking...';
    winMessage.style.display = 'block';
    setTimeout(() => {
      statusText.textContent = 'AI wins!';
      gameOver = true;
    }, 2000);
    return;
  }

  currentPlayer = 'X';
  statusText.textContent = "Your turn (X)";
}

function updateCell(index) {
  const cell = board.children[index];
  cell.textContent = gameBoard[index];
  cell.style.pointerEvents = 'none';
}

function checkWin() {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  return winPatterns.some(pattern => {
    const [a,b,c] = pattern;
    return gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c];
  });
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
  const winner = checkWinner(board);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (board.every(cell => cell)) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
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
    for (let i = 0; i < 9; i++) {
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
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  for (const pattern of winPatterns) {
    const [a,b,c] = pattern;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function resetGame() {
  gameBoard = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;
  statusText.textContent = "Your turn (X)";
  winMessage.style.display = 'none';
  createBoard();
}

createBoard();
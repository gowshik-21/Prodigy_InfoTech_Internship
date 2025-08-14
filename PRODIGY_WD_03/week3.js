const board = document.getElementById('board');
const resetButton = document.getElementById('reset');
const homeButton = document.getElementById('home'); // New Home button
const statusDiv = document.getElementById('status');
const modeSelection = document.getElementById('mode-selection');
const playerNamesDiv = document.getElementById('player-names');
const player1NameInput = document.getElementById('player1-name');
const player2NameInput = document.getElementById('player2-name');
const startGameButton = document.getElementById('start-game');

let currentPlayer = '';
let boardState = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let isSinglePlayer = false;
let player1Name = '';
let player2Name = '';
const player1Symbol = 'X'; // Player 1's symbol
const player2Symbol = 'O'; // Player 2's symbol

const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Event listeners for game mode selection
document.getElementById('single-player').addEventListener('click', () => {
    isSinglePlayer = true;
    setupPlayerNames();
});

document.getElementById('two-player').addEventListener('click', () => {
    isSinglePlayer = false;
    setupPlayerNames();
});

// Setting up player names
function setupPlayerNames() {
    modeSelection.style.display = 'none';
    playerNamesDiv.style.display = 'block';
    player2NameInput.style.display = isSinglePlayer ? 'none' : 'block';
}

// Start game button event listener
startGameButton.addEventListener('click', () => {
    player1Name = player1NameInput.value || 'Player 1';
    player2Name = isSinglePlayer ? 'Computer' : player2NameInput.value || 'Player 2';
    
    player1NameInput.value = '';
    player2NameInput.value = '';

    playerNamesDiv.style.display = 'none';
    board.style.display = 'grid';
    resetButton.style.display = 'inline-block';
    statusDiv.style.display = 'block';
    homeButton.style.display = 'none'; // Hide Home button at the start

    resetGame();
});

// Create cell for the board
function createCell(index) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('data-index', index);
    cell.addEventListener('click', handleCellClick);
    board.appendChild(cell);
}

// Handle cell clicks
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = clickedCell.getAttribute('data-index');

    // Check if the cell is already occupied or the game is not active
    if (boardState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    // Update board state based on the current player's turn
    boardState[clickedCellIndex] = currentPlayer === player1Name ? player1Symbol : player2Symbol;
    clickedCell.textContent = boardState[clickedCellIndex];
    clickedCell.setAttribute('data-symbol', boardState[clickedCellIndex]); // Set symbol color

    checkResult();

    // Switch current player
    if (gameActive) {
        currentPlayer = currentPlayer === player1Name ? player2Name : player1Name;
        statusDiv.textContent = `${currentPlayer}'s turn (${currentPlayer === player1Name ? player1Symbol : player2Symbol})`;
    }

    // If in single-player mode, the computer makes its move after a brief delay
    if (isSinglePlayer && gameActive) {
        setTimeout(computerMove, 500); // Add a slight delay for the computer's move
    }
}

// Computer's move in single-player mode
function computerMove() {
    if (!gameActive) return;

    const bestMove = getBestMove();
    if (bestMove !== undefined) {
        boardState[bestMove] = player2Symbol; // Computer's move
        const computerCell = document.querySelector(`.cell[data-index='${bestMove}']`);
        computerCell.textContent = player2Symbol; // Display O for computer
        computerCell.setAttribute('data-symbol', player2Symbol); // Set symbol color for O
        checkResult();
    }

    // Switch back to the player's turn
    if (gameActive) {
        currentPlayer = player1Name; // Reset back to Player 1's turn
        statusDiv.textContent = `${currentPlayer}'s turn (${player1Symbol})`;
    }
}

// Minimax algorithm for the AI
function minimax(newBoard, depth, isMaximizing) {
    const scores = {
        [player1Symbol]: -1, // Player -1 (X)
        [player2Symbol]: 1,  // Computer +1 (O)
        'draw': 0            // Draw 0
    };

    const result = checkWinner(newBoard);
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = player2Symbol; // Try computer move
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = ''; // Undo move
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = player1Symbol; // Try player's move
                let score = minimax(newBoard, depth + 1, true);
                newBoard[i] = ''; // Undo move
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Get the best move for the computer
function getBestMove() {
    // Check if the AI can win in the next move
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === '') {
            boardState[i] = player2Symbol;
            if (checkWinner(boardState) === player2Symbol) {
                return i; // Return winning move
            }
            boardState[i] = ''; // Undo move
        }
    }

    // Check if the player can win in their next move and block them
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === '') {
            boardState[i] = player1Symbol;
            if (checkWinner(boardState) === player1Symbol) {
                boardState[i] = ''; // Undo move
                return i; // Block player's winning move
            }
            boardState[i] = ''; // Undo move
        }
    }

    // Otherwise, use the minimax algorithm to find the best move
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === '') {
            boardState[i] = player2Symbol; // Try computer move
            let score = minimax(boardState, 0, false);
            boardState[i] = ''; // Undo move
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

// Check if there's a winner
function checkWinner(board) {
    for (const condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] === board[b] && board[a] === board[c] && board[a] !== '') {
            return board[a]; // Return the winner symbol
        }
    }
    return board.includes('') ? null : 'draw'; // Check for draw condition
}

// Check results and update the game state
function checkResult() {
    const result = checkWinner(boardState);
    if (result) {
        if (result === player1Symbol) {
            statusDiv.textContent = `${player1Name} wins!`;
        } else if (result === player2Symbol) {
            statusDiv.textContent = `${player2Name} wins!`;
        } else {
            statusDiv.textContent = `Good Game! It's a draw.`;
        }
        gameActive = false;
        homeButton.style.display = 'inline-block'; // Show Home button
        return;
    }
}

// Reset the game state
function resetGame() {
    gameActive = true;
    currentPlayer = player1Name; // Start with Player 1
    boardState = ['', '', '', '', '', '', '', '', ''];
    statusDiv.textContent = `${currentPlayer}'s turn (${player1Symbol})`;
    board.innerHTML = '';
    initializeBoard();
}

// Initialize the game board
function initializeBoard() {
    for (let i = 0; i < 9; i++) {
        createCell(i);
    }
    statusDiv.textContent = `${currentPlayer}'s turn (${player1Symbol})`;
}

// Reset button event listener
resetButton.addEventListener('click', resetGame);

// Home button event listener
homeButton.addEventListener('click', () => {
    board.style.display = 'none';
    resetButton.style.display = 'none';
    homeButton.style.display = 'none';
    statusDiv.style.display = 'none';
    modeSelection.style.display = 'block'; // Show mode selection again
});

// Initialize the game board on load
initializeBoard();
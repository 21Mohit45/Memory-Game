

const splash = document.getElementById("splash");

const homeScreen = document.getElementById("homeScreen");
const gameScreen = document.getElementById("gameScreen");
const winScreen = document.getElementById("winScreen");

const playerInput = document.getElementById("playerId");

const difficultyButtons =
document.querySelectorAll(".difficultyBtn");

const board =
document.getElementById("gameBoard");

const timerEl =
document.getElementById("timer");

const movesEl =
document.getElementById("moves");

const displayPlayer =
document.getElementById("displayPlayer");

const finalMoves =
document.getElementById("finalMoves");

const finalTime =
document.getElementById("finalTime");

const restartBtn =
document.getElementById("restartBtn");

const homeBtn =
document.getElementById("homeBtn");

const playAgainBtn =
document.getElementById("playAgain");

const goHomeBtn =
document.getElementById("goHome");

const leaderboardBody =
document.getElementById("leaderboardBody");

const resetLeaderboardBtn =
document.getElementById("resetLeaderboard");


// -----------------------------
// GAME VARIABLES
// -----------------------------

let boardSize = 4;
let totalPairs = 8;

let firstCard = null;
let secondCard = null;

let lockBoard = false;

let moves = 0;
let matchedPairs = 0;

let seconds = 0;
let timer = null;

let playerID = "";

let gameStarted = false;


// -----------------------------
// SYMBOLS
// -----------------------------

const symbols = [
"🍎","🍌","🍇","🍉","🍒","🍓","🥝","🍍",
"🍋","🥥","🥕","🍑","🐶","🐱","🐭","🐹",
"🐼","🦁","🐵","🐸","🚗","🚕","🚀","⚽",
"🏀","🎾","🏈","🎮","🎲","🎯","🎸","🎧"
];


// -----------------------------
// SPLASH SCREEN
// -----------------------------

window.addEventListener("load", () => {

setTimeout(() => {

splash.style.display = "none";

}, 2000);

});


// -----------------------------
// PLAYER INPUT CLEANUP
// -----------------------------

playerInput.addEventListener("input", () => {

playerInput.value =
playerInput.value
.toUpperCase()
.replace(/[^A-Z0-9]/g, "")
.slice(0, 4);

});


// -----------------------------
// SHUFFLE FUNCTION
// -----------------------------

function shuffle(array) {

    for (let i = array.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];

    }

    return array;
}


// -----------------------------
// START GAME
// -----------------------------

function startGame(size) {

    boardSize = size;
    totalPairs = (size * size) / 2;

    firstCard = null;
    secondCard = null;

    lockBoard = false;

    moves = 0;
    matchedPairs = 0;

    seconds = 0;
    gameStarted = false;

    clearInterval(timer);

    timerEl.textContent = "00:00";
    movesEl.textContent = "0";

    board.innerHTML = "";

    board.className = "";
    board.classList.add("grid-" + boardSize);

    displayPlayer.textContent = playerID;

    createBoard();
}


// -----------------------------
// CREATE BOARD
// -----------------------------

function createBoard() {

    let selected = symbols.slice(0, totalPairs);

    let gameArray = [...selected, ...selected];

    shuffle(gameArray);

    gameArray.forEach(symbol => {

        const card = createCard(symbol);
        board.appendChild(card);

    });
}


// -----------------------------
// CREATE CARD
// -----------------------------

function createCard(symbol) {

    const card = document.createElement("div");

    card.classList.add("card");
    card.dataset.symbol = symbol;

    card.innerHTML = `
        <div class="front">${symbol}</div>
        <div class="back">?</div>
    `;

    card.addEventListener("click", flipCard);

    return card;
}

// -----------------------------
// FLIP CARD
// -----------------------------

function flipCard() {

    if (lockBoard) return;

    if (this === firstCard) return;

    startTimer();

    this.classList.add("flip");

    if (!firstCard) {

        firstCard = this;
        return;

    }

    secondCard = this;

    moves++;
    movesEl.textContent = moves;

    checkMatch();
}


// -----------------------------
// CHECK MATCH
// -----------------------------

function checkMatch() {

    const isMatch =
        firstCard.dataset.symbol === secondCard.dataset.symbol;

    if (isMatch) {

        disableCards();

    } else {

        unflipCards();

    }
}


// -----------------------------
// MATCH FOUND
// -----------------------------

function disableCards() {

    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);

    matchedPairs++;

    resetCards();

    if (matchedPairs === totalPairs) {

        setTimeout(gameWin, 600);

    }
}


// -----------------------------
// NO MATCH
// -----------------------------

function unflipCards() {

    lockBoard = true;

    setTimeout(() => {

        firstCard.classList.remove("flip");
        secondCard.classList.remove("flip");

        resetCards();

    }, 800);
}


// -----------------------------
// RESET CARDS
// -----------------------------

function resetCards() {

    firstCard = null;
    secondCard = null;
    lockBoard = false;
}


// -----------------------------
// START TIMER (ONLY ON FIRST MOVE)
// -----------------------------

function startTimer() {

    if (gameStarted) return;

    gameStarted = true;

    timer = setInterval(() => {

        seconds++;

        let min = Math.floor(seconds / 60);
        let sec = seconds % 60;

        timerEl.textContent =
            String(min).padStart(2, "0") +
            ":" +
            String(sec).padStart(2, "0");

    }, 1000);
}


// -----------------------------
// GAME WIN FUNCTION
// -----------------------------

function gameWin() {

    clearInterval(timer);

    finalMoves.textContent = moves;
    finalTime.textContent = timerEl.textContent;

    saveScore();

    setTimeout(() => {

        gameScreen.classList.add("hidden");
        winScreen.classList.remove("hidden");

    }, 500);
}


// -----------------------------
// SAVE SCORE TO LOCAL STORAGE
// -----------------------------

function saveScore() {

    let scores =
        JSON.parse(localStorage.getItem("memoryLeaderboard")) || [];

    scores.push({
        player: playerID,
        moves: moves,
        time: seconds
    });

    // Sort by moves first, then time
    scores.sort((a, b) => {

        if (a.moves === b.moves) {
            return a.time - b.time;
        }

        return a.moves - b.moves;
    });

    // Keep only top 5
    scores = scores.slice(0, 5);

    localStorage.setItem(
        "memoryLeaderboard",
        JSON.stringify(scores)
    );

    loadLeaderboard();
}


// -----------------------------
// LOAD LEADERBOARD
// -----------------------------

function loadLeaderboard() {

    let scores =
        JSON.parse(localStorage.getItem("memoryLeaderboard")) || [];

    leaderboardBody.innerHTML = "";

    if (scores.length === 0) {

        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="4">No Records Yet</td>
            </tr>
        `;

        return;
    }

    scores.forEach((s, index) => {

        let min = Math.floor(s.time / 60);
        let sec = s.time % 60;

        leaderboardBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${s.player}</td>
                <td>${s.moves}</td>
                <td>
                    ${String(min).padStart(2, "0")}:
                    ${String(sec).padStart(2, "0")}
                </td>
            </tr>
        `;
    });
}


// -----------------------------
// INITIAL LOAD
// -----------------------------

loadLeaderboard();


// -----------------------------
// RESET LEADERBOARD BUTTON
// -----------------------------

resetLeaderboardBtn.addEventListener("click", () => {

    if (confirm("Reset leaderboard?")) {

        localStorage.removeItem("memoryLeaderboard");
        loadLeaderboard();
    }
});

// -----------------------------
// RESTART GAME
// -----------------------------

restartBtn.addEventListener("click", () => {

    startGame(boardSize);
});


// -----------------------------
// HOME BUTTON
// -----------------------------

homeBtn.addEventListener("click", () => {

    clearInterval(timer);

    gameScreen.classList.add("hidden");
    winScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");

    resetGame();
});


// -----------------------------
// PLAY AGAIN (AFTER WIN)
// -----------------------------

playAgainBtn.addEventListener("click", () => {

    winScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    startGame(boardSize);
});


// -----------------------------
// GO HOME (WIN SCREEN)
// -----------------------------

goHomeBtn.addEventListener("click", () => {

    winScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");

    resetGame();
});


// -----------------------------
// RESET GAME VARIABLES
// -----------------------------

function resetGame() {

    firstCard = null;
    secondCard = null;

    lockBoard = false;

    moves = 0;
    matchedPairs = 0;

    seconds = 0;
    gameStarted = false;

    clearInterval(timer);

    timerEl.textContent = "00:00";
    movesEl.textContent = "0";

    board.innerHTML = "";
}


// -----------------------------
// OPTIONAL KEYBOARD SHORTCUTS
// -----------------------------

document.addEventListener("keydown", (e) => {

    if (e.key.toLowerCase() === "r") {

        if (!gameScreen.classList.contains("hidden")) {

            startGame(boardSize);
        }
    }

    if (e.key.toLowerCase() === "h") {

        gameScreen.classList.add("hidden");
        winScreen.classList.add("hidden");
        homeScreen.classList.remove("hidden");

        resetGame();
    }
});


// -----------------------------
// SERVICE WORKER (PWA)
// -----------------------------

if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("service-worker.js")
            .then(() => console.log("Service Worker Registered"))
            .catch(err => console.log("SW Error:", err));

    });
}
// -----------------------------
// DIFFICULTY BUTTONS
// -----------------------------

difficultyButtons.forEach(button => {

    button.addEventListener("click", () => {

        playerID = playerInput.value.trim();

        if (playerID.length < 1) {
            alert("Please enter a Player ID.");
            playerInput.focus();
            return;
        }

        const size = Number(button.dataset.size);

        homeScreen.classList.add("hidden");
        winScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");

        startGame(size);

    });

});
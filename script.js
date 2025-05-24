const dino = document.getElementById("dino");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const themeToggle = document.getElementById("themeToggle");

// Modal elements
const gameOverModal = document.getElementById("gameOverModal");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

let isJumping = false;
let gravity = 0.7;
let velocity = 0;
let score = 0;
let gameOver = false;
let obstacleSpeed = 6; // Base speed
let speedIncreaseInterval;
let aiCheckHandle;

// Jump Logic - Short and snappy
function jump() {
  if (isJumping || gameOver) return;
  isJumping = true;
  velocity = 14;

  const jumpLoop = () => {
    let currentBottom = parseInt(window.getComputedStyle(dino).getPropertyValue("bottom"));

    if (velocity > 0) {
      currentBottom += velocity;
      velocity -= gravity;
    } else if (currentBottom > 0) {
      currentBottom += velocity;
      velocity -= gravity;
    }

    if (currentBottom <= 0) {
      currentBottom = 0;
      isJumping = false;
      velocity = 0;
    }

    dino.style.bottom = `${currentBottom}px`;

    if (isJumping) requestAnimationFrame(jumpLoop);
  };

  jumpLoop();
}

// Create Obstacles
function createObstacle() {
  if (gameOver) return;

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");
  obstacle.style.left = "800px";
  game.appendChild(obstacle);

  let obstacleLeft = 800;

  const moveObstacle = () => {
    if (gameOver) {
      obstacle.remove();
      return;
    }

    obstacleLeft -= obstacleSpeed;
    obstacle.style.left = `${obstacleLeft}px`;

    // Collision Detection
    const dinoRect = dino.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    if (
      dinoRect.top < obstacleRect.bottom &&
      dinoRect.right > obstacleRect.left &&
      dinoRect.left < obstacleRect.right &&
      dinoRect.bottom > obstacleRect.top
    ) {
      endGame();
    }

    // Remove off-screen obstacle
    if (obstacleLeft + obstacle.offsetWidth < 0) {
      obstacle.remove();
      score++;
      scoreDisplay.textContent = `Score: ${score}`;
      return;
    }

    requestAnimationFrame(moveObstacle);
  };

  moveObstacle();

  // Schedule next obstacle
  const randomTime = Math.random() * 2000 + 1000;
  setTimeout(createObstacle, randomTime);
}

// End Game
function endGame() {
  gameOver = true;
  clearInterval(speedIncreaseInterval);
  cancelAnimationFrame(aiCheckHandle);
  finalScore.textContent = `Final Score: ${score}`;
  gameOverModal.classList.remove("hidden");
}

// Increase difficulty over time
function startDifficultyCurve() {
  speedIncreaseInterval = setInterval(() => {
    if (!gameOver && obstacleSpeed < 12) {
      obstacleSpeed += 0.2;
    }
  }, 3000); // Every 3 seconds
}

// Smart AI that jumps when cactus is near
function aiJumpCheck() {
  if (gameOver || !startBtn.disabled) return;

  const obstacles = document.querySelectorAll(".obstacle");

  for (let obs of obstacles) {
    const obsRect = obs.getBoundingClientRect();
    const dinoRect = dino.getBoundingClientRect();

    const distance = obsRect.left - dinoRect.right;

    if (distance > 0 && distance < 120 && !isJumping) {
      jump();
      break;
    }
  }

  aiCheckHandle = requestAnimationFrame(aiJumpCheck);
}

// Reset and start game
startBtn.addEventListener("click", () => {
  resetGame();
  startBtn.disabled = true;
  createObstacle();
  aiJumpCheck();
  startDifficultyCurve();
});

restartBtn.addEventListener("click", () => {
  gameOverModal.classList.add("hidden");
  resetGame();
  startBtn.disabled = true;
  createObstacle();
  aiJumpCheck();
  startDifficultyCurve();
});

function resetGame() {
  score = 0;
  gameOver = false;
  isJumping = false;
  velocity = 0;
  obstacleSpeed = 6;
  scoreDisplay.textContent = "Score: 0";
  dino.style.bottom = "10px";

  // Remove any existing obstacles
  document.querySelectorAll(".obstacle").forEach(obs => obs.remove());
}

// Theme Toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  themeToggle.textContent = document.body.classList.contains("dark-mode")
    ? "☀ Light Mode"
    : "🌙 Dark Mode";
});
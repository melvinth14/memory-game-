const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let timeLeft = 60;
let timerInterval;
let allCardsData = [];
let gameCardCount = 8;

fetch("./data/cards.json")
  .then((res) => res.json())
  .then((data) => {
    allCardsData = data;
  })
  .catch((error) => {
    console.error("Error loading cards:", error);
    alert("Failed to load cards data. Check console for details.");
  });

function startGame(cardCount, time) {
  gameCardCount = cardCount;
  timeLeft = time;
  score = 0;
  
  // Update grid columns based on card count
  if (cardCount === 8) {
    gridContainer.style.gridTemplateColumns = "repeat(4, 140px)";
    gridContainer.style.gridTemplateRows = "repeat(2, calc(140px / 2 * 3))";
  } else if (cardCount === 16) {
    gridContainer.style.gridTemplateColumns = "repeat(4, 140px)";
    gridContainer.style.gridTemplateRows = "repeat(4, calc(140px / 2 * 3))";
  } else if (cardCount === 32) {
    gridContainer.style.gridTemplateColumns = "repeat(8, 140px)";
    gridContainer.style.gridTemplateRows = "repeat(4, calc(140px / 2 * 3))";
  }
  
  // Show game screen, hide menu
  document.getElementById("menuScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  
  // Prepare cards
  const selectedCards = allCardsData.slice(0, cardCount / 2);
  cards = [...selectedCards, ...selectedCards];
  
  document.querySelector(".score").textContent = score;
  document.querySelector(".timer").textContent = timeLeft;
  gridContainer.innerHTML = "";
  
  shuffleCards();
  generateCards();
  startTimer();
}

function goToMenu() {
  clearInterval(timerInterval);
  document.getElementById("menuScreen").style.display = "flex";
  document.getElementById("gameScreen").style.display = "none";
  gridContainer.innerHTML = "";
  lockBoard = false;
  firstCard = null;
  secondCard = null;
}

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src=${card.image} />
      </div>
      <div class="back"></div>
    `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard);
  }
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  lockBoard = true;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  firstCard.style.visibility = "hidden";
  secondCard.style.visibility = "hidden";

  score++;
  document.querySelector(".score").textContent = score;

  resetBoard();
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function restart() {
  clearInterval(timerInterval);
  resetBoard();
  shuffleCards();
  score = 0;
  timeLeft = gameCardCount === 32 ? 120 : 60;
  document.querySelector(".score").textContent = score;
  document.querySelector(".timer").textContent = timeLeft;
  gridContainer.innerHTML = "";
  generateCards();
  startTimer();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    document.querySelector(".timer").textContent = timeLeft;
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      lockBoard = true;
      alert("Time's up! Game Over. Click Restart to play again.");
    }
  }, 1000);
}

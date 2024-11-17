const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Dimenzije Canvasa
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Konstantni parametri
const PADDLE_WIDTH = 100; 
const PADDLE_HEIGHT = 20; 
const BALL_RADIUS = 10;
const BRICK_ROWS = 5;
const BRICK_COLUMNS = 8;
const BRICK_WIDTH = canvas.width / BRICK_COLUMNS - 5;
const BRICK_HEIGHT = 30;

// Globalne varijable
let paddleX = (canvas.width - PADDLE_WIDTH) / 2; // Početna pozicija ploče
let paddleDX = 0; // Brzina ploče
let ballX = canvas.width / 2; // Početna pozicija lopte (x os) 
let ballY = canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 10; // Početna pozicija lopte (y os) 
let ballDX = 4; // Početna brzina lopte (x os)
let ballDY = -4; // Početna brzina lopte (y os)
let score = 0; // Početni bodovi
let highScore = localStorage.getItem('highScore') || 0; // HighScore (localStorage)
let bricks = []; // Polje za ploče
let isGameOver = false; // Završena igra (T/F)
let isWin = false; // Pobjeda (T/F)

const resetButton = document.getElementById('resetButton');

// Funkcija koja omogućuje ponovno pokretanje igre
function resetGame() {
    score = 0; 
    isGameOver = false;
    isWin = false;
    resetButton.style.display = 'none'; // Skrivanje reset dugmeta
    ballX = canvas.width / 2;
    ballY = canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 30;
    ballDX = 4;
    ballDY = -4;
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
    createBricks(); // Ponovno postavljanje ploča
    draw(); // Ponovno crtanje igre
}

// Stavljanje funkcije "resetGame" na dugme "Reset"
resetButton.addEventListener('click', resetGame);

function createBricks() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        bricks[r] = [];
        for (let c = 0; c < BRICK_COLUMNS; c++) {
            bricks[r][c] = { x: 0, y: 0, status: 1 }; // Status 1 -> ploča aktivna
        }
    }
}

// Postavljanje ploča
function drawBricks() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLUMNS; c++) {
            if (bricks[r][c].status === 1) { // Ako je ploča aktivna
                let brickX = c * (BRICK_WIDTH + 5);
                let brickY = r * (BRICK_HEIGHT + 5);
                bricks[r][c].x = brickX;
                bricks[r][c].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                ctx.fillStyle = '#e74c3c';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Postavljanje lopte 
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.closePath();
}

// Postavljanje ploče igrača
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = '#e74c3c';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000';
    ctx.fill();
    ctx.closePath();
}

// Detekcija kolizije 
function collisionDetection() {
    for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLUMNS; c++) {
            let b = bricks[r][c];
            if (b.status === 1) {
                if (
                    ballX > b.x &&
                    ballX < b.x + BRICK_WIDTH &&
                    ballY > b.y &&
                    ballY < b.y + BRICK_HEIGHT
                ) {
                    ballDY = -ballDY;
                    b.status = 0;
                    score++;
                    if (score === BRICK_ROWS * BRICK_COLUMNS) {
                        isWin = true;
                        isGameOver = true;
                    }
                }
            }
        }
    }
}

// Postavljanje bodova (i High Score System)
function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${score}`, canvas.width - 120, 20);
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 300, 20);
}

// Glavna funkcija za crtanje svega na ekranu
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();

    if (isGameOver) {
        ctx.font = '50px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText(
            isWin ? 'YOU WIN!' : 'GAME OVER',
            canvas.width / 2,
            canvas.height / 2
        );

        resetButton.style.display = 'block';
        resetButton.style.top = `${canvas.height / 2 + 60}px`;
        return;
    }

    collisionDetection();

    // Provjera sudara lopte s granicama ekrana
    if (ballX + ballDX > canvas.width - BALL_RADIUS || ballX + ballDX < BALL_RADIUS) {
        ballDX = -ballDX;
    }
    if (ballY + ballDY < BALL_RADIUS) {
        ballDY = -ballDY;
    } else if (ballY + ballDY > canvas.height - BALL_RADIUS) {
        if (ballX > paddleX && ballX < paddleX + PADDLE_WIDTH) { // Ako lopta pogodi
            ballDY = -ballDY;
        } else { // Ako lopta padne (GameOver)
            isGameOver = true;
            if (score > highScore) { // Ako su bodovi veći od High Score-a
                highScore = score;
                localStorage.setItem('highScore', highScore);
            }
        }
    }

    // Ažuriraj poziciju lopte
    ballX += ballDX;
    ballY += ballDY;

    // Ažuriraj poziciju ploče
    paddleX += paddleDX;

    // Provjera da ploča ne izlazi iz okvira
    if (paddleX < 0) {
        paddleX = 0;
    } else if (paddleX > canvas.width - PADDLE_WIDTH) {
        paddleX = canvas.width - PADDLE_WIDTH;
    }

    requestAnimationFrame(draw);
}

let isMovingRight = false;
let isMovingLeft = false;

// Kretanje
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        if (!isMovingLeft) {  // Ako ne pritisnemo lijevu tipku
            paddleDX = 5;  // Pomicanje udesno
            isMovingRight = true;
        }
    }
    if (e.key === 'ArrowLeft') {
        if (!isMovingRight) {  // Ako ne pritisnemo desnu tipku
            paddleDX = -5;  // Pomicanje ulijevo
            isMovingLeft = true;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowRight') {
        paddleDX = 0; // Zaustavi pomicanje udesno
        isMovingRight = false;
    }
    if (e.key === 'ArrowLeft') {
        paddleDX = 0; // Zaustavi pomicanje ulijevo
        isMovingLeft = false;
    }
});


createBricks();
draw();

const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const item = document.getElementById('item');
const hideSpot = document.getElementById('hide-spot');
const scoreDisplay = document.getElementById('score');
const shieldBtn = document.getElementById('shield-btn');
const winScreen = document.getElementById('win-screen');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let hasItem = false;
let shieldActive = false;
let playerBullets = [];
let enemyBullets = [];
let enemies = [];
let keys = {};
let playerX = 400;
let playerY = 300;

function randomPosition() {
    return {
        x: Math.floor(Math.random() * 770),
        y: Math.floor(Math.random() * 570)
    };
}

function setPosition(element, x, y) {
    element.style.left = x + 'px';
    element.style.top = y + 'px';
}

function createEnemy() {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    const pos = randomPosition();
    setPosition(enemy, pos.x, pos.y);
    gameContainer.appendChild(enemy);
    return enemy;
}

function initializeGame() {
    playerX = 400;
    playerY = 300;
    setPosition(player, playerX, playerY);
    setPosition(item, randomPosition().x, randomPosition().y);
    setPosition(hideSpot, randomPosition().x, randomPosition().y);
    
    enemies.forEach(enemy => gameContainer.removeChild(enemy));
    enemies = [];
    for (let i = 0; i < 3; i++) {
        enemies.push(createEnemy());
    }
    
    hasItem = false;
    score = 0;
    updateScore();
    item.style.display = 'block';
    winScreen.classList.add('hidden');
}

function movePlayer() {
    const speed = 5;
    if (keys['w']) playerY = Math.max(0, playerY - speed);
    if (keys['s']) playerY = Math.min(570, playerY + speed);
    if (keys['a']) playerX = Math.max(0, playerX - speed);
    if (keys['d']) playerX = Math.min(770, playerX + speed);
    setPosition(player, playerX, playerY);
}

function playerShoot(e) {
    const rect = gameContainer.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;
    
    const angle = Math.atan2(targetY - playerY, targetX - playerX);
    const velocity = {
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10
    };
    
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    setPosition(bullet, playerX + 15, playerY + 15);
    gameContainer.appendChild(bullet);
    playerBullets.push({ element: bullet, velocity });
}

function enemyShoot(enemy) {
    const enemyRect = enemy.getBoundingClientRect();
    const enemyX = enemyRect.left + enemyRect.width / 2 - gameContainer.offsetLeft;
    const enemyY = enemyRect.top + enemyRect.height / 2 - gameContainer.offsetTop;
    
    const angle = Math.atan2(playerY - enemyY, playerX - enemyX);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    };
    
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    setPosition(bullet, enemyX, enemyY);
    gameContainer.appendChild(bullet);
    enemyBullets.push({ element: bullet, velocity });
}

function updateBullets() {
    playerBullets.forEach((bullet, index) => {
        const x = bullet.element.offsetLeft + bullet.velocity.x;
        const y = bullet.element.offsetTop + bullet.velocity.y;
        setPosition(bullet.element, x, y);
        
        if (x < 0 || x > 800 || y < 0 || y > 600) {
            gameContainer.removeChild(bullet.element);
            playerBullets.splice(index, 1);
        }
        
        enemies.forEach((enemy, enemyIndex) => {
            if (isColliding(bullet.element, enemy)) {
                gameContainer.removeChild(bullet.element);
                playerBullets.splice(index, 1);
                gameContainer.removeChild(enemy);
                enemies.splice(enemyIndex, 1);
                enemies.push(createEnemy());
                score += 25;
                updateScore();
            }
        });
    });
    
    enemyBullets.forEach((bullet, index) => {
        const x = bullet.element.offsetLeft + bullet.velocity.x;
        const y = bullet.element.offsetTop + bullet.velocity.y;
        setPosition(bullet.element, x, y);
        
        if (x < 0 || x > 800 || y < 0 || y > 600) {
            gameContainer.removeChild(bullet.element);
            enemyBullets.splice(index, 1);
        }
        
        if (isColliding(bullet.element, player) && !shieldActive) {
            gameContainer.removeChild(bullet.element);
            enemyBullets.splice(index, 1);
            score -= 50;
            updateScore();
        }
    });
}

function checkCollisions() {
    if (!hasItem && isColliding(player, item)) {
        hasItem = true;
        item.style.display = 'none';
        score += 50;
        updateScore();
    }

    if (hasItem && isColliding(player, hideSpot)) {
        winGame();
    }
}

function isColliding(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return !(
        aRect.top + aRect.height < bRect.top ||
        aRect.top > bRect.top + bRect.height ||
        aRect.left + aRect.width < bRect.left ||
        aRect.left > bRect.left + bRect.width
    );
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function activateShield() {
    if (!shieldActive) {
        shieldActive = true;
        player.style.border = '2px solid white';
        setTimeout(() => {
            shieldActive = false;
            player.style.border = 'none';
        }, 3000);
    }
}

function winGame() {
    winScreen.classList.remove('hidden');
}

function gameLoop() {
    movePlayer();
    updateBullets();
    checkCollisions();
    
    enemies.forEach(enemy => {
        if (Math.random() < 0.02) {
            enemyShoot(enemy);
        }
    });
    
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);
gameContainer.addEventListener('click', playerShoot);
shieldBtn.addEventListener('click', activateShield);
restartBtn.addEventListener('click', initializeGame);

initializeGame();
gameLoop();
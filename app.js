const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");
const objects = document.getElementById("objects");

const scoreDisplay = document.getElementById("score");
const coinsDisplay = document.getElementById("coins");
const bestDisplay = document.getElementById("best");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const jumpButton = document.getElementById("jumpButton");

const telegramUser = tg.initDataUnsafe?.user;

if (telegramUser) {
    document.getElementById("playerName").textContent =
        `👋 ${telegramUser.first_name}`;
}


/* GAME SETTINGS */

const lanes = [16.5, 50, 83.5];

let currentLane = 1;

let score = 0;
let coins = 0;

let bestScore =
    Number(localStorage.getItem("runnerBest")) || 0;

let running = false;
let jumping = false;

let gameSpeed = 4;

let lastTime = 0;
let spawnTimer = 0;
let animationFrame;


/* DISPLAY BEST SCORE */

bestDisplay.textContent = bestScore;


/* OBJECTS */

let gameObjects = [];


/* START GAME */

function startGame() {

    cancelAnimationFrame(animationFrame);

    objects.innerHTML = "";

    gameObjects = [];

    currentLane = 1;

    score = 0;

    coins = 0;

    gameSpeed = 4;

    running = true;

    jumping = false;

    spawnTimer = 0;

    scoreDisplay.textContent = "0";

    coinsDisplay.textContent = "0";

    player.style.left = `${lanes[currentLane]}%`;

    player.style.bottom = "34px";

    player.style.transform = "translateX(-50%)";

    startScreen.style.display = "none";

    gameOverScreen.style.display = "none";

    lastTime = performance.now();

    animationFrame =
        requestAnimationFrame(gameLoop);
}


/* GAME LOOP */

function gameLoop(timestamp) {

    if (!running) return;

    const delta =
        Math.min(timestamp - lastTime, 40);

    lastTime = timestamp;

    spawnTimer += delta;

    /* SCORE */

    score += delta * 0.01;

    scoreDisplay.textContent =
        Math.floor(score);


    /* MAKE GAME FASTER */

    gameSpeed =
        4 + Math.min(score / 200, 5);


    /* SPAWN */

    const spawnDelay =
        Math.max(500, 1050 - score * 2);

    if (spawnTimer >= spawnDelay) {

        spawnTimer = 0;

        spawnObject();
    }


    /* MOVE OBJECTS */

    for (let i = gameObjects.length - 1; i >= 0; i--) {

        const object = gameObjects[i];

        object.y +=
            gameSpeed * (delta / 16);

        object.element.style.top =
            `${object.y}px`;


        /* COLLISION */

        if (checkCollision(object)) {

            if (object.type === "coin") {

                coins++;

                coinsDisplay.textContent =
                    coins;

                removeObject(i);

                continue;
            }

            if (object.type === "obstacle") {

                endGame();

                return;
            }
        }


        /* REMOVE OFF SCREEN */

        if (object.y > gameArea.clientHeight + 80) {

            removeObject(i);
        }
    }


    animationFrame =
        requestAnimationFrame(gameLoop);
}


/* SPAWN OBJECT */

function spawnObject() {

    const lane =
        Math.floor(Math.random() * 3);

    const isCoin =
        Math.random() < 0.32;

    const element =
        document.createElement("div");

    let type;

    if (isCoin) {

        type = "coin";

        element.className = "coin";

        element.textContent = "🪙";

    } else {

        type = "obstacle";

        element.className = "obstacle";
    }


    element.style.left =
        `${lanes[lane]}%`;

    element.style.top =
        "-70px";

    element.style.transform =
        "translateX(-50%)";

    objects.appendChild(element);


    gameObjects.push({

        element: element,

        lane: lane,

        y: -70,

        type: type

    });
}


/* COLLISION CHECK */

function checkCollision(object) {

    const playerRect =
        player.getBoundingClientRect();

    const objectRect =
        object.element.getBoundingClientRect();


    const padding = 10;


    return (
        playerRect.left + padding <
            objectRect.right &&

        playerRect.right - padding >
            objectRect.left &&

        playerRect.top + padding <
            objectRect.bottom &&

        playerRect.bottom - padding >
            objectRect.top
    );
}


/* REMOVE OBJECT */

function removeObject(index) {

    const object =
        gameObjects[index];

    if (object.element) {

        object.element.remove();
    }

    gameObjects.splice(index, 1);
}


/* MOVE LEFT */

function moveLeft() {

    if (!running) return;

    if (currentLane > 0) {

        currentLane--;

        player.style.left =
            `${lanes[currentLane]}%`;
    }
}


/* MOVE RIGHT */

function moveRight() {

    if (!running) return;

    if (currentLane < 2) {

        currentLane++;

        player.style.left =
            `${lanes[currentLane]}%`;
    }
}


/* JUMP */

function jump() {

    if (!running || jumping) return;

    jumping = true;

    player.style.bottom = "125px";

    player.style.transform =
        "translateX(-50%) scale(1.05)";


    setTimeout(() => {

        if (!running) return;

        player.style.bottom = "34px";

        player.style.transform =
            "translateX(-50%)";

    }, 550);


    setTimeout(() => {

        jumping = false;

    }, 600);
}


/* KEYBOARD SUPPORT */

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "ArrowLeft") {

            event.preventDefault();

            moveLeft();
        }

        if (event.key === "ArrowRight") {

            event.preventDefault();

            moveRight();
        }

        if (
            event.key === "ArrowUp" ||
            event.key === " "
        ) {

            event.preventDefault();

            jump();
        }
    }
);


/* BUTTON CONTROLS */

leftButton.addEventListener(
    "click",
    moveLeft
);

rightButton.addEventListener(
    "click",
    moveRight
);

jumpButton.addEventListener(
    "click",
    jump
);


/* SWIPE SUPPORT */

let touchStartX = 0;
let touchStartY = 0;

gameArea.addEventListener(
    "touchstart",
    (event) => {

        const touch =
            event.changedTouches[0];

        touchStartX =
            touch.screenX;

        touchStartY =
            touch.screenY;
    },
    { passive: true }
);


gameArea.addEventListener(
    "touchend",
    (event) => {

        const touch =
            event.changedTouches[0];

        const dx =
            touch.screenX - touchStartX;

        const dy =
            touch.screenY - touchStartY;


        /* LEFT / RIGHT SWIPE */

        if (Math.abs(dx) > 45) {

            if (dx < 0) {

                moveLeft();

            } else {

                moveRight();
            }

            return;
        }


        /* UP SWIPE */

        if (dy < -45) {

            jump();
        }
    },
    { passive: true }
);


/* END GAME */

function endGame() {

    if (!running) return;

    running = false;

    cancelAnimationFrame(animationFrame);


    const final =
        Math.floor(score);


    if (final > bestScore) {

        bestScore = final;

        localStorage.setItem(
            "runnerBest",
            bestScore
        );

        bestDisplay.textContent =
            bestScore;
    }


    finalScore.textContent =
        `Score: ${final}  •  Coins: ${coins}`;

    gameOverScreen.style.display =
        "flex";
}


/* START */

startGame();

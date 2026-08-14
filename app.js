const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();


const gameArea = document.getElementById("gameArea");
const trail = document.querySelector(".trail");

const player = document.getElementById("player");
const lion = document.getElementById("lion");
const objects = document.getElementById("objects");

const scoreDisplay = document.getElementById("score");
const coinsDisplay = document.getElementById("coins");
const bestDisplay = document.getElementById("best");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOver");
const finalScore = document.getElementById("finalScore");

const distanceMessage =
    document.getElementById("distanceMessage");

const leftButton =
    document.getElementById("leftButton");

const rightButton =
    document.getElementById("rightButton");

const jumpButton =
    document.getElementById("jumpButton");


/* TELEGRAM USER */

const telegramUser =
    tg.initDataUnsafe?.user;

if (telegramUser) {

    document.getElementById("playerName").textContent =
        `🏃 ${telegramUser.first_name} — RUN!`;
}


/* LANES */

const lanes = [16.5, 50, 83.5];

let currentLane = 1;


/* GAME */

let score = 0;
let coins = 0;

let bestScore =
    Number(localStorage.getItem("forestRunnerBest")) || 0;

let gameRunning = false;

let jumping = false;

let lastTime = 0;
let spawnTimer = 0;

let animationFrame;

let gameSpeed = 4;

let gameObjects = [];


/* LION DISTANCE */

let lionDistance = 0;


/* DISPLAY */

bestDisplay.textContent = bestScore;


/* START GAME */

function startGame() {

    cancelAnimationFrame(animationFrame);

    objects.innerHTML = "";

    gameObjects = [];

    score = 0;
    coins = 0;

    currentLane = 1;

    gameSpeed = 4;

    lionDistance = 0;

    jumping = false;

    gameRunning = true;

    spawnTimer = 0;

    scoreDisplay.textContent = "0";

    coinsDisplay.textContent = "0";

    distanceMessage.textContent =
        "🦁 RUN! RUN! RUN!";

    startScreen.style.display = "none";

    gameOverScreen.style.display = "none";


    player.style.left =
        `${lanes[currentLane]}%`;

    player.style.bottom =
        "31px";

    player.style.transform =
        "translateX(-50%)";


    lion.style.left =
        `${lanes[currentLane]}%`;

    lion.style.bottom =
        "0px";

    lion.style.transform =
        "translateX(-50%)";


    lastTime =
        performance.now();

    animationFrame =
        requestAnimationFrame(gameLoop);
}


/* GAME LOOP */

function gameLoop(timestamp) {

    if (!gameRunning) return;


    const delta =
        Math.min(timestamp - lastTime, 40);

    lastTime = timestamp;


    /* DISTANCE */

    score +=
        delta * 0.012;


    const displayedScore =
        Math.floor(score);

    scoreDisplay.textContent =
        displayedScore;


    /* SPEED */

    gameSpeed =
        4 + Math.min(score / 150, 7);


    /* LION GETS CLOSER */

    lionDistance +=
        delta * 0.0006;


    const lionBase =
        Math.min(lionDistance, 35);


    lion.style.bottom =
        `${lionBase}px`;


    /*
       The lion becomes slightly larger
       as the player gets farther into the run.
    */

    const lionScale =
        1 + Math.min(score / 1500, 0.22);

    lion.style.fontSize =
        `${54 * lionScale}px`;


    /* SPAWN */

    spawnTimer += delta;


    const spawnDelay =
        Math.max(
            420,
            950 - score * 1.8
        );


    if (spawnTimer >= spawnDelay) {

        spawnTimer = 0;

        spawnObject();
    }


    /* MOVE OBJECTS */

    for (
        let i = gameObjects.length - 1;
        i >= 0;
        i--
    ) {

        const object =
            gameObjects[i];


        object.y +=
            gameSpeed * (delta / 16);


        object.element.style.top =
            `${object.y}px`;


        /* COLLECT COIN */

        if (
            object.type === "coin" &&
            checkCollision(object)
        ) {

            coins++;

            coinsDisplay.textContent =
                coins;

            removeObject(i);

            continue;
        }


        /* HIT TREE / ROCK */

        if (
            object.type === "obstacle" &&
            !jumping &&
            checkCollision(object)
        ) {

            endGame();

            return;
        }


        /* REMOVE OBJECT */

        if (
            object.y >
            trail.clientHeight + 100
        ) {

            removeObject(i);
        }
    }


    /*
       If the lion gets very close,
       the player loses.
    */

    if (lionDistance >= 35) {

        endGame();

        return;
    }


    animationFrame =
        requestAnimationFrame(gameLoop);
}


/* CREATE OBJECT */

function spawnObject() {

    const lane =
        Math.floor(
            Math.random() * 3
        );


    const random =
        Math.random();


    let type;


    if (random < 0.25) {

        type = "coin";

    } else {

        type = "obstacle";
    }


    const element =
        document.createElement("div");


    /* COIN */

    if (type === "coin") {

        element.className =
            "coin";

        element.textContent =
            "🪙";

    }


    /* TREE OR ROCK */

    else {

        element.className =
            "obstacle";

        if (Math.random() < 0.7) {

            element.textContent =
                "🌲";

        } else {

            element.className =
                "rock";
        }
    }


    element.style.left =
        `${lanes[lane]}%`;

    element.style.top =
        "-80px";

    element.style.transform =
        "translateX(-50%)";


    objects.appendChild(element);


    gameObjects.push({

        element: element,

        lane: lane,

        y: -80,

        type: type

    });
}


/* COLLISION */

function checkCollision(object) {

    const playerRect =
        player.getBoundingClientRect();

    const objectRect =
        object.element.getBoundingClientRect();


    const padding = 8;


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

    if (!gameRunning) return;


    if (currentLane > 0) {

        currentLane--;

        player.style.left =
            `${lanes[currentLane]}%`;

        lion.style.left =
            `${lanes[currentLane]}%`;
    }
}


/* MOVE RIGHT */

function moveRight() {

    if (!gameRunning) return;


    if (currentLane < 2) {

        currentLane++;

        player.style.left =
            `${lanes[currentLane]}%`;

        lion.style.left =
            `${lanes[currentLane]}%`;
    }
}


/* JUMP */

function jump() {

    if (
        !gameRunning ||
        jumping
    ) {
        return;
    }


    jumping = true;


    player.style.bottom =
        "125px";


    player.style.transform =
        "translateX(-50%) scale(1.08)";


    setTimeout(() => {

        if (!gameRunning) return;


        player.style.bottom =
            "31px";


        player.style.transform =
            "translateX(-50%)";

    }, 550);


    setTimeout(() => {

        jumping = false;

    }, 600);
}


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


/* KEYBOARD */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key ===
            "ArrowLeft"
        ) {

            event.preventDefault();

            moveLeft();
        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            event.preventDefault();

            moveRight();
        }


        if (
            event.key ===
            "ArrowUp" ||
            event.key === " "
        ) {

            event.preventDefault();

            jump();
        }
    }
);


/* SWIPE */

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
            touch.screenX -
            touchStartX;

        const dy =
            touch.screenY -
            touchStartY;


        if (Math.abs(dx) > 45) {

            if (dx < 0) {

                moveLeft();

            } else {

                moveRight();
            }

            return;
        }


        if (dy < -45) {

            jump();
        }
    },
    { passive: true }
);


/* GAME OVER */

function endGame() {

    if (!gameRunning) return;


    gameRunning = false;


    cancelAnimationFrame(
        animationFrame
    );


    const final =
        Math.floor(score);


    if (final > bestScore) {

        bestScore =
            final;


        localStorage.setItem(
            "forestRunnerBest",
            bestScore
        );


        bestDisplay.textContent =
            bestScore;
    }


    finalScore.textContent =
        `Distance: ${final}  •  🪙 Coins: ${coins}`;


    gameOverScreen.style.display =
        "flex";


    distanceMessage.textContent =
        "🦁 The chase is over!";
}

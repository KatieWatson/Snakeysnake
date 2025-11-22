var discoMode = true;
let lastTouchStartInCenter = 0;
let newHighScore = false;
let score = 0;
let best = localStorage.getItem(isMobileScreen() ? "mobileBest" : "best") ?
    parseInt(localStorage.getItem(isMobileScreen() ? "mobileBest" : "best")) :
    0;
document.getElementById("best").innerText = best;
let arenaWidth = isMobileScreen() ? 50 : 75;
let arenaHeight = isMobileScreen() ? 30 : 40;
const board = document.getElementById("board");
const overlay = document.getElementById("start-screen-overlay");
const endOverlay = document.getElementById("end-screen-overlay");
let z = 3;
let blockSize = -1;
let borderSize = -1;
setArenaSize();

const dPad = document.getElementById("dPad");
const mobileScore = document.getElementById("mobileScore");

if (isMobileScreen()) {
    dPad.style.display = "block";
    mobileScore.style.display = "block";
} else {
    dPad.style.display = "none";
    mobileScore.style.display = "none";
}

centerX = ~~(arenaWidth / 2);
centerY = ~~(arenaHeight / 2);
snake = [
    [centerX, centerY - 1],
    [centerX, centerY],
    [centerX, centerY + 1],
];
let foodPosition = [];
let turnQueue = [];
let border = [];
let snakeObjects = [];

let gradientCount = 10;
let colors = makeColorSequence(gradientCount);
let currentColor = 0;
let direction = "u";
let growCount = 0;

let activeGame = false;
let moving = false;
let step = setInterval(
    function() {
        moveSnake();
    },
    isMobileScreen() ? 100 : 75
);

board.style.width = `${arenaWidth * blockSize}`;
board.style.height = `${arenaHeight * blockSize}`;



function isMobileScreen() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
            userAgent
        ) || /android|ipad|playbook|silk/i.test(userAgent)
    );
}

function listIncludesPoint(pointsList, point) {
    for (let i = 0; i < pointsList.length; i++) {
        if (pointsList[i][0] == point[0] && pointsList[i][1] == point[1]) {
            return true;
        }
    }
    return false;
}

function drawSquare(color, position, isBorder) {
    let square = document.createElement("div");
    board.appendChild(square);
    square.style.width = isBorder ?
        `${blockSize + borderSize * 2}` :
        `${blockSize}`;
    square.style.height = isBorder ?
        `${blockSize + borderSize * 2}` :
        `${blockSize}`;
    square.style.backgroundColor = color;
    square.style.display = "block";
    square.style.position = "absolute";
    square.style.top = isBorder ?
        `${position[1] * blockSize - borderSize}` :
        `${position[1] * blockSize}`;
    square.style.left = isBorder ?
        `${position[0] * blockSize - borderSize}` :
        `${position[0] * blockSize}`;
    square.style.zIndex = `${z}`;
    return square;
}

function moveSquare(id, position) {
    let square = document.getElementById(id);
    square.style.width = `${blockSize}`;
    square.style.height = `${blockSize}`;
    square.style.visibility = "visible";
    square.style.top = `${position[1] * blockSize}`;
    square.style.left = `${position[0] * blockSize}`;
    square.style.zIndex = `${z}`;
    return square;
}

function setFood() {
    let x = ~~(Math.random() * arenaWidth);
    let y = ~~(Math.random() * arenaHeight);
    while (listIncludesPoint(snake, [x, y])) {
        x = ~~(Math.random() * arenaWidth);
        y = ~~(Math.random() * arenaHeight);
    }
    moveSquare("food", [x, y]);
}

function drawWholeSnake() {
    for (let i = 0; i < snake.length; i++) {
        border.push(drawSquare("white", snake[i], discoMode));
    }
    if (discoMode) {
        for (let i = 0; i < snake.length; i++) {
            snakeObjects.push(drawSquare(colors[currentColor], snake[i], false));
        }
    }
    z++;
}

function makeColorSequence(gradientCount) {
    let hues = [0, 30, 57, 100, 200, 270, 290];
    let finalHues = [];
    let darker = true;
    for (let i = 0; i < hues.length; i++) {
        for (let j = 1; j <= gradientCount; j++) {
            // 85 - 45
            if (darker) {
                finalHues.push(
                    `hsl(${hues[i]}, 100%, ${85 - j * ~~(40 / gradientCount)}%)`
                );
            } else {
                finalHues.push(
                    `hsl(${hues[i]}, 100%, ${45 + j * ~~(40 / gradientCount)}%)`
                );
            }
        }
        darker = !darker;
    }
    for (let i = 0; i < hues.length; i++) {
        for (let j = 1; j <= gradientCount; j++) {
            // 85 - 45
            if (darker) {
                finalHues.push(
                    `hsl(${hues[i]}, 100%, ${85 - j * ~~(40 / gradientCount)}%)`
                );
            } else {
                finalHues.push(
                    `hsl(${hues[i]}, 100%, ${45 + j * ~~(40 / gradientCount)}%)`
                );
            }
        }
        darker = !darker;
    }
    return finalHues;
}

function moveSnake() {
    if (!moving || !activeGame) {
        return;
    }
    if (turnQueue.length > 0) {
        changeDirection(turnQueue[turnQueue.length - 1]);
        turnQueue.pop();
    }
    switch (direction) {
        case "u":
            snake = [
                [snake[0][0], snake[0][1] - 1]
            ].concat(snake);
            break;
        case "d":
            snake = [
                [snake[0][0], snake[0][1] + 1]
            ].concat(snake);
            break;
        case "l":
            snake = [
                [snake[0][0] - 1, snake[0][1]]
            ].concat(snake);
            break;
        case "r":
            snake = [
                [snake[0][0] + 1, snake[0][1]]
            ].concat(snake);
            break;
    }

    // Check whether the snake got itself or hit a wall.
    if (
        listIncludesPoint(snake.slice(1), snake[0]) ||
        snake[0][0] < 0 ||
        snake[0][0] > arenaWidth - 1 ||
        snake[0][1] < 0 ||
        snake[0][1] > arenaHeight - 1
    ) {
        endScreen();
        return;
    }

    // Check whether the snake got the food
    if (snake[0][0] == foodPosition[0] && snake[0][1] == foodPosition[1]) {
        growCount += 3;
        score += 10;
        document.getElementById("score").innerText = score;
        if (score > best) {
            newHighScore = true;
            best = score;
            localStorage.setItem(isMobileScreen() ? "mobileBest" : "best", best);
            document.getElementById("best").innerText = best;
            document.getElementById("bestScore").style.display = "none";
            document.getElementById("bestBanner").style.display = "inline";
        }

        setFood();
    }
    border = [drawSquare("white", snake[0], discoMode)].concat(border);
    if (discoMode) {
        snakeObjects = [
            drawSquare(colors[currentColor], snake[0], false),
        ].concat(snakeObjects);
        currentColor++;
        document.getElementById("b").style.color = colors[currentColor];
        document.getElementById("e").style.color = colors[currentColor - 2];
        document.getElementById("s").style.color = colors[currentColor - 4];
        document.getElementById("t").style.color = colors[currentColor - 6];
    }

    // Delete the tail if not growing.1
    if (growCount > 0) {
        growCount--;
    } else {
        snake.pop();
        board.removeChild(border[border.length - 1]);
        border.pop();
        snakeObjects.pop();
    }
    for (let i = 0; i < border.length; i++) {
        border[i].style.zIndex = z;
    }
    z++;
    for (let i = 0; i < snakeObjects.length; i++) {
        snakeObjects[i].style.zIndex = z;
        snakeObjects[i].style.backgroundColor = colors[currentColor];
    }
    currentColor++;
    if (currentColor >= colors.length) {
        currentColor = 0;
    }
    z++;
}

document.addEventListener("keydown", queueTurn);

const dPadRect = dPad.getBoundingClientRect();

function handleTouch(event) {
    const touch = event.touches[event.touches.length - 1];
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    const xInsideElement = clientX - dPadRect.left - dPad.width / 2;
    const yInsideElement = clientY - dPadRect.top - dPad.height / 2;

    if (
        event.type == "touchstart" &&
        Math.hypot(Math.abs(xInsideElement), Math.abs(yInsideElement)) <
        dPad.width / 7
    ) {
        lastTouchStartInCenter = new Date().getTime();
        return;
    }

    if (Math.abs(yInsideElement - xInsideElement) < 10) return;
    if (Math.abs(xInsideElement) > Math.abs(yInsideElement)) {
        // Left or right
        if (xInsideElement < 0) {
            queueTurn({ code: "ArrowLeft", preventDefault: () => {} });
        } else {
            queueTurn({ code: "ArrowRight", preventDefault: () => {} });
        }
    } else {
        // Up or down
        if (yInsideElement < 0) {
            queueTurn({ code: "ArrowUp", preventDefault: () => {} });
        } else {
            queueTurn({ code: "ArrowDown", preventDefault: () => {} });
        }
    }
}

let lastTouchEnd = 0;
document.addEventListener(
    "touchend",
    (event) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
        if (lastTouchEnd - lastTouchStartInCenter <= 300) {
            moving = !moving;
        }
    },
    false
);

dPad.addEventListener("touchstart", handleTouch);

dPad.addEventListener("touchmove", (event) => {
    event.preventDefault();
    handleTouch(event);
});

function queueTurn(e) {
    if (e.code == "Space") {
        e.preventDefault();
        if (!activeGame) {
            startGame();
            return;
        }
        moving = !moving;
    }
    if (!moving) {
        return;
    }
    if (
        e.code == "ArrowUp" ||
        e.code == "ArrowDown" ||
        e.code == "ArrowLeft" ||
        e.code == "ArrowRight"
    ) {
        e.preventDefault();
        if (turnQueue[0] !== e.code) turnQueue = [e.code].concat(turnQueue);
    }
}

function changeDirection(code) {
    switch (code) {
        case "ArrowUp":
            if (direction != "d") {
                direction = "u";
            }
            break;
        case "ArrowDown":
            if (direction != "u") {
                direction = "d";
            }
            break;
        case "ArrowLeft":
            if (direction != "r") {
                direction = "l";
            }
            break;
        case "ArrowRight":
            if (direction != "l") {
                direction = "r";
            }
            break;
    }
}

function startGame() {
    setArenaSize();
    newHighScore = false;
    score = 0;
    document.getElementById("score").innerText = score;
    overlay.style.visibility = "hidden";
    endOverlay.style.visibility = "hidden";
    document.getElementById("bestScore").style.display = "inline";
    document.getElementById("bestBanner").style.display = "none";
    foodPosition = [];
    z = 10;
    turnQueue = [];
    border = [];
    snakeObjects = [];
    board.innerHTML = "";
    snake = [
        [centerX, centerY - 1],
        [centerX, centerY],
        [centerX, centerY + 1],
    ];

    drawWholeSnake();
    direction = "u";
    growCount = 0;
    moving = true;
    activeGame = true;
    drawSquare("black", [0, 0], false).id = "food";
    setFood();
}
window.startGame = startGame;

function setArenaSize() {
    blockSize = isMobileScreen() ?
        Math.floor((window.innerWidth - 4) / arenaWidth) :
        Math.floor(
            Math.min(
                (window.innerWidth - 20) / arenaWidth,
                (window.innerHeight - 115) / arenaHeight
            )
        );
    borderSize = Math.max(Math.floor(blockSize / 4), 1);
    board.style.width = `${arenaWidth * blockSize}`;
    board.style.height = `${arenaHeight * blockSize}`;
}

function endScreen() {
    document.getElementById("finalScore").innerText = `${score}`;
    document.getElementById("sadSlug2").style.display = "none";
    document.getElementById("discoSlug2").style.display = "none";
    if (newHighScore) {
        document.getElementById("highScore").style.display = "flex";
        document.getElementById("gameOver").style.display = "none";
    } else {
        document.getElementById("highScore").style.display = "none";
        document.getElementById("gameOver").style.display = "flex";
    }
    endOverlay.style.visibility = "visible";
    moving = false;
    activeGame = false;
}

function toggleDisco() {
    discoMode = !discoMode;
    document.getElementById("discoToggle").checked = discoMode;
    let discoSlug = document.getElementById("discoSlug");
    discoSlug.style.display = discoMode ? "flex" : "none";
    let sadSlug = document.getElementById("sadSlug");
    sadSlug.style.display = discoMode ? "none" : "flex";
    if (!discoMode) {
        document.getElementById("b").style.color = "#e0dae7";
        document.getElementById("e").style.color = "#e0dae7";
        document.getElementById("s").style.color = "#e0dae7";
        document.getElementById("t").style.color = "#e0dae7";
        document.getElementById("sadSlug2").style.display = "flex";
        document.getElementById("highScore").style.display = "none";
        document.getElementById("discoSlug2").style.display = "none";
        document.getElementById("gameOver").style.display = "none";
    } else {
        document.getElementById("sadSlug2").style.display = "none";
        document.getElementById("highScore").style.display = "none";
        document.getElementById("discoSlug2").style.display = "flex";
        document.getElementById("gameOver").style.display = "none";
    }
}
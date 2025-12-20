import { getNextDiscoImage, resetDiscoImages } from "./disco_mode.js";
import { buildMenu } from "./mode_menu.js";
import { drawOldSnakeObstacles } from "./picture_mode/old_snakey.js";
import { drawPixel, getFullImage, isImageLoading, loadRandomImage, resetPictureModeImages } from "./picture_mode/picture_mode.js";

export const modes = {
    chorusHoliday: "Happy Holidays!",
    disco: "Disco Mode",
    picture: "Picture Mode",
    oldSnakey: "Old Snakey",
    plain: "Plain Mode"
}
window.modes = modes;

export const gameModeDescriptions = {
    chorusHoliday: "uncover every pixel to see a special holiday card!",
    disco: "fill the board with dazzling designs",
    picture: "uncover every pixel to reveal a hidden image",
    oldSnakey: "<span> the game that inspired my snakey obsession </span>\
                    <span style='color: red; padding-left: 0'\
                      >[no wormhole mode]</span\
                    >",
    plain: "why do we even have this mode?"

};

function keyOfMode(value) {
    return Object.keys(modes).find(key => modes[key] === value);
}

let coveredPositions = [];
let stepsSinceFillingPixel = 0;
let flashing = 0;
let flashFood = false;
let flashFoodCount = 0;
let best = 0;
let cardRevealedCountdown = 0;
let cardRevealed = false;


const queryString = window.location.search;
const modeFromParams = new URLSearchParams(queryString).get("mode");
const localStorageMode = localStorage.getItem("selectedMode")

let currentMode = !!modeFromParams && !!modes[modeFromParams] ?
    modes[modeFromParams] : !!localStorageMode && localStorageMode != modes.chorusHoliday && !!modes[localStorageMode] ?
        localStorage.getItem("selectedMode") : modes.disco;

if (!isHolidayCard()) {
    delete modes.chorusHoliday;
}

let wormholeMode = localStorage.getItem("wormholeMode") == "true" ? true : false;
buildMenu();
setGameMode(currentMode);
setWormholeMode(wormholeMode);
let lastTouchStartInCenter = 0;
let newHighScore = false;
let score = 0;
let arenaWidth = isMobileScreen() ? 50 : 75;
let arenaHeight = isMobileScreen() ? 30 : 40;
const arena = document.getElementById("arena");
const arenaContainer = document.getElementById("arenaContainer");
const overlay = document.getElementById("start-screen-overlay");
const endOverlay = document.getElementById("end-screen-overlay");
let z = 3;
let blockSize = -1;
let borderWidth = -1;
setArenaSize();

const dPad = document.getElementById("dPad");

if (isMobileScreen()) {
    dPad.style.display = "block";
} else {
    dPad.style.display = "none";
}

let centerX = ~~(arenaWidth / 2);
let centerY = ~~(arenaHeight / 2);
let snake = [
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

let obstacles = [];

setInterval(
    function () {
        moveSnake();
    },
    isMobileScreen() ? 100 : 75
);

arena.style.width = `${arenaWidth * blockSize}`;
arena.style.height = `${arenaHeight * blockSize}`;
arenaContainer.style.width = `${arenaWidth * blockSize + 6}`;

function getScoreTitle() {
    return (isMobileScreen() ? "mobile-" : "") + (wormholeMode ? "wormhole-" : "") + getGameMode();
}

function setRadioValue(groupName, valueToSelect) {
    const radioButtons = document.querySelectorAll(`input[name="${groupName}"]`);
    radioButtons.forEach(radio => {
        if (radio.value === valueToSelect) {
            radio.checked = true;
        } else {
            radio.checked = false;
        }
    });
}

function setImages(selectedMode) {
    const images = Array.from(document.getElementsByClassName("pop-over-img"));

    images.forEach(image => {
        if (image.id === selectedMode) {
            image.style.display = "block";
        } else {
            image.style.display = "none";
        }
    });
}

export function getGameMode() {
    return currentMode;
}
window.getGameMode = getGameMode;

export function getCardRevealed() {
    return cardRevealed;
}

export function setGameMode(mode) {
    currentMode = mode;
    localStorage.setItem("selectedMode", mode);
    setRadioValue("gameMode0", mode);
    setRadioValue("gameMode1", mode);
    setImages(mode);
    if (isOldSnakeyMode()) {
        disableWormholeMode();
    } else {
        let wormholeToggles = Array.from(document.getElementsByClassName("wormholeToggle"));
        wormholeToggles.forEach(elem => {
            elem.disabled = false;
        });
    }
    const modeParam = `?mode=${keyOfMode(mode)}`;
    window.history.pushState({ path: modeParam }, '', modeParam);
}
window.setGameMode = setGameMode;

function setWormholeMode(isOn) {
    wormholeMode = isOn;
    localStorage.setItem("wormholeMode", wormholeMode.toString());
    let wormholeToggles = Array.from(document.getElementsByClassName("wormholeToggle"));
    wormholeToggles.forEach(elem => {
        elem.checked = wormholeMode;
    });
    let imgBackgrounds = Array.from(document.getElementsByClassName("img_background"));
    if (wormholeMode) {
        imgBackgrounds.forEach(elem => {
            elem.style.backgroundImage = `url('holiday_background_wormhole.png')`;
        });
    } else {
        imgBackgrounds.forEach(elem => {
            elem.style.backgroundImage = `url('holiday_background.png')`;
        });
    }
}

function disableWormholeMode() {
    setWormholeMode(false);
    let wormholeToggles = Array.from(document.getElementsByClassName("wormholeToggle"));
    wormholeToggles.forEach(elem => {
        elem.disabled = true;
    });
}

export function toggleWormholeMode() {
    setWormholeMode(!wormholeMode);
    setImages(currentMode);
}
window.toggleWormholeMode = toggleWormholeMode;

export function getArenaDimensions() {
    return { width: arenaWidth, height: arenaHeight };
}

export function isMobileScreen() {
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

export function drawSquare(color, position, type) {
    let isBorder = type == "border";
    let isFood = type == "food";
    let isObstacle = type == "obstacle";
    let square = document.createElement("div");
    arena.appendChild(square);
    square.style.width = isBorder ?
        `${blockSize + borderWidth * 2}` :
        isOldSnakeyMode() ? `${blockSize - borderWidth}` :
            `${blockSize}`;
    square.style.height = isBorder ?
        `${blockSize + borderWidth * 2}` :
        isOldSnakeyMode() ? `${blockSize - borderWidth}` :
            `${blockSize}`;
    square.style.backgroundColor = color;
    square.style.display = "block";
    square.style.position = "absolute";
    square.style.top = isBorder || (isFood && isPictureMode()) ?
        `${position[1] * blockSize - borderWidth}` :
        isOldSnakeyMode() ?
            `${position[1] * blockSize + borderWidth / 2}` :
            `${position[1] * blockSize}`;
    square.style.left = isBorder || (isFood && isPictureMode()) ?
        `${position[0] * blockSize - borderWidth}` :
        isOldSnakeyMode() ?
            `${position[0] * blockSize + borderWidth / 2}` :
            `${position[0] * blockSize}`;
    if (!isFood || isDiscoMode()) {
        square.style.zIndex = `${z}`;
    }
    if (isFood && isPictureMode()) {
        square.style.border = `white solid ${borderWidth}px`;
    } else {
        square.style.border = "none";
    }
    if (isObstacle) {
        obstacles.push(`(${position[0]}, ${position[1]})`);
    }
    return square;
}

export function isDiscoMode() {
    return currentMode == modes.disco;
}

export function isOldSnakeyMode() {
    return currentMode == modes.oldSnakey;
}

export function isPictureMode() {
    return currentMode == modes.picture || currentMode == modes.chorusHoliday;
}

export function isHolidayCard() {
    return currentMode == modes.chorusHoliday;
}
window.isHolidayMode = isHolidayCard;

function setScore(newScore) {
    score = newScore;
    document.getElementById("score").innerText = score;
    if (score > best) {
        newHighScore = true;
        best = score;
        localStorage.setItem(getScoreTitle(), best);
        document.getElementById("best").innerText = best;
        document.getElementById("bestScore").style.display = "none";
        document.getElementById("bestBanner").style.display = "inline";
    }
}

function setFood() {
    let x = ~~(Math.random() * arenaWidth);
    let y = ~~(Math.random() * arenaHeight);
    while (listIncludesPoint(snake, [x, y]) ||
        !(!isOldSnakeyMode() ||
            !obstacles.includes(`(${x}, ${y})`))) {
        x = ~~(Math.random() * arenaWidth);
        y = ~~(Math.random() * arenaHeight);
    }
    foodPosition = [x, y];
    let food = document.getElementById("food");
    food.style.width = isOldSnakeyMode() ? `${blockSize - borderWidth}` : `${blockSize}`;
    food.style.height = isOldSnakeyMode() ? `${blockSize - borderWidth}` : `${blockSize}`;
    food.style.visibility = "visible";
    const modifier = isPictureMode() ?
        -1 * borderWidth :
        isOldSnakeyMode() ?
            0.5 * borderWidth :
            0;
    food.style.top = `${foodPosition[1] * blockSize + modifier}`;
    food.style.left = `${foodPosition[0] * blockSize + modifier}`;
    food.style.zIndex = isPictureMode() ? 1000000 : z;
}

function drawWholeSnake() {
    for (let i = 0; i < snake.length; i++) {
        border.push(drawSquare(isOldSnakeyMode() ? "black" : "white", snake[i], isDiscoMode() ? "border" : ""));
    }
    if (isDiscoMode()) {
        for (let i = 0; i < snake.length; i++) {
            if (!coveredPositions.includes(`${snake[i][0]},${snake[i][1]}`)) {
                coveredPositions.push(`${snake[i][0]},${snake[i][1]}`);
            }
            snakeObjects.push(drawSquare(colors[currentColor], snake[i], ""));
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
    window.focus();
    if (flashFood) {
        flashFoodCount++;
        if (flashFoodCount < 8) {
            document.getElementById("food").style.backgroundColor = "white";
        } else if (flashFoodCount < 16) {
            document.getElementById("food").style.backgroundColor = "black";
        } else { flashFoodCount = 0; }
    }
    if (!moving || !activeGame || isImageLoading()) {
        return;
    }
    if (turnQueue.length > 0) {
        changeDirection(turnQueue[turnQueue.length - 1]);
        turnQueue.pop();
    }
    switch (direction) {
        case "u":
            snake.unshift([snake[0][0], wormholeMode && (snake[0][1] - 1) < 0 ? arenaHeight - 1 : (snake[0][1] - 1)]);
            break;
        case "d":
            snake.unshift([snake[0][0], wormholeMode ? (snake[0][1] + 1) % arenaHeight : (snake[0][1] + 1)]);
            break;
        case "l":
            snake.unshift([wormholeMode && (snake[0][0] - 1) < 0 ? arenaWidth - 1 : (snake[0][0] - 1), snake[0][1]]);
            break;
        case "r":
            snake.unshift([wormholeMode ? (snake[0][0] + 1) % arenaWidth : (snake[0][0] + 1), snake[0][1]]);
            break;
    }
    // Check whether the snake got itself or hit a wall.
    if (
        listIncludesPoint(snake.slice(1, -1), snake[0]) ||
        ((snake[0][0] < 0 ||
            snake[0][0] > arenaWidth - 1 ||
            snake[0][1] < 0 ||
            snake[0][1] > arenaHeight - 1) && !wormholeMode) ||
        obstacles.includes(`(${snake[0][0]}, ${snake[0][1]})`)) {
        endScreen();
        return;
    }

    // Check whether the snake got the food
    if (snake[0][0] == foodPosition[0] && snake[0][1] == foodPosition[1]) {
        growCount += 3;
        setScore(score + 10);
        setFood();
    }
    if (isPictureMode() && !cardRevealedCountdown) {
        if (coveredPositions.length < arenaHeight * arenaWidth &&
            !coveredPositions.includes(`${snake[0][0]},${snake[0][1]}`)) {
            try {
                drawPixel(snake[0][0], snake[0][1]);
                stepsSinceFillingPixel = 0;
                coveredPositions.push(`${snake[0][0]},${snake[0][1]}`);

            } catch (e) { }
        } else {
            stepsSinceFillingPixel++;
        }
        if (stepsSinceFillingPixel > 150 || flashing > 0) {
            flashing++;
            if (flashing < 8) {
                arena.style.backgroundColor = "white";
            } else if (flashing < 16) {
                arena.style.backgroundColor = "black";
            } else {
                stepsSinceFillingPixel = 0;
                flashing = 0;
                arena.style.backgroundColor = "lightslategray";
            }
        }

        // Reveal image
        if (coveredPositions.length >= arenaHeight * arenaWidth) {
            arena.style.backgroundImage = `url('${getFullImage()}')`;
            arena.style.backgroundSize = "100% 100%";
            arena.innerHTML = "";
            doubleScore();
            border = [];
            drawWholeSnake();
            drawSquare("black", foodPosition, "food").id = "food";
            coveredPositions = [];
            if (isHolidayCard() && !cardRevealed) {
                cardRevealedCountdown = 5;
                cardRevealed = true;
                const interval = setInterval(() => {
                    if (cardRevealedCountdown > 0) {
                        cardRevealedCountdown--;
                    } else {
                        clearInterval(interval);
                    }
                }, 1000);
                Array.from(document.getElementsByClassName("download-card")).forEach((elem) => {
                    elem.style.display = "block";
                });
            }
            loadRandomImage();
        }
    }

    border.unshift(drawSquare(isOldSnakeyMode() ? "black" : "white", snake[0], isDiscoMode() ? "border" : ""));
    document.getElementById("b").style.color = colors[currentColor];
    document.getElementById("e").style.color = colors[currentColor - 2];
    document.getElementById("s").style.color = colors[currentColor - 4];
    document.getElementById("t").style.color = colors[currentColor - 6];

    // Delete the tail if not growing.
    if (growCount > 0) {
        growCount--;
    } else {
        snake.pop();
        arena.removeChild(border[border.length - 1]);
        border.pop();
        snakeObjects.pop();
    }

    if (isDiscoMode()) {
        snakeObjects.unshift(drawSquare(colors[currentColor], snake[0], ""));
        currentColor++;

        if (coveredPositions.length < arenaHeight * arenaWidth &&
            !coveredPositions.includes(`${snake[0][0]},${snake[0][1]}`)) {
            coveredPositions.push(`${snake[0][0]},${snake[0][1]}`);
        }
        if (coveredPositions.length >= arenaHeight * arenaWidth) {
            arena.style.backgroundImage = `url('${getNextDiscoImage()}')`;
            arena.style.backgroundSize = "100% 100%";
            arena.innerHTML = "";
            doubleScore();
            border = [];
            snakeObjects = [];
            coveredPositions = [];
            drawWholeSnake();
            drawSquare("black", foodPosition, "food").id = "food";
            flashFood = true;
        }
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
            queueTurn({ code: "ArrowLeft", preventDefault: () => { } });
        } else {
            queueTurn({ code: "ArrowRight", preventDefault: () => { } });
        }
    } else {
        // Up or down
        if (yInsideElement < 0) {
            queueTurn({ code: "ArrowUp", preventDefault: () => { } });
        } else {
            queueTurn({ code: "ArrowDown", preventDefault: () => { } });
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
        if (!activeGame) {
            startGame();
            return;
        }
        moving = !moving;
    }
    if (
        e.code == "ArrowUp" ||
        e.code == "ArrowDown" ||
        e.code == "ArrowLeft" ||
        e.code == "ArrowRight" ||
        e.code == "KeyW" ||
        e.code == "KeyA" ||
        e.code == "KeyS" ||
        e.code == "KeyD"
    ) {
        e.preventDefault();
        if (moving && turnQueue[0] !== e.code) turnQueue.unshift(e.code);


    }
}

function changeDirection(code) {
    switch (code) {
        case "ArrowUp":
        case "KeyW":
            if (direction != "d") {
                direction = "u";
            }
            break;
        case "ArrowDown":
        case "KeyS":
            if (direction != "u") {
                direction = "d";
            }
            break;
        case "ArrowLeft":
        case "KeyA":
            if (direction != "r") {
                direction = "l";
            }
            break;
        case "ArrowRight":
        case "KeyD":
            if (direction != "l") {
                direction = "r";
            }
            break;
    }
}

function startGame() {
    let scoreTitle = getScoreTitle();
    resetPictureModeImages();
    resetDiscoImages();
    best = localStorage.getItem(scoreTitle) ?
        parseInt(localStorage.getItem(scoreTitle)) :
        0;
    document.getElementById("best").innerText = best;
    document.getElementById("scoreTitle").innerText = `(${scoreTitle})`;
    if (wormholeMode) {
        arena.style.boxShadow = "inset 0px 0px 23px 2px #56268e";
    } else {
        arena.style.boxShadow = "none";
    }
    obstacles = [];
    arena.style.backgroundImage = "none";
    arena.style.backgroundColor = isOldSnakeyMode() ? "white" : "lightslategray";
    Array.from(document.getElementsByClassName("download-card")).forEach((elem) => {
        elem.style.display = "none";
    });
    stepsSinceFillingPixel = 0;
    flashing = 0;
    flashFood = false;
    flashFoodCount = 0;
    setArenaSize();
    cardRevealed = false;
    loadRandomImage();
    coveredPositions = [];
    newHighScore = false;
    cardRevealedCountdown = 0;

    overlay.style.visibility = "hidden";
    endOverlay.style.visibility = "hidden";
    setScore(0);
    document.getElementById("bestScore").style.display = "inline";
    document.getElementById("bestBanner").style.display = "none";
    foodPosition = [];
    z = 10;
    turnQueue = [];
    border = [];
    snakeObjects = [];
    arena.innerHTML = "";
    snake = [
        [centerX, centerY - 1],
        [centerX, centerY],
        [centerX, centerY + 1],
    ];
    if (isOldSnakeyMode()) {
        drawOldSnakeObstacles();
    }
    drawWholeSnake();
    direction = "u";
    growCount = 0;
    moving = true;
    activeGame = true;
    let food = drawSquare(isOldSnakeyMode() ? "green" : "black", foodPosition, "food");
    food.id = "food";
    if (isPictureMode()) {
        food.style.border = `white solid ${borderWidth}px`;
    } else {
        food.style.border = "none";
    }
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
    blockSize = blockSize - blockSize % 2;
    borderWidth = Math.max(Math.floor(blockSize / 4), 1);
    arena.style.width = `${arenaWidth * blockSize}`;
    arena.style.height = `${arenaHeight * blockSize}`;
}

function endScreen() {
    document.getElementById("finalScore").innerText = `${score}`;
    setImages("");
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

function doubleScore() {
    setScore(score * 2);
    let banner = document.createElement("div");
    banner.innerText = "SCORE DOUBLED!";
    arena.appendChild(banner);
    banner.id = "double"
    let opacity = 1;
    let bottom = 0;
    const interval = setInterval(() => {
        if (opacity > 0) {
            opacity -= 0.02;
            bottom += 0.5;
            banner.style.opacity = opacity;
            banner.style.bottom = `${bottom}px`;
        } else {
            clearInterval(interval);
            banner.style.display = 'none';
        }
    }, 50);
}

document.addEventListener("DOMContentLoaded", () => {
    const element = document.getElementById("bandcamp-player");
    const buttons = Array.from(document.getElementsByClassName("start-button-container"));
    let angle = 0;
    const rotate = () => {
        angle = (angle + 1) % 360; // Increment angle and keep it within 0-360
        element.style.setProperty("--angle", `${angle}deg`);
        buttons.forEach(button => {
            button.style.setProperty("--angle", `${angle * 2}deg`);
        });
        requestAnimationFrame(rotate);
    };

    rotate();
});
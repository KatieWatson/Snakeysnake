import { drawSquare, getArenaDimensions, isMobileScreen } from "../main.js";

export function drawOldSnakeObstacles() {
    const dimensions = getArenaDimensions();
    // draw lines across top and bottom
    for (let column = 0; column < dimensions.width; column++) {
        drawSquare("red", [column, 0], "obstacle");
        drawSquare("red", [column, dimensions.height - 1], "obstacle");
    }
    // draw lines on right and left
    for (let row = 1; row < dimensions.height - 1; row++) {
        drawSquare("red", [0, row], "obstacle");
        drawSquare("red", [1, row], "obstacle");
        drawSquare("red", [dimensions.width - 2, row], "obstacle");
        drawSquare("red", [dimensions.width - 1, row], "obstacle");
    }

    // draw diagonal lines
    for (let column = 5; column < (dimensions.width) / 2 - (isMobileScreen() ? 2 : 4); column = column + 2) {
        let row = Math.floor(((column - 2) / 2)) + (isMobileScreen() ? 4 : 3);
        drawSquare("red", [column, row], "obstacle");
        drawSquare("red", [column + 1, row], "obstacle");
        drawSquare("red", [column, row + 1], "obstacle");
        drawSquare("red", [column + 1, row + 1], "obstacle");

        let oppositeColumn = dimensions.width - 1 - column;
        drawSquare("red", [oppositeColumn, row], "obstacle");
        drawSquare("red", [oppositeColumn - 1, row], "obstacle");
        drawSquare("red", [oppositeColumn, row + 1], "obstacle");
        drawSquare("red", [oppositeColumn - 1, row + 1], "obstacle");
    }

}
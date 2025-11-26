import { drawSquare, isMobileScreen } from "../main.js";
const images = ["cabin", "california", "cows", "lilies", "olive_trees", "starry", "stream", "wave", "wheat", "willows", "yosemite"];
let pixels = [];
let image = "";
let imageLoading = false;

export function getFullImage() {
    return `./picture_mode/${image}_full.jpg`;
}

export function isImageLoading() {
    return imageLoading
}

export function loadRandomImage() {
    image = images[Math.floor(Math.random() * images.length)];
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `./picture_mode/${image}${isMobileScreen()? "_mobile": ""}.jpg`;

    const canvas = document.getElementById("canvas");

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    pixels = [];

    img.onload = function() {
        imageLoading = true;

        const imageWidth = img.width;
        const imageHeight = img.height;
        ctx.drawImage(img, 0, 0);
        let count = 0;

        for (let y = 0; y < imageHeight; y++) {
            let current = [];
            for (let x = 0; x < imageWidth; x++) {
                count++;
                const pixel = ctx.getImageData(x, y, 1, 1);
                const data = pixel.data;
                current.push(data);
            }
            pixels.push(current);
        }
        imageLoading = false;
    };
}



export function drawPixel(x, y) {
    if (imageLoading) return;
    let pixel = pixels[y][x];
    drawSquare(`rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`, [x, y], false);
}
import { drawSquare, getGameMode, isMobileScreen, modes } from "../main.js";
const images = ["california", "cows", "lilies", "olive_trees", "starry", "stream", "wave", "wheat", "willows", "yosemite"];
const holidayImages = ["alex_levin_2", "alex_levin", "america_windows", "john_leech",
    "mike_kraus", "myriyevskyy", "trevor_mitchell",
    "valery_rybakow_2", "valery_rybakow", "viggo_johansen"];
let remainingImages = [...holidayImages];
let pixels = [];
let image = "";
let imageLoading = false;

export function getFullImage() {
    return `./picture_mode/holiday_pictures/${image}_full.jpg`;
}

export function isImageLoading() {
    return imageLoading
}

export function resetPictureModeImages() {
    remainingImages = [...holidayImages];
}

export function loadRandomImage() {
    if (getGameMode() == modes.chorusHoliday) {
        image = "chorus_holiday_card";
    } else {
        image = remainingImages[Math.floor(Math.random() * remainingImages.length)];
        remainingImages = remainingImages.filter(img => img !== image);
        if (remainingImages.length === 0) {
            resetPictureModeImages();
        }
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `./picture_mode/holiday_pictures/${image}${isMobileScreen() ? "_mobile" : ""}.jpg`;

    const canvas = document.getElementById("canvas");

    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    pixels = [];

    img.onload = function () {
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
const images = ["winner", "winner2", "winner3", "winner4"];
let index = -1;


export function getNextDiscoImage() {
    index = (index + 1) % images.length;

    return `./disco_mode/${images[index]}.jpg`;
}


export function resetDiscoImages() {
    index = -1;
}
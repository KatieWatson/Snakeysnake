import { gameModeDescriptions, modes, setGameMode, toggleWormholeMode } from "./main.js";

export function buildMenu() {

    const menuElements = document.getElementsByClassName("menuList");
    for (let i = 0; i < menuElements.length; i++) {
        let menuElement = menuElements[i];
        let input = document.createElement("input");
        menuElement.appendChild(input);
        input.type = "checkbox";
        input.id = "wormhole${i}";
        input.classList.add("wormholeToggle");
        input.name = "wormhole";
        input.value = "Wormhole Mode";
        input.onclick = toggleWormholeMode;
        let label = document.createElement("label");
        menuElement.appendChild(label);
        label.htmlFor = "wormhole${i}";
        label.innerHTML = `
              Wormhole Mode
                  <p class="gameModeDescription">where snake knows no bounds</p>`;
        for (let mode of Object.keys(modes)) {
            input = document.createElement("input");
            menuElement.appendChild(input);
            input.type = "radio";
            input.id = mode;
            input.name = `gameMode${i}`;
            input.value = modes[mode];
            input.onclick = () => {
                setGameMode(modes[mode]);
            }
            label = document.createElement("label");
            menuElement.appendChild(label);
            label.htmlFor = mode;
            label.innerHTML = `
            ${modes[mode]}
                  <p class="gameModeDescription" >
                    ${gameModeDescriptions[mode]}
                  </p>`;
        }
        const padding = document.createElement("div");
        menuElement.appendChild(padding);
        padding.classList.add("menuPadding");
    }
}
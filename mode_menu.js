import { gameModeDescriptions, modes, setGameMode, toggleWormholeMode, toggleSnailMode, getSnailMode } from "./main.js";

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

        if (getSnailMode()) {
            let snailInput = document.createElement("input");
            menuElement.appendChild(snailInput);
            snailInput.type = "checkbox";
            snailInput.id = "snail${i}";
            snailInput.classList.add("snailToggle");
            snailInput.name = "snail";
            snailInput.value = "Snail Mode";
            snailInput.onclick = toggleSnailMode;
            let snailLabel = document.createElement("label");
            menuElement.appendChild(snailLabel);
            snailLabel.htmlFor = "snail${i}";
            snailLabel.innerHTML = `
                        Snail Mode
                            <p class="gameModeDescription">a.k.a. "melissa mode"</p>`;
        }

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
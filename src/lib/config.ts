import * as Blockly from "blockly/core";
import { toolbox } from "$lib/toolbox";

// 1. Create a custom theme based on the default theme that enables hats
const zeus = Blockly.Theme.defineTheme('custom_hat_theme', {
    base: Blockly.Themes.Classic, // Or whichever base theme you prefer
    blockStyles: {},
    categoryStyles: {},
    componentStyles: {},
    fontStyle: {},
    startHats: true,
    name: ""
    // i plan to modify the render more in the future so i want to make a custom theme for that, but for now it just enables hats and has a custom name
});

export function initAllBlocks() {
    const blockModules = import.meta.glob('./blocks/*.ts', { eager: true });

    for (const path in blockModules) {
        const module = blockModules[path] as any;
        if (typeof module.blockInit === "function") {
            module.blockInit();
        }
    }
}

export const workspaceConfig: Blockly.BlocklyOptions = {
    renderer: "zelos",
    theme: zeus,
    toolbox: toolbox,
    trashcan: true,
    move: {
        scrollbars: {
            horizontal: true,
            vertical: true,
        },
        drag: true,
        wheel: false,
    },
    zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
        pinch: true,
    },
    grid: {
        spacing: 20,
        length: 3,
        colour: "#ccc",
        snap: true,
    },
};

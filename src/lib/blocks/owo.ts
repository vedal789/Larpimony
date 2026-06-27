import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";

Blockly.Blocks["gay_furry"] = {
  init() {
    this.appendDummyInput().appendField("gay furry");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle("owo_blocks");
  },
};

javascriptGenerator.forBlock["gay_furry"] = function () {
const code = `
    const audio = new Audio('/nya.wav');
    audio.play();
  `;
  return code;
};

export {};
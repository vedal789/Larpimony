import * as Blockly from "blockly/core";
import { javascriptGenerator } from "blockly/javascript";
import { categoryColours } from "../colors";

Blockly.Blocks["test"] = {
  init: function () {
    this.appendDummyInput().appendField("tung tung tung sahur");
    this.setNextStatement(true, null);
    this.setTooltip("yooo it works");
    this.setColour(categoryColours.test);
  },
};

javascriptGenerator.forBlock["test"] = function () {
  return `console.log("wow");\n`;
};

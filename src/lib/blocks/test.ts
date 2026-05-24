import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import { categoryColours } from "$lib/colors";

export function blockInit() {
    // block shape
    Blockly.common.defineBlocksWithJsonArray([
        {
            type: "test",
            message0: "tung tung tung sahur",
            nextStatement: null,
            colour: categoryColours.test,
            tooltip: "yooo it works",
            helpUrl: "",
        },
    ]);

    // gen
    javascriptGenerator.forBlock["test"] = function (
        block: Blockly.Block,
        generator: any,
    ) {
        const text = generator.valueToCode(block, "TEXT", Order.NONE) || "''";

        return `console.log("wow");\n`;
    };
}

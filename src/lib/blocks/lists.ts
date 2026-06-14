import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import {
  defineExpandableValueBlock,
  type ExpandableBlock,
} from "./expandable";

const listDefaultValues = "abcdefghijklmnopqrstuvwxyz1234567890mangomustard67";

defineExpandableValueBlock({
  type: "lists_create_with",
  style: "list_blocks",
  output: "Array",
  outputShape: 3,
  initialItemCount: 2,
  minItemCount: 0,
  maxItemCount: Infinity,
  inputPrefix: "ADD",
  emptyLabel: "create empty list",
  firstInputLabel: "create list with",
  shadow: (index) => ({
    type: "text",
    fields: { TEXT: listDefaultValues[index] ?? "" },
  }),
  tooltip: "Create a list with any number of items.",
});

javascriptGenerator.forBlock["lists_create_with"] = function (
  block: Blockly.Block,
) {
  const expandableBlock = block as ExpandableBlock;
  const items: string[] = [];

  for (let i = 0; i < expandableBlock.itemCount_; i++) {
    items.push(
      javascriptGenerator.valueToCode(block, `ADD${i}`, Order.NONE) || "''",
    );
  }

  return [`[${items.join(", ")}]`, Order.ATOMIC];
};

export { };

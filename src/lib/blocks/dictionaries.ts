import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type ShadowFieldValue = string | number | boolean;

type ExpandableShadow = {
    type: string;
    fields?: Record<string, ShadowFieldValue>;
};

type ExpandableKVBlockOptions = {
    type: string;
    style: string;
    output?: string | string[] | null;
    outputShape?: number;
    previousStatement?: string | string[] | null;
    nextStatement?: string | string[] | null;
    initialItemCount?: number;
    minItemCount?: number;
    maxItemCount?: number;
    keyInputPrefix?: string;
    valueInputPrefix?: string;
    emptyLabel?: string;
    firstInputLabel?: string;
    keyInputCheck?: string | string[] | null;
    valueInputCheck?: string | string[] | null;
    keyShadow?: ExpandableShadow | ((index: number) => ExpandableShadow | null);
    valueShadow?: ExpandableShadow | ((index: number) => ExpandableShadow | null);
    tooltip?: string;
};

type ExpandableKVBlock = Blockly.Block & {
    itemCount_: number;
    updateShape_: () => void;
    increase_: () => void;
    decrease_: () => void;
};

function arrowIcon(direction: "left" | "right") {
    const Icon = direction === "left" ? ArrowBigLeft : ArrowBigRight;
    const svg = renderToStaticMarkup(
        createElement(Icon, {
            size: 30,
            strokeWidth: 2.5,
            color: "white",
            "aria-hidden": true,
        }),
    );

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function createShadowDom(template: ExpandableShadow) {
    const shadow = Blockly.utils.xml.createElement("shadow");
    shadow.setAttribute("type", template.type);

    for (const [name, value] of Object.entries(template.fields ?? {})) {
        const field = Blockly.utils.xml.createElement("field");
        field.setAttribute("name", name);
        field.textContent = String(value);
        shadow.appendChild(field);
    }

    return shadow;
}

function getShadow(
    shadowFnOrObj:
        | ExpandableShadow
        | ((index: number) => ExpandableShadow | null)
        | undefined,
    index: number,
): ExpandableShadow | null {
    if (!shadowFnOrObj) return null;
    return typeof shadowFnOrObj === "function"
        ? shadowFnOrObj(index)
        : shadowFnOrObj;
}

function defineExpandableKVBlock(options: ExpandableKVBlockOptions) {
    const keyInputPrefix = options.keyInputPrefix ?? "KEY";
    const valueInputPrefix = options.valueInputPrefix ?? "VALUE";
    const minItemCount = options.minItemCount ?? 0;
    const maxItemCount = options.maxItemCount ?? 99;
    const initialItemCount = options.initialItemCount ?? minItemCount;

    Blockly.Blocks[options.type] = {
        init: function (this: ExpandableKVBlock) {
            this.itemCount_ = initialItemCount;
            this.setInputsInline(false); // KV pairs look better stacked
            this.setStyle(options.style);
            if (options.output !== undefined) this.setOutput(true, options.output);
            if (options.outputShape !== undefined) {
                (this as Blockly.Block & { setOutputShape?: (shape: number) => void })
                    .setOutputShape?.(options.outputShape);
            }
            if (options.previousStatement !== undefined) {
                this.setPreviousStatement(true, options.previousStatement);
            }
            if (options.nextStatement !== undefined) {
                this.setNextStatement(true, options.nextStatement);
            }
            if (options.tooltip) this.setTooltip(options.tooltip);
            this.updateShape_();
        },

        mutationToDom: function (this: ExpandableKVBlock) {
            const container = Blockly.utils.xml.createElement("mutation");
            container.setAttribute("items", String(this.itemCount_));
            return container;
        },

        domToMutation: function (this: ExpandableKVBlock, xmlElement: Element) {
            const items = Number.parseInt(xmlElement.getAttribute("items") ?? "", 10);
            this.itemCount_ = Number.isFinite(items) ? items : initialItemCount;
            this.updateShape_();
        },

        saveExtraState: function (this: ExpandableKVBlock) {
            return { itemCount: this.itemCount_ };
        },

        loadExtraState: function (
            this: ExpandableKVBlock,
            state: { itemCount?: number } | null,
        ) {
            this.itemCount_ =
                state && typeof state.itemCount === "number"
                    ? state.itemCount
                    : initialItemCount;
            this.updateShape_();
        },

        updateShape_: function (this: ExpandableKVBlock) {
            if (this.getInput("ARROWS")) this.removeInput("ARROWS");
            if (this.getInput("EMPTY")) this.removeInput("EMPTY");

            if (this.itemCount_ === 0) {
                this.appendDummyInput("EMPTY").appendField(
                    options.emptyLabel ?? "create empty dictionary",
                );
            } else {
                for (let i = 0; i < this.itemCount_; i++) {
                    let keyInput = this.getInput(`${keyInputPrefix}${i}`);
                    let valueInput = this.getInput(`${valueInputPrefix}${i}`);

                    if (!keyInput) {
                        keyInput = this.appendValueInput(`${keyInputPrefix}${i}`).setCheck(
                            options.keyInputCheck ?? null,
                        );
                        keyInput.setAlign(Blockly.inputs.Align.RIGHT);
                        if (i === 0 && options.firstInputLabel && !keyInput.fieldRow.length) {
                            keyInput.appendField(options.firstInputLabel);
                        }
                        keyInput.appendField(":");
                        const keyShadow = getShadow(options.keyShadow, i);
                        if (keyShadow)
                            keyInput.connection?.setShadowDom(createShadowDom(keyShadow));
                    }

                    if (!valueInput) {
                        valueInput = this.appendValueInput(`${valueInputPrefix}${i}`).setCheck(
                            options.valueInputCheck ?? null,
                        );
                        valueInput.setAlign(Blockly.inputs.Align.RIGHT);
                        const valueShadow = getShadow(options.valueShadow, i);
                        if (valueShadow)
                            valueInput.connection?.setShadowDom(createShadowDom(valueShadow));
                    }
                }
            }

            for (let i = this.itemCount_; this.getInput(`${keyInputPrefix}${i}`); i++) {
                this.removeInput(`${keyInputPrefix}${i}`);
                this.removeInput(`${valueInputPrefix}${i}`);
            }

            const arrowsInput = this.appendDummyInput("ARROWS").setAlign(
                Blockly.inputs.Align.RIGHT,
            );

            if (this.itemCount_ > minItemCount) {
                arrowsInput.appendField(
                    new Blockly.FieldImage(
                        arrowIcon("left"),
                        18,
                        24,
                        "remove a key-value pair",
                        this.decrease_.bind(this),
                    ),
                );
            }

            arrowsInput.appendField(
                new Blockly.FieldImage(
                    arrowIcon("right"),
                    18,
                    24,
                    "add a key-value pair",
                    this.increase_.bind(this),
                ),
            );
        },

        increase_: function (this: ExpandableKVBlock) {
            if (this.itemCount_ >= maxItemCount) return;
            this.itemCount_++;
            this.updateShape_();
            (this as unknown as Blockly.BlockSvg).render();
        },

        decrease_: function (this: ExpandableKVBlock) {
            if (this.itemCount_ <= minItemCount) return;
            this.itemCount_--;
            this.updateShape_();
            (this as unknown as Blockly.BlockSvg).render();
        },
    };
}

const dictDefaultKeys = ["key1", "key2", "key3", "key4", "key5", "key6"];
const dictDefaultValues = ["value1", "value2", "value3", "value4", "value5", "value6"];

defineExpandableKVBlock({
    type: "dicts_create_with",
    style: "dict_blocks",
    output: "Object",
    outputShape: 3,
    initialItemCount: 2,
    minItemCount: 0,
    maxItemCount: Infinity,
    keyInputPrefix: "KEY",
    valueInputPrefix: "VALUE",
    emptyLabel: "create empty dictionary",
    firstInputLabel: "create dictionary with",
    keyInputCheck: "String",
    valueInputCheck: null,
    keyShadow: (index) => ({
        type: "text",
        fields: { TEXT: dictDefaultKeys[index] ?? "key" },
    }),
    valueShadow: (index) => ({
        type: "text",
        fields: { TEXT: dictDefaultValues[index] ?? "value" },
    }),
    tooltip: "Create a dictionary (JavaScript object) with any number of key-value pairs.",
});

javascriptGenerator.forBlock["dicts_create_with"] = function (
    block: Blockly.Block,
) {
    const expandableBlock = block as ExpandableKVBlock;
    const pairs: string[] = [];

    for (let i = 0; i < expandableBlock.itemCount_; i++) {
        const keyCode =
            javascriptGenerator.valueToCode(block, `KEY${i}`, Order.NONE) || "''";
        const valueCode =
            javascriptGenerator.valueToCode(block, `VALUE${i}`, Order.NONE) || "''";
        pairs.push(`${keyCode}: ${valueCode}`);
    }

    return [`{ ${pairs.join(", ")} }`, Order.ATOMIC];
};
Blockly.Blocks["dicts_get_value"] = {
    init: function () {
        this.appendValueInput("DICT")
            .setCheck("Object")
            .appendField("get value from dictionary");
        this.appendValueInput("KEY")
            .setCheck("String")
            .appendField("with key");
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setStyle("dict_blocks");
        this.setTooltip("Get a value from a dictionary by key");
    },
};

javascriptGenerator.forBlock["dicts_get_value"] = function (
    block: Blockly.Block,
) {
    const dictCode =
        javascriptGenerator.valueToCode(block, "DICT", Order.MEMBER) || "{}";
    const keyCode =
        javascriptGenerator.valueToCode(block, "KEY", Order.NONE) || "''";
    return [`${dictCode}[${keyCode}]`, Order.MEMBER];
};

export { };

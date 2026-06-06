import * as Blockly from 'blockly/core';
import { javascriptGenerator, Order } from 'blockly/javascript';

Blockly.Blocks['on_start'] = {
    init: function () {
        this.appendDummyInput('NAME').appendField('on start of the video');
        this.appendStatementInput('DO').setCheck(null);
        this.setStyle('timing_blocks');
        (this as Blockly.Block & { hat?: string }).hat = 'cap';
        this.setTooltip('Runs whatevers underneath when the video is started');
        this.setHelpUrl('');
    }
};

javascriptGenerator.forBlock['on_start'] = function (block: Blockly.Block) {
    const statements = javascriptGenerator.statementToCode(block, 'DO');
    return `(window.RUNTIME || {}).onStart(async function(context){\n${statements}\n});\n`;
};

Blockly.Blocks['timing_wait'] = {
    init: function () {
        this.appendValueInput('SECONDS')
            .setCheck('Number')
            .appendField('wait');
        this.appendDummyInput()
            .appendField('seconds');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('timing_blocks');
        this.setTooltip('Pause execution for the specified number of seconds');
        this.setHelpUrl('');
    }
};

javascriptGenerator.forBlock['timing_wait'] = function (block: Blockly.Block) {
    const seconds = javascriptGenerator.valueToCode(block, 'SECONDS', Order.ATOMIC) || '1';
    return `await window.RUNTIME.delay(${seconds} * 1000);\n`;
};

export { };

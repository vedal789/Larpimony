import * as Blockly from "blockly/core";
import { javascriptGenerator, Order } from "blockly/javascript";

const getSoundOptions: Blockly.MenuGenerator = function(this: any) {
  const block = this instanceof Blockly.Block ? this : this.getSourceBlock();
  if (!block) return [["", ""]];

  const workspace = block.workspace;
  const spriteId = (workspace as any).spriteId;
  
  let options: [string, string][] = [];
  
  if (spriteId && (workspace as any).sprites) {
    const sprite = (workspace as any).sprites.find((s: any) => s.id === spriteId);
    if (sprite && sprite.data.sounds && sprite.data.sounds.length > 0) {
      options = sprite.data.sounds.map((s: any) => [s.name, s.id]);
    }
  }
  
  const hasSounds = options.length > 0;
  
  if (!hasSounds) {
    options.push(["", ""]);
  }
  
  const currentValue = block.getFieldValue("SOUND");
  if (currentValue !== undefined && currentValue !== null) {
    const found = options.find(opt => opt[1] === currentValue);
    if (!found) {
      const label = currentValue === "" 
        ? (hasSounds ? "Select sound..." : "no sounds")
        : `missing sound (${currentValue})`;
      options.push([label, currentValue]);
    }
  }
  
  return options;
};

Blockly.Blocks["audio_play"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("play sound")
      .appendField(new Blockly.FieldDropdown(getSoundOptions), "SOUND");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle("audio_blocks");
    this.setTooltip("Play the selected sound");
  },
};

javascriptGenerator.forBlock["audio_play"] = function (block: Blockly.Block) {
  const soundId = block.getFieldValue("SOUND") || "";
  return `const _sound = context.sprite.sounds?.find(s => s.id === "${soundId}");
    if (_sound?.src) window.RUNTIME.playSound(_sound.src, false, "${soundId}");\n`;
};

Blockly.Blocks["audio_playUntilDone"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("play sound")
      .appendField(new Blockly.FieldDropdown(getSoundOptions), "SOUND")
      .appendField("until done");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle("audio_blocks");
    this.setTooltip("Play the selected sound and wait for it to finish");
  },
};

javascriptGenerator.forBlock["audio_playUntilDone"] = function (block: Blockly.Block) {
  const soundId = block.getFieldValue("SOUND") || "";
  return `const _soundWait = context.sprite.sounds?.find(s => s.id === "${soundId}");
    if (_soundWait?.src) await window.RUNTIME.playSound(_soundWait.src, false, "${soundId}");\n`;
};

Blockly.Blocks["audio_stopAll"] = {
  init: function () {
    this.appendDummyInput().appendField("stop all sounds");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle("audio_blocks");
    this.setTooltip("Stop all currently playing sounds");
  },
};

javascriptGenerator.forBlock["audio_stopAll"] = function () {
  return `window.RUNTIME.stopAllSounds();\n`;
};

Blockly.Blocks["audio_isPlaying"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("is sound")
      .appendField(new Blockly.FieldDropdown(getSoundOptions), "SOUND")
      .appendField("playing");
    this.setOutput(true, "Boolean");
    this.setStyle("audio_blocks");
    this.setTooltip("Returns whether a sound is currently playing");
  }
};

javascriptGenerator.forBlock["audio_isPlaying"] = function (block: Blockly.Block) {
  const soundId = block.getFieldValue("SOUND") || "";
  return [`window.RUNTIME.isSoundPlaying("${soundId}")`, Order.FUNCTION_CALL];
};
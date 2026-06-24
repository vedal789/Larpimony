import * as Blockly from "blockly";
const svgPaths = Blockly.utils.svgPaths;

class CustomConstantProvider extends Blockly.zelos.ConstantProvider {
  init() {
    super.init();
  }

  shapeFor(connection: Blockly.RenderedConnection) {
    if (!connection.sourceBlock_) {
      return super.shapeFor(connection);
    }

    let checks = connection.getCheck() ?? [];
    if (!checks && connection.targetConnection)
      checks = connection.targetConnection.getCheck() ?? [];
    const outputShape = connection.sourceBlock_.getOutputShape();

    if (
      connection.type === Blockly.ConnectionType.INPUT_VALUE ||
      connection.type === Blockly.ConnectionType.OUTPUT_VALUE
    ) {
      if (checks.includes("Array")) {
        return this.SQUARED!;
      }
    }

    return super.shapeFor(connection);
  }
}

export default class CustomRenderer extends Blockly.zelos.Renderer {
  constructor(name: string) {
    super(name);
  }

  makeConstants_() {
    return new CustomConstantProvider();
  }
}

Blockly.blockRendering.register("modified_zelos", CustomRenderer);

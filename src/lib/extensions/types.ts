export type ExtensionMenuItem =
  | string
  | {
      text: string;
      value: string;
    };

export type ExtensionFieldSpec =
  | {
      kind?: "value";
      type?: string | string[] | null;
      default?: unknown;
    }
  | {
      kind: "statement";
      accepts?: string | string[] | null;
    }
  | {
      kind: "menu";
      items: ExtensionMenuItem[];
      default?: string;
    };

export type ExtensionBlockType = "statement" | "cap" | "output" | "dual";
export type ExtensionBlockSpecType =
  | ExtensionBlockType
  | "command"
  | "reporter"
  | "hat";

export type ExtensionBlockDef = {
  id?: string;
  opcode?: string;
  text?: string;
  spec?: string;
  type?: ExtensionBlockSpecType;
  blockType?: ExtensionBlockSpecType;
  fields?: Record<string, ExtensionFieldSpec>;
  arguments?: Record<string, ExtensionFieldSpec>;
  color?: string;
  tooltip?: string;
  inlineInputs?: boolean;
  outputType?: string | string[] | null;
  outputShape?: number;
  statementType?: string | string[] | null;
  promise?: boolean;
  dual?: boolean;
};

export type ExtensionCategoryDef = {
  name?: string;
  color?: string;
  iconURI?: string;
};

export type ExtensionCodeHandlers = Record<
  string,
  (args: Record<string, unknown>, context?: unknown) => unknown
>;

export type ExtensionInstance = {
  id?: string;
  registerCategory?: () => ExtensionCategoryDef | null;
  registerBlocks?: () => ExtensionBlockDef[];
  registerCode?: () => ExtensionCodeHandlers;
};

export type RegisteredExtension = {
  id: string;
  code: string;
  trusted: boolean;
};

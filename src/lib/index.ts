export {
  initAllBlocks,
  workspaceConfig,
  buildToolboxForSource,
} from "./config";
export {
  blockVisibilityConfig,
  isBlockVisibleFor,
  filterBlocksForSource,
  getVisibleBlocksForSource,
  getSourceTypeForSprite,
} from "./blockVisibility";
export type { BlockSourceType, BlockVisibilityConfig } from "./blockVisibility";
export {
  registerExtension,
  activeExtensions,
  extensionBridges,
  extensionHandlers,
  subscribeExtensionChanges,
} from "./extensions/manager";
export type {
  ExtensionBlockDef,
  ExtensionBlockSpecType,
  ExtensionCategoryDef,
  ExtensionCodeHandlers,
  ExtensionFieldSpec,
  ExtensionInstance,
  RegisteredExtension,
} from "./extensions/types";

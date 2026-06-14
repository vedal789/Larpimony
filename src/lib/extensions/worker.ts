import type { ExtensionInstance } from "./types";

let idCounter = 0;
const pending = new Map<
  number,
  {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }
>();

function requestHost(action: string, payload: unknown) {
  return new Promise((resolve, reject) => {
    const id = ++idCounter;
    pending.set(id, { resolve, reject });
    postMessage({ type: "syscall", id, action, payload });
  });
}

const api = {
  fetch: (url: string, options?: RequestInit) =>
    requestHost("fetch", { url, options }),
  storage: {
    get: (key: string) => requestHost("storage.get", { key }),
    set: (key: string, value: string) =>
      requestHost("storage.set", { key, value }),
  },
  log: (...args: unknown[]) => requestHost("log", { args }),
};

let userExtension: ExtensionInstance | null = null;

self.onmessage = async (event: MessageEvent) => {
  const { type, id, action, payload, result, error } = event.data;

  if (type === "init") {
    try {
      const ExtensionClass = new Function(
        "api",
        `"use strict"; return (${payload.code})`,
      )(api);
      userExtension = new ExtensionClass(api) as ExtensionInstance;
      const codeGen = userExtension.registerCode?.() ?? {};

      postMessage({
        type: "ready",
        id: payload.extId,
        extInfo: {
          id: userExtension.id || userExtension.constructor.name,
          category: userExtension.registerCategory?.() ?? null,
          blocks: userExtension.registerBlocks?.() ?? [],
          codeGen: Object.keys(codeGen),
        },
      });
    } catch (err) {
      postMessage({
        type: "error",
        error: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  if (type === "response") {
    const request = pending.get(id);
    if (!request) return;
    if (error) request.reject(new Error(error));
    else request.resolve(result);
    pending.delete(id);
    return;
  }

  if (type === "runBlock") {
    try {
      const handlers = userExtension?.registerCode?.();
      const handler = handlers?.[action];
      if (!handler) throw new Error(`Unknown block action: ${action}`);
      const blockResult = await handler(payload.args);
      postMessage({ type: "blockResult", id, result: blockResult });
    } catch (err) {
      postMessage({
        type: "blockResult",
        id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
};

export {};

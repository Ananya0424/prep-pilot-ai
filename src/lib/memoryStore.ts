declare global {
  var globalKitsCacheMap: Map<string, any> | undefined;
}

if (!global.globalKitsCacheMap) {
  global.globalKitsCacheMap = new Map();
}

export const memoryKits = global.globalKitsCacheMap;

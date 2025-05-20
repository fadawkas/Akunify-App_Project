const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('myAPI', {
  version: () => process.versions,
});

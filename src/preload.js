const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('apis', {
    quit: async (data) => await ipcRenderer.invoke('quitapp', data)
});
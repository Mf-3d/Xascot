const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('apis', {
    quit: async (data) => await ipcRenderer.invoke('quitapp', data),
    setting: async (data) => await ipcRenderer.invoke('setting', data),
    setting_e: async (data) => await ipcRenderer.invoke('setting_e', data),
    get_model: () => ipcRenderer.invoke('get_model')
});


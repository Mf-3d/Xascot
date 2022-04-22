const { app } = require("electron");
const electron = require("electron");
const Store = require('electron-store');
const express = require('express');

const _app = express();

const store = new Store({
  name: 'config'  // 設定ファイル名を指定　※省略可。拡張子は.jsonになる
});

var PORT = store.get('config.port',1210);

var version = "1.0.0-beta3";
let tray = null;

const isMac = (process.platform === 'darwin');  // 'darwin' === macOS

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// node-staticの代わり
var server = _app.listen(PORT, function(){
  console.log("Node.js is listening to PORT:" + server.address().port);
});

_app.use(express.static('src'));

const createTrayIcon = () => {
  let imgFilePath;
  if (process.platform === 'win32') { // Windows
    imgFilePath = __dirname + '/tray.png';
  }
  else{ // macOS
    imgFilePath = __dirname + '/tray.png';
    // 一応、macOS のダークモードに対応しておく
    // if ( nativeTheme.shouldUseDarkColors === true ){
    //   isDarkTheme = true;
    //   imgFilePath = __dirname + '/images/tray-icon/white/100.png';
    // }
  }
  const contextMenu = electron.Menu.buildFromTemplate([
    {role:'about', label:`Xascotについて` },
    { label: '設定', click: () => {
      snw();
    } },
    {type:'separator'},
    { label: '終了', role: 'quit' }
  ]);
  tray = new electron.Tray(imgFilePath);
  tray.setToolTip(app.name);
  tray.setContextMenu(contextMenu);
}

function nw(){
  win=new electron.BrowserWindow({
    resizable: false,
    hasShadow:  false,
    width: 200,
    height: 400,
    transparent: true,
    frame: false,
    toolbar: false,
    alwaysOnTop: true,
    icon: `${__dirname}/icon.png`,
    webPreferences: {
      preload: `${__dirname}/src/preload/preload.js`
    }
  })
  win.webContents.loadURL(`http://localhost:${store.get(`config.port`)}`);

  win.on('closed', function() {
    store.set('config.port', PORT);
    win = null;
  });

  createTrayIcon();

  win.on("focus", () => {
    win.setSkipTaskbar(true);
  });
  win.on("blur", () => {
    win.setSkipTaskbar(true);
  });
};



function snw(){
  swin=new electron.BrowserWindow({
    width: 400,
    height: 200,
    toolbar: false,
    // icon: `${__dirname}/icon.png`,
    webPreferences: {
      preload: `${__dirname}/src/preload/preload.js`
    }
  })
  swin.webContents.loadURL(`http://localhost:${store.get(`config.port`)}/setting.html`);

  swin.on('closed', function() {
    swin = null;
  });
}

electron.app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

electron.app.on('ready',nw);

electron.ipcMain.handle('get_model', async (event, data) => {
  var modelUrl = store.get('config.model', './pmx/Bluesky/Bluesky_1.0.2.pmx');
  model_path = String(modelUrl);
  return model_path;
})

electron.ipcMain.handle('quitapp', (event, data) => {
  electron.app.quit();
});

electron.ipcMain.handle('setting', (event, data) => {
  snw();
});

electron.ipcMain.handle('setting_e', (event, data) => {
  if(data[0] !== ''){
    var port_int = Number(data[0])
    store.set(`config.port`, port_int);
  }
  if(data[1] !== ''){
    if(data[1] == 'default'){
      store.set(`config.model`, `./pmx/Bluesky/Bluesky_1.0.2.pmx`);
    }
    else{
      store.set(`config.model`, data[1]);
    }
  }
});
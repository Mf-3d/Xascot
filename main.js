const { app } = require("electron");
const electron = require("electron");
const Store = require('electron-store');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const store = new Store({
  name: 'config'  // 設定ファイル名を指定　※省略可。拡張子は.jsonになる
});

var PORT = store.get('config.port') || 1210;

var nodeStatic = require('node-static');
var file = new nodeStatic.Server(__dirname + '/src');

let win;
let swin;
var version = "0.0.1-alpha5";

const isMac = (process.platform === 'darwin');  // 'darwin' === macOS

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(PORT);//ポートは空いていそうなところで。

function nw(){
  win=new electron.BrowserWindow({
    width: 200,
    height: 400,
    transparent: true,
    frame: false,
    toolbar: false,
    alwaysOnTop: true,
    icon: `${__dirname}/icon.png`,
    webPreferences: {
      preload: `${__dirname}/src/preload.js`
    }
  })
  win.webContents.loadURL(`http://localhost:${store.get(`config.port`)}`);

  win.on('closed', function() {
    store.set('config.port', PORT);
    fs.rmSync('./src/pmx/cache/',{ recursive: true, force: true });
    console.log('正常に削除が完了しました'); // 完了してるか分からんやろカス
    win = null;
  });

  fs.mkdir('./src/pmx/cache', { recursive: true }, (err) => {
    if (err) console.error(err)
  });
  fse.copySync(store.get(`config.model_folder`), './src/pmx/cache/');
};



function snw(){
  swin=new electron.BrowserWindow({
    width: 400,
    height: 200,
    toolbar: false,
    // icon: `${__dirname}/icon.png`,
    webPreferences: {
      preload: `${__dirname}/src/preload.js`
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
  var modelUrl = store.get('config.model_name',[]);
  var model_name = String(modelUrl);
  return './pmx/cache/'+ path.basename(model_name);
})

electron.ipcMain.handle('quitapp', (event, data) => {
  electron.app.quit();
});

electron.ipcMain.handle('setting', (event, data) => {
  snw();
});

electron.ipcMain.handle('setting_e', (event, data) => {
  if(data[0] !== ''){
    port_int = Number(data[0])
    store.set(`config.port`, port_int);
  }
  if(data[1] !== ''){
    if(data[1] == 'default'){
      store.set(`config.model_name`, `./src/pmx/Bluesky/Bluesky_1.0.2.pmx`);
      store.set(`config.model_folder`, `./src/pmx/Bluesky/`);
    }
    else{
      store.set(`config.model_name`, data[1]);
      store.set(`config.model_folder`, path.dirname(data[1]) + '/');
    }
  }
});
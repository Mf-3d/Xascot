const { app } = require("electron");
const electron = require("electron");
const Store = require('electron-store');

const store = new Store({
  name: 'config'  // 設定ファイル名を指定　※省略可。拡張子は.jsonになる
});

var PORT = store.get('config.port') || 1210;

var nodeStatic = require('node-static');
var file = new nodeStatic.Server(__dirname + '/src');

var version = "0.0.1-alpha3";

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
    win = null;
  });
}

electron.app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

electron.app.on('ready',nw);

electron.ipcMain.handle('quitapp', (event, data) => {
  electron.app.quit();
})
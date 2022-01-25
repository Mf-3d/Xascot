const { app } = require("electron");
const electron = require("electron");

var nodeStatic = require('node-static');
var file = new nodeStatic.Server(__dirname + '/src');

var version = "0.0.1-alpha3";

const isMac = (process.platform === 'darwin');  // 'darwin' === macOS

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(1210);//ポートは空いていそうなところで。

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
  win.webContents.loadURL(`http://localhost:1210`);

  win.on('closed', function() {
    win = null;
  });

  //------------------------------------
  // About Panelの内容をカスタマイズする
  //------------------------------------
  const aboutPanel = function(){
    electron.dialog.showMessageBox({
      title: `Xascotについて`,
      message: `Xascot ${version}`,
      detail: `Created by mf7cli\nCopyright (C) 2022 mf7cli.`,
      buttons: [],
      icon: 'icon.png'
    });
  }
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
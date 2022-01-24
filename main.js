const electron = require("electron");

var nodeStatic = require('node-static');
var file = new nodeStatic.Server(__dirname + '/src');

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
    icon: `${__dirname}/src/icon.png`,
    webPreferences: {
      preload: `${__dirname}/src/preload.js`
    }
  })
  win.webContents.loadURL(`http://localhost:1210`);

  win.webContents.on('close',()=>{
      win=null;
  })
}

electron.app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

electron.app.on('ready',nw);
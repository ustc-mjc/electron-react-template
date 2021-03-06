import { BrowserWindow, app, ipcMain } from 'electron';
import path from "path";
// @ts-ignore

function loadHtml(window: BrowserWindow, name: string) {
  if (process.env.NODE_ENV === 'production') {
    window.loadFile(path.resolve(__dirname, `../renderer/${name}/index.html`)).catch(console.error);
    return;
  }
  // 开发模式
  window.loadURL(`http://localhost:8080/dist/${name}.html`).catch(console.error);
}

let mainWindow: BrowserWindow | null = null;

let userInfoWidget: BrowserWindow | null = null;

ipcMain.handle('open-user-info-widget', () => {
  createUserInfoWidget();
});

ipcMain.handle('calc-value', (event, a, b) => {
  return (a+b);
});

function createMainWindow() {
  if (mainWindow) return;
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    frame: true,
    backgroundColor: '#333544',
    minWidth: 450,
    minHeight: 350,
    height: 350,
    width: 450
  });

  loadHtml(mainWindow, 'index');
  mainWindow.on('close', () => mainWindow = null);
  mainWindow.webContents.on('crashed', () => console.error('crash'));
}

function createUserInfoWidget() {
  if (userInfoWidget) return;
  if (!mainWindow) return;
  userInfoWidget = new BrowserWindow({
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: true
    },
    frame: true,
    backgroundColor: '#333544',
    minWidth: 250,
    minHeight: 300,
    height: 300,
    width: 250
  });
  loadHtml(userInfoWidget, 'userInfo');
  userInfoWidget.on('close', () => userInfoWidget = null);
  userInfoWidget.webContents.on('crashed', () => console.error('crash'));
}

app.on('ready', () => {
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  createMainWindow();
});
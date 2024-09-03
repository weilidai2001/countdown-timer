const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let win;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Set the window to be always on top
  win.setAlwaysOnTop(true, 'screen-saver');

  // Set additional flags to make it visible on fullscreen applications
  win.setVisibleOnAllWorkspaces(true);

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('put-to-sleep', () => {
  if (process.platform === 'win32') {
    exec('rundll32.exe user32.dll,LockWorkStation');
  } else if (process.platform === 'darwin') {
    exec('pmset sleepnow');
  }
});

ipcMain.on('start-countdown', () => {
  win.setAlwaysOnTop(true);
  win.setSize(200, 80);
});

ipcMain.on('stop-countdown', () => {
  win.setAlwaysOnTop(false);
  win.setSize(250, 300);
});

ipcMain.on('close-app', () => {
  app.quit();
});
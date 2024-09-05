const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 300,
    height: 400,
    frame: false,
    transparent: true,
    movable: true,
    resizable: true,
    minWidth: 110,  // Adjusted minimum width
    minHeight: 95,  // Adjusted minimum height
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

// Add this function to close Chrome browsers
function closeChromeBrowsers() {
  exec('taskkill /F /IM chrome.exe', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error closing Chrome: ${error}`);
      return;
    }
    console.log('Chrome browsers closed successfully');
  });
}

// Add this new event listener
ipcMain.on('close-chrome', () => {
  closeChromeBrowsers();
});

ipcMain.on('start-countdown', () => {
  if (win && !win.isDestroyed()) {
    win.setAlwaysOnTop(true);
    win.setSize(110, 95);  // Adjusted width and height
    win.setResizable(false);
  }
});

ipcMain.on('stop-countdown', () => {
  if (win && !win.isDestroyed()) {
    win.setAlwaysOnTop(false);
    win.setSize(300, 400);
    win.setResizable(true);
  }
});

ipcMain.on('close-app', () => {
  app.quit();
});

// Add this near the other ipcMain listeners
ipcMain.on('move-window', (event, { dx, dy }) => {
  if (win && !win.isDestroyed()) {
    const [x, y] = win.getPosition();
    win.setPosition(x + dx, y + dy);
  }
});

// Add this to handle the new 'resize-window' event
ipcMain.on('resize-window', (event, { width, height }) => {
  if (win && !win.isDestroyed()) {
    win.setSize(width, height);
  }
});
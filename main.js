const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 250,
    height: 300,
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
    win.setSize(180, 100); // Adjust these values as needed
    win.setContentSize(180, 100); // Ensure content fits tightly
    win.setResizable(false); // Prevent resizing during countdown
  }
});

ipcMain.on('stop-countdown', () => {
  if (win && !win.isDestroyed()) {
    win.setAlwaysOnTop(false);
    win.setSize(250, 300);
    win.setResizable(true); // Allow resizing when not in countdown mode
  }
});

ipcMain.on('close-app', () => {
  app.quit();
});
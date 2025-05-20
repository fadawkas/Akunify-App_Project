import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import isDev from 'electron-is-dev';

// Define __dirname manually for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: join(__dirname, 'preload.js'), // Optional
        },
    });

    const appURL = isDev
        ? 'http://localhost:5173' // Vite dev server URL
        : `file://${join(__dirname, 'client/dist/index.html')}`; // React build files

    mainWindow.loadURL(appURL);

    if (isDev) {
        mainWindow.webContents.openDevTools(); // Open DevTools in development mode
    }
};

app.whenReady().then(() => {
    try {
        createWindow();
    } catch (error) {
        console.error('Failed to create the window:', error);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception in main process:', error);
    app.quit();
});

const { ipcRenderer } = require('electron');
const timerDisplay = document.getElementById('timer');

let countdown;

ipcRenderer.on('start-countdown', (event, minutes) => {
    let totalSeconds = minutes * 60;
    updateTimerDisplay(totalSeconds);
    
    countdown = setInterval(() => {
        totalSeconds--;
        updateTimerDisplay(totalSeconds);
        
        if (totalSeconds <= 0) {
            clearInterval(countdown);
            ipcRenderer.send('put-to-sleep');
        }
    }, 1000);
});

function updateTimerDisplay(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}
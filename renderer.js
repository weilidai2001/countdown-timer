const { ipcRenderer } = require('electron');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const timerDisplay = document.getElementById('timer');
const setupView = document.getElementById('setup-view');
const timerView = document.getElementById('timer-view');

let countdown;
let totalSeconds;
let isPaused = false;

startBtn.addEventListener('click', startCountdown);
pauseBtn.addEventListener('click', togglePause);
stopBtn.addEventListener('click', stopCountdown);

function startCountdown() {
    const minutes = parseInt(minutesInput.value) || 0;
    const seconds = parseInt(secondsInput.value) || 0;
    totalSeconds = minutes * 60 + seconds;

    if (totalSeconds <= 0) {
        alert('Please enter a valid time.');
        return;
    }
    
    updateTimerDisplay();
    
    setupView.classList.add('hidden');
    timerView.classList.remove('hidden');
    ipcRenderer.send('start-countdown');
    
    runTimer();
}

function runTimer() {
    countdown = setInterval(() => {
        if (!isPaused) {
            totalSeconds--;
            updateTimerDisplay();
            
            if (totalSeconds <= 0) {
                clearInterval(countdown);
                ipcRenderer.send('put-to-sleep');
            }
        }
    }, 1000);
}

function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

function stopCountdown() {
    clearInterval(countdown);
    setupView.classList.remove('hidden');
    timerView.classList.add('hidden');
    ipcRenderer.send('stop-countdown');
    isPaused = false;
    pauseBtn.textContent = 'Pause';
    minutesInput.value = '';
    secondsInput.value = '';
}

function updateTimerDisplay() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

// Add this at the end of the file
const closeButton = document.getElementById('close-button');
closeButton.addEventListener('click', () => {
    ipcRenderer.send('close-app');
});
const { ipcRenderer } = require('electron');

const titlebar = document.getElementById('titlebar');
let isDragging = false;
let startPosition = { x: 0, y: 0 };

titlebar.addEventListener('mousedown', (e) => {
    isDragging = true;
    startPosition = { x: e.clientX, y: e.clientY };
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - startPosition.x;
        const dy = e.clientY - startPosition.y;
        ipcRenderer.send('move-window', { dx, dy });
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('startButton');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const timerDisplay = document.getElementById('timer');
const setupView = document.getElementById('setup-view');
const timerView = document.getElementById('timer-view');

const minus1MinBtn = document.getElementById('minus-1-min');
const plus1MinBtn = document.getElementById('plus-1-min');
const minus10SecBtn = document.getElementById('minus-10-sec');
const plus10SecBtn = document.getElementById('plus-10-sec');

let countdown;
let totalSeconds = 11 * 60; // Default to 11 minutes
let isPaused = false;

function updateTimeDisplay() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timeDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
}

minus1MinBtn.addEventListener('click', () => adjustTime(-60));
plus1MinBtn.addEventListener('click', () => adjustTime(60));
minus10SecBtn.addEventListener('click', () => adjustTime(-10));
plus10SecBtn.addEventListener('click', () => adjustTime(10));

function adjustTime(seconds) {
    totalSeconds += seconds;
    if (totalSeconds < 0) totalSeconds = 0;
    updateTimeDisplay();
}

startBtn.addEventListener('click', startCountdown);
pauseBtn.addEventListener('click', togglePause);
stopBtn.addEventListener('click', stopCountdown);

function startCountdown() {
    if (totalSeconds <= 0) {
        alert('Please set a valid time.');
        return;
    }
    
    updateTimerDisplay();
    
    setupView.classList.add('hidden');
    timerView.classList.remove('hidden');
    ipcRenderer.send('start-countdown');
    
    // Adjust layout for timer view
    document.body.style.display = 'flex';
    document.body.style.flexDirection = 'column';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.height = '100vh';
    
    // Adjust window size for timer view
    ipcRenderer.send('resize-window', { width: 250, height: 200 });
    
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
                ipcRenderer.send('close-chrome'); // Add this line
            }
        }
    }, 1000);
}

function togglePause() {
    isPaused = !isPaused;
    const pauseIcon = pauseBtn.querySelector('i');
    if (isPaused) {
        pauseIcon.classList.remove('fa-pause');
        pauseIcon.classList.add('fa-play');
    } else {
        pauseIcon.classList.remove('fa-play');
        pauseIcon.classList.add('fa-pause');
    }
}

function stopCountdown() {
    clearInterval(countdown);
    setupView.classList.remove('hidden');
    timerView.classList.add('hidden');
    ipcRenderer.send('stop-countdown');
    isPaused = false;
    pauseBtn.textContent = 'Pause';
    
    // Reset layout
    document.body.style.display = '';
    document.body.style.flexDirection = '';
    document.body.style.justifyContent = '';
    document.body.style.alignItems = '';
    document.body.style.height = '';
    
    // Restore window size for setup view
    ipcRenderer.send('resize-window', { width: 300, height: 400 });
}

function updateTimerDisplay() {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    timerDisplay.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

// Initialize the time display
updateTimeDisplay();

// Add this near the top of the file, after other element selections
const closeButton = document.getElementById('close-button');

// Add this near the bottom of the file
closeButton.addEventListener('click', () => {
    ipcRenderer.send('close-app');
});
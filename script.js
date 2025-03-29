// Main app script for DevBreak mini games collection

// DOM elements
const gameCollection = document.getElementById('game-collection');
const gameModal = document.getElementById('game-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');
const soundToggleBtn = document.getElementById('sound-toggle');
const fullscreenToggleBtn = document.getElementById('fullscreen-toggle');
const scoreValue = document.getElementById('score-value');
const timerValue = document.getElementById('timer-value');

// App state
let currentGame = null;
let soundEnabled = true;
let gameTimer = null;
let gamePaused = false;
let gameTimeElapsed = 0;
let currentGameInstance = null;

// Safe localStorage functions
function storageAvailable() {
    try {
        const storage = window.localStorage;
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return false;
    }
}

function safeSetItem(key, value) {
    if (storageAvailable()) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
}

function safeGetItem(key, defaultValue) {
    if (storageAvailable()) {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? item : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }
    return defaultValue;
}

// Game data - each game contains metadata and implementation details
const games = [
    {
        id: 'memory-match',
        title: 'Memory Match',
        description: 'Test your memory by matching pairs of cards',
        thumbnail: 'memory_match.png',
        difficulty: 'easy',
        category: 'memory',
        bestScore: 0,
        timePlayed: 0
    },
    {
        id: 'typing-speed',
        title: 'Speed Typer',
        description: 'Test your typing speed with programming terms',
        thumbnail: 'typing.png',
        difficulty: 'medium',
        category: 'reflex',
        bestScore: 0,
        timePlayed: 0
    },
    {
        id: 'whack-a-mole',
        title: 'Whack-a-Mole',
        description: 'Click on moles as they appear to score points',
        thumbnail: 'whock.jpg',
        difficulty: 'medium',
        category: 'reflex',
        bestScore: 0,
        timePlayed: 0
    },
    {
        id: 'color-match',
        title: 'Color Match',
        description: 'Select the color that matches the displayed word',
        thumbnail: 'color_match.jpg',
        difficulty: 'easy',
        category: 'puzzle',
        bestScore: 0,
        timePlayed: 0
    },
    {
        id: 'snake',
        title: 'Snake',
        description: 'Control the snake to eat food and grow without hitting walls',
        thumbnail: 'snake.jpg',
        difficulty: 'hard',
        category: 'reflex',
        bestScore: 0,
        timePlayed: 0
    }
];

function initApp() {
    // Get DOM elements (paste the lines you cut here)
    window.gameCollection = document.getElementById('game-collection');
    window.gameModal = document.getElementById('game-modal');
    window.modalTitle = document.getElementById('modal-title');
    window.modalBody = document.getElementById('modal-body');
    window.closeModalBtn = document.getElementById('close-modal');
    window.pauseBtn = document.getElementById('pause-btn');
    window.restartBtn = document.getElementById('restart-btn');
    window.soundToggleBtn = document.getElementById('sound-toggle');
    window.fullscreenToggleBtn = document.getElementById('fullscreen-toggle');
    window.scoreValue = document.getElementById('score-value');
    window.timerValue = document.getElementById('timer-value');
    
    // Initialize the app
    renderGameCards();
    setupEventListeners();
    loadUserPreferences();
    if (typeof preloadSounds === 'function') {
        preloadSounds();
    }

    addUtilityStyles();

    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .no-animations * {
            animation-duration: 0s !important;
            transition-duration: 0s !important;
        }
        
        .high-contrast {
            --contrast-factor: 1.5;
            --primary-color: #4834d4;
            --secondary-color: #eb4d4b;
            --grey-color: #d1d1d1;
            --light-color: #ffffff;
            --dark-color: #000000;
        }
        
        .color-game {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 30px;
            width: 100%;
        }
        
        .color-display {
            font-size: 3rem;
            font-weight: bold;
            padding: 20px 40px;
            border-radius: 10px;
            box-shadow: var(--shadow);
            background: var(--light-color);
            text-transform: uppercase;
            min-width: 300px;
            text-align: center;
        }
        
        .color-options {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            width: 100%;
            max-width: 400px;
        }
        
        .color-btn {
            height: 80px;
            border-radius: 10px;
            cursor: pointer;
            border: none;
            box-shadow: var(--shadow);
            transition: var(--transition);
        }
        
        .color-btn:hover {
            transform: scale(1.05);
            box-shadow: var(--shadow-lg);
        }
    `;

    document.head.appendChild(styleElement);
    addSearchCSS();
    updateModalStyles();
    updateCardStyles();
}

// Render game cards on the main page
function renderGameCards() {
    gameCollection.innerHTML = '';
    
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card animate__animated animate__fadeIn';
        card.dataset.gameId = game.id;
        
        card.innerHTML = `
            <div class="game-img-wrapper">
                <img src="${game.thumbnail}" alt="${game.title}">
                <span class="game-card-badge">${game.category}</span>
                <div class="game-card-overlay">
                    <div class="game-card-overlay-content">
                        <button>Play Now</button>
                    </div>
                </div>
            </div>
            <div class="game-card-body">
                <h3>${game.title}</h3>
                <p>${game.description}</p>
                <div class="difficulty ${game.difficulty}">
                    <span class="difficulty-label">Difficulty:</span>
                    <div class="difficulty-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <div class="game-stats">
                    <div class="stat"><i class="fas fa-trophy"></i> ${game.bestScore}</div>
                    <div class="stat"><i class="fas fa-clock"></i> ${formatTime(game.timePlayed)}</div>
                </div>
            </div>
        `;
        
        gameCollection.appendChild(card);
    });
}

// Setup event listeners
function setupEventListeners() {

    const settingsToggle = document.getElementById('settings-toggle');
    const settingsPanel = document.getElementById('settings-panel');
    const closeSettings = document.getElementById('close-settings');
    const saveSettings = document.getElementById('save-settings');
    const resetSettings = document.getElementById('reset-settings');

    const shareScoreBtn = document.getElementById('share-score');
    shareScoreBtn.addEventListener('click', shareScore);

    const leaderboardBtn = document.getElementById('leaderboard-btn');
    leaderboardBtn.addEventListener('click', () => {
        if (currentGame) {
            showLeaderboard(currentGame.id);
        }
    });

    settingsToggle.addEventListener('click', () => {
        settingsPanel.classList.add('open');
    });

    closeSettings.addEventListener('click', () => {
        settingsPanel.classList.remove('open');
    });

    saveSettings.addEventListener('click', () => {
        saveUserSettings();
        settingsPanel.classList.remove('open');
        showNotification('Settings saved successfully', 'success');
    });

    resetSettings.addEventListener('click', () => {
        resetUserSettings();
        showNotification('Settings reset to default', 'info');
    });

    // Game card click events
    gameCollection.addEventListener('click', event => {
        const gameCard = event.target.closest('.game-card');
        if (gameCard) {
            const gameId = gameCard.dataset.gameId;
            openGame(gameId);
        }
    });

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.dataset.filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter game cards
            filterGames(filterValue);
        });
    });

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-theme');
        
        // Save theme preference
        const isDarkTheme = document.body.classList.contains('dark-theme');
        safeSetItem('devbreak-theme', isDarkTheme ? 'dark' : 'light');
    });

    const searchInput = document.getElementById('game-search');
    if (searchInput) {
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        searchGames(query);
    });
    }
    
    // Modal control events
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeGame);
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
    if (restartBtn) restartBtn.addEventListener('click', restartGame);
    if (soundToggleBtn) soundToggleBtn.addEventListener('click', toggleSound);
    if (fullscreenToggleBtn) fullscreenToggleBtn.addEventListener('click', toggleFullscreen);
    
    // Keyboard events
    document.addEventListener('keydown', handleKeyPress);
    
    // Window events
    window.addEventListener('beforeunload', saveUserPreferences);
}

// Open a game in the modal
function openGame(gameId) {
    currentGame = games.find(game => game.id === gameId);
    
    if (!currentGame) return;
    
    // Reset state
    gamePaused = false;
    gameTimeElapsed = 0;
    
    // Update modal UI
    modalTitle.textContent = currentGame.title;
    
    // Set difficulty badge
    const modalDifficulty = document.getElementById('modal-difficulty');
    modalDifficulty.textContent = currentGame.difficulty.charAt(0).toUpperCase() + currentGame.difficulty.slice(1);
    modalDifficulty.className = 'difficulty-badge ' + currentGame.difficulty;
    
    modalBody.innerHTML = '';
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    scoreValue.textContent = '0';
    timerValue.textContent = '0:00';
    
    // Set level value
    const levelValue = document.getElementById('level-value');
    if (levelValue) levelValue.textContent = '1';
    
    // Initialize game
    currentGameInstance = initializeGame(gameId);
    
    // Start timer
    startGameTimer();
    
    // Show modal
    gameModal.style.display = 'block';
    
    // Play sound
    playSound('game-start');
}

// Initialize the selected game
function initializeGame(gameId) {
    switch(gameId) {
        case 'memory-match':
            return initMemoryGame();
        case 'typing-speed':
            return initTypingGame();
        case 'whack-a-mole':
            return initWhackAMole();
        case 'color-match':
            return initColorMatch();
        case 'snake':
            return initSnakeGame();
        default:
            console.error(`Game '${gameId}' not implemented`);
            return null;
    }
}

// Close the current game
function closeGame() {
    if (!currentGame) return;
    
    // Stop timer
    clearInterval(gameTimer);
    
    // Update game stats
    currentGame.timePlayed += gameTimeElapsed;
    
    // Clean up game instance
    if (currentGameInstance && typeof currentGameInstance.cleanup === 'function') {
        currentGameInstance.cleanup();
    }
    
    // Save game
    saveGameProgress();
    
    // Hide modal
    gameModal.style.display = 'none';
    
    // Reset current game
    currentGame = null;
    currentGameInstance = null;
    
    // Play sound
    playSound('game-close');
}

// Toggle game pause state
function togglePause() {
    if (!currentGame || !currentGameInstance) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        // Pause game
        pauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        clearInterval(gameTimer);
        
        if (typeof currentGameInstance.pause === 'function') {
            currentGameInstance.pause();
        }
        
        playSound('game-pause');
    } else {
        // Resume game
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        startGameTimer();
        
        if (typeof currentGameInstance.resume === 'function') {
            currentGameInstance.resume();
        }
        
        playSound('game-resume');
    }
}

// Restart current game
function restartGame() {
    if (!currentGame) return;
    
    // Reset state
    gamePaused = false;
    gameTimeElapsed = 0;
    
    // Update UI
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    scoreValue.textContent = '0';
    timerValue.textContent = '0:00';
    
    // Restart game
    if (currentGameInstance && typeof currentGameInstance.restart === 'function') {
        currentGameInstance.restart();
    } else {
        // Fallback - reinitialize the game
        currentGameInstance = initializeGame(currentGame.id);
    }
    
    // Restart timer
    clearInterval(gameTimer);
    startGameTimer();
    
    // Play sound
    playSound('game-restart');
}

// Start the game timer
function startGameTimer() {
    clearInterval(gameTimer);
    
    const startTime = Date.now() - gameTimeElapsed * 1000;
    
    gameTimer = setInterval(() => {
        if (!gamePaused) {
            gameTimeElapsed = Math.floor((Date.now() - startTime) / 1000);
            updateTimerDisplay();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(gameTimeElapsed / 60);
    const seconds = gameTimeElapsed % 60;
    timerValue.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Update score display
function updateScore(score) {
    scoreValue.textContent = score;
    
    // Update best score if needed
    if (currentGame && score > currentGame.bestScore) {
        currentGame.bestScore = score;
    }
}

// Format time for display (mm:ss)
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    
    if (soundEnabled) {
        soundToggleBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        soundToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
    
    // Play or mute background music if exists
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.muted = !soundEnabled;
    }
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
        fullscreenToggleBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            fullscreenToggleBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }
}

// Handle keyboard press
function handleKeyPress(event) {
    if (!currentGame) return;
    
    // Escape key to close modal
    if (event.key === 'Escape') {
        closeGame();
    }
    
    // Space key to toggle pause
    if (event.key === ' ' || event.key === 'Spacebar') {
        togglePause();
        event.preventDefault();
    }
    
    // R key to restart game
    if (event.key === 'r' || event.key === 'R') {
        restartGame();
    }
}

// Audio elements for sounds
// const sounds = {};

// Preload sounds
function preloadSounds() {
    const soundNames = [
        'game-start', 'game-close', 'game-pause', 'game-resume',
        'game-restart', 'game-over', 'card-flip', 'match-found',
        'no-match', 'correct', 'wrong', 'whack', 'food-eaten'
    ];
    
    soundNames.forEach(name => {
        // Note: In a real implementation, you would need sound files in a 'sounds' folder
        sounds[name] = new Audio(`sounds/${name}.mp3`);
    });
}

// Play sound effect
function playSound(soundName) {
    if (!soundEnabled) return;
    
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(error => {
            console.log(`Error playing sound: ${error}`);
        });
    } else {
        console.log(`Sound not found: ${soundName}`);
    }
}

// Save game progress to localStorage
function saveGameProgress() {
    if (!currentGame) return;
    
    const savedGames = JSON.parse(safeGetItem('devbreak-games', '{}'));
    savedGames[currentGame.id] = {
        bestScore: currentGame.bestScore,
        timePlayed: currentGame.timePlayed
    };
    safeSetItem('devbreak-games', JSON.stringify(savedGames));
}

// Save user preferences to localStorage
function saveUserPreferences() {
    const preferences = {
        soundEnabled
    };
    safeSetItem('devbreak-preferences', JSON.stringify(preferences));
}

// Load user preferences from localStorage
function loadUserPreferences() {
    // Load preferences
    const preferences = JSON.parse(safeGetItem('devbreak-preferences', '{}'));
    
    if (preferences.soundEnabled !== undefined) {
        soundEnabled = preferences.soundEnabled;
        if (!soundEnabled) {
            soundToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
    }

    // Load theme preference
    const savedTheme = safeGetItem('devbreak-theme', 'light');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('theme-toggle').checked = true;
    }

    // Load settings
    const savedSettings = JSON.parse(safeGetItem('devbreak-settings', '{}'));
    
    if (Object.keys(savedSettings).length > 0) {
        // Update UI
        if (savedSettings.soundVolume !== undefined) {
            document.getElementById('sound-volume').value = savedSettings.soundVolume;
        }
        if (savedSettings.muteEffects !== undefined) {
            document.getElementById('mute-effects').checked = savedSettings.muteEffects;
        }
        if (savedSettings.muteMusic !== undefined) {
            document.getElementById('mute-music').checked = savedSettings.muteMusic;
        }
        if (savedSettings.animations !== undefined) {
            document.getElementById('animations').checked = savedSettings.animations;
        }
        if (savedSettings.highContrast !== undefined) {
            document.getElementById('high-contrast').checked = savedSettings.highContrast;
        }
        if (savedSettings.difficulty !== undefined) {
            document.getElementById('difficulty').value = savedSettings.difficulty;
        }
        
        // Apply settings
        applyUserSettings(savedSettings);
    }
    
    // Load game stats
    const savedGames = JSON.parse(safeGetItem('devbreak-games', '{}'));
    
    games.forEach(game => {
        if (savedGames[game.id]) {
            game.bestScore = savedGames[game.id].bestScore || 0;
            game.timePlayed = savedGames[game.id].timePlayed || 0;
        }
    });
    
    // Update UI
    renderGameCards();
}

// ----- Game Implementations -----

// Memory Match Game
function initMemoryGame() {
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const gameEmojis = [...emojis, ...emojis];
    let flippedCards = [];
    let matchedPairs = 0;
    let score = 0;
    let moves = 0;
    let gameActive = true;

    function setupCards() {
        // Clear current board
        gameBoard.innerHTML = '';
        
        // Reset game state
        flippedCards = [];
        matchedPairs = 0;
        score = 0;
        moves = 0;
        gameActive = true;
        
        // Shuffle the emojis
        gameEmojis.sort(() => Math.random() - 0.5);
        
        // Create cards
        gameEmojis.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.cardIndex = index;
            
            card.innerHTML = `
                <div class="front-face">${emoji}</div>
                <div class="back-face">?</div>
            `;
            
            gameBoard.appendChild(card);
            
            // Add click event
            card.addEventListener('click', () => {
                // Prevent clicking if game is paused or inactive
                if (gamePaused || !gameActive) return;
                
                // Prevent clicking already flipped or matched cards
                if (card.classList.contains('flip') || card.classList.contains('matched')) return;
                
                // Prevent flipping more than 2 cards at once
                if (flippedCards.length === 2) return;
                
                // Flip the card
                card.classList.add('flip');
                flippedCards.push(card);
                
                // Play sound
                playSound('card-flip');
                
                // Check for match if 2 cards are flipped
                if (flippedCards.length === 2) {
                    moves++;
                    
                    const card1 = flippedCards[0];
                    const card2 = flippedCards[1];
                    
                    const emoji1 = card1.querySelector('.front-face').textContent;
                    const emoji2 = card2.querySelector('.front-face').textContent;
                    
                    if (emoji1 === emoji2) {
                        // Match found logic...
                        matchedPairs++;
                        score += 10;
                        updateScore(score);
                        
                        // Mark cards as matched
                        card1.classList.add('matched');
                        card2.classList.add('matched');
                        
                        // Play sound
                        playSound('match-found');
                        
                        // Reset flipped cards
                        flippedCards = [];
                        
                        // Check for game completion
                        if (matchedPairs === emojis.length) {
                            // Game completed logic...
                        }
                    } else {
                        // No match logic...
                        setTimeout(() => {
                            card1.classList.remove('flip');
                            card2.classList.remove('flip');
                            flippedCards = [];
                            
                            // Play sound
                            playSound('no-match');
                        }, 1000);
                    }
                }
            });
        });
    }
    
    // Shuffle the emojis
    gameEmojis.sort(() => Math.random() - 0.5);
    
    // Create game HTML
    modalBody.innerHTML = `
        <div class="memory-game"></div>
    `;
    
    const gameBoard = modalBody.querySelector('.memory-game');
    gameBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
    gameBoard.style.gap = '10px';
    gameBoard.style.width = '100%';
    gameBoard.style.maxWidth = '600px';
    gameBoard.style.margin = '0 auto';

    setupCards();
    
    // Create cards
    gameEmojis.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.cardIndex = index;
        
        card.innerHTML = `
            <div class="front-face">${emoji}</div>
            <div class="back-face">?</div>
        `;
        
        gameBoard.appendChild(card);
        
        // Add click event
        card.addEventListener('click', () => {
            // Prevent clicking if game is paused or inactive
            if (gamePaused || !gameActive) return;
            
            // Prevent clicking already flipped or matched cards
            if (card.classList.contains('flip') || card.classList.contains('matched')) return;
            
            // Prevent flipping more than 2 cards at once
            if (flippedCards.length === 2) return;
            
            // Flip the card
            card.classList.add('flip');
            flippedCards.push(card);
            
            // Play sound
            playSound('card-flip');
            
            // Check for match if 2 cards are flipped
            if (flippedCards.length === 2) {
                moves++;
                
                const card1 = flippedCards[0];
                const card2 = flippedCards[1];
                
                const emoji1 = card1.querySelector('.front-face').textContent;
                const emoji2 = card2.querySelector('.front-face').textContent;
                
                if (emoji1 === emoji2) {
                    // Match found
                    matchedPairs++;
                    score += 10;
                    updateScore(score);
                    
                    // Mark cards as matched
                    card1.classList.add('matched');
                    card2.classList.add('matched');
                    
                    // Play sound
                    playSound('match-found');
                    
                    // Reset flipped cards
                    flippedCards = [];
                    
                    // Check for game completion
                    if (matchedPairs === emojis.length) {
                        // Game completed
                        gameActive = false;
                        playSound('game-completed');
                        
                        // Add bonus points for fewer moves
                        const bonusPoints = Math.max(0, 100 - (moves - emojis.length) * 5);
                        score += bonusPoints;
                        updateScore(score);
                        
                        // Show completion message
                        setTimeout(() => {
                            const gameOver = document.createElement('div');
                            gameOver.className = 'game-over animate__animated animate__fadeIn';
                            gameOver.innerHTML = `
                                <h2>Great job!</h2>
                                <p>You completed the game with ${moves} moves</p>
                                <p>Bonus points: ${bonusPoints}</p>
                                <p>Final score: ${score}</p>
                            `;
                            modalBody.appendChild(gameOver);
                        }, 1000);
                    }
                } else {
                    // No match
                    setTimeout(() => {
                        card1.classList.remove('flip');
                        card2.classList.remove('flip');
                        flippedCards = [];
                        
                        // Play sound
                        playSound('no-match');
                    }, 1000);
                }
            }
        });
    });
    
    // Return game controller
    return {
        pause: function() {
            // Nothing specific needed for this game
        },
        resume: function() {
            // Nothing specific needed for this game
        },
        restart: function() {
            // Replace all this code...
            setupCards(); // ...with this single function call
            
            // Remove game over message if it exists
            const gameOver = modalBody.querySelector('.game-over');
            if (gameOver) {
                modalBody.removeChild(gameOver);
            }
            
            // Reset score
            updateScore(0);
        },
        cleanup: function() {
            // Any cleanup needed when closing the game
        }
    };
}

// Typing Speed Game
function initTypingGame() {
    let score = 0;
    let wordCount = 0;
    let currentWord = '';
    let timeLeft = 30; // Game duration in seconds
    let gameActive = true;
    let intervalId = null;
    
    // Word list (common programming terms)
    const words = [
        'function', 'variable', 'const', 'let', 'array', 
        'object', 'string', 'boolean', 'number', 'null', 
        'undefined', 'async', 'await', 'promise', 'callback',
        'event', 'listener', 'component', 'prop', 'state',
        'render', 'effect', 'hook', 'context', 'redux',
        'react', 'angular', 'vue', 'node', 'express',
        'api', 'rest', 'json', 'xml', 'http',
        'request', 'response', 'server', 'client', 'database'
    ];
    
    // Create game HTML
    modalBody.innerHTML = `
        <div class="typing-game">
            <div class="typing-stats">
                <div class="time-left">Time: <span id="time-display">30</span>s</div>
                <div class="word-count">Words: <span id="word-count">0</span></div>
            </div>
            <div class="typing-area">
                <div class="current-word" id="current-word"></div>
                <input type="text" id="word-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Type the word here...">
            </div>
            <div class="typing-history" id="typing-history"></div>
        </div>
    `;
    
    // Get DOM elements
    const timeDisplay = document.getElementById('time-display');
    const wordCountDisplay = document.getElementById('word-count');
    const currentWordDisplay = document.getElementById('current-word');
    const wordInput = document.getElementById('word-input');
    const typingHistory = document.getElementById('typing-history');
    
    // Function to get a random word
    function getRandomWord() {
        return words[Math.floor(Math.random() * words.length)];
    }
    
    // Initialize with a random word
    function setNewWord() {
        currentWord = getRandomWord();
        currentWordDisplay.textContent = currentWord;
        wordInput.value = '';
        wordInput.focus();
    }
    
    // Handle word input
    const inputHandler = function() {
        if (!gameActive || gamePaused) return;
        
        const typedWord = this.value.trim();
        
        // Check if the word is complete
        if (typedWord === currentWord) {
            // Correct word
            wordCount++;
            score += 10 + (currentWord.length * 2); // More points for longer words
            updateScore(score);
            
            // Update word count display
            wordCountDisplay.textContent = wordCount;
            
            // Add to history
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item word-correct';
            wordItem.textContent = currentWord;
            typingHistory.prepend(wordItem);
            
            // Play sound
            playSound('correct');
            
            // Set new word
            setNewWord();
        }
    };
    
    wordInput.addEventListener('input', inputHandler);
    
    // Start countdown timer
    intervalId = setInterval(function() {
        if (gamePaused) return;
        
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(intervalId);
            gameActive = false;
            
            // Disable input
            wordInput.disabled = true;
            
            // Calculate typing speed
            const wordsPerMinute = Math.round((wordCount / 30) * 60);
            
            // Create game over overlay
            const gameOver = document.createElement('div');
            gameOver.className = 'game-over animate__animated animate__fadeIn';
            
            gameOver.innerHTML = `
                <h2>Time's Up!</h2>
                <div class="typing-results">
                    <h3>Your Results</h3>
                    <div><span>Words Typed:</span> <span>${wordCount}</span></div>
                    <div><span>Words Per Minute:</span> <span>${wordsPerMinute}</span></div>
                    <div><span>Score:</span> <span>${score}</span></div>
                </div>
                <p>Click restart to play again</p>
            `;
            
            modalBody.appendChild(gameOver);
            
            // Play sound
            playSound('game-over');
        }
    }, 1000);
    
    // Set first word
    setNewWord();
    
    // Return game controller
    return {
        pause: function() {
            if (intervalId) {
                clearInterval(intervalId);
            }
            
            wordInput.removeEventListener('input', inputHandler);
        },
        resume: function() {
            // Restart the timer
            intervalId = setInterval(function() {
                if (gamePaused) return;
                
                timeLeft--;
                timeDisplay.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    // Same timeout logic as before
                    // ...
                }
            }, 1000);
            
            // Re-add event listener
            wordInput.addEventListener('input', inputHandler);
        },
        restart: function() {
            // Clear previous interval
            clearInterval(intervalId);
            
            // Reset game state
            score = 0;
            wordCount = 0;
            timeLeft = 30;
            gameActive = true;
            
            // Update displays
            updateScore(0);
            timeDisplay.textContent = timeLeft;
            wordCountDisplay.textContent = 0;
            
            // Clear history
            typingHistory.innerHTML = '';
            
            // Enable input
            wordInput.disabled = false;
            
            // Set new word
            setNewWord();
            
            // Remove game over if exists
            const gameOver = modalBody.querySelector('.game-over');
            if (gameOver) {
                modalBody.removeChild(gameOver);
            }
            
            // Restart timer
            intervalId = setInterval(function() {
                // Same interval logic as before
                // ...
            }, 1000);
        },
        cleanup: function() {
            // Clear interval
            if (intervalId) {
                clearInterval(intervalId);
            }
            
            // Remove event listeners
            wordInput.removeEventListener('input', inputHandler);
        }
    };
}

// Whack-a-Mole Game
function initWhackAMole() {
    let score = 0;
    let gameActive = true;
    let moles = [];
    let speed = 1000; // Starting speed in ms
    let minSpeed = 500; // Minimum speed (maximum difficulty)
    let gameInterval = null;
    let timeLeft = 60; // Game duration in seconds
    let timeInterval = null;
    
    // Create game HTML
    modalBody.innerHTML = `
        <div class="whack-game-container">
            <div class="whack-game-timer">Time: <span id="whack-timer">60</span>s</div>
            <div class="whack-game"></div>
        </div>
    `;
    
    // Add CSS for the timer
    const style = document.createElement('style');
    style.textContent = `
        .whack-game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            width: 100%;
        }
        
        .whack-game-timer {
            font-size: 1.2rem;
            font-weight: bold;
            padding: 5px 15px;
            background: var(--light-color);
            border-radius: 5px;
            box-shadow: var(--shadow);
        }
    `;
    document.head.appendChild(style);
    
    const gameBoard = modalBody.querySelector('.whack-game');
    const timerDisplay = document.getElementById('whack-timer');
    
    // Create mole holes
    for (let i = 0; i < 9; i++) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        
        const mole = document.createElement('div');
        mole.className = 'mole';
        mole.dataset.index = i;
        
        mole.innerHTML = `
            <div class="mole-face">😊</div>
        `;
        
        // Event handler for whacking moles
        const whackHandler = () => {
            // Prevent clicking if game is paused
            if (gamePaused || !gameActive) return;
            
            // Check if mole is up
            if (mole.classList.contains('up')) {
                // Whack the mole
                score += 5;
                updateScore(score);
                
                // Change mole face
                mole.querySelector('.mole-face').textContent = '😵';
                
                // Play sound
                playSound('whack');
                
                // Remove up class to make it go down
                mole.classList.remove('up');
                
                // Prevent double-whacking
                mole.style.pointerEvents = 'none';
                
                // Reset pointer events after animation
                setTimeout(() => {
                    mole.style.pointerEvents = 'auto';
                    mole.querySelector('.mole-face').textContent = '😊';
                }, 500);
                
                // Increase difficulty (speed) as score increases
                speed = Math.max(minSpeed, 1000 - Math.floor(score / 20) * 50);
            }
        };
        
        mole.addEventListener('click', whackHandler);
        
        hole.appendChild(mole);
        gameBoard.appendChild(hole);
        
        moles.push({
            element: mole,
            whackHandler: whackHandler
        });
    }
    
    // Start the game
    function startGame() {
        // Reset any previous interval
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        
        gameInterval = setInterval(() => {
            if (gamePaused || !gameActive) return;
            
            // Hide all moles
            moles.forEach(mole => mole.element.classList.remove('up'));
            
            // Show random mole
            const randomIndex = Math.floor(Math.random() * moles.length);
            const randomMole = moles[randomIndex].element;
            
            randomMole.classList.add('up');
            
            // Auto-hide mole after a delay
            setTimeout(() => {
                if (gameActive && randomMole.classList.contains('up')) {
                    randomMole.classList.remove('up');
                }
            }, speed * 0.8);
            
        }, speed);
    }
    
    // Game timer countdown
    timeInterval = setInterval(() => {
        if (gamePaused) return;
        
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            // End game
            clearInterval(timeInterval);
            clearInterval(gameInterval);
            gameActive = false;
            
            // Hide all moles
            moles.forEach(mole => mole.element.classList.remove('up'));
            
            // Show game over message
            const gameOver = document.createElement('div');
            gameOver.className = 'game-over animate__animated animate__fadeIn';
            gameOver.innerHTML = `
                <h2>Time's Up!</h2>
                <p>Your final score: ${score}</p>
                <p>Click restart to play again</p>
            `;
            
            modalBody.appendChild(gameOver);
            
            // Play sound
            playSound('game-over');
        }
    }, 1000);
    
    // Start the game
    startGame();
    
    // Return game controller
    return {
        pause: function() {
            // Just let the internal gamePaused check handle it
        },
        resume: function() {
            // Just let the internal gamePaused check handle it
        },
        restart: function() {
            // Clear intervals
            if (gameInterval) {
                clearInterval(gameInterval);
            }
            if (timeInterval) {
                clearInterval(timeInterval);
            }
            
            // Reset game state
            score = 0;
            gameActive = true;
            timeLeft = 60;
            speed = 1000;
            
            // Update score and timer display
            updateScore(0);
            timerDisplay.textContent = timeLeft;
            
            // Remove game over if exists
            const gameOver = modalBody.querySelector('.game-over');
            if (gameOver) {
                modalBody.removeChild(gameOver);
            }
            
            // Hide all moles
            moles.forEach(mole => mole.element.classList.remove('up'));
            
            // Restart game
            startGame();
            
            // Restart timer
            timeInterval = setInterval(() => {
                if (gamePaused) return;
                
                timeLeft--;
                timerDisplay.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    // End game (same as above)
                    clearInterval(timeInterval);
                    clearInterval(gameInterval);
                    gameActive = false;
                    
                    // Hide all moles
                    moles.forEach(mole => mole.element.classList.remove('up'));
                    
                    // Show game over message
                    const gameOver = document.createElement('div');
                    gameOver.className = 'game-over animate__animated animate__fadeIn';
                    gameOver.innerHTML = `
                        <h2>Time's Up!</h2>
                        <p>Your final score: ${score}</p>
                        <p>Click restart to play again</p>
                    `;
                    
                    modalBody.appendChild(gameOver);
                    
                    // Play sound
                    playSound('game-over');
                }
            }, 1000);
        },
        cleanup: function() {
            // Clean up intervals
            if (gameInterval) {
                clearInterval(gameInterval);
            }
            if (timeInterval) {
                clearInterval(timeInterval);
            }
            
            // Clean up event listeners
            moles.forEach(mole => {
                mole.element.removeEventListener('click', mole.whackHandler);
            });
        }
    };
}

// Color Match Game
function initColorMatch() {
    const colors = [
        { name: 'red', hex: '#ff0000' },
        { name: 'blue', hex: '#0000ff' },
        { name: 'green', hex: '#00ff00' },
        { name: 'yellow', hex: '#ffff00' },
        { name: 'purple', hex: '#800080' },
        { name: 'orange', hex: '#ffa500' }
    ];
    
    let score = 0;
    let gameActive = true;
    let timeLeft = 30; // Game duration in seconds
    let countdownInterval = null;
    let currentOptions = [];
    let wordColor = null;
    let textColor = null;
    
    // Create game HTML
    modalBody.innerHTML = `
        <div class="color-game">
            <div class="time-left">Time: <span id="color-timer">30</span>s</div>
            <div class="color-display"></div>
            <div class="color-options"></div>
        </div>
    `;
    
    const colorDisplay = modalBody.querySelector('.color-display');
    const colorOptions = modalBody.querySelector('.color-options');
    const timerDisplay = document.getElementById('color-timer');
    
    // Function to generate a new round
    function newRound() {
        if (!gameActive) return;
        
        // Clear previous options and handlers
        colorOptions.innerHTML = '';
        currentOptions = [];
        
        // Select random color for the word
        const wordColorIndex = Math.floor(Math.random() * colors.length);
        wordColor = colors[wordColorIndex];
        
        // Select random color for the text display (might be different from the word)
        const textColorIndex = Math.floor(Math.random() * colors.length);
        textColor = colors[textColorIndex];
        
        // Update the display
        colorDisplay.textContent = wordColor.name;
        colorDisplay.style.color = textColor.hex;
        
        // Create shuffled array of colors for options
        const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
        
        // Select 4 random colors from shuffled array
        const optionColors = shuffledColors.slice(0, 4);
        
        // Make sure the correct color is among the options
        if (!optionColors.some(color => color.name === wordColor.name)) {
            optionColors[0] = wordColor;
        }
        
        // Shuffle the options again
        optionColors.sort(() => Math.random() - 0.5);
        
        // Create option buttons
        optionColors.forEach(color => {
            const button = document.createElement('button');
            button.className = 'color-btn';
            button.style.backgroundColor = color.hex;
            button.textContent = '';
            
            // Option click handler
            const optionClickHandler = () => {
                if (gamePaused || !gameActive) return;
                
                if (color.name === wordColor.name) {
                    // Correct choice
                    score += 5;
                    updateScore(score);
                    
                    // Visual feedback
                    button.classList.add('animate__animated', 'animate__pulse');
                    
                    // Play sound
                    playSound('correct');
                    
                    // Next round
                    setTimeout(() => {
                        newRound();
                    }, 500);
                } else {
                    // Wrong choice
                    score = Math.max(0, score - 2);
                    updateScore(score);
                    
                    // Visual feedback
                    button.classList.add('animate__animated', 'animate__shakeX');
                    
                    // Play sound
                    playSound('wrong');
                }
            };
            
            button.addEventListener('click', optionClickHandler);
            
            colorOptions.appendChild(button);
            
            // Store button and handler for cleanup
            currentOptions.push({
                element: button,
                handler: optionClickHandler
            });
        });
    }
    
    // Start the first round
    newRound();
    
    // Countdown timer
    countdownInterval = setInterval(() => {
        if (gamePaused) return;
        
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            gameActive = false;
            
            // Show game over message
            const gameOver = document.createElement('div');
            gameOver.className = 'game-over animate__animated animate__fadeIn';
            gameOver.innerHTML = `
                <h2>Time's Up!</h2>
                <p>Your final score: ${score}</p>
                <p>Click restart to play again</p>
            `;
            
            modalBody.appendChild(gameOver);
            
            // Play sound
            playSound('game-over');
        }
    }, 1000);
    
    // Return game controller
    return {
        pause: function() {
            // Let the gamePaused flag handle this
        },
        resume: function() {
            // Let the gamePaused flag handle this
        },
        restart: function() {
            // Clean up interval
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            
            // Reset game state
            score = 0;
            gameActive = true;
            timeLeft = 30;
            
            // Update score and timer
            updateScore(0);
            timerDisplay.textContent = timeLeft;
            
            // Remove game over if exists
            const gameOver = modalBody.querySelector('.game-over');
            if (gameOver) {
                modalBody.removeChild(gameOver);
            }
            
            // Clear existing options
            colorOptions.innerHTML = '';
            
            // Start new round
            newRound();
            
            // Restart timer
            countdownInterval = setInterval(() => {
                if (gamePaused) return;
                
                timeLeft--;
                timerDisplay.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    gameActive = false;
                    
                    // Show game over message
                    const gameOver = document.createElement('div');
                    gameOver.className = 'game-over animate__animated animate__fadeIn';
                    gameOver.innerHTML = `
                        <h2>Time's Up!</h2>
                        <p>Your final score: ${score}</p>
                        <p>Click restart to play again</p>
                    `;
                    
                    modalBody.appendChild(gameOver);
                    
                    // Play sound
                    playSound('game-over');
                }
            }, 1000);
        },
        cleanup: function() {
            // Clean up interval
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            
            // Clean up event listeners
            currentOptions.forEach(option => {
                option.element.removeEventListener('click', option.handler);
            });
        }
    };
}

// Snake Game
function initSnakeGame() {
    const boardSize = 20; // 20x20 grid
    const cellSize = 20; // cell size in pixels
    let snake = [{ x: 10, y: 10 }]; // starting position
    let food = { x: 15, y: 15 }; // initial food position
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let gameOver = false;
    let snakeInterval = null;
    let keyDownHandler = null;
    
    // Create game HTML
    modalBody.innerHTML = `
        <div class="snake-game">
            <canvas id="snake-board" width="${boardSize * cellSize}" height="${boardSize * cellSize}"></canvas>
            <div class="snake-controls">
                <button class="snake-btn" id="up-btn"><i class="fas fa-arrow-up"></i></button>
                <button class="snake-btn" id="left-btn"><i class="fas fa-arrow-left"></i></button>
                <button class="snake-btn" id="right-btn"><i class="fas fa-arrow-right"></i></button>
                <button class="snake-btn" id="down-btn"><i class="fas fa-arrow-down"></i></button>
            </div>
        </div>
    `;
    
    const canvas = document.getElementById('snake-board');
    const ctx = canvas.getContext('2d');
    
    // Add touch controls
    const touchButtons = {
        up: document.getElementById('up-btn'),
        left: document.getElementById('left-btn'),
        right: document.getElementById('right-btn'),
        down: document.getElementById('down-btn')
    };
    
    // Button handlers
    const buttonHandlers = {
        up: () => {
            if (direction !== 'down') nextDirection = 'up';
        },
        left: () => {
            if (direction !== 'right') nextDirection = 'left';
        },
        right: () => {
            if (direction !== 'left') nextDirection = 'right';
        },
        down: () => {
            if (direction !== 'up') nextDirection = 'down';
        }
    };
    
    // Add button event listeners
    touchButtons.up.addEventListener('click', buttonHandlers.up);
    touchButtons.left.addEventListener('click', buttonHandlers.left);
    touchButtons.right.addEventListener('click', buttonHandlers.right);
    touchButtons.down.addEventListener('click', buttonHandlers.down);
    
    // Add keyboard controls
    keyDownHandler = (e) => {
        if (gamePaused || gameOver) return;
        
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    };
    
    document.addEventListener('keydown', keyDownHandler);
    
    // Create food at random position
    function createFood() {
        let newFood;
        let onSnake;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * boardSize),
                y: Math.floor(Math.random() * boardSize)
            };
            
            onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
        } while (onSnake);
        
        food = newFood;
    }
    
    // Check if position is in bounds
    function isOutOfBounds(position) {
        return (
            position.x < 0 || position.x >= boardSize ||
            position.y < 0 || position.y >= boardSize
        );
    }
    
    // Check if head collided with body
    function checkCollision() {
        const head = snake[0];
        return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }
    
    // Draw game elements
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? '#4a4de7' : '#6c757d';
            ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
            
            // Add eyes to head
            if (index === 0) {
                ctx.fillStyle = 'white';
                
                // Position eyes based on direction
                let eyeX1, eyeY1, eyeX2, eyeY2;
                
                switch (direction) {
                    case 'right':
                        eyeX1 = (segment.x * cellSize) + (cellSize * 0.7);
                        eyeY1 = (segment.y * cellSize) + (cellSize * 0.3);
                        eyeX2 = (segment.x * cellSize) + (cellSize * 0.7);
                        eyeY2 = (segment.y * cellSize) + (cellSize * 0.7);
                        break;
                    case 'left':
                        eyeX1 = (segment.x * cellSize) + (cellSize * 0.3);
                        eyeY1 = (segment.y * cellSize) + (cellSize * 0.3);
                        eyeX2 = (segment.x * cellSize) + (cellSize * 0.3);
                        eyeY2 = (segment.y * cellSize) + (cellSize * 0.7);
                        break;
                    case 'up':
                        eyeX1 = (segment.x * cellSize) + (cellSize * 0.3);
                        eyeY1 = (segment.y * cellSize) + (cellSize * 0.3);
                        eyeX2 = (segment.x * cellSize) + (cellSize * 0.7);
                        eyeY2 = (segment.y * cellSize) + (cellSize * 0.3);
                        break;
                    case 'down':
                        eyeX1 = (segment.x * cellSize) + (cellSize * 0.3);
                        eyeY1 = (segment.y * cellSize) + (cellSize * 0.7);
                        eyeX2 = (segment.x * cellSize) + (cellSize * 0.7);
                        eyeY2 = (segment.y * cellSize) + (cellSize * 0.7);
                        break;
                }
                
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, cellSize * 0.15, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(eyeX2, eyeY2, cellSize * 0.15, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Draw food
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(
            food.x * cellSize + cellSize / 2,
            food.y * cellSize + cellSize / 2,
            cellSize / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        
        // Draw grid (optional)
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < boardSize; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, canvas.height);
            ctx.stroke();
            
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(canvas.width, i * cellSize);
            ctx.stroke();
        }
        
        // Draw game over message if needed
        if (gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
            ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
            ctx.font = '16px Arial';
            ctx.fillText('Press Restart to play again', canvas.width / 2, canvas.height / 2 + 60);
        }
    }
    
    // Move snake
    function moveSnake() {
        if (gamePaused || gameOver) return;
        
        // Update direction
        direction = nextDirection;
        
        // Calculate new head position
        const head = { ...snake[0] };
        
        switch (direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // Check if game over
        if (isOutOfBounds(head) || checkCollision()) {
            gameOver = true;
            playSound('game-over');
            draw(); // Update the canvas one last time
            return;
        }
        
        // Add new head
        snake.unshift(head);
        
        // Check if food eaten
        if (head.x === food.x && head.y === food.y) {
            // Increase score
            score += 10;
            updateScore(score);
            
            // Create new food
            createFood();
            
            // Play sound
            playSound('food-eaten');
        } else {
            // Remove tail if no food eaten
            snake.pop();
        }
    }
    
    // Game loop
    function gameLoop() {
        moveSnake();
        draw();
    }
    
    // Start game loop
    snakeInterval = setInterval(gameLoop, 150);
    
    // Return game controller
    return {
        pause: function() {
            // Let the gamePaused flag handle this
        },
        resume: function() {
            // Let the gamePaused flag handle this
        },
        restart: function() {
            // Reset game state
            snake = [{ x: 10, y: 10 }];
            direction = 'right';
            nextDirection = 'right';
            score = 0;
            gameOver = false;
            
            // Place new food
            createFood();
            
            // Update score
            updateScore(0);
            
            // Draw initial state
            draw();
        },
        cleanup: function() {
            // Clean up interval
            if (snakeInterval) {
                clearInterval(snakeInterval);
            }
            
            // Clean up event listeners
            document.removeEventListener('keydown', keyDownHandler);
            touchButtons.up.removeEventListener('click', buttonHandlers.up);
            touchButtons.left.removeEventListener('click', buttonHandlers.left);
            touchButtons.right.removeEventListener('click', buttonHandlers.right);
            touchButtons.down.removeEventListener('click', buttonHandlers.down);
        }
    };
}

// Audio elements for sounds
const sounds = {};

// Preload sounds
function preloadSounds() {
    const soundNames = [
        'game-start', 'game-close', 'game-pause', 'game-resume',
        'game-restart', 'game-over', 'card-flip', 'match-found',
        'no-match', 'correct', 'wrong', 'whack', 'food-eaten'
    ];
    
    soundNames.forEach(name => {
        sounds[name] = new Audio(`sounds/${name}.mp3`);
    });
}

// Play sound effect
function playSound(soundName) {
    if (!soundEnabled) return;
    
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(error => {
            console.log(`Error playing sound: ${error}`);
        });
    } else {
        console.log(`Sound not found: ${soundName}`);
    }
}

// Safe localStorage functions
function storageAvailable() {
    try {
        const storage = window.localStorage;
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return false;
    }
}

function safeSetItem(key, value) {
    if (storageAvailable()) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
}

function safeGetItem(key, defaultValue) {
    if (storageAvailable()) {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? item : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }
    return defaultValue;
}

// Then use these in saveGameProgress, saveUserPreferences, and loadUserPreferences

// Call this in initApp()
preloadSounds();

// Call the init function when the script loads
document.addEventListener('DOMContentLoaded', initApp);

// Add this new function
function filterGames(filter) {
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        const game = games.find(g => g.id === card.dataset.gameId);
        
        if (filter === 'all' || game.category === filter) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Add this new function
function searchGames(query) {
    //Get all card games
    const gameCards = document.querySelectorAll('.game-card');
    
    // If search is empty, show all cards (respecting current category filter)
    if (query === '') {
        // Get current active filter
        const activeFilter = document.querySelector('.filter-btn.active');
        const filterValue = activeFilter ? activeFilter.dataset.filter : 'all';
        filterGames(filterValue);
        return;
      }

     // Flag to check if any matches found
    let matchFound = false;

    gameCards.forEach(card => {
        const gameId = card.dataset.gameId;
        const game = games.find(g => g.id === gameId);
        
        if (!game) return;
        
        // Search in title, description, and category
        const matchesQuery = 
            game.title.toLowerCase().includes(query.toLowerCase()) || 
            game.description.toLowerCase().includes(query.toLowerCase()) || 
            game.category.toLowerCase().includes(query.toLowerCase());
        
        // Show or hide card based on match
        if (matchesQuery) {
            card.style.display = 'flex';
            matchFound = true;
        } else {
            card.style.display = 'none';
        }
    });

  
    if (!matchFound) {
        if (!noResultsMessage) {
        const message = document.createElement('div');
        message.id = 'no-results-message';
        message.className = 'no-results-message';
        message.innerHTML = `
            <i class="fas fa-search"></i>
            <p>No games found matching "${query}"</p>
            <button id="clear-search" class="action-btn">Clear Search</button>
        `;
        
        // Add message after game collection
        gameCollection.insertAdjacentElement('afterend', message);
        
        // Add clear button handler
        document.getElementById('clear-search').addEventListener('click', () => {
            document.getElementById('game-search').value = '';
            searchGames('');
            message.remove();
        });
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }
    
    // If no results found, show a message
    const noResultsMessage = document.getElementById('no-results-message');
    const visibleCards = document.querySelectorAll('.game-card[style="display: flex;"]');
    
    if (visibleCards.length === 0) {
        // Create message if it doesn't exist
        if (!noResultsMessage) {
            const message = document.createElement('div');
            message.id = 'no-results-message';
            message.className = 'no-results-message';
            message.innerHTML = `
                <i class="fas fa-search"></i>
                <p>No games found matching "${query}"</p>
                <button id="clear-search" class="action-btn">Clear Search</button>
            `;
            
            // Insert after the search bar
            const searchFilterContainer = document.querySelector('.search-filter-container');
            searchFilterContainer.insertAdjacentElement('afterend', message);
            
            // Add event listener to clear button
            document.getElementById('clear-search').addEventListener('click', () => {
                searchInput.value = '';
                searchGames('');
                message.remove();
            });
        }
    } else {
        // Remove message if it exists
        if (noResultsMessage) {
            noResultsMessage.remove();
        }
    }
}

function saveUserSettings() {
    const settings = {
        soundVolume: document.getElementById('sound-volume').value,
        muteEffects: document.getElementById('mute-effects').checked,
        muteMusic: document.getElementById('mute-music').checked,
        animations: document.getElementById('animations').checked,
        highContrast: document.getElementById('high-contrast').checked,
        difficulty: document.getElementById('difficulty').value
    };
    
    safeSetItem('devbreak-settings', JSON.stringify(settings));
    
    // Apply settings
    applyUserSettings(settings);
}

function resetUserSettings() {
    // Default settings
    const defaultSettings = {
        soundVolume: 80,
        muteEffects: false,
        muteMusic: false,
        animations: true,
        highContrast: false,
        difficulty: 'medium'
    };
    
    // Update UI
    document.getElementById('sound-volume').value = defaultSettings.soundVolume;
    document.getElementById('mute-effects').checked = defaultSettings.muteEffects;
    document.getElementById('mute-music').checked = defaultSettings.muteMusic;
    document.getElementById('animations').checked = defaultSettings.animations;
    document.getElementById('high-contrast').checked = defaultSettings.highContrast;
    document.getElementById('difficulty').value = defaultSettings.difficulty;
    
    // Save defaults
    safeSetItem('devbreak-settings', JSON.stringify(defaultSettings));
    
    // Apply settings
    applyUserSettings(defaultSettings);
}

function applyUserSettings(settings) {
    // Apply volume
    for (const sound in sounds) {
        if (sounds.hasOwnProperty(sound)) {
            sounds[sound].volume = settings.soundVolume / 100;
        }
    }
    
    // Apply animations toggle
    if (!settings.animations) {
        document.body.classList.add('no-animations');
    } else {
        document.body.classList.remove('no-animations');
    }
    
    // Apply high contrast
    if (settings.highContrast) {
        document.body.classList.add('high-contrast');
    } else {
        document.body.classList.remove('high-contrast');
    }
    
    // Apply mute settings
    soundEnabled = !settings.muteEffects;
    if (settings.muteEffects) {
        soundToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        soundToggleBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = notification.querySelector('.notification-message');
    const notificationIcon = notification.querySelector('.notification-icon');
    const notificationClose = notification.querySelector('.notification-close');
    
    // Set message
    notificationMessage.textContent = message;
    
    // Remove previous classes
    notification.classList.remove('success', 'warning', 'error', 'info');
    
    // Add appropriate class
    notification.classList.add(type);
    
    // Set icon
    switch (type) {
        case 'success':
            notificationIcon.className = 'notification-icon fas fa-check-circle';
            break;
        case 'warning':
            notificationIcon.className = 'notification-icon fas fa-exclamation-triangle';
            break;
        case 'error':
            notificationIcon.className = 'notification-icon fas fa-times-circle';
            break;
        default:
            notificationIcon.className = 'notification-icon fas fa-info-circle';
    }
    
    // Show notification
    notification.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
    
    // Add close button functionality
    notificationClose.addEventListener('click', () => {
        notification.classList.remove('show');
    }, { once: true });
}

function showLeaderboard(gameId) {
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const leaderboardList = leaderboardModal.querySelector('.leaderboard-list');
    const leaderboardTabs = leaderboardModal.querySelectorAll('.leaderboard-tab');
    
    // Clear previous entries
    leaderboardList.innerHTML = '';
    
    // Get current tab
    const activeTab = leaderboardModal.querySelector('.leaderboard-tab.active');
    const timeframe = activeTab ? activeTab.dataset.timeframe : 'alltime';
    
    // Load leaderboard data (mock data for now)
    const leaderboardData = getLeaderboardData(gameId, timeframe);
    
    // Create leaderboard entries
    leaderboardData.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.className = 'leaderboard-entry';
        
        entryElement.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-player">
                <div class="player-avatar">${entry.name.charAt(0)}</div>
                <div class="player-name">${entry.name}</div>
            </div>
            <div class="leaderboard-score"><i class="fas fa-star"></i>${entry.score}</div>
        `;
        
        leaderboardList.appendChild(entryElement);
    });
    
    // Add tab event listeners
    leaderboardTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab
            leaderboardTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Reload leaderboard with new timeframe
            showLeaderboard(gameId);
        });
    });
    
    // Show modal
    leaderboardModal.style.display = 'block';
    
    // Add close button functionality
    const closeBtn = leaderboardModal.querySelector('.close-leaderboard');
    closeBtn.addEventListener('click', () => {
        leaderboardModal.style.display = 'none';
    });
}

function getLeaderboardData(gameId, timeframe) {
    // Mock data - in a real app, this would fetch from a server
    const mockData = [
        { name: 'Player1', score: 150 },
        { name: 'Player2', score: 120 },
        { name: 'Player3', score: 100 },
        { name: 'Player4', score: 90 },
        { name: 'Player5', score: 85 }
    ];
    
    return mockData;
}

function shareScore() {
    if (!currentGame) return;
    
    const score = parseInt(scoreValue.textContent);
    const shareText = `I scored ${score} points in ${currentGame.title} on DevBreak! Can you beat my score?`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'DevBreak Score',
            text: shareText,
            url: window.location.href
        })
        .then(() => {
            console.log('Score shared successfully');
        })
        .catch(error => {
            console.error('Error sharing score:', error);
            // Fallback - copy to clipboard
            copyToClipboard(shareText);
            showNotification('Score copied to clipboard!', 'info');
        });
    } else {
        // Fallback - copy to clipboard
        copyToClipboard(shareText);
        showNotification('Score copied to clipboard!', 'info');
    }
}

function copyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

function showConfetti() {
    const confettiContainer = document.getElementById('confetti-container');
    
    const confettiSettings = {
        target: 'confetti-container',
        max: 200,
        size: 1.5,
        animate: true,
        props: ['circle', 'square', 'triangle', 'line'],
        colors: [[165,104,246], [230,61,135], [0,199,228], [253,214,126]],
        clock: 25,
        respawn: false
    };
    
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
    
    // Stop after 5 seconds
    setTimeout(() => {
        confetti.clear();
    }, 5000);
}

function addSearchCSS() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .no-results-message {
            text-align: center;
            padding: 40px;
            margin: 30px auto;
            background: var(--grey-color);
            border-radius: var(--radius-lg);
            max-width: 500px;
            animation: fadeIn 0.5s;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
        }
        
        .no-results-message i {
            font-size: 3rem;
            color: var(--grey-dark);
            margin-bottom: 10px;
        }
        
        .no-results-message p {
            font-size: 1.2rem;
            color: var(--dark-color);
            margin-bottom: 20px;
        }
    `;
    
    document.head.appendChild(styleElement);
}

function updateModalStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      #modal-body {
        padding: var(--space-lg);
        height: auto;
        min-height: 400px;
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        overflow-y: auto;
        width: 100%;
      }
      
      .memory-game, .typing-game, .whack-game, .color-game, .snake-game {
        width: 100%;
        max-width: 100%;
        margin: 0 auto;
      }
      
      .modal-content {
        height: 90vh;
        display: flex;
        flex-direction: column;
      }
      
      @media (min-width: 768px) {
        .memory-game, .typing-game, .whack-game, .color-game, .snake-game {
          max-width: 80%;
        }
      }
      
      /* Game fullscreen mode */
      .fullscreen-mode #modal-body {
        max-height: 100vh;
        padding: var(--space-md);
      }
      
      .fullscreen-mode .modal-content {
        height: 100vh;
        max-width: 100%;
        width: 100%;
        margin: 0;
        border-radius: 0;
      }
    `;
    
    document.head.appendChild(styleElement);
  }

  function updateCardStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .game-stats {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        color: var(--grey-dark);
        margin-top: var(--space-md);
        padding-top: var(--space-sm);
        border-top: 1px solid var(--grey-color);
      }
      
      .stat {
        display: flex;
        align-items: center;
        gap: var(--space-xs);
      }
      
      .stat i {
        color: var(--primary-color);
      }
      
      /* Improved difficulty indicator */
      .difficulty {
        display: flex;
        margin-top: var(--space-sm);
        align-items: center;
        gap: var(--space-xs);
        margin-bottom: var(--space-md);
      }
      
      .difficulty-dots {
        margin-left: auto;
      }
    `;
    
    document.head.appendChild(styleElement);
  }

// Add this to the toggleFullscreen function
function toggleFullscreen() {
    const modalContent = document.querySelector('.modal-content');
    
    if (!document.fullscreenElement) {
      // Try to enter fullscreen mode
      if (modalContent.requestFullscreen) {
        modalContent.requestFullscreen()
          .then(() => {
            document.body.classList.add('fullscreen-mode');
            fullscreenToggleBtn.innerHTML = '<i class="fas fa-compress"></i>';
          })
          .catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
            // Fallback to CSS fullscreen
            document.body.classList.add('fullscreen-mode');
            fullscreenToggleBtn.innerHTML = '<i class="fas fa-compress"></i>';
          });
      } else {
        // Fallback to CSS fullscreen
        document.body.classList.add('fullscreen-mode');
        fullscreenToggleBtn.innerHTML = '<i class="fas fa-compress"></i>';
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => {
            document.body.classList.remove('fullscreen-mode');
            fullscreenToggleBtn.innerHTML = '<i class="fas fa-expand"></i>';
          })
          .catch(err => {
            console.error(`Error attempting to exit fullscreen: ${err.message}`);
            // Fallback
            document.body.classList.remove('fullscreen-mode');
            fullscreenToggleBtn.innerHTML = '<i class="fas fa-expand"></i>';
          });
      } else {
        // Fallback
        document.body.classList.remove('fullscreen-mode');
        fullscreenToggleBtn.innerHTML = '<i class="fas fa-expand"></i>';
      }
    }
  }

  function addUtilityStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .no-results-message {
        text-align: center;
        padding: var(--space-xl);
        margin: var(--space-lg) auto;
        background: var(--grey-color);
        border-radius: var(--radius);
        max-width: 500px;
      }
      
      .no-results-message i {
        font-size: 2.5rem;
        color: var(--grey-dark);
        margin-bottom: var(--space-md);
      }
      
      .no-results-message p {
        margin-bottom: var(--space-md);
        color: var(--dark-color);
      }
      
      /* Game-specific containers */
      .whack-game-container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
      }
      
      .color-game {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-lg);
      }
      
      .snake-game {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
      }
      
      /* Game badge styling */
      .game-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-bottom: var(--space-lg);
        padding-bottom: var(--space-sm);
        border-bottom: 1px solid var(--grey-color);
      }
    `;
    
    document.head.appendChild(styleElement);
  }
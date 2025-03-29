// Speed Typing Game Implementation

const typingGame = {
    init: function(modalBody, updateScore, playSound, gamePaused) {
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
            'request', 'response', 'server', 'client', 'database',
            'query', 'model', 'view', 'controller', 'method',
            'class', 'import', 'export', 'module', 'package',
            'bug', 'debug', 'error', 'exception', 'try',
            'catch', 'finally', 'throw', 'git', 'commit',
            'branch', 'merge', 'pull', 'push', 'clone'
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
        
        // Style for the typing game
        const style = document.createElement('style');
        style.textContent = `
            .typing-game {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .typing-stats {
                display: flex;
                justify-content: space-between;
                font-size: 1.2rem;
            }
            
            .typing-area {
                display: flex;
                flex-direction: column;
                gap: 15px;
                align-items: center;
            }
            
            .current-word {
                font-size: 2.5rem;
                font-weight: bold;
                color: #4a4de7;
                letter-spacing: 2px;
                min-height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            #word-input {
                width: 100%;
                max-width: 400px;
                padding: 12px 20px;
                font-size: 1.2rem;
                border: 2px solid #e9ecef;
                border-radius: 5px;
                text-align: center;
                transition: all 0.3s ease;
            }
            
            #word-input:focus {
                outline: none;
                border-color: #4a4de7;
                box-shadow: 0 0 0 3px rgba(74, 77, 231, 0.2);
            }
            
            .typing-history {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                max-height: 150px;
                overflow-y: auto;
                padding: 10px;
                border-radius: 5px;
                background: #f8f9fa;
            }
            
            .word-item {
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 0.9rem;
            }
            
            .word-correct {
                background: #d4edda;
                color: #155724;
            }
            
            .word-incorrect {
                background: #f8d7da;
                color: #721c24;
                text-decoration: line-through;
            }
            
            .game-over {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10;
            }
            
            .game-over h2 {
                font-size: 2rem;
                margin-bottom: 20px;
            }
            
            .game-over p {
                font-size: 1.2rem;
                margin-bottom: 10px;
            }
            
            .typing-results {
                margin-top: 20px;
                width: 80%;
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            
            .typing-results div {
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
            }
            
            .typing-results h3 {
                text-align: center;
                margin-bottom: 15px;
            }
        `;
        
        document.head.appendChild(style);
        
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
        wordInput.addEventListener('input', function() {
            if (!gameActive || gamePaused()) return;
            
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
        });
        
        // Start countdown timer
        intervalId = setInterval(function() {
            if (gamePaused()) return;
            
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(intervalId);
                gameActive = false;
                
                // Disable input
                wordInput.disabled = true;
                
                // Calculate typing speed and accuracy
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
        
        return {
            pause: function() {
                if (intervalId) {
                    clearInterval(intervalId);
                }
                wordInput.disabled = true;
            },
            resume: function() {
                if (gameActive) {
                    intervalId = setInterval(function() {
                        if (gamePaused()) return;
                        
                        timeLeft--;
                        timeDisplay.textContent = timeLeft;
                        
                        if (timeLeft <= 0) {
                            clearInterval(intervalId);
                            gameActive = false;
                            
                            // Same end game logic as above
                        }
                    }, 1000);
                    
                    wordInput.disabled = false;
                    wordInput.focus();
                }
            },
            restart: function() {
                if (intervalId) {
                    clearInterval(intervalId);
                }
                
                // Remove game over overlay if exists
                const gameOver = modalBody.querySelector('.game-over');
                if (gameOver) {
                    modalBody.removeChild(gameOver);
                }
                
                // Just reinitialize the game
                return typingGame.init(modalBody, updateScore, playSound, gamePaused);
            }
        };
    }
};

// Export the game
export default typingGame;
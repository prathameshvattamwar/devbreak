// Memory Match Game Implementation

const memoryGame = {
    init: function(modalBody, updateScore, playSound, gamePaused) {
        const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
        const gameEmojis = [...emojis, ...emojis];
        let flippedCards = [];
        let matchedPairs = 0;
        let score = 0;
        let moves = 0;
        
        // Shuffle the emojis
        gameEmojis.sort(() => Math.random() - 0.5);
        
        // Create game HTML
        modalBody.innerHTML = `
            <div class="memory-game"></div>
        `;
        
        const gameBoard = modalBody.querySelector('.memory-game');
        
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
                // Prevent clicking if game is paused
                if (gamePaused()) return;
                
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
                            playSound('game-completed');
                            
                            // Add bonus points for fewer moves
                            const bonusPoints = Math.max(0, 100 - (moves - emojis.length) * 5);
                            score += bonusPoints;
                            updateScore(score);
                            
                            // Show game completion message
                            const gameOver = document.createElement('div');
                            gameOver.className = 'game-over animate__animated animate__fadeIn';
                            gameOver.innerHTML = `
                                <h2>Great job!</h2>
                                <p>You completed the game with ${moves} moves</p>
                                <p>Bonus points: ${bonusPoints}</p>
                                <p>Final score: ${score}</p>
                            `;
                            
                            setTimeout(() => {
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
        
        return {
            pause: function() {
                // Nothing to do for this game
            },
            resume: function() {
                // Nothing to do for this game
            },
            restart: function() {
                // Just reinitialize the game
                this.init(modalBody, updateScore, playSound, gamePaused);
            }
        };
    }
};

// Export the game
export default memoryGame;
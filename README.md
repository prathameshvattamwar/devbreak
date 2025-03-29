# DevBreak - Mini Games Collection

DevBreak is a collection of stress-relieving mini-games designed specifically for developers who need a quick mental break during work. The application features multiple games presented as cards, allowing users to quickly choose and play their favorite game.

## Features

- **Multiple Mini-Games**: Collection of fun, quick mini-games designed for short breaks
- **Score Tracking**: Keep track of your best scores and total play time
- **Mobile Responsive**: Works on all devices and screen sizes
- **Sound Controls**: Toggle game sounds on/off
- **Fullscreen Mode**: Enjoy games in fullscreen for a more immersive experience
- **Game Controls**: Pause, resume, and restart games anytime

## Games Included

1. **Memory Match**: Test your memory by matching pairs of cards
2. **Speed Typer**: Test your typing speed with programming terms
3. **Whack-a-Mole**: Click on moles as they appear to score points
4. **Color Match**: Select the color that matches the displayed word
5. **Snake**: Control the snake to eat food and grow without hitting walls

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- FontAwesome Icons
- Animate.css for animations

## Setup Instructions

1. Clone the repository or download the source code
2. Open the `index.html` file in your browser to start the application
3. No additional dependencies or installation required!

## File Structure

```
devbreak/
├── index.html           # Main HTML file
├── styles.css           # Main CSS styles
├── script.js            # Main JavaScript file
├── memory-game.js       # Memory Match game implementation
├── typing-game.js       # Speed Typer game implementation
└── README.md            # This file
```

## How to Play

1. Click on a game card to start playing
2. Each game has its own unique rules and scoring system
3. Use the controls in the modal header to pause, restart, or exit the game
4. Your best scores and play time will be saved automatically

## Game Controls

- **Sound Toggle**: Turn game sounds on/off
- **Fullscreen Toggle**: Enter/exit fullscreen mode
- **Pause/Resume**: Pause or resume the current game
- **Restart**: Reset the current game to start from the beginning
- **Close**: Exit the current game and return to the game selection screen

## Keyboard Shortcuts

- **Escape**: Close the current game
- **Spacebar**: Pause/Resume the current game
- **R**: Restart the current game
- **Arrow Keys**: Control direction in applicable games (Snake)

## Adding New Games

The project is designed to be easily extendable. To add a new game:

1. Create a new game implementation file
2. Add the game metadata to the `games` array in `script.js`
3. Implement the required game functions (initialize, pause, resume, restart)
4. Add any game-specific styles to `styles.css`

## Browser Compatibility

DevBreak works on all modern browsers including:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is open source and available for personal and commercial use.

## Author

[Your Name] - Feel free to contribute and improve the project!

---

Happy Coding and Happy Breaks! 🎮
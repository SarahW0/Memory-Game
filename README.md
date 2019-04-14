# Memory-Game
The 2nd project built for Udacity FRONT END Developer course

# Features
1. Responsive Design. Works on mobile phone, ipad and desktop.

2. 4 Sound effects
   * Background music
   * Cheering sound when 2 open cards are successfully matched
   * Losing sound when 2 open cards are unsuccessfully matched
   * Winning sound when the game finishes

3. Keyboard Support
   * Tab key: Set the focus on the first card and move the focus to the next card
   * Arrow key: 4 arrow keys to move the focus around
   * Enter key: Flip the currently focused card over or restart game when the result window is showing. Same effect as mouse click.   
   
4. Store and reload game state using the local storage

# Instructions
1. Start the game by clicking the card or pressing the Tab key
2. The moves and the time displayed on the board once the game starts
3. Enable/Disable the sound play by clicking the horn icon
4. Restart the game by clicking the restart button on the game board or the restart button on the result pop up window

# Browser Compatibility
Tested in Chrome, FireFox, IE edge and IE11

# Comment
If autoplay is not activated in Chrome or Firefox browser, the error message will be printed out in console. But the game is still playable.

# Updates V1.0.0 => V1.1.0
1. Add keyboard support to the sound control and restart button elements
   * Using TAB key to set focus on element and use ENTER key to trigger the button

2. Add accessibility support for screen reader to explain how to play the game
   * Add hidden instructions to the header element
   * Add aria-label attribute to the sound control and restart button elements

# Updates V1.1.0 => V1.1.1
Add IIFE design pattern in JavaScript code to avoid polluting the global namespace

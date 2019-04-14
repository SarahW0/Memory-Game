/**
 * @description The Javascript file for the Matching Game
 *
 * @author Sarah Wang
 * @version 1.1.0
 * update 1.0.0->1.1.0
 *    -Add keyboard support to the sound control and restart elements
 *    -Add accessibility support for screen reader
 * update 1.1.0->1.1.1
 *    -Add IIFE design pattern to avoid polluting the global namespace
 */
(function(){
/*Global Variation Declaration Start------------------------------------------------------------------------------------------ */
/**
 * @global Array of all cards' symbols
 */
let cards = [
  "diamond",
  "paper-plane-o",
  "anchor",
  "bolt",
  "cube",
  "leaf",
  "bicycle",
  "bomb",
  "diamond",
  "paper-plane-o",
  "anchor",
  "bolt",
  "cube",
  "leaf",
  "bicycle",
  "bomb"
];

/**
 * @global Object that hold all the open cards
 * @description each open card is a property of this object with card id as the propery name and true/false as value. True means match open card and False means unmatched open card
 */
let openCards = {};

/**
 * @global boolean value
 * @description When there are 2 open cards on the screen, the click event on the card is not responded until those 2 cards are closed
 */
let clickDisabled = false;

/**
 * @global game timer identifier
 */
let timerID = -1;

/**
 * @global seconds passed since game starts
 */
let secondsLapse = 0;

/**
 * @global Number of moves taken
 */
let moves = 0;

/**
 * @global 3 stars if number of moves is less than THREE_STARS, 2 stars if the number is between TWO_STARS and Three stars, otherwise 1 star
 */
const THREE_STARS = 45;
const TWO_STARS = 70;

/**
 * @global audio elements
 * @description
 *   cheeringAudio: audio to play when 2 open cards match
 *   loseAudio: audio to play when 2 open cards do not match
 *   winAudio: audio to play when all open cards are matched
 *   backgroundAudio: game background music played automatically when the game loads
 */
const cheeringAudio = new Audio("sound/cheering.mp3");
const loseAudio = new Audio("sound/lose.mp3");
const winAudio = new Audio("sound/win.mp3");
const backgroundAudio = new Audio("sound/KennyG-ForeverInLove-64.mp3");
backgroundAudio.loop = true;
backgroundAudio.volume = 0.1;

/**
 * @global boolean value
 * @description the audio is enabled when it is true
 */
let audioEnabled = true;

/*Global Variation Declaration End------------------------------------------------------------------------------------------ */

/*Card Control Functions Start---------------------------------------------------------------------------------------------- */
/**
 * @description shuffle cards when game starts or restarts
 * @param {Array} array - Original array of cards
 * @return {Array} Shuffled cards
 */
function shuffle(array) {
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/**
 * @description Add cards to UI
 * @param {Array} array - Cards array
 */
function initCards(array) {
  const deck = document.querySelector(".deck");

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < array.length; i++) {
    const newLi = document.createElement("li");
    newLi.className = "card flex flex-center cursor-pointer";
    //newLi.classList.add("card", "flex", "flex-center", "cursor-pointer");
    newLi.setAttribute("data-symbol", array[i]);
    newLi.setAttribute("id", "card-" + i);
    newLi.setAttribute("tabindex", "0");
    newLi.innerHTML = "<i class='fa fa-" + array[i] + "'></i>";

    fragment.appendChild(newLi);
  }
  //Remove previous content of deck
  deck.innerHTML = "";
  //Add new content to deck
  deck.appendChild(fragment);
}

/**
 * @description Add class "open" to this card element so this card is open card
 * @param {Element} card - Card Element
 */
function showCard(card) {
  card.classList.add("open");
}

/**
 * @description Remove class "open" from this card element so this card is closed
 * @param {Element} card - Card Element
 */
function hideCard(card) {
  card.classList.remove("open");
}

/**
 * @description Check to see if the click event fired on the open cards. The properties of openCards object are the ids of open cards
 * @param {String} id - card id
 * @returns {boolean} True if click is on one of the open cards; otherwise reture false
 */
function isOpenCardClicked(id) {
  return openCards.hasOwnProperty(id);
}

/**
 * @description Check if there is one open card match clicked card
 * @param {String} symbol - card symbol
 * @returns {Object} object with 2 propertis: status and OpenCardId
 *    status = -1: This is the first open card or all the open cards are matched
 *    status = 0: This card does not match the other open card
 *                openCardId = id of the other open card
 *    status = 1: This card does match the other open card
 */
function isCardMatched(symbol) {
  const ids = Object.keys(openCards);
  const result = {
    status: 0,
    openCardId: 0
  };
  //This is the first open card
  if (ids.length === 0) {
    result.status = -1;
    return result;
  }

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    //If there is an unmatched open card
    if (!openCards[id]) {
      //get the symbol of unmatched open card
      const unMatchedSymbol = document
        .getElementById(id)
        .getAttribute("data-symbol");
      //if these 2 cards match
      if (unMatchedSymbol === symbol) {
        //change the class of the open card from open to match
        cardMatched(id);
        //change the status of the open unmatched card to matched
        openCards[id] = true;
        result.status = 1;
        return result;
      } else {
        //2 cards do not match
        result.status = 0;
        result.openCardId = id;
        return result;
      }
    }
  }
  //if all the open cards are matched
  result.status = -1;
  return result;
}

/**
 * @description Change the class of the card from open to match
 * @param {String} id - card id
 */
function cardMatched(id) {
  const card = document.getElementById(id);
  card.classList.remove("open");
  card.classList.add("match");
}

/**
 * @description Called when 2 open cards do not match. Close the other open card and remove it from open cards object
 * @param {String} id - ID of open card
 */
function removeUnMatchedCardFromList(id) {
  hideCard(document.getElementById(id));
  delete openCards[id];
}

/**
 * @description Handle Card Mouse Click or enter Key event
 * @param {Element} card - The card element clicked by mouse or pressed the enter key on
 */
function cardClick(card) {
  //if it is an open card, ignore the click event
  if (isOpenCardClicked(card.id)) {
    return;
  }

  //start timer if no timer created yet
  startTimer();

  //show the card
  showCard(card);

  //update Moves
  updateMoves(++moves);

  //check if there is one open card that matches this card
  const match = isCardMatched(card.getAttribute("data-symbol"));

  switch (match.status) {
    /*If all the other open cards are matched or this is the first open card,
     *   - add this card to the open cards object and set its status to unmatched
     */
    case -1:
      openCards[card.id] = false;
      break;

    /*If this card does not match the other open card, then
     *   -Play losing audio
     *   -Prevent click event from any card for 0.5s
     *   -hide this card and the other open card, remove that card from open cards object after .5s
     */

    case 0:
      playAudio(loseAudio);
      clickDisabled = true;

      setTimeout(function() {
        hideCard(card);
        removeUnMatchedCardFromList(match.openCardId);
        clickDisabled = false;
      }, 500);
      break;

    /*If This card matches the other open card
     *   -Add this card to the open cards object and set its status to matched
     *   -Change the card class from open to matched
     *   -if all the cards matched
     *     + stop Background music and play game winning audio sound
     *     + stop timer
     *     + show the pop-up window
     *   -Otherwise play card matched winning audio
     */
    case 1:
      //this card matched
      openCards[card.id] = true;
      cardMatched(card.id);
      //if all cards matched, show the result pop-up window
      if (Object.keys(openCards).length === cards.length) {
        pauseAudio(backgroundAudio);
        playAudio(cheeringAudio);
        stopTimer();
        showResult();
      } else {
        playAudio(winAudio);
      }
  }
}
/**
 * @description Handle Card Mouse Click
 * @param {Event} e - Click event
 */
function onClickCards(e) {
  //if the click happened on card
  if (e.target && e.target.nodeName === "LI") {
    //if the click is not allowed, then exit
    if (clickDisabled) {
      return;
    }
    //invoke click event handling function
    cardClick(e.target);
  }
  //stop event bubbling
  e.stopPropagation();
}

/**
 * @description Return Id of the card that gets Focus
 * @returns {Number}
 *  - positive number if valid card id;
 *  - -1 if no card that gets focus
 */
function getFocusCardId() {
  const card = document.querySelector(".deck .card:focus");

  if (card !== null) {
    return parseInt(card.id.substring(5), 10);
  } else {
    return -1;
  }
}

/**
 * @description Set focus on the card with id
 * @param {Number} id - card id
 */
function setCardFocus(id) {
  const card = document.getElementById("card-" + id);
  card.focus();
}

/**
 * @description Handle keyboard event to set focus to the new card or open a card
 * @param {Event} e - key press event
 */
function onSetCardFocus(e) {
  //get the id of the current focused card
  const currentId = getFocusCardId();

  //calculate how many cards in one row based on the screen width
  let columnNumber = 0;
  if (window.innerWidth < 454) {
    //2 cards per row
    columnNumber = 2;
  } else if (window.innerWidth < 634) {
    // 3 cards per row
    columnNumber = 3;
  } else {
    //4 cards per row
    columnNumber = 4;
  }

  //Check which key is pressed and set focus to the other card
  switch (e.keyCode) {
    case 9: //tab key, start the game if game has not started yet
      startTimer();
      break;
    case 38: //arrow up key
      if (currentId >= 0) {
        const newId =
          currentId - columnNumber >= 0 ? currentId - columnNumber : currentId;
        setCardFocus(newId);
      }
      break;
    case 40: //arrow down key
      if (currentId >= 0) {
        const newId =
          currentId + columnNumber <= 15 ? currentId + columnNumber : currentId;
        setCardFocus(newId);
      }
      break;
    case 37: //arrow left key
      if (currentId >= 0) {
        const newId = currentId % columnNumber == 0 ? currentId : currentId - 1;
        setCardFocus(newId);
      }

      break;
    case 39: //arrow right key
      if (currentId >= 0) {
        if (currentId === 15 && columnNumber === 3) {
          return;
        }
        const newId =
          currentId % columnNumber == columnNumber - 1
            ? currentId
            : currentId + 1;
        setCardFocus(newId);
      }
      break;
    case 13: //enter key
      const resultPanel = document.querySelector(".result-panel");
      //if the result window is shown, restart the game
      if (resultPanel !== null) {
        onClickRestartButton(resultPanel);
      } else if (currentId >= 0) {
        //if there is focused card, open the card
        cardClick(document.getElementById("card-" + currentId));
      }
      break;
  }
}
/*Card Control Functions End------------------------------------------------------------------------------------------------------ */

/*Timer Functions Start----------------------------------------------------------------------------------------------------------- */
/**
 * @description Return seconds in time format "00:00:00"
 * @param {Number} sec_num - seconds
 * @returns {String} - time string
 */
function formatTime(sec_num) {
  let seconds = sec_num;

  let hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;

  let minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }

  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
}

/**
 * @description Update the timer on UI page
 * @param {Number} seconds - seconds
 */
function showTimeLapse(seconds) {
  const timeElement = document.querySelector(".time-lapse");
  timeElement.innerText = formatTime(seconds);
}

/**
 * @description Start game timer if timer has not started yet
 */
function startTimer() {
  //if timer already started, then exit
  if (timerID > 0) return;

  //start timer and save timer identifier to the global variable timerID
  timerID = setInterval(function() {
    secondsLapse++;
    showTimeLapse(secondsLapse);
  }, 1000);
}

/**
 * @description stop game timer
 */
function stopTimer() {
  timerID = clearInterval(timerID);
}

/**
 * @description stop game timer and reset the relavant UI element and global variables
 */
function clearTimer() {
  const timeElement = document.querySelector(".time-lapse");
  timeElement.innerText = "00:00:00";
  stopTimer();
  timerID = -1;
  secondsLapse = 0;
}
/*Timer Functions End------------------------------------------------------------------------------------------------------ */

/*Moves Functions Start----------------------------------------------------------------------------------------------------- */
/**
 * @description Reset Moves and Stars on UI to the initial state
 */
function resetStars() {
  const starElement = document.querySelector(".stars");
  starElement.innerHTML =
    '<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li>';
}

/**
 * @description Restore Moves and Stars on UI when the game is loaded in browser
 * @param {Number} moves
 */
function loadMovesAndStars(moves) {
  const starElement = document.querySelector(".stars");
  const moveElement = document.querySelector(".moves");
  //show 3 stars
  if (moves <= THREE_STARS) {
    resetStars();
  } else if (moves <= TWO_STARS) {
    //show 2 starts
    starElement.innerHTML =
      '<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li>';
  } else {
    //show 1 star
    starElement.innerHTML = '<i class="fa fa-star"></i></li>';
  }
  moveElement.innerText = moves;
}

/**
 * @description Update Moves and Stars on UI
 * @param {Number} newMoves
 */
function updateMoves(newMoves) {
  const starElement = document.querySelector(".stars");
  moves = newMoves;
  //show 2 stars
  if (moves === THREE_STARS + 1) {
    starElement.innerHTML =
      '<li><i class="fa fa-star"></i></li><li><i class="fa fa-star"></i></li>';
  }
  //show one stars
  if (moves === TWO_STARS + 1) {
    starElement.innerHTML = '<i class="fa fa-star"></i></li>';
  }
  //update moves
  const moveElement = document.querySelector(".moves");
  moveElement.innerText = moves;
}

/**
 * @description Reset Moves global variable and Moves on UI
 */
function resetMoves() {
  moves = 0;
  const moveElement = document.querySelector(".moves");
  moveElement.innerText = moves;
}

/*Moves Functions End-------------------------------------------------------------------------------------------------- */

/*Result Panel Start------------------------------------------------------------------------------------------------- */
/**
 * @description When restart button is clicked or enter key is pressed on the result window, game restarts
 * @param {Element} resultPanel - result pop up window element
 */
function onClickRestartButton(resultPanel) {
  resultPanel.parentNode.removeChild(resultPanel);
  reset();
}

/**
 * @description Show the result pop up window
 */
function showResult() {
  const starElement = document.querySelector(".stars");
  const timeElement = document.querySelector(".time-lapse");

  const resultPageContent =
    '<div class="result-message">You Win!</div><div><span class="result-label">Moves: </span><ul class="stars">' +
    moves +
    starElement.innerHTML +
    '</ul></div><div class="result-time-lapse"><span class="result-label">Time: </span>' +
    timeElement.innerText +
    '</div><div class="restart cursor-pointer result-restart"><i class="fa fa-repeat"></i>Restart</div>';

  const resultSection = document.createElement("section");
  resultSection.classList.add("result-panel");
  resultSection.innerHTML = resultPageContent;

  const container = document.querySelector(".container");
  container.insertBefore(resultSection, null);

  //Add event handler to Restart button
  document
    .querySelector(".result-restart")
    .addEventListener("click", function() {
      onClickRestartButton(resultSection);
    });
}
/*Result Panel end------------------------------------------------------------------------------------------------- */

/*Restart Event Handler Start---------------------------------------------------------------------------------------------- */
/**
 * @description Handle click event of restart button on the game board
 * @param {Event} event - click event or enter key press event
 */
function onClickRestart(event) {
  //stop the background music
  pauseAudio(backgroundAudio);
  //restart the game
  reset();
}

/*Restart Event Handler End------------------------------------------------------------------------------------------------- */
/*Audio Functions Start----------------------------------------------------------------------------------------------------- */
/**
 * @description play audio
 * @param {Audio} audio - the audio to play
 */
function playAudio(audio) {
  //if audio is disabled on UI, then exit
  if (!audioEnabled) return;

  //if it is background music, start from the beginning
  if (backgroundAudio === audio) {
    audio.currentTime = 0;
  }

  //catch errors and output to the console
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    //Older browsers may not return a promise, according to the MDN website
    playPromise.catch(function(error) {
      console.error(error);
    });
  }
}

/**
 * @description pause audio
 * @param {Audio} audio - the audio to be paused
 */
function pauseAudio(audio) {
  audio.pause();
}

/**
 * @description Handling the sound control button on the game board
 * @param {Event} event - Click event
 */
function onClickSound(event) {
  //

  if (event.type === "keydown" && event.keyCode !== 13) return;
  //toggle the audio enabled variable
  audioEnabled = !audioEnabled;

  //change the audio icon
  const soundElement = document.querySelector(".sound-control");
  if (audioEnabled) {
    soundElement.innerHTML = '<i class="fa fa-volume-up"></i>';
    playAudio(backgroundAudio);
  } else {
    soundElement.innerHTML = '<i class="fa fa-volume-off"></i>';
    pauseAudio(backgroundAudio);
  }
  //stop event bubbling
  event.stopPropagation();
}
/*Audio Functions Ends------------------------------------------------------------------------------------------------------- */
/*App Start------------------------------------------------------------------------------------------------------------------ */
/**
 * @description Reset game to the initial state
 */
function reset() {
  //clear open cards object
  openCards = {};
  //enable click event on the card
  clickDisabled = false;
  //Init cards
  initCards(shuffle(cards));
  //init Stars
  resetStars();
  //Init Moves
  resetMoves();
  //clear Timer
  clearTimer();
  //play background music
  playAudio(backgroundAudio);
}

/**
 * @description Load game status from localStorage
 */
function loadLocalStorage() {
  //load the variable
  let sarahMatchingGame = JSON.parse(localStorage.getItem("sarahMatchingGame"));

  //Initialize the moves and stars on UI
  moves = sarahMatchingGame.moves;
  loadMovesAndStars(moves);

  //Initialize time passed on UI
  secondsLapse = sarahMatchingGame.secondsLapse;
  showTimeLapse(secondsLapse);

  //Initialize cards layout
  cards = sarahMatchingGame.cards;
  initCards(cards);

  //Initialize cards status
  openCards = sarahMatchingGame.openCards;
  const ids = Object.keys(openCards);

  let allCardMatched = true;
  ids.forEach(function(id) {
    if (openCards[id]) {
      cardMatched(id);
    } else {
      showCard(document.getElementById(id));
      allCardMatched = false;
    }
  });

  //If all cards are matched, show the result window
  if (allCardMatched && ids.length == 16) {
    showResult();
    playAudio(cheeringAudio);
  }
}

/**
 * @description Initialize the game
 */
function init() {
  //if no state is found in localstorage, start the game from initial state
  if (localStorage.getItem("sarahMatchingGame") == null) {
    reset();
  } else {
    //Initialize the game based on the infor stored in localStorage
    //load state from localStorage
    loadLocalStorage();
    //play background music
    playAudio(backgroundAudio);
  }
}

//Add event listener to Cards' Parent elemement
document.querySelector(".deck").addEventListener("click", onClickCards);

//Add event handler to Restart button on game board
document.querySelector(".restart").addEventListener("click", onClickRestart);

//Add event handler to audio button on the game board
document
  .querySelector(".sound-control")
  .addEventListener("click", onClickSound);

//Save state to localStorage when the brower is closed or user is leaving the page
window.onbeforeunload = function(e) {
  let sarahMatchingGame = {};
  sarahMatchingGame.moves = moves;
  sarahMatchingGame.secondsLapse = secondsLapse;
  sarahMatchingGame.cards = cards;
  sarahMatchingGame.openCards = openCards;
  localStorage.setItem("sarahMatchingGame", JSON.stringify(sarahMatchingGame));
};

//Add keyboard event handler
window.addEventListener("keydown", onSetCardFocus);

//Start the game
init();
}());

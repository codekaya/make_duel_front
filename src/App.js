import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Navbar from './Navbar';
import { io } from "socket.io-client";
import { Routes, Route } from 'react-router-dom';
import HowToPlay from './pages/HowToPlay';

//const socket = io('http://localhost:5005'); // Connect to the backend server


//images taken from https://hunterpunks.com/images/characters/7.svg
// Character data with real images and fight stats
const characters = [
  { id: 1, name: "Warrior", info: "A powerful warrior with futuristic armor and glowing swords.", image: "/images/characters/1.svg", health: 100, fightScore: 70, defendScore: 30 },
  { id: 2, name: "Ninja", info: "A fast and agile ninja, skilled in stealth and combat.", image: "/images/characters/2.svg", health: 100, fightScore: 80, defendScore: 20 },
  { id: 3, name: "Sorcerer", info: "A mystical sorcerer wielding a glowing staff with powerful magic.", image: "/images/characters/3.svg", health: 100, fightScore: 75, defendScore: 25 },
  { id: 4, name: "Assassin", info: "A deadly assassin who strikes from the shadows.", image: "/images/characters/4.svg", health: 100, fightScore: 85, defendScore: 15 },
  { id: 5, name: "Beast", info: "A fearsome beast with immense strength and agility.", image: "/images/characters/5.svg", health: 100, fightScore: 65, defendScore: 35 },
  { id: 6, name: "Robot", info: "A highly advanced robot with mechanical precision.", image: "/images/characters/6.svg", health: 100, fightScore: 60, defendScore: 40 },
  { id: 7, name: "Alien", info: "An extraterrestrial being with unknown powers.", image: "/images/characters/7.svg", health: 100, fightScore: 50, defendScore: 50 },
  { id: 8, name: "Pirate", info: "A cunning pirate with a thirst for adventure.", image: "/images/characters/8.svg", health: 100, fightScore: 45, defendScore: 55 },
  { id: 9, name: "Samurai", info: "A disciplined samurai with a code of honor.", image: "/images/characters/9.svg", health: 100, fightScore: 55, defendScore: 45 }
];


function App() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonsOpen, setIsButtonsOpen] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedButtonText, setSelectedButtonText] = useState(null); // Track the selected button text
  const [walletAddress, setWalletAddress] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [fightStarted, setFightStarted] = useState(false); // Track if the fight has started
  const [showAnimation, setShowAnimation] = useState(true); // Track if the fight animation should show
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeOpponent, setShakeOpponent] = useState(false);

  const [waitingForPlayer, setWaitingForPlayer] = useState(true);

  const [gameState, setGameState] = useState({
    player1: null,
    player2: null,
    playerCharacter: { id: 1, name: "Warrior", info: "A powerful warrior with futuristic armor and glowing swords.", image: "/images/characters/1.svg", health: 100, fightScore: 90 },
    opponentCharacter: null,
    gameOver: false,
    winner: null,
  });

  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [actionTaken, setActionTaken] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [roundEndTime, setRoundEndTime] = useState(0);
  
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  
  // Add countdown ref at component level
  const countdownRef = useRef(null);
  
  // Reference for audio
  const tickSoundRef = useRef(null);
  
  // Add the sound state at the top of your component
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Add the gameStats state here
  const [gameStats, setGameStats] = useState({
    onlinePlayers: 0,
    activeGames: 0
  });
  
  // Add the effect at component level
  useEffect(() => {
    if (countdownRef.current && roundActive) {
      countdownRef.current.classList.remove('pump');
      void countdownRef.current.offsetWidth; // Force reflow
      countdownRef.current.classList.add('pump');
    }
  }, [Math.ceil(timeLeft), roundActive]);
  
  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io('https://duel-breaker-api.onrender.com');
    
    // Add gameStats listener
    socketRef.current.on('gameStats', (stats) => {
      setGameStats(stats);
    });
    
    // Request stats immediately
    socketRef.current.emit('requestStats');
    
    // Calculate server time offset for synchronization
    socketRef.current.on('connect', () => {
      const clientTime = Date.now();
      socketRef.current.emit('getServerTime', { clientTime });
    });
    
    socketRef.current.on('serverTime', (data) => {
      const clientReceiveTime = Date.now();
      const roundTripTime = clientReceiveTime - data.clientTime;
      const serverTime = data.serverTime + (roundTripTime / 2);
      const offset = serverTime - clientReceiveTime;
      setServerTimeOffset(offset);
    });
    
    // Handle round start
    socketRef.current.on('roundStart', (data) => {
      setCurrentRound(data.round);
      setActionTaken(false);
      setRoundActive(true);
      
      // Calculate when the round will end in client time
      const serverStartTime = data.startTime;
      const clientStartTime = serverStartTime - serverTimeOffset;
      const endTime = clientStartTime + data.duration;
      setRoundEndTime(endTime);
      
      // Start the synchronized timer
      startSynchronizedTimer(endTime);
    });
    
    // Handle round end
    socketRef.current.on('roundEnd', (data) => {
      setRoundActive(false);
      // Update game state with round results
      setGameState(prevState => ({
        ...prevState,
        playerCharacter: {
          ...prevState.playerCharacter,
          health: data.player1Health
        },
        opponentCharacter: {
          ...prevState.opponentCharacter,
          health: data.player2Health
        },
        gameOver: data.gameOver,
        winner: data.winner
      }));
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    });
    
    // Handle action confirmation
    socketRef.current.on('actionConfirmed', (data) => {
      setActionTaken(true);
    });
    
    // Listen for game state updates from the server
    socketRef.current.on('gameState', (newGameState) => {
      setGameState(newGameState);
      if (newGameState.player2) {
        console.log("set waiting for plllater", waitingForPlayer)
        setWaitingForPlayer(false); // Stop waiting if both players are present
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Set up audio element with correct file extension
  useEffect(() => {
    // Create audio element with MP4 file extension
    tickSoundRef.current = new Audio('/sounds/tick.mp4'); // Updated to .mp4
    
    // Clean up on unmount
    return () => {
      tickSoundRef.current = null;
    };
  }, []);
  
  // Update the tick sound effect to respect sound enabled state
  useEffect(() => {
    if (!roundActive || !timeLeft || !tickSoundRef.current) return;
    
    // Reset the audio
    tickSoundRef.current.pause();
    tickSoundRef.current.currentTime = 0;
    
    // Only play sounds if sound is enabled
    if (soundEnabled) {
      // Adjust playback properties based on time left
      if (timeLeft <= 1) {
        // Danger state (last second)
        tickSoundRef.current.playbackRate = 1.5; // Faster playback
        tickSoundRef.current.volume = 1.0; // Full volume
      } else if (timeLeft <= 3) {
        // Warning state (3-2 seconds)
        tickSoundRef.current.playbackRate = 1.25; // Slightly faster
        tickSoundRef.current.volume = 0.8; // Higher volume
      } else {
        // Normal state
        tickSoundRef.current.playbackRate = 1.0; // Normal speed
        tickSoundRef.current.volume = 0.5; // Lower volume
      }
      
      // Play the sound with error handling
      tickSoundRef.current.play().catch(e => {
        console.log("Audio play error:", e);
      });
    }
  }, [Math.ceil(timeLeft), roundActive, soundEnabled]);

  const handleClick = (buttonIndex) => {
    setSelectedButtonText(`${generateButtonText(buttonIndex)}`);
    setIsModalOpen(true); // Open the character selection modal
  };

  const handleFightClick = () => {
    if (!walletAddress && selectedButtonText.trim() !== "Free!") {
      console.log("olmadibe")
      setShowAlert(true); 
      
    } else {
      // Proceed with fight logic
      console.log("Fight started!");
      socketRef.current.emit('joinGame', {
        selectedCharacter,
        betAmount: selectedButtonText
      });
      
      setFightStarted(true); // Start the fight
      setShowAnimation(true); // Show animation
      setTimeout(() => {
        setShowAnimation(false); // Hide animation after 2 seconds
      }, 2000);
    }
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setIsModalOpen(false); // Close the modal after character selection
    setIsButtonsOpen(false);
  };

const handlePlayerAttack = () => {
  socketRef.current.emit('playerAttack');
  setShakeOpponent(true);
  setTimeout(() => setShakeOpponent(false), 500); 
};

  const handleCloseAlert = () => {
    setShowAlert(false);  // Close the custom alert
  };

  const handleUndoClick = () => {
    setSelectedCharacter(null);
    setIsButtonsOpen(true); // Show the main screen with the buttons
    setSelectedButtonText(null); // Reset button text
    setFightStarted(false); // Reset the fight state
    setWaitingForPlayer(true);
    setGameState({
      player1: null,
      player2: null,
      playerCharacter: { id: 1, name: "Warrior", info: "A powerful warrior with futuristic armor and glowing swords.", image: "/images/characters/1.svg", health: 100, fightScore: 90 },
      opponentCharacter: null,
      gameOver: false,
      winner: null,
    });
    socketRef.current.emit('resetGame');
  };

// Function to generate Fibonacci sequence for the buttons, starting from the 4th button
const generateButtonText = (index) => {
  if (index === 0) return "Free!"; // First button is "Free!"
  if (index === 1) return "5$"; // Second button is "5$"
  if (index === 2) return "10$"; // Third button is "10$"

  // Fibonacci logic for the rest of the buttons (4th onwards)
  let a = 5;
  let b = 10;
  let result = 0;

  for (let i = 3; i <= index; i++) {
    result = a + b;
    a = b;
    b = result;
  }

  return `${result}$`; // Return the Fibonacci number with "$" suffix
};

// Function to start synchronized timer
const startSynchronizedTimer = (endTime) => {
  if (timerRef.current) {
    clearInterval(timerRef.current);
  }
  
  // Update time immediately
  const now = Date.now();
  setTimeLeft(Math.max(0, (endTime - now) / 1000));
  
  timerRef.current = setInterval(() => {
    const now = Date.now();
    const secondsLeft = Math.max(0, (endTime - now) / 1000);
    
    setTimeLeft(secondsLeft);
    
    if (secondsLeft <= 0) {
      // Timer reached zero
      setRoundActive(false);
      clearInterval(timerRef.current);
    }
  }, 100); // Update 10 times per second for smooth countdown
};

// Render epic battle timer
const renderRoundTimer = () => {
  // Calculate percentage for timer display
  const duration = 10; // 10 seconds per round
  const percentage = (timeLeft / duration) * 100;
  
  // Determine timer state based on time remaining
  let timerState = 'normal';
  if (timeLeft >= 9) {
    timerState = 'early'; // 10th and 9th second get green treatment
  } else if (timeLeft <= 3) { 
    timerState = timeLeft <= 1 ? 'danger' : 'warning';
  }
  
  return (
    <>
      {/* Large countdown number between characters with shower effect */}
      <div 
        ref={countdownRef}
        className={`battle-countdown ${timerState}`}
        data-count={Math.ceil(timeLeft)}
      >
      
        
        {/* Actual text hidden but still accessible */}
        <span style={{ opacity: 0 }}>{Math.ceil(timeLeft)}</span>
      </div>
      
      {/* Full-width timer bar */}
      <div className={`battle-timer-container ${timerState}`}>
        <div className="battle-timer-bar">
          <div 
            className="battle-timer-progress" 
            style={{ '--progress': `${percentage}%` }}
          >
            {/* Timer ticks go here */}
          </div>
          <div className="timer-glow-effect"></div>
        </div>
      </div>
      
      {/* Separate round indicator with added margin */}
      <div className="round-indicator">ROUND {currentRound}</div>
    </>
  );
};


  return (
    <div className="App">
      <Navbar 
        setWalletAddress={setWalletAddress} 
        soundEnabled={soundEnabled} 
        setSoundEnabled={setSoundEnabled} 
      />
      
      <Routes>
        <Route path="/" element={
          <div className="game-container">
            {!fightStarted && !selectedCharacter && (<h1 className="duel-text">Duel!</h1>)}

            {/* Main Screen: Button Grid */}
            {isButtonsOpen && !fightStarted && (
              <div className="button-container">
                {[...Array(9)].map((_, index) => (
                  <button
                    key={index}
                    className="fight-button"
                    onClick={() => handleClick(index)}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : generateButtonText(index)}
                  </button>
                ))}
              </div>
            )}
            

            {/* Modal for Character Selection */}
            {isModalOpen && !fightStarted && (
              <div className="modal">
                <div className="modal-content">
                  <h2>Select Your Character</h2>
                  <div className="character-list">
                    {characters.map((character) => (
                      <div 
                        key={character.id} 
                        className="character-option" 
                        onClick={() => handleCharacterSelect(character)}
                      >
                        <img src={character.image} alt={character.name} className="character-image" />
                        <div className="character-info-overlay">
                          <h3>{character.name}</h3>
                          <p>Fight Score: {character.fightScore}</p>
                          <p>Defense: {character.defendScore}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Display Selected Character Info */}
            {selectedCharacter && !fightStarted && (
              <div className="character-info">
                <img src={selectedCharacter.image} alt={selectedCharacter.name} className="selected-character-image" />
                <h2>Selected Character: {selectedCharacter.name}</h2>
                <p>{selectedCharacter.info}</p>
                <p>Fight Score: {selectedCharacter.fightScore}</p>
                <p>Defense Score: {selectedCharacter.defendScore}</p>
                <h2 className="selected-amount">Selected: {selectedButtonText}</h2>
                {selectedButtonText !== "Free!" && (
                  <p className="potential-winnings">
                    If you win, you'll receive:  
                    <span>
                      {(parseFloat(selectedButtonText.replace('$', '')) * 2 * 0.99).toFixed(2)}$
                    </span>
                  </p>
                )}
                <button className="fight-button-fancy" onClick={() => handleFightClick()} >Fight!</button>

                {/* Undo Button inside character info */}
                <button className="undo-button" onClick={handleUndoClick}>
                  &#x21A9; {/* Unicode for Undo symbol */}
                </button>

              </div>
            )}

            

            {/* Waiting for player popup */}
            {fightStarted && selectedCharacter && waitingForPlayer && (
              <div className="custom-alert fancy-waiting-popup">
                <div className="alert-content">
                  <h2>Waiting for an opponent to join...</h2>
                  <div className="loading-character">
                    {selectedCharacter && (
                      <img 
                        src={selectedCharacter.image} 
                        alt={selectedCharacter.name}
                      />
                    )}
                  </div>
                  <div className="loading-spinner"></div>
                  <div className="loading-bar">
                    <div className="loading-fill"></div>
                  </div>
                  
                  {/* New stats display */}
                  <div className="game-stats">
                    <div className="stat-item">
                      <span className="stat-icon">👤</span>
                      <span className="stat-value">{gameStats.onlinePlayers}</span>
                      <span className="stat-label">Players Online</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">🎮</span>
                      <span className="stat-value">{gameStats.activeGames}</span>
                      <span className="stat-label">Active Games</span>
                    </div>
                  </div>
                  
                  <p className="waiting-tips">
                    Battle tip: Stay patient, victory awaits!
                  </p>
                </div>
              </div>
            )}

            


            {/* Fight Start Animation */}
            {fightStarted && !waitingForPlayer && showAnimation &&  (
                    <div className="fight-animation">
                      <h1 className="fight-text">Fight!</h1>
                    </div>
                  )}

            {/* Game Screen for player 1*/}
            {fightStarted && !showAnimation && selectedCharacter && !waitingForPlayer && gameState.player1 === socketRef.current.id &&(
              <div className="game-screen">
                <div className="game-characters">
                  {/* Player's Character */}
                  <div className={`character player`}>
                    <div className={`character-content ${shakePlayer ? 'shake' : ''}`}>
                      <img src={gameState.playerCharacter.image} alt={gameState.playerCharacter.name} />
                      <p>{gameState.playerCharacter.name}</p>
                      <div className="health-bar">
                        <div
                          className="health"
                          style={{ width: `${gameState.playerCharacter.health}%` }}
                        ></div>
                        <div className="health-text">{gameState.playerCharacter.health}/100</div>
                      </div>
                      <div className="action-buttons">
                        <button className="attack-button" onClick={handlePlayerAttack}>Attack</button>
                        <button className="dodge-button" onClick={() => console.log("dodge")}>Dodge</button>
                        <button className="hide-button" onClick={() => {console.log("hide")}}>Hide</button>
                      </div>
                    </div>
                  </div>

                  {/* Opponent's Character */}
                  <div className={`character opponent`}>
                    <div className={`character-content ${shakeOpponent ? 'shake' : ''}`}>
                      <img 
                        src={gameState.opponentCharacter.image} 
                        alt={gameState.opponentCharacter.name} 
                        className="fight-character-image opponent"
                      />
                      <p>{gameState.opponentCharacter.name}</p>
                      <div className="health-bar">
                        <div
                          className="health"
                          style={{ width: `${gameState.opponentCharacter.health}%` }}
                        ></div>
                        <div className="health-text">{gameState.opponentCharacter.health}/100</div>
                      </div>
                      <div style={{ height: "155px" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

             {/* Game Screen for player 2*/}
             {fightStarted && !showAnimation && selectedCharacter && !waitingForPlayer && gameState.player2 === socketRef.current.id &&(
              <div className="game-screen">
                <div className="game-characters">
                  {/* Player's Character */}
                  <div className={`character player`}>
                    <div className={`character-content ${shakePlayer ? 'shake' : ''}`}>
                      <img src={gameState.opponentCharacter.image} alt={gameState.opponentCharacter.name} />
                      <p>{gameState.opponentCharacter.name}</p>
                      <div className="health-bar">
                        <div
                          className="health"
                          style={{ width: `${gameState.opponentCharacter.health}%` }}
                        ></div>
                        <div className="health-text">{gameState.opponentCharacter.health}/100</div>
                      </div>
                      <div className="action-buttons">
                        <button className="attack-button" onClick={handlePlayerAttack}>Attack</button>
                        <button className="dodge-button" onClick={() => console.log("dodge")}>Dodge</button>
                        <button className="hide-button" onClick={() => {console.log("hide")}}>Hide</button>
                      </div>
                    </div>
                  </div>

                  {/* Opponent's Character */}
                  <div className={`character opponent`}>
                    <div className={`character-content ${shakeOpponent ? 'shake' : ''}`}>
                      <img 
                        src={gameState.playerCharacter.image} 
                        alt={gameState.playerCharacter.name} 
                        className="fight-character-image opponent"
                      />
                      <p>{gameState.playerCharacter.name}</p>
                      <div className="health-bar">
                        <div
                          className="health"
                          style={{ width: `${gameState.playerCharacter.health}%` }}
                        ></div>
                        <div className="health-text">{gameState.playerCharacter.health}/100</div>
                      </div>
                      <div style={{ height: "155px" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {/* Game Over Pop-up */}
              {gameState.gameOver && (
              <div className="custom-alert">
                <div className="alert-content">
                  <h2>{gameState.winner === socketRef.current.id ? "You Win!" : "You Lose!"}</h2>
                  <p>{`Selected amount: ${selectedButtonText}`}</p>
                  <button onClick={handleUndoClick} className="alert-button">Play Again</button>
                </div>
              </div>
            )}

            {/* Fancy Alert Message */}
            {showAlert && (
              <div className="custom-alert">
                <div className="alert-content">
                  <h2>Oops!</h2>
                  <p>Please connect your wallet first.</p>
                  <button onClick={handleCloseAlert} className="alert-button">Close</button>
                </div>
              </div>
            )}

            {/* Round timer */}
            {roundActive && (
              <div className="round-timer">
                {renderRoundTimer()}
              </div>
            )}
          </div>
        } />
        <Route path="/how-to-play" element={
          <HowToPlay 
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            setWalletAddress={setWalletAddress}
          />
        } />
      </Routes>
    </div>
  );
}

export default App;
import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import Navbar from './Navbar';
import { io } from "socket.io-client";
import { Routes, Route, Link } from 'react-router-dom';
import HowToPlay from './pages/HowToPlay';
import * as solanaWeb3 from '@solana/web3.js';
import { Buffer } from 'buffer';
import MyGames from './pages/MyGames';
import Contact from './pages/Contact';

// Make Buffer available globally (this is the key fix)
window.Buffer = Buffer;

//const socket = io('http://localhost:5005'); // Connect to the backend server


//images taken from https://hunterpunks.com/images/characters/7.svg
// Character data with real images and fight stats
const characters = [
  { id: 1, name: "Warrior", info: "A powerful warrior with futuristic armor and glowing swords.", image: "/images/characters/1.svg", health: 100, fightScore: 70, defendScore: 30 },
  { id: 2, name: "Will", info: "A fast and agile ninja, skilled in stealth and combat.", image: "/images/characters/2.svg", health: 100, fightScore: 80, defendScore: 20 },
  { id: 3, name: "Zombie", info: "A mystical sorcerer wielding a glowing staff with powerful magic.", image: "/images/characters/3.svg", health: 100, fightScore: 75, defendScore: 25 },
  { id: 4, name: "Ghost", info: "A deadly assassin who strikes from the shadows.", image: "/images/characters/4.svg", health: 100, fightScore: 85, defendScore: 15 },
  { id: 5, name: "Plumber", info: "A fearsome beast with immense strength and agility.", image: "/images/characters/5.svg", health: 100, fightScore: 65, defendScore: 35 },
  { id: 6, name: "Chef", info: "A highly advanced robot with mechanical precision.", image: "/images/characters/6.svg", health: 100, fightScore: 60, defendScore: 40 },
  { id: 7, name: "Alien", info: "An extraterrestrial being with unknown powers.", image: "/images/characters/7.svg", health: 100, fightScore: 50, defendScore: 50 },
  { id: 8, name: "Soldier", info: "A cunning pirate with a thirst for adventure.", image: "/images/characters/8.svg", health: 100, fightScore: 45, defendScore: 55 },
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
  
  // Add these state variables at the top with other state declarations
  const [playerActiveGame, setPlayerActiveGame] = useState(null);
  const [showActiveGameAlert, setShowActiveGameAlert] = useState(false);
  
  // Add these state variables
  const [roundResults, setRoundResults] = useState(null);
  const [showRoundResults, setShowRoundResults] = useState(false);
  
  // Add these state variables at the top with your other state declarations
  const [predictionMode, setPredictionMode] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  
  // Add these at the top with your other refs
  const hideResultsTimeoutRef = useRef(null);
  const lastProcessedRoundRef = useRef(null);
  const roundLockTimeRef = useRef(null);
  const pendingRoundRef   = useRef(null);

  
  // Add this new ref to track the current game phase
  const gamePhaseRef = useRef('idle'); // idle, round-active, round-ending, results-display
  
  // Add this effect at component level
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
    socketRef.current.on('roundStart', data => {
            // ignore duplicates or old rounds
          if (data.round <= currentRound) return;
      
            // if we're not idle (still showing results or ending), hold this data
            if (gamePhaseRef.current !== 'idle') {
              pendingRoundRef.current = data;
              return;
            }
      
            // otherwise start the round immediately
      processRoundStart(data);
      });
    // Handle round end
    socketRef.current.on('roundEnd', (data) => {
      console.log("Round End Data:", data);
      
      // Implement a strict round processing order
      if (lastProcessedRoundRef.current !== null && data.round <= lastProcessedRoundRef.current) {
        console.log(`Ignoring out-of-sequence round data for round ${data.round}`);
        return;
      }
      
      // Only process round end if we're in an active round or waiting for results
      if (gamePhaseRef.current !== 'round-active' && gamePhaseRef.current !== 'round-ending') {
        console.log(`Ignoring round end event during ${gamePhaseRef.current} phase`);
        return;
      }
      
      // Set phase to round-ending
      gamePhaseRef.current = 'round-ending';
      
      // Update our tracked round
      lastProcessedRoundRef.current = data.round;
      
      // Update the local gameState directly 
      setGameState(prevState => {
        // Create a deep copy to ensure React detects changes
        const newState = JSON.parse(JSON.stringify(prevState));
        
        // Update health directly based on round results
        if (socketRef.current.id === prevState.player1) {
          // We are player 1
          newState.playerCharacter.health = Math.max(0, data.player1Health);
          newState.opponentCharacter.health = Math.max(0, data.player2Health);
        } else {
          // We are player 2
          newState.playerCharacter.health = Math.max(0, data.player2Health);
          newState.opponentCharacter.health = Math.max(0, data.player1Health);
        }
        
        // Update game over status from round end data
        if (data.gameOver) {
          console.log("Game over detected in roundEnd event:", data);
          newState.gameOver = true;
          newState.winner = data.winner;
        }
        
        return newState;
      });
      
      // Set round results for display
      setRoundResults(data);
      
      // Clear any existing timeout to avoid multiple popups
      if (hideResultsTimeoutRef.current) {
        clearTimeout(hideResultsTimeoutRef.current);
      }
      
      // Set round inactive immediately to stop the timer
      setRoundActive(false);
      
      // Set phase to results-display
      gamePhaseRef.current = 'results-display';
      
      // Show the results
      setShowRoundResults(true);
      
      // Lock the round display for 9 seconds (almost the full display time)
      roundLockTimeRef.current = Date.now() + 10000;
      
      // Visual effects for damage
      if (socketRef.current.id === gameState.player1) {
        if (data.player1.damageTaken > 0) {
          setShakePlayer(true);
          setTimeout(() => setShakePlayer(false), 500);
        }
        if (data.player2.damageTaken > 0) {
          setShakeOpponent(true);
          setTimeout(() => setShakeOpponent(false), 500);
        }
      } else {
        if (data.player2.damageTaken > 0) {
          setShakePlayer(true);
          setTimeout(() => setShakePlayer(false), 500);
        }
        if (data.player1.damageTaken > 0) {
          setShakeOpponent(true);
          setTimeout(() => setShakeOpponent(false), 500);
        }
      }
      
      // Set timeout to hide results after 10 seconds
      hideResultsTimeoutRef.current = setTimeout(() => {
        setShowRoundResults(false);
        hideResultsTimeoutRef.current = null;
        roundLockTimeRef.current = null;
        gamePhaseRef.current = 'idle';
        // if a roundStart came in while we were showing results, start it now:
        if (pendingRoundRef.current) {
          processRoundStart(pendingRoundRef.current);
          pendingRoundRef.current = null;
        }
      }, 10000);
    });
    
    // Handle action confirmation
    socketRef.current.on('actionConfirmed', (data) => {
      console.log('Action confirmed:', data);
      // Show some confirmation to the player
    });
    
    // Listen for game state updates from the server
    socketRef.current.on('gameState', (newState) => {
      console.log("Game State Update:", newState);
      
      // Update entire game state including health values
      setGameState(prevState => {
        // When we receive a game state update, fully replace our state
        return { ...newState };
      });
      
      if (newState.player2) {
        setWaitingForPlayer(false);
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

  // Add this useEffect near the top of your component to check for active games on initial load
  useEffect(() => {
    // Only run this check if wallet is connected and socket is ready
    if (!walletAddress || !socketRef.current) return;
    
    console.log("Checking for active games with wallet:", walletAddress);
    
    // Add a small delay to ensure socket is fully connected
    const checkTimer = setTimeout(() => {
      // Emit event to check for active games for this wallet
      socketRef.current.emit('checkActiveGame', { walletAddress });
      
      // Set up listener for response
      const handleActiveGameCheck = (response) => {
        console.log("Active game check response:", response);
        
        if (response.hasActiveGame && response.gameSession) {
          console.log("Found active game:", response.gameSession);
          setPlayerActiveGame(response.gameSession);
          setShowActiveGameAlert(true);
        }
      };
      
      socketRef.current.on('activeGameCheck', handleActiveGameCheck);
      
      // Cleanup function
      return () => {
        socketRef.current.off('activeGameCheck', handleActiveGameCheck);
      };
    }, 1000); // 1 second delay
    
    return () => clearTimeout(checkTimer);
  }, [walletAddress, socketRef.current]);

  // Add this useEffect to check for active games when the component mounts
  useEffect(() => {
    // Function to check for active games
    const checkForActiveGames = async () => {
      // Only check if wallet is connected
      if (!walletAddress) return;
      
      try {
        console.log('Checking for active games with wallet:', walletAddress);
        
        // Emit event to check for active games
        socketRef.current.emit('checkActiveGames', { walletAddress });
        
        // Wait for response
        const result = await new Promise((resolve, reject) => {
          socketRef.current.once('activeGameResult', (data) => resolve(data));
          setTimeout(() => reject(new Error('Request timeout')), 5000);
        });
        
        console.log('Active game check result:', result);
        
        // If there's an active game, show the alert
        if (result.hasActiveGame && result.gameData) {
          setPlayerActiveGame(result.gameData);
          setShowActiveGameAlert(true);
        }
      } catch (error) {
        console.error('Error checking for active games:', error);
      }
    };
    
    // Check for active games when component mounts
    if (socketRef.current && walletAddress) {
      checkForActiveGames();
    }
    
    // Also set up listener for wallet changes
    const handleWalletChange = () => {
      if (socketRef.current && walletAddress) {
        checkForActiveGames();
      }
    };
    
    // Call on wallet change
    window.addEventListener('walletChange', handleWalletChange);
    
    return () => {
      window.removeEventListener('walletChange', handleWalletChange);
    };
  }, [walletAddress, socketRef.current]);

  const handleClick = (buttonIndex) => {
    setSelectedButtonText(`${generateButtonText(buttonIndex)}`);
    setIsModalOpen(true); // Open the character selection modal
  };

  // Add this state to your component's state
  const [showTransactionWaiting, setShowTransactionWaiting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('Initiating payment...');

  // Add these state variables to your existing state
  const [transactionSignature, setTransactionSignature] = useState(null);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Then update the handleFightClick function
  const handleFightClick = async () => {
    if (!selectedCharacter) return;
    
    try {
      // For free games, proceed immediately
      if (selectedButtonText === "Free!") {
        proceedToGame();
        return;
      }
      
      // Check if wallet is connected
      if (!walletAddress) {
        setShowAlert(true);
        return;
      }
      
      // Reset verification states
      setVerificationFailed(false);
      setVerificationError('');
      setTransactionSignature(null);
      
      // Request bet information from server
      socketRef.current.emit('requestBetInfo', { betAmount: selectedButtonText });
      setTransactionStatus('Calculating bet amount...');
      setShowTransactionWaiting(true);
      
      // Wait for bet info
      const betInfo = await new Promise((resolve, reject) => {
        socketRef.current.once('betInfo', (data) => resolve(data));
        socketRef.current.once('error', (error) => reject(error));
        // Set timeout
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });
      
      console.log('Received bet info:', betInfo);
      
      // No confirmation dialog - directly prepare transaction
      if (!window.solana) {
        setShowTransactionWaiting(false);
        alert("Phantom wallet not found!");
        return;
      }
      
      // Connect to Solana network
      const connection = new solanaWeb3.Connection(
        'https://api.devnet.solana.com', 
        'confirmed'
      );
      
      // Create a transaction
      setTransactionStatus('Preparing transaction...');
      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: new solanaWeb3.PublicKey(walletAddress),
          toPubkey: new solanaWeb3.PublicKey(betInfo.recipientWallet),
          lamports: Math.floor(betInfo.solAmount * solanaWeb3.LAMPORTS_PER_SOL),
        })
      );
      
      // Get the recent blockhash
      const blockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash.blockhash;
      transaction.feePayer = new solanaWeb3.PublicKey(walletAddress);
      
      // Update status
      setTransactionStatus('Please approve transaction in your wallet...');
      
      // Send transaction using Phantom
      const { signature } = await window.solana.signAndSendTransaction(transaction);
      console.log('Transaction sent:', signature);
      setTransactionSignature(signature);
      
      // Try to verify the payment
      await verifyPayment(betInfo.paymentId, signature);
      
    } catch (error) {
      console.error('Error in handleFightClick:', error);
      setVerificationFailed(true);
      setVerificationError(error.message);
      setTransactionStatus(`Error: ${error.message}`);
    }
  };

  // Add a separate function for payment verification
  const verifyPayment = async (paymentId, signature) => {
    try {
      setTransactionStatus('Transaction sent! Waiting for confirmation...');
      
      // Verify payment with server
      socketRef.current.emit('verifyPayment', { 
        paymentId, 
        signature 
      });
      
      const verificationResult = await new Promise((resolve, reject) => {
        socketRef.current.once('paymentVerified', (data) => resolve(data));
        socketRef.current.once('error', (error) => reject(error));
        // Set timeout
        setTimeout(() => reject(new Error('Verification timeout')), 30000);
      });
      
      if (!verificationResult.success) {
        setVerificationFailed(true);
        setVerificationError(verificationResult.message);
        setTransactionStatus(`Verification failed: ${verificationResult.message}`);
        return false;
      }
      
      // Hide waiting popup and proceed to game
      setShowTransactionWaiting(false);
      proceedToGame(true, paymentId, signature);
      return true;
    } catch (error) {
      console.error('Error in verifyPayment:', error);
      setVerificationFailed(true);
      setVerificationError(error.message);
      setTransactionStatus(`Verification error: ${error.message}`);
      return false;
    }
  };

  // Add a retry verification function
  const handleRetryVerification = async () => {
    if (!transactionSignature) {
      setVerificationError('No transaction signature available to retry');
      return;
    }
    
    try {
      setVerificationFailed(false);
      setTransactionStatus('Retrying verification...');
      
      // Get the bet info from the current state
      socketRef.current.emit('requestBetInfo', { betAmount: selectedButtonText });
      
      const betInfo = await new Promise((resolve, reject) => {
        socketRef.current.once('betInfo', (data) => resolve(data));
        socketRef.current.once('error', (error) => reject(error));
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });
      
      // Try verification again with the existing signature
      await verifyPayment(betInfo.paymentId, transactionSignature);
    } catch (error) {
      console.error('Error in retry verification:', error);
      setVerificationFailed(true);
      setVerificationError(error.message);
      setTransactionStatus(`Retry failed: ${error.message}`);
    }
  };

  // Helper function to proceed to game
  const proceedToGame = (verified = false, paymentId = null, signature = null) => {
    if (!selectedCharacter) return;
    
    console.log(`Proceeding to game with character ${selectedCharacter.id}, betAmount: ${selectedButtonText}`);
    
    // Join the game with payment verification details
    socketRef.current.emit('joinGame', {
      selectedCharacter: selectedCharacter,
      betAmount: selectedButtonText,
      walletAddress: walletAddress || null,
      verified: verified,
      paymentId: paymentId,
      signature: signature
    });
    
    setFightStarted(true);
    setShowAnimation(true);
    
    // Hide fight animation after 3 seconds
    setTimeout(() => {
      setShowAnimation(false);
    }, 3000);
    
    setLoading(false);
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setIsModalOpen(false); // Close the modal after character selection
    setIsButtonsOpen(false);
  };

const handlePlayerAttack = () => handlePlayerAction('attack');
const handlePlayerDodge = () => handlePlayerAction('dodge');
const handlePlayerHide = () => handlePlayerAction('hide');

  const handleCloseAlert = () => {
    setShowAlert(false);  // Close the custom alert
  };

  const handleUndoClick = () => {
    // Reset basic game state
    setSelectedCharacter(null);
    setIsButtonsOpen(true); 
    setSelectedButtonText(null);
    setFightStarted(false);
    setWaitingForPlayer(true);
    
    // Reset game state
    setGameState({
      player1: null,
      player2: null,
      playerCharacter: { id: 1, name: "Warrior", info: "A powerful warrior with futuristic armor and glowing swords.", image: "/images/characters/1.svg", health: 100, fightScore: 90 },
      opponentCharacter: null,
      gameOver: false,
      winner: null,
    });
    
    // Reset round-related state
    setCurrentRound(0);
    setTimeLeft(0);
    setActionTaken(false);
    setRoundActive(false);
    setRoundEndTime(0);
    
    // Reset round results state
    setRoundResults(null);
    setShowRoundResults(false);
    
    // Reset action state
    setPredictionMode(false);
    setSelectedAction(null);
    setSelectedPrediction(null);
    
    // Reset refs
    lastProcessedRoundRef.current = null;
    roundLockTimeRef.current = null;
    pendingRoundRef.current = null;
    
    // Reset game phase
    gamePhaseRef.current = 'idle';
    
    // Clear any existing timers
    if (hideResultsTimeoutRef.current) {
      clearTimeout(hideResultsTimeoutRef.current);
      hideResultsTimeoutRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Tell the server to reset
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
      if (gamePhaseRef.current === 'round-active') {
        gamePhaseRef.current = 'round-ending';
      }
      setRoundActive(false);
      clearInterval(timerRef.current);
    }
  }, 100); // Update 10 times per second for smooth countdown
};

// Update the renderRoundTimer function to handle zero values better
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
  
  // For debugging
  //console.log(`Rendering timer: ${timeLeft} seconds left, ${percentage}% remaining`);
  
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

// Update the timer initialization in processRoundStart
const processRoundStart = (data) => {
  // Update game phase
  gamePhaseRef.current = 'round-active';
  
  // Hide any existing round results
  setShowRoundResults(false);
  
  // Clear any existing timeout
  if (hideResultsTimeoutRef.current) {
    clearTimeout(hideResultsTimeoutRef.current);
    hideResultsTimeoutRef.current = null;
  }
  
  console.log("Processing round start with data:", data);
  
  // Make sure we have the required time data
  if (data.endTime) {
    // Parse the endTime correctly (ensure it's a number)
    const endTimeMillis = typeof data.endTime === 'string' 
      ? Date.parse(data.endTime) 
      : data.endTime;
    
    // Store as a number
    setRoundEndTime(endTimeMillis);
    
    // Calculate initial time left
    const now = Date.now();
    const initialTimeLeft = Math.max(0, (endTimeMillis - now) / 1000);
    
    console.log(`Round ${data.round} starting with ${initialTimeLeft}s remaining`);
    console.log(`End time: ${new Date(endTimeMillis).toISOString()}, Now: ${new Date(now).toISOString()}`);
    
    // Set time immediately
    setTimeLeft(initialTimeLeft);
    
    // Start synchronized timer
    startSynchronizedTimer(endTimeMillis);
  } else {
    console.error("Missing endTime in round start data", data);
    // Default to 10 seconds if no end time provided
    setTimeLeft(10);
    setRoundEndTime(Date.now() + 10000);
    startSynchronizedTimer(Date.now() + 10000);
  }
  
  // Normal round start handling
  setCurrentRound(data.round);
  setRoundActive(true);
  setActionTaken(false);
  setPredictionMode(false);
  setSelectedAction(null);
  setSelectedPrediction(null);
  
  // Release any locks
  roundLockTimeRef.current = null;
};

// Update the handleRejoinGame function to properly handle the waiting for opponent state
const handleRejoinGame = () => {
  if (!playerActiveGame) return;
  
  setFightStarted(true);
  setShowAnimation(true);
  setShowActiveGameAlert(false);
  
  // Store the bet amount for display purposes
  if (playerActiveGame.betAmount) {
    setSelectedButtonText(playerActiveGame.betAmount);
  }
  
  // Set player character based on wallet address
  if (playerActiveGame.player1Wallet === walletAddress) {
    // We are player 1
    if (playerActiveGame.playerCharacter) {
      setSelectedCharacter(playerActiveGame.playerCharacter);
      
      // Check if there's no player 2 yet - this means we're waiting for an opponent
      if (!playerActiveGame.player2) {
        setWaitingForPlayer(true);
        console.log("Rejoined game that's waiting for an opponent");
      } else {
        setWaitingForPlayer(false);
      }
    }
  } else if (playerActiveGame.player2Wallet === walletAddress) {
    // We are player 2
    if (playerActiveGame.opponentCharacter) {
      setSelectedCharacter(playerActiveGame.opponentCharacter);
      setWaitingForPlayer(false);
    }
  }
  
  // Emit the joinGame event to reconnect to the socket room
  socketRef.current.emit('joinGame', {
    selectedCharacter: null, // Not needed for rejoin
    betAmount: playerActiveGame.betAmount,
    walletAddress: walletAddress
  });
  
  // Hide fight animation after delay
  setTimeout(() => {
    setShowAnimation(false);
  }, 2000);
};

// Update the socket event handler to account for waiting state changes
useEffect(() => {
  if (!socketRef.current) return;
  
  // Listen for game state updates from the server
  const handleGameState = (newGameState) => {
    setGameState(newGameState);
    
    // If we're player 1 and a player 2 just joined, stop waiting
    if (newGameState.player1 === socketRef.current.id && 
        newGameState.player2 && 
        waitingForPlayer) {
      console.log("Player 2 joined, no longer waiting");
      setWaitingForPlayer(false);
    }
    
    // If we're player 2, we're never waiting for another player
    if (newGameState.player2 === socketRef.current.id && waitingForPlayer) {
      setWaitingForPlayer(false);
    }
  };
  
  socketRef.current.on('gameState', handleGameState);
  
  return () => {
    socketRef.current.off('gameState', handleGameState);
  };
}, [socketRef.current, waitingForPlayer]);

// Add this component for showing round results
const RoundResults = () => {
  if (!showRoundResults || !roundResults) return null;
  
  const isPlayer1 = socketRef.current.id === gameState.player1;
  const playerData = isPlayer1 ? roundResults.player1 : roundResults.player2;
  const opponentData = isPlayer1 ? roundResults.player2 : roundResults.player1;
  
  // Calculate total damage/healing for emphasis
  const playerNetChange = playerData.healingReceived - playerData.damageTaken;
  const opponentNetChange = opponentData.healingReceived - opponentData.damageTaken;
  
  // Determine result message
  let resultMessage = "Round Complete";
  if (playerNetChange > opponentNetChange) {
    resultMessage = "You Won This Round!";
  } else if (playerNetChange < opponentNetChange) {
    resultMessage = "You Lost This Round";
  } else {
    resultMessage = "Round Draw";
  }
  
  return (
    <div className="round-results">
      <div className="round-results-header">
        <h3>Round {roundResults.round} Results</h3>
        <h2 className={playerNetChange > 0 ? "positive-result" : playerNetChange < 0 ? "negative-result" : ""}>{resultMessage}</h2>
      </div>
      <div className="round-results-content">
        <div className="player-result">
          <h4>Your Move</h4>
          <p className="move-result">Action: <span className="highlight">{playerData.action || "None"}</span></p>
          <p className="move-result">Prediction: <span className="highlight">{playerData.prediction || "None"}</span></p>
          <p className="damage-result">Damage Taken: <span className="damage">{playerData.damageTaken}</span></p>
          <p className="healing-result">Healing: <span className="healing">{playerData.healingReceived}</span></p>
          <p className="net-result">Net: <span className={playerNetChange >= 0 ? "healing" : "damage"}>{playerNetChange}</span></p>
        </div>
        <div className="opponent-result">
          <h4>Opponent's Move</h4>
          <p className="move-result">Action: <span className="highlight">{opponentData.action || "None"}</span></p>
          <p className="move-result">Prediction: <span className="highlight">{opponentData.prediction || "None"}</span></p>
          <p className="damage-result">Damage Taken: <span className="damage">{opponentData.damageTaken}</span></p>
          <p className="healing-result">Healing: <span className="healing">{opponentData.healingReceived}</span></p>
          <p className="net-result">Net: <span className={opponentNetChange >= 0 ? "healing" : "damage"}>{opponentNetChange}</span></p>
        </div>
      </div>
    </div>
  );
};

// Add this function to handle all player actions
const handlePlayerAction = (action) => {
  if (gamePhaseRef.current !== 'round-active' || actionTaken) return;
  
  if (!predictionMode) {
    // First, handle prediction selection
    setSelectedPrediction(action);
    setPredictionMode(true);
  } else {
    // Then handle action selection
    setSelectedAction(action);
    setPredictionMode(false);
    
    // Send both to the server
    socketRef.current.emit('playerAction', {
      action: action,
      prediction: selectedPrediction
    });
    
    setActionTaken(true);
  }
};

// Add this component to show the current mode
const GameModeIndicator = () => {
  if (!roundActive || actionTaken) return null;
  
  return (
    <div className="game-mode-indicator">
      {predictionMode ? (
        <div className="mode action-mode">
          <h3>Select Your Action</h3>
        </div>
      ) : (
        <div className="mode prediction-mode">
          <h3>Predict Opponent's Move</h3>
        </div>
      )}
    </div>
  );
};

// Clean up timeouts when component unmounts
useEffect(() => {
  return () => {
    if (hideResultsTimeoutRef.current) {
      clearTimeout(hideResultsTimeoutRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Reset game phase
    gamePhaseRef.current = 'idle';
  };
}, []);

  return (
    <div className="App">
      <Navbar 
        setWalletAddress={setWalletAddress} 
        soundEnabled={soundEnabled} 
        setSoundEnabled={setSoundEnabled}
        setShowAlert={setShowAlert}
      />
      
      <Routes>
        <Route path="/" element={
          <div className="game-container">
            {/* Active Game Alert */}
            {showActiveGameAlert && playerActiveGame && (
              <div className="custom-alert fancy-waiting-popup">
                <div className="alert-content">
                  <h2>You have an active game!</h2>
                  <p>You're in the middle of a duel with bet amount: {playerActiveGame.betAmount}</p>
                  <div className="alert-buttons" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button onClick={handleRejoinGame} className="alert-button">
                      Rejoin Game
                    </button>
                    <button 
                      onClick={() => setShowActiveGameAlert(false)} 
                      className="alert-button secondary"
                    >
                      Start New Game
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                  
                  
                  
                  {/* Game stats display */}
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
                      {roundActive && !actionTaken && (
                        <GameModeIndicator />
                      )}
                      <div className="action-buttons">
                        <button 
                          className="attack-button" 
                          onClick={handlePlayerAttack}
                          disabled={!roundActive || actionTaken}
                        >
                          Attack
                        </button>
                        <button 
                          className="dodge-button" 
                          onClick={handlePlayerDodge}
                          disabled={!roundActive || actionTaken}
                        >
                          Dodge
                        </button>
                        <button 
                          className="hide-button" 
                          onClick={handlePlayerHide}
                          disabled={!roundActive || actionTaken}
                        >
                          Hide
                        </button>
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
                <RoundResults />
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
                          style={{ width: `${gameState.playerCharacter.health}%` }}
                        ></div>
                        <div className="health-text">{gameState.playerCharacter.health}/100</div>
                      </div>
                      {roundActive && !actionTaken && (
                        <GameModeIndicator />
                      )}
                      <div className="action-buttons">
                        <button 
                          className="attack-button" 
                          onClick={handlePlayerAttack}
                          disabled={!roundActive || actionTaken}
                        >
                          Attack
                        </button>
                        <button 
                          className="dodge-button" 
                          onClick={handlePlayerDodge}
                          disabled={!roundActive || actionTaken}
                        >
                          Dodge
                        </button>
                        <button 
                          className="hide-button" 
                          onClick={handlePlayerHide}
                          disabled={!roundActive || actionTaken}
                        >
                          Hide
                        </button>
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
                          style={{ width: `${gameState.opponentCharacter.health}%` }}
                        ></div>
                        <div className="health-text">{gameState.opponentCharacter.health}/100</div>
                      </div>
                      <div style={{ height: "155px" }}></div>
                    </div>
                  </div>
                </div>
                <RoundResults />
              </div>
            )}

              {/* Game Over Pop-up */}
              {gameState.gameOver && (
              <div className="custom-alert">
                <div className="alert-content">
                  <h2>{gameState.winner === socketRef.current.id || gameState.winner === walletAddress ? "You Win!" : "You Lose!"}</h2>
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

            {/* Updated transaction waiting popup with retry button */}
            {showTransactionWaiting && (
              <div className="fancy-waiting-popup">
                <div className="alert-content">
                  <div className="loading-character">
                    <img src={selectedCharacter ? selectedCharacter.image : "/images/characters/1.svg"} alt="Loading" />
                  </div>
                  <h2>Transaction in Progress</h2>
                  <p>{transactionStatus}</p>
                  
                  {!verificationFailed && (
                    <>
                      <div className="loading-spinner"></div>
                      <div className="loading-bar">
                        <div className="loading-fill"></div>
                      </div>
                      <div className="waiting-tips">
                        This usually takes 5-15 seconds to complete
                      </div>
                    </>
                  )}
                  
                  {verificationFailed && (
                    <>
                      <div className="verification-error">
                        <p>The transaction may have succeeded, but verification timed out.</p>
                        <p className="error-details">{verificationError}</p>
                      </div>
                      <div className="verification-options" style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                        <button className="fight-button" style={{ minWidth: '150px' }} onClick={handleRetryVerification}>
                          Verify Again
                        </button>
                        <button className="fight-button" style={{ minWidth: '150px' }} onClick={() => setShowTransactionWaiting(false)}>
                          Cancel
                        </button>
                      </div>
                      <div className="waiting-tips">
                        You can check your transaction status:
                        <a 
                          href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="explorer-link"
                        >
                          View in Explorer
                        </a>
                      </div>
                    </>
                  )}
                </div>
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
        <Route path="/my-games" element={
          <MyGames 
            walletAddress={walletAddress}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            setWalletAddress={setWalletAddress}
          />
        } />
        <Route path="/contact" element={
          <Contact 
            walletAddress={walletAddress}
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
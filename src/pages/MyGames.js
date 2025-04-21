import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyGames.css'; // You'll need to create this CSS file
import config from '../utils/config';

function MyGames({ walletAddress, setWalletAddress, soundEnabled, setSoundEnabled }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Redirect if wallet not connected
  useEffect(() => {
    if (!walletAddress) {
      navigate('/');
    }
  }, [walletAddress, navigate]);

  // Fetch games for this wallet
  useEffect(() => {
    if (!walletAddress) return;

    // Fetch actual game data from the backend
    const fetchGames = async () => {
      setLoading(true);
      try {
        // Get games from the server using fetch API
        const response = await fetch(`${config.apiUrl}/api/games?wallet=${walletAddress}`);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the games to format them for display
        const processedGames = data.games.map(game => {
          try {
            // Log the game for debugging
            console.log('Processing game data:', game);
            
            // Determine if this wallet was player1 or player2
            const isPlayer1 = game.player1Wallet === walletAddress;
            
            // Debugging
            console.log('Is Player1:', isPlayer1);
            console.log('Winner info:', {
              winner: game.winner,
              player1Wallet: game.player1Wallet,
              player2Wallet: game.player2Wallet,
              gameOver: game.gameOver
            });
            
            // Determine the result for this player
            let result = 'unknown';
            if (game.gameOver && game.winner) {
              // Winner contains the wallet address of the winner or a session ID
              if (game.winner === 'draw') {
                result = 'draw';
              } else if (game.winner === walletAddress) {
                // If the winner is the current wallet, it's a win
                result = 'win';
              } else if (game.winner === game.player1Wallet || game.winner === game.player2Wallet) {
                // If winner is one of the wallet addresses but not the current one, it's a loss
                result = 'loss';
              } else if (game.winner === game.player1 || game.winner === game.player2) {
                // If winner is one of the session IDs, check if it corresponds to the current player
                if ((isPlayer1 && game.winner === game.player1) || (!isPlayer1 && game.winner === game.player2)) {
                  result = 'win';
                } else {
                  result = 'loss';
                }
              } else {
                // If winner doesn't match any known format, assume it's an anonymous player's session ID
                result = 'loss';
              }
            }
            
            console.log('Calculated result:', result, 'Winner:', game.winner);
            
            // Get opponent wallet
            const opponentWallet = isPlayer1 ? game.player2Wallet : game.player1Wallet;
            
            // Get character
            const character = isPlayer1 ? game.playerCharacter : game.opponentCharacter;
            
            // Parse bet amount and calculate winning/loss amounts
            let rawBetAmount = 0;
            let betAmountDisplay = 'Free!';
            let winAmount = 0;
            let lossAmount = 0;
            
            if (game.betAmount) {
              // Extract numeric value from bet amount (handles formats like "5$")
              const betMatch = game.betAmount.match(/(\d+(\.\d+)?)/);
              if (betMatch && betMatch[1]) {
                rawBetAmount = parseFloat(betMatch[1]);
                betAmountDisplay = game.betAmount; // Keep original format for display
                
                // Calculate win/loss amounts
                lossAmount = rawBetAmount;
                // Win amount = bet*2 minus 3% fee
                winAmount = rawBetAmount * 2 * 0.97;
              }
            }
            
            return {
              id: game.sessionId ? game.sessionId.slice(-5) : Math.random().toString(36).substr(2, 5),
              date: game.createdAt ? new Date(game.createdAt).toLocaleDateString() : 'Unknown date',
              opponent: opponentWallet ? `${opponentWallet.slice(0, 4)}...${opponentWallet.slice(-4)}` : 'Unknown',
              betAmount: betAmountDisplay,
              rawBetAmount: rawBetAmount,
              winAmount: winAmount.toFixed(2),
              lossAmount: lossAmount.toFixed(2),
              result: result,
              character: {
                name: character?.name || 'Unknown',
                image: character?.image || '/images/characters/1.svg'
              },
              gameType: "PvP Duel",
              rounds: game.currentRound || "N/A",
              sessionInfo: game.gameOver ? "Complete" : "Active"
            };
          } catch (error) {
            console.error('Error processing game:', error);
            return null;
          }
        }).filter(Boolean);
        
        setGames(processedGames);
      } catch (error) {
        console.error('Error fetching games:', error);
        // If the fetch fails, use empty array
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [walletAddress]);

  return (
    <div className="my-games-container">
      <h1 >My Games</h1>
      <p className="wallet-info">Wallet: {walletAddress}</p>
      
      {loading ? (
        <div className="loading-spinner">Loading your games...</div>
      ) : games.length > 0 ? (
        <div className="games-list">
          {games.map(game => (
            <div key={game.id} className={`game-card ${game.result}`}>
              <div className="game-character">
                <img src={game.character.image} alt={game.character.name} />
              </div>
              
              <div className="game-details">
                <div className="game-id">ID: {game.id}</div>
                
                <div className="game-details-main">
                  <div className="game-info-section">
                    <div className="game-details-row">
                      <div className="game-detail-item">
                        <span className="detail-label">Date</span>
                        <span className="detail-value">{game.date}</span>
                      </div>
                      
                      <div className="game-detail-item">
                        <span className="detail-label">Opponent</span>
                        <span className="detail-value">{game.opponent}</span>
                      </div>
                      
                      <div className="game-detail-item">
                        <span className="detail-label">Bet Amount</span>
                        <span className="detail-value">{game.betAmount}</span>
                      </div>
                    </div>
                    
                    <div className="game-details-row">
                      <div className="game-detail-item">
                        <span className="detail-label">Rounds</span>
                        <span className="detail-value">{game.rounds || "N/A"}</span>
                      </div>
                      
                      <div className="game-detail-item">
                        <span className="detail-label">Status</span>
                        <span className="detail-value">{game.sessionInfo}</span>
                      </div>
                      
                      <div className="game-detail-item">
                        <span className="detail-label">
                          {game.result === 'win' ? 'Won Amount' : 'Loss Amount'}
                        </span>
                        <span className={`detail-value ${game.result === 'win' ? 'win-amount' : 'loss-amount'}`}>
                          {game.result === 'win' 
                            ? (game.rawBetAmount > 0 ? `+$${game.winAmount}` : 'Free Game') 
                            : (game.result === 'loss' && game.rawBetAmount > 0 ? `-$${game.lossAmount}` : 'No Loss')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="game-result-container">
                    <div className="game-result">
                      {game.result ? game.result.toUpperCase() : "UNKNOWN"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-games">
          <p>You haven't played any games yet!</p>
          <button onClick={() => navigate('/')} className="play-button">
            Play Now
          </button>
        </div>
      )}
    </div>
  );
}

export default MyGames;
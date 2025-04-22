import React, { useState } from 'react';
import './HowToPlay.css';
import { useNavigate } from 'react-router-dom';

// Import your character images
// Example path structure - update with your actual paths
const characterImages = {
  ninja: '/images/characters/4.svg',
  knight: '/images/characters/4.svg',
  wizard: '/images/characters/4.svg',
  archer: '/images/characters/4.svg',
  monk: '/images/characters/4.svg',
  warrior: '/images/characters/4.svg'
};

function HowToPlay() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Character data
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
  
  
  return (
    <div className="how-to-play-container">
      {/* Decorative corners */}
      <div className="corner-decoration top-left"></div>
      <div className="corner-decoration top-right"></div>
      <div className="corner-decoration bottom-left"></div>
      <div className="corner-decoration bottom-right"></div>
      
      <div className="how-to-play-content">
        <div className="game-header">
          <div className="game-title-decoration left"></div>
          <h1 className="game-title">Dojo Duel</h1>
          <div className="game-title-decoration right"></div>
        </div>
        
        <div className="navigation-tabs">
          <button 
            className={activeTab === 'overview' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('overview')}
          >
            Game Overview
          </button>
          <button 
            className={activeTab === 'characters' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('characters')}
          >
            Characters
          </button>
          <button 
            className={activeTab === 'combat' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('combat')}
          >
            Combat
          </button>
          <button 
            className={activeTab === 'controls' ? 'tab-button active' : 'tab-button'}
            onClick={() => setActiveTab('controls')}
          >
            Controls
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <div className="tab-content overview-tab">
            <div className="content-with-image">
              <div className="content-text">
                <h2 className="overview-title">Welcome to Dojo Duel</h2>
                
                <p className="overview-intro">Dojo Duel is a fast-paced battle game where skilled fighters face off in high-stakes duels. Select your character, pay your entry fee, and prepare to outmaneuver your opponent!</p>
                
                <div className="feature-grid">
                  <div className="feature-item">
                    <div className="feature-icon">💰</div>
                    <h3 className="feature-title">Entry Stakes</h3>
                    <p className="feature-desc">Choose how much to wager on your victory. Higher stakes mean bigger rewards!</p>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">👤</div>
                    <h3 className="feature-title">Character Selection</h3>
                    <p className="feature-desc">Choose from unique characters with different strengths and abilities.</p>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">⚔️</div>
                    <h3 className="feature-title">Strategic Combat</h3>
                    <p className="feature-desc">Attack, dodge, or hide - time your moves perfectly to defeat your opponent.</p>
                  </div>
                  
                  <div className="feature-item">
                    <div className="feature-icon">🏆</div>
                    <h3 className="feature-title">Win the Pot</h3>
                    <p className="feature-desc">The last fighter standing claims all the staked currency for themselves!</p>
                  </div>
                </div>
              </div>
              
              <div className="content-image">
                <div className="game-preview">
                  <div 
                    className="preview-character left" 
                    style={{ backgroundImage: `url(${characters[0].image})` }}
                  ></div>
                  <div className="vs-badge">VS</div>
                  <div 
                    className="preview-character right" 
                    style={{ backgroundImage: `url(${characters[4].image})` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="getting-started">
              <h2 className="section-title">Getting Started</h2>
              
              <ol className="steps-list">
                <li className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3 className="step-title">Select Entry Fee</h3>
                    <p className="step-desc">Choose your entry fee from the grid of buttons on the main screen. Remember, higher stakes mean bigger rewards!</p>
                  </div>
                </li>
                
                <li className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3 className="step-title">Choose Your Character</h3>
                    <p className="step-desc">Each character has unique attributes that affect their health, attack power, and special abilities. Choose wisely!</p>
                  </div>
                </li>
                
                <li className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3 className="step-title">Start the Duel</h3>
                    <p className="step-desc">Click the "Fight!" button to enter the battlefield and wait for an opponent ready to battle.</p>
                  </div>
                </li>
                
                <li className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h3 className="step-title">Invite Friends</h3>
                    <p className="step-desc">Share your game link with friends if you want to play with someone specific!</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}
        
        {activeTab === 'characters' && (
          <div className="tab-content characters-tab">
            <h2>Character Roster</h2>
            <p className="tab-intro">Choose your fighter wisely! Each character has unique attributes that affect their performance in combat.</p>
            
            <div className="character-grid" style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '25px'
            }}>
              {characters.map(char => (
                <div className="character-card" key={char.id}>
                  <div className="character-image">
                    <img 
                      src={char.image} 
                      alt={char.name} 
                      style={{
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain',
                        maxHeight: '150px'
                      }} 
                    />
                  </div>
                  <div className="character-name" style={{
                    textAlign: 'center',
                    marginTop: '10px',
                    marginBottom: '10px',
                    fontWeight: 'bold',
                    color: '#ff416c'
                  }}>
                    {char.name}
                  </div>
                  <div className="character-stats">
                    <div className="stat-group">
                      <div className="stat" style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span className="stat-label" style={{ fontWeight: 'bold', color: '#ff416c' }}>ATTACK</span>
                          <span style={{ color: '#ff416c', fontWeight: 'bold' }}>{char.fightScore}</span>
                        </div>
                        <div className="stat-bar" style={{ height: '10px', backgroundColor: 'rgba(255,65,108,0.2)', borderRadius: '5px' }}>
                          <div className="stat-fill attack" style={{
                            width: `${char.fightScore}%`, 
                            backgroundColor: '#ff416c',
                            height: '100%',
                            borderRadius: '5px',
                            boxShadow: '0 0 6px rgba(255,65,108,0.5)'
                          }}></div>
                        </div>
                      </div>
                      <div className="stat">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span className="stat-label" style={{ fontWeight: 'bold', color: '#4CAF50' }}>DEFENSE</span>
                          <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>{char.defendScore}</span>
                        </div>
                        <div className="stat-bar" style={{ height: '10px', backgroundColor: 'rgba(76,175,80,0.2)', borderRadius: '5px' }}>
                          <div className="stat-fill defense" style={{
                            width: `${char.defendScore}%`,
                            backgroundColor: '#4CAF50',
                            height: '100%',
                            borderRadius: '5px',
                            boxShadow: '0 0 6px rgba(76,175,80,0.5)'
                          }}></div>
                        </div>
                      </div>
                    </div>
                    <p className="character-description" style={{ 
                      marginTop: '15px', 
                      fontSize: '0.9rem', 
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: '1.4' 
                    }}>{char.info}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'combat' && (
          <div className="tab-content combat-tab">
            <h2>Combat System</h2>
            <p className="tab-intro">Master the strategic combat system of Dojo Duel where prediction and counter-moves are key to victory!</p>
            
            <div className="combat-mechanics">
              <div className="combat-section core-mechanics">
                <h3 className="section-subtitle">Core Mechanics</h3>
                <div className="mechanics-container">
                  <div className="mechanic-item">
                    <div className="mechanic-icon">❤️</div>
                    <div className="mechanic-info">
                      <h4>Health Points</h4>
                      <p>Each character starts with <span className="highlight">150 HP</span></p>
                    </div>
                  </div>
                  <div className="mechanic-item">
                    <div className="mechanic-icon">⏱️</div>
                    <div className="mechanic-info">
                      <h4>Round Time</h4>
                      <p>Each round lasts <span className="highlight">10 seconds</span></p>
                    </div>
                  </div>
                  <div className="mechanic-item">
                    <div className="mechanic-icon">🔮</div>
                    <div className="mechanic-info">
                      <h4>Prediction Phase</h4>
                      <p>Guess your opponent's next move</p>
                    </div>
                  </div>
                  <div className="mechanic-item">
                    <div className="mechanic-icon">👊</div>
                    <div className="mechanic-info">
                      <h4>Move Selection</h4>
                      <p>Choose Attack, Dodge, or Hide</p>
                    </div>
                  </div>
                 
                </div>
              </div>
              
              <div className="combat-section move-triangle">
                <h3 className="section-subtitle">Move Superiority Triangle</h3>
                <div className="triangle-diagram">
                  <div className="move-node attack-node">
                    <div className="node-icon">⚔️</div>
                    <div className="node-label">Attack</div>
                    <div className="node-glow"></div>
                  </div>
                  
                  <div className="move-node dodge-node">
                    <div className="node-icon">💨</div>
                    <div className="node-label">Dodge</div>
                    <div className="node-glow"></div>
                  </div>
                  
                  <div className="move-node hide-node">
                    <div className="node-icon">🛡️</div>
                    <div className="node-label">Hide</div>
                    <div className="node-glow"></div>
                  </div>
                  
                  <svg className="triangle-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 260">
                    {/* Base lines with gradient */}
                    <defs>
                      <linearGradient id="attack-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff416c" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ff4b2b" stopOpacity="0.8" />
                      </linearGradient>
                      <linearGradient id="dodge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#8BC34A" stopOpacity="0.8" />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Triangle base lines */}
                    <line className="triangle-line" x1="150" y1="50" x2="50" y2="210" />
                    <line className="triangle-line" x1="50" y1="210" x2="250" y2="210" />
                    <line className="triangle-line" x1="250" y1="210" x2="150" y2="50" />
                    
                    {/* Attack beats Hide arrow */}
                    <path className="arrow-path attack-path" d="M135,80 L75,180" stroke="url(#attack-gradient)" filter="url(#glow)" />
                    <polygon className="arrow-head attack-head" points="75,180 85,165 65,165" fill="url(#attack-gradient)" filter="url(#glow)" />
                    <text className="triangle-text attack-beats" x="90" y="120" filter="url(#glow)">BEATS</text>
                    
                    {/* Hide beats Dodge arrow - ADJUSTED SLIGHTLY HIGHER */}
                    <path className="arrow-path hide-path" d="M80,213 L220,213" stroke="#00BFFF" strokeWidth="3" strokeDasharray="8, 4" />
                    <polygon className="arrow-head hide-head" points="220,213 205,203 205,223" fill="#00BFFF" />
                    <text className="triangle-text hide-beats" x="150" y="198" fill="#00BFFF" fontWeight="bold">BEATS</text>
                    
                    {/* Dodge beats Attack arrow */}
                    <path className="arrow-path dodge-path" d="M225,180 L165,80" stroke="url(#dodge-gradient)" filter="url(#glow)" />
                    <polygon className="arrow-head dodge-head" points="165,80 155,95 175,95" fill="url(#dodge-gradient)" filter="url(#glow)" />
                    <text className="triangle-text dodge-beats" x="210" y="120" filter="url(#glow)">BEATS</text>
                  </svg>
                </div>
                
                {/* Enhanced legend with bigger text and icons */}
                <div className="triangle-legend">
                  <div className="legend-item attack-legend">
                    <div className="legend-icon">⚔️</div>
                    <div className="legend-text">Attack beats Hide</div>
                  </div>
                  <div className="legend-item hide-legend">
                    <div className="legend-icon">🛡️</div>
                    <div className="legend-text">Hide beats Dodge</div>
                  </div>
                  <div className="legend-item dodge-legend">
                    <div className="legend-icon">💨</div>
                    <div className="legend-text">Dodge beats Attack</div>
                  </div>
                </div>
              </div>
              
              <div className="combat-section interaction-matrix" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 className="section-subtitle">Move Interaction Matrix</h3>
                <div className="matrix-container" style={{ margin: '30px auto' }}>
                  <div className="matrix-header">
                    <div className="matrix-corner"></div>
                    <div className="matrix-top attack" style={{ marginRight: '25px' }}>
                      <div className="move-icon">⚔️</div>
                      <span>Attack</span>
                    </div>
                    <div className="matrix-top dodge" style={{ marginRight: '25px' }}>
                      <div className="move-icon">💨</div>
                      <span>Dodge</span>
                    </div>
                    <div className="matrix-top hide">
                      <div className="move-icon">🛡️</div>
                      <span>Hide</span>
                    </div>
                  </div>
                  
                  <div className="matrix-row">
                    <div className="matrix-side attack">
                      <div className="move-icon">⚔️</div>
                      <span>Attack</span>
                    </div>
                    <div className="matrix-cell outcome-both-damage">
                      <p>Both deal damage to each other</p>
                      <p className="matrix-detail">If one predicts correctly, only their attack hits with +20% damage</p>
                    </div>
                    <div className="matrix-cell outcome-dodge-wins">
                      <p>Dodge wins</p>
                      <p className="matrix-detail">Attacker takes recoil damage</p>
                      <p className="matrix-detail">If attacker predicts correctly, they deal +20% damage instead</p>
                    </div>
                    <div className="matrix-cell outcome-attack-wins">
                      <p>Attack wins</p>
                      <p className="matrix-detail">Attacker deals damage, defender heals</p>
                      <p className="matrix-detail">If attacker predicts correctly, no healing and +20% damage</p>
                      <p className="matrix-detail">If defender predicts correctly, no damage and +20% healing</p>
                    </div>
                  </div>
                  
                  <div className="matrix-row">
                    <div className="matrix-side dodge">
                      <div className="move-icon">💨</div>
                      <span>Dodge</span>
                    </div>
                    <div className="matrix-cell outcome-dodge-wins">
                      <p>Dodge wins</p>
                      <p className="matrix-detail">Attacker takes recoil damage</p>
                      <p className="matrix-detail">If attacker predicts correctly, they deal +20% damage instead</p>
                    </div>
                    <div className="matrix-cell outcome-nothing">
                      <p>Nothing happens</p>
                      <p className="matrix-detail">If one predicts correctly, opponent takes damage</p>
                    </div>
                    <div className="matrix-cell outcome-hide-wins">
                      <p>Hide wins</p>
                      <p className="matrix-detail">Hide player heals</p>
                      <p className="matrix-detail">If Hide predicts correctly, +20% healing and Dodge player takes damage</p>
                    </div>
                  </div>
                  
                  <div className="matrix-row">
                    <div className="matrix-side hide">
                      <div className="move-icon">🛡️</div>
                      <span>Hide</span>
                    </div>
                    <div className="matrix-cell outcome-attack-wins">
                      <p>Attack wins</p>
                      <p className="matrix-detail">Attacker deals damage, defender heals</p>
                      <p className="matrix-detail">If attacker predicts correctly, no healing and +20% damage</p>
                      <p className="matrix-detail">If defender predicts correctly, no damage and +20% healing</p>
                    </div>
                    <div className="matrix-cell outcome-hide-wins">
                      <p>Hide wins</p>
                      <p className="matrix-detail">Hide player heals</p>
                      <p className="matrix-detail">If Hide predicts correctly, +20% healing and Dodge player takes damage</p>
                    </div>
                    <div className="matrix-cell outcome-both-heal">
                      <p>Both players heal</p>
                      <p className="matrix-detail">If one predicts correctly, only they heal</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="combat-section damage-calculation">
                <h3 className="section-subtitle">Damage & Healing Calculations</h3>
                <div className="formula-container">
                  <div className="formula damage-formula">
                    <h4>Attack Damage Formula</h4>
                    <div className="formula-box">
                      <p className="formula-text">Damage = 12 × (Attacker's Fight Score ÷ Defender's Defense Score) × Random(0.9-1.1)</p>
                      <p className="formula-example">Example: If attacker has FS=60 and defender has DS=40, base damage is about 18 HP</p>
                    </div>
                    <p className="formula-note">* Correct prediction adds +20% bonus damage</p>
                  </div>
                  <div className="formula healing-formula">
                    <h4>Hide Healing Formula</h4>
                    <div className="formula-box">
                      <p className="formula-text">Healing = Character's Defense Score ÷ 10</p>
                      <p className="formula-example">Example: If character has DS=50, healing is 5 HP per Hide</p>
                    </div>
                    <p className="formula-note">* Correct prediction adds +20% bonus healing</p>
                  </div>
                </div>
              </div>
              
              <div className="combat-section strategy-tips">
                <h3 className="section-subtitle">Strategic Tips</h3>
                <div className="tips-container">
                  <ul className="tips-list">
                    <li className="tip-item">
                      <div className="tip-icon">👁️</div>
                      <div className="tip-content">
                        <p>Pay close attention to your opponent's pattern - most players develop habits</p>
                      </div>
                    </li>
                    <li className="tip-item">
                      <div className="tip-icon">💪</div>
                      <div className="tip-content">
                        <p>Consider your character's strengths - high Attack favors aggressive play, high Defense enables better healing</p>
                      </div>
                    </li>
                    <li className="tip-item">
                      <div className="tip-icon">🔄</div>
                      <div className="tip-content">
                        <p>Mix up your moves to avoid being predictable</p>
                      </div>
                    </li>
                    <li className="tip-item">
                      <div className="tip-icon">❤️</div>
                      <div className="tip-content">
                        <p>When low on health, consider risking a Hide move for healing</p>
                      </div>
                    </li>
                    <li className="tip-item">
                      <div className="tip-icon">🛡️</div>
                      <div className="tip-content">
                        <p>Against aggressive players, Dodge can turn their attacks against them</p>
                      </div>
                    </li>
                    <li className="tip-item">
                      <div className="tip-icon">🔮</div>
                      <div className="tip-content">
                        <p>The prediction bonus can overcome a superior move - predict correctly!</p>
                      </div>
                    </li>
                    <li className="tip-item">
                      <div className="tip-icon">🧠</div>
                      <div className="tip-content">
                        <p>Try to establish a false pattern, then break it at a critical moment to catch your opponent off-guard</p>
                      </div>
                    </li>
                    <li className="tip-item">
                      <div className="tip-icon">⚖️</div>
                      <div className="tip-content">
                        <p>Balance risk and reward - sometimes taking damage is worth it if you can deal more in return</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'controls' && (
          <div className="tab-content controls-tab">
            <h2>Game Controls</h2>
            <p className="tab-intro">Master these controls to dominate the battlefield!</p>
            
            <div className="combat-section game-controls">
              <h3 className="section-subtitle">Game Controls</h3>
              <div className="controls-container">
                <div className="controls-row">
                  <div className="control-card keyboard-controls">
                    <div className="card-header">
                      <div className="card-icon">⌨️</div>
                      <h4>Keyboard Controls</h4>
                    </div>
                    <div className="controls-grid">
                      <div className="control-item">
                        <div className="key-combo">
                          <span className="key">A</span>
                        </div>
                        <span className="control-action">Attack</span>
                      </div>
                      <div className="control-item">
                        <div className="key-combo">
                          <span className="key">D</span>
                        </div>
                        <span className="control-action">Dodge</span>
                      </div>
                      <div className="control-item">
                        <div className="key-combo">
                          <span className="key">H</span>
                        </div>
                        <span className="control-action">Hide</span>
                      </div>
                    </div>
                    <div className="card-glow keyboard-glow"></div>
                  </div>
                  
                  <div className="control-card mouse-controls">
                    <div className="card-header">
                      <div className="card-icon">🖱️</div>
                      <h4>Mouse Controls</h4>
                    </div>
                    <div className="mouse-grid">
                      <div className="mouse-section">
                        <div className="section-label">Move Selection</div>
                        <div className="visual-container">
                          <div className="move-buttons">
                            <div className="move-button attack-btn">Attack</div>
                            <div className="move-button dodge-btn">Dodge</div>
                            <div className="move-button hide-btn">Hide</div>
                          </div>
                          <div className="control-description">
                            Click a button to select your move
                          </div>
                        </div>
                      </div>
                      <div className="mouse-section">
                        <div className="section-label">Prediction</div>
                        <div className="visual-container">
                          <div className="prediction-buttons">
                            <div className="predict-button">
                              <div className="predict-icon">⚔️</div>
                              <span>Attack</span>
                            </div>
                            <div className="predict-button">
                              <div className="predict-icon">💨</div>
                              <span>Dodge</span>
                            </div>
                            <div className="predict-button">
                              <div className="predict-icon">🛡️</div>
                              <span>Hide</span>
                            </div>
                          </div>
                          <div className="control-description">
                            Click to predict opponent's move
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card-glow mouse-glow"></div>
                  </div>
                </div>
                
                <div className="control-card timing-controls">
                  <div className="card-header">
                    <div className="card-icon">⏱️</div>
                    <h4>Round Timing</h4>
                  </div>
                  <div className="timer-visualization">
                    <div className="timer-bar">
                      <div className="timer-progress"></div>
                    </div>
                    <div className="timer-markers">
                      <div className="timer-marker start">
                        <div className="marker-label">Round Start</div>
                      </div>
                      <div className="timer-marker predict">
                        <div className="marker-label">Make Prediction</div>
                      </div>
                      <div className="timer-marker decide">
                        <div className="marker-label">Choose Move</div>
                      </div>
                      <div className="timer-marker end">
                        <div className="marker-label">Round End</div>
                      </div>
                    </div>
                  </div>
                  <div className="timing-notes">
                    <div className="timing-note">
                      <span className="note-highlight">10 seconds</span> per round
                    </div>
                    <div className="timing-note">
                      Inactivity results in <span className="note-highlight">5 HP</span> damage
                    </div>
                  </div>
                  <div className="card-glow timer-glow"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="navigation-footer">
          <button className="return-button" onClick={() => navigate('/')}>
            Return to Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default HowToPlay; 
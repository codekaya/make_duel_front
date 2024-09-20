import React, { useState } from "react";
import "./App.css";
import Navbar from './Navbar';

// Character data with real images and fight stats
const characters = [
  { id: 1, name: "Warrior", info: "A powerful warrior with futuristic armor and glowing swords.", image: "https://hunterpunks.com/images/characters/10.svg", health: 100, fightScore: 90 },
  { id: 2, name: "Ninja", info: "A fast and agile ninja, skilled in stealth and combat.", image: "https://hunterpunks.com/images/characters/1.svg", health: 80, fightScore: 95 },
  { id: 3, name: "Sorcerer", info: "A mystical sorcerer wielding a glowing staff with powerful magic.", image: "https://hunterpunks.com/images/characters/2.svg", health: 70, fightScore: 85 },
  { id: 4, name: "Assassin", info: "A deadly assassin who strikes from the shadows.", image: "https://hunterpunks.com/images/characters/3.svg", health: 90, fightScore: 88 },
  { id: 5, name: "Beast", info: "A fearsome beast with immense strength and agility.", image: "https://hunterpunks.com/images/characters/4.svg", health: 120, fightScore: 80 },
  { id: 6, name: "Robot", info: "A highly advanced robot with mechanical precision.", image: "https://hunterpunks.com/images/characters/5.svg", health: 110, fightScore: 92 },
  { id: 7, name: "Alien", info: "An extraterrestrial being with unknown powers.", image: "https://hunterpunks.com/images/characters/6.svg", health: 85, fightScore: 93 },
  { id: 8, name: "Pirate", info: "A cunning pirate with a thirst for adventure.", image: "https://hunterpunks.com/images/characters/7.svg", health: 95, fightScore: 84 },
  { id: 9, name: "Samurai", info: "A disciplined samurai with a code of honor.", image: "https://hunterpunks.com/images/characters/8.svg", health: 100, fightScore: 87 }
];

function App() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonsOpen, setIsButtonsOpen] = useState(true);

  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedButtonText, setSelectedButtonText] = useState(null); // Track the selected button text
  const [walletAddress, setWalletAddress] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleClick = (buttonIndex) => {
    setSelectedButtonText(`${(buttonIndex + 1) * 5}$`);
    setIsModalOpen(true); // Open the character selection modal
  };

  const handleFightClick = () => {
    if (!walletAddress) {
      console.log("olmadibe")
      setShowAlert(true); 
      
    } else {
      // Proceed with fight logic
      console.log("Fight started!");
      alert("Please connect your wallet second!");
    }
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setIsModalOpen(false); // Close the modal after character selection
    setIsButtonsOpen(false);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);  // Close the custom alert
  };

  const handleUndoClick = () => {
    setSelectedCharacter(null);
    setIsButtonsOpen(true); // Show the main screen with the buttons
    setSelectedButtonText(null); // Reset button text
  };

  return (
    <div className="App">
      <Navbar setWalletAddress={setWalletAddress} />
      <h1 className="duel-text">Duel!</h1>

      {isButtonsOpen && (<div className="button-container">
        {[...Array(9)].map((_, index) => (
          <button
            key={index}
            className="fight-button"
            //onClick={handleClick}
            onClick={() => handleClick(index)}
            disabled={loading}
          >
            {loading ? "Loading..." : `${(index + 1) * 5}$`}
          </button>
        ))}
      </div>)}
      

      {/* Modal for Character Selection */}
      {isModalOpen && (
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
                    <p>Health: {character.health}</p>
                    <p>Fight Score: {character.fightScore}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Display Selected Character Info */}
      {selectedCharacter && (
        <div className="character-info">
          <img src={selectedCharacter.image} alt={selectedCharacter.name} className="selected-character-image" />
          <h2>Selected Character: {selectedCharacter.name}</h2>
          <p>{selectedCharacter.info}</p>
          <p>Health: {selectedCharacter.health}</p>
          <p>Fight Score: {selectedCharacter.fightScore}</p>
          <h2 className="selected-amount">Selected: {selectedButtonText}</h2>
          <button className="fight-button-fancy" onClick={() => handleFightClick()} >Fight!</button>

          {/* Undo Button inside character info */}
          <button className="undo-button" onClick={handleUndoClick}>
            &#x21A9; {/* Unicode for Undo symbol */}
          </button>

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

    </div>
  );
}

export default App;

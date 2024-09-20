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
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedButtonText, setSelectedButtonText] = useState(null); // Track the selected button text

  const handleClick = (buttonIndex) => {
    setSelectedButtonText(`${(buttonIndex + 1) * 5}$`); // Save the text of the clicked button
    setIsModalOpen(true); // Open the character selection modal
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setIsModalOpen(false); // Close the modal after character selection
  };

  return (
    <div className="App">
      <Navbar />
      <h1 className="duel-text">Duel!</h1>

      {/* Hide button container after character selection */}
      {!selectedCharacter && (
        <div className="button-container">
          {[...Array(9)].map((_, index) => (
            <button
              key={index}
              className="fight-button"
              onClick={() => handleClick(index)}
              disabled={loading}
            >
              {loading ? "Loading..." : `${(index + 1) * 5}$`}
            </button>
          ))}
        </div>
      )}

      {/* Display selected character info and previously selected button text */}
      {selectedCharacter && (
        <div className="character-info-section">
          <h2>Selected: {selectedButtonText}</h2>
          <div className="character-info">
            <img src={selectedCharacter.image} alt={selectedCharacter.name} className="selected-character-image" />
            <h2>Selected Character: {selectedCharacter.name}</h2>
            <p>{selectedCharacter.info}</p>
            <p>Health: {selectedCharacter.health}</p>
            <p>Fight Score: {selectedCharacter.fightScore}</p>
          </div>

          {/* Fancy Fight Button */}
          <button className="fight-button-fancy">Fight!</button>
        </div>
      )}
    </div>
  );
}

export default App;
                    
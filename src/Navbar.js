import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { Connection, PublicKey } from '@solana/web3.js';

function Navbar({ setWalletAddress, soundEnabled, setSoundEnabled, gameInProgress, onNavigate, setShowAlert }) {
   const [walletAddress, setLocalWalletAddress] = useState(null);
   const [menuOpen, setMenuOpen] = useState(false);
   const navigate = useNavigate();

  // Check if Phantom is installed
  const isPhantomInstalled = () => {
    return window.solana && window.solana.isPhantom;
  };

  // Connect to Phantom wallet
  const connectWallet = async () => {
    if (isPhantomInstalled()) {
      try {
        const { solana } = window;
        if (solana.isConnected) {
          console.log("Already connected to wallet: ", solana.publicKey.toString());
          return;
        }
        const response = await solana.connect();
        setWalletAddress(response.publicKey.toString());
        setLocalWalletAddress(response.publicKey.toString());
        console.log("Connected to wallet: ", response.publicKey.toString());
      } catch (err) {
        console.error("Wallet connection failed: ", err);
      }
    } else {
      alert("Phantom wallet is not installed!");
    }
  };

  // Toggle sound on/off
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    console.log("Sound toggled:", !soundEnabled);
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu after navigation
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Check if the wallet is already connected on page load/reload
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (isPhantomInstalled()) {
        const { solana } = window;

        if (solana.isConnected) {
          // If the wallet is already connected, set the address
          const wallet = solana.publicKey.toString();
          setWalletAddress(wallet);
          setLocalWalletAddress(wallet);
          console.log("Wallet already connected: ", wallet);
        } else {
          // Check for auto-connect support in Phantom wallet
          try {
            const response = await solana.connect({ onlyIfTrusted: true });
            setWalletAddress(response.publicKey.toString());
            setLocalWalletAddress(response.publicKey.toString());
            console.log("Auto-connected to wallet: ", response.publicKey.toString());
          } catch (err) {
            console.log("Auto-connect failed: ", err);
          }
        }
      }
    };

    checkWalletConnection();

    // Listen for wallet connection events
    if (isPhantomInstalled()) {
      const { solana } = window;

      solana.on("connect", () => {
        const wallet = solana.publicKey.toString();
        setWalletAddress(wallet);
        setLocalWalletAddress(wallet);
        console.log("Wallet connected: ", wallet);
      });

      solana.on("disconnect", () => {
        setWalletAddress(null);
        setLocalWalletAddress(null);
        console.log("Wallet disconnected");
      });
    }
  }, [setWalletAddress]);

  // Handle navigation with game in progress check
  const handleNavigation = (path) => {
    if (gameInProgress) {
      if (window.confirm('You have an active game in progress. If you leave, you will forfeit the match. Are you sure you want to leave?')) {
        navigate(path);
        closeMenu();
      }
    } else {
      navigate(path);
      closeMenu();
    }
  };

  // Update the handleMyGamesClick function
  const handleMyGamesClick = () => {
    if (!walletAddress) {
      // Trigger the custom alert in App.js instead of using a simple alert
      setShowAlert(true);
      closeMenu();
      return;
    }
    
    // If wallet is connected, navigate to the my-games route
    navigate('/my-games');
    closeMenu();
  };

  const handleContactClick = () => {
    navigate('/contact');
    closeMenu();
  };

  return (
    <nav className="navbar">
      {/* Make the logo clickable and navigate to home */}
      <div 
        className="navbar-logo" 
        onClick={() => handleNavigation('/')}
        style={{ cursor: 'pointer' }}
      >
        Dojo Duel
      </div>
      
      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        <li>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/how-to-play');
            }}
          >
            How to Play?
          </a>
        </li>
        <li><a onClick={handleMyGamesClick}>My Games</a></li>
        <li><a onClick={handleContactClick}>Contact</a></li>
      </ul>

      <div className="wallet-button-container">
        {/* Simple SVG Sound Toggle Button */}
        <button 
          className="sound-toggle-button" 
          onClick={toggleSound}
          aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
        >
          {soundEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          )}
        </button>
        
        {walletAddress ? (
          <p>Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</p>
        ) : (
          <button className="wallet-button" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
      
      {/* Mobile menu toggle button */}
      <button 
        className="mobile-menu-button" 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {menuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>
    </nav>
  );
}

export default Navbar;

// src/Navbar.js
import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { Connection, PublicKey } from '@solana/web3.js';

function Navbar({ setWalletAddress }) {
   const [walletAddress, setLocalWalletAddress] = useState(null);

  // Check if Phantom is installed
  const isPhantomInstalled = () => {
    return window.solana && window.solana.isPhantom;
  };

  // Connect to Phantom wallet
  const connectWallet = async () => {
    if (isPhantomInstalled()) {
      try {
        const { solana } = window;
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

  // Check if the wallet is already connected
  useEffect(() => {
    if (isPhantomInstalled()) {
      const { solana } = window;
      solana.on("connect", () => {
        const wallet = solana.publicKey.toString();
        setWalletAddress(wallet);  // Update the wallet address in App.js
        setLocalWalletAddress(wallet); // Update the local wallet address in Navbar
      });

    }
  }, [setWalletAddress]);

  return (
    <nav className="navbar">
      <div className="navbar-logo">Make Duel</div>
      <ul className="navbar-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      <div className="wallet-button-container">
        {walletAddress ? (
          <p>Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</p>
        ) : (
          <button className="wallet-button" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

import React from 'react';
import './Contact.css';
import { useNavigate } from 'react-router-dom';

function Contact() {
  const navigate = useNavigate();
  
  return (
    <div className="contact-container">
      <div className="contact-content">
        <h1 className="contact-title">Contact Us</h1>
        
        <div className="contact-section">
          <div className="contact-box social">
            <h2>Follow Us</h2>
            <div className="contact-links">
              <a href="https://twitter.com/dojoduel" target="_blank" rel="noopener noreferrer">
                <div className="contact-link-icon twitter">
                  <span className="icon-text">𝕏</span>
                </div>
                <span>Twitter</span>
              </a>
              
              <a href="https://discord.gg/dojoduel" target="_blank" rel="noopener noreferrer">
                <div className="contact-link-icon discord">
                  <span className="icon-text">D</span>
                </div>
                <span>Discord</span>
              </a>
              
              <a href="https://t.me/dojoduel" target="_blank" rel="noopener noreferrer">
                <div className="contact-link-icon telegram">
                  <span className="icon-text">T</span>
                </div>
                <span>Telegram</span>
              </a>
            </div>
          </div>

          <div className="contact-box email">
            <h2>Email Us</h2>
            <div className="single-email">
              <p>Need help, found a bug, or want to collaborate?</p>
              <ul className="email-purpose-list">
                <li>Player support</li>
                <li>Partnership</li>
                <li>Bug reports</li>
                <li>Game suggestions</li>
              </ul>
              <a href="mailto:contact@dojoduel.com" className="main-email">contact@dojoduel.com</a>
              <p className="email-note">We'll respond to your message as soon as possible!</p>
            </div>
          </div>
        </div>
        
        <button className="back-button" onClick={() => navigate('/')}>
          Back to Game
        </button>
      </div>
    </div>
  );
}

export default Contact; 
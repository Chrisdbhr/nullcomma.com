import { Link, Outlet } from 'react-router-dom';
import {
  FaGithub, FaSteam, FaEnvelope,
  FaLinkedin, FaInstagram, FaYoutube, FaTiktok, FaDiscord
} from 'react-icons/fa'

function App() {
  return (
    <div className="app-container">
      <header className="main-header">
        <Link to="/" className="site-title-link">
          <h1>Null Comma</h1>
          <span>Games, prototypes & dev insights</span>
        </Link>
      </header>

      <main className="main-content-area">
        <Outlet />
      </main>

      <footer className="main-footer">
        <div className="footer-grid">
          <div className="footer-about">
            <h4>About Me</h4>
            <p>
              I'm <strong>Christopher Ravailhe</strong>, a Senior C# Developer and Unity specialist with 9+ years of experience. I've shipped 25+ games across PC, console, and mobile.
            </p>
          </div>
          <div className="footer-community">
            <h4>My Community</h4>
            <p>
              Meet Concord! For over 10 years, we've been playing, working, and talking about life together.
            </p>
            <a href="https://discord.nullcomma.com/" target="_blank" rel="noopener noreferrer" className="footer-discord-btn">
              <FaDiscord /> Join Discord
            </a>
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            <p>Interested in collaboration or just chatting?</p>
            <a href="mailto:contato@nullcomma.com" className="footer-email">
              <FaEnvelope /> contato@nullcomma.com
            </a>
            <div className="footer-social-links">
              <a href="https://github.com/Chrisdbhr" target="_blank" rel="noopener noreferrer" title="GitHub"><FaGithub /></a>
              <a href="https://www.linkedin.com/in/chrisdbhr" target="_blank" rel="noopener noreferrer" title="LinkedIn"><FaLinkedin /></a>
              <a href="https://store.steampowered.com/curator/44885415" target="_blank" rel="noopener noreferrer" title="Steam"><FaSteam /></a>
              <a href="https://tiktok.com/@nullcomma" target="_blank" rel="noopener noreferrer" title="TikTok"><FaTiktok /></a>
              <a href="https://www.instagram.com/nullcomma" target="_blank" rel="noopener noreferrer" title="Instagram"><FaInstagram /></a>
              <a href="https://www.youtube.com/@chrisjogos" target="_blank" rel="noopener noreferrer" title="YouTube"><FaYoutube /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            © 2025 Null Comma. All rights reserved.
            <span className="footer-sep">·</span>
            <a href="/privacy">Privacy</a>
            <span className="footer-sep">·</span>
            <a href="/terms">Terms</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

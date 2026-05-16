import { Link, Outlet } from 'react-router-dom';
import ProfileSidebar from './components/ProfileSidebar';
import {
  FaGithub, FaSteam, FaEnvelope,
  FaLinkedin, FaInstagram, FaYoutube, FaTiktok
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

      <div className="page-layout">
        <ProfileSidebar />

        <main className="main-content-area">
          <Outlet />
        </main>
      </div>

      <footer className="main-footer">
        <div className="footer-social-links">
          <a href="https://github.com/Chrisdbhr" target="_blank" rel="noopener noreferrer" title="GitHub">
            <FaGithub />
          </a>
          <a href="https://www.linkedin.com/in/chrisdbhr" target="_blank" rel="noopener noreferrer" title="LinkedIn">
            <FaLinkedin />
          </a>
          <a href="https://store.steampowered.com/curator/44885415" target="_blank" rel="noopener noreferrer" title="Steam">
            <FaSteam />
          </a>
          <a href="https://tiktok.com/@nullcomma" target="_blank" rel="noopener noreferrer" title="TikTok">
            <FaTiktok />
          </a>
          <a href="https://www.instagram.com/nullcomma" target="_blank" rel="noopener noreferrer" title="Instagram">
            <FaInstagram />
          </a>
          <a href="https://www.youtube.com/@chrisjogos" target="_blank" rel="noopener noreferrer" title="YouTube">
            <FaYoutube />
          </a>
          <a href="mailto:contato@nullcomma.com" title="Email">
            <FaEnvelope />
          </a>
        </div>
        <p>
          © 2025 Null Comma. All rights reserved.
          <span className="footer-sep">·</span>
          <a href="/privacy">Privacy</a>
          <span className="footer-sep">·</span>
          <a href="/terms">Terms</a>
        </p>
      </footer>
    </div>
  );
}

export default App;

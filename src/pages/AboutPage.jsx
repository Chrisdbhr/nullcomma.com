import { Link } from 'react-router-dom';
import {
  FaGithub, FaSteam, FaLinkedin,
  FaInstagram, FaYoutube, FaTiktok, FaDiscord, FaEnvelope
} from 'react-icons/fa'

function AboutPage() {
  return (
    <div className="page-content" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Link to="/" className="button-back">&larr; Back to nullcomma.com</Link>

      <div className="glass-content-card">
        <h1 style={{ color: 'var(--color-light)', fontSize: '2rem', marginBottom: '0.5rem' }}>About</h1>
        <p style={{ color: 'var(--color-grey)', marginBottom: '1.5rem' }}>The person and the project behind Null Comma.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>Christopher Ravailhe</h2>
        <p>Senior C# Developer and QA Test Automation specialist with over 9 years of experience in Unity. Shipped 25+ games across PC, console, and mobile platforms.</p>
        <p>Null Comma serves as a hub for games, prototypes, and technical experiments. The blog features devlogs, tutorials, and game development insights.</p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <span className="mini-stat"><strong>9+</strong> Years in Unity</span>
          <span className="mini-stat"><strong>25+</strong> Games Shipped</span>
          <span className="mini-stat">PC · Console · Mobile</span>
        </div>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>Connect</h2>
        <div className="social-links-grid" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
          <a href="https://github.com/Chrisdbhr" target="_blank" rel="noopener noreferrer" title="GitHub"><FaGithub /></a>
          <a href="https://www.linkedin.com/company/105116562" target="_blank" rel="noopener noreferrer" title="LinkedIn"><FaLinkedin /></a>
          <a href="https://store.steampowered.com/curator/46087468" target="_blank" rel="noopener noreferrer" title="Steam"><FaSteam /></a>
          <a href="https://tiktok.com/@nullcomma" target="_blank" rel="noopener noreferrer" title="TikTok"><FaTiktok /></a>
          <a href="https://www.instagram.com/nullcomma" target="_blank" rel="noopener noreferrer" title="Instagram"><FaInstagram /></a>
          <a href="https://www.youtube.com/@chrisjogos" target="_blank" rel="noopener noreferrer" title="YouTube"><FaYoutube /></a>
          <a href="https://discord.nullcomma.com/" target="_blank" rel="noopener noreferrer" title="Discord"><FaDiscord /></a>
          <a href="mailto:contact@nullcomma.com" title="Email"><FaEnvelope /></a>
        </div>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>Community</h2>
        <p>Meet <strong>Concord</strong>! For over 10 years, the community has been playing, working, and talking about life together.</p>
        <p style={{ marginTop: '0.75rem' }}>
          <a href="https://discord.nullcomma.com/" target="_blank" rel="noopener noreferrer" className="button-primary" style={{ display: 'inline-block' }}>Join Discord</a>
        </p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>Contact</h2>
        <p>Email: <a href="mailto:contact@nullcomma.com">contact@nullcomma.com</a></p>
      </div>
    </div>
  );
}

export default AboutPage;

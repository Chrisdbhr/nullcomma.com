import { Link } from 'react-router-dom';
import {
  FaGithub, FaSteam, FaEnvelope,
  FaLinkedin, FaInstagram, FaYoutube, FaTiktok
} from 'react-icons/fa'

const gravatarUrl = "https://www.gravatar.com/avatar/bc67d0d8223c77034223d024d9f96b46?s=200";

function ProfileSidebar() {
  return (
    <aside className="profile-sidebar">
      <Link to="/">
        <img src={gravatarUrl} alt="Profile Picture" className="profile-avatar" />
      </Link>
      <h2 className="profile-name">Christopher Ravailhe</h2>
      <p className="profile-bio">
        Senior C# Developer & QA Tests Automation. Unity Specialist over 9 years of experience. Worked on +25 games for PC, Console & Mobile.
      </p>

      <div className="profile-brand-block">
        <h4>My Brand</h4>
        <a href="https://nullcomma.com" target="_blank" rel="noopener noreferrer" className="profile-brand-card">
          <img src="/logo.png" alt="Enigmatic Comma Logo" className="brand-logo" />
          <div className="brand-card-content">
            <h5>Enigmatic Comma</h5>
            <p>Development label for my commercial projects and games.</p>
          </div>
        </a>
      </div>

      <div className="social-links">
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
      </div>

      <div className="contact-info">
        <h3>Contact</h3>
        <p>
          Interested in collaboration or just chatting?
          <br />
          <a href="mailto:contato@nullcomma.com">
            <FaEnvelope style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            contato@nullcomma.com
          </a>
        </p>
      </div>
    </aside>
  )
}

export default ProfileSidebar
import { Link } from 'react-router-dom';

const gravatarUrl = "https://www.gravatar.com/avatar/bc67d0d8223c77034223d024d9f96b46?s=200";

function ProfileSidebar() {
  return (
    <aside className="profile-sidebar">
      <Link to="/" className="profile-brand-card">
        <img src={gravatarUrl} alt="Profile Picture" className="brand-logo" />
        <div className="brand-card-content">
          <h5>Null Comma</h5>
          <p>Game Developer Portfolio</p>
        </div>
      </Link>
    </aside>
  )
}

export default ProfileSidebar

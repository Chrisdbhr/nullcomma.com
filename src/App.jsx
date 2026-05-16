import { Link, Outlet } from 'react-router-dom';
import ProfileSidebar from './components/ProfileSidebar';

function App() {
  return (
    <div className="app-container">
      <header className="main-header">
        <Link to="/" className="site-title-link">
          <h1>Null Comma</h1>
          <span>Null Comma — Projects Portfolio & Blog</span>
        </Link>
      </header>

      <div className="page-layout">
        <ProfileSidebar />

        <main className="main-content-area">
          <Outlet />
        </main>
      </div>

      <footer className="main-footer">
        <p>© 2025 Null Comma. All rights reserved.</p>
        <p className="footer-links">
          <a href="/privacy">Privacy</a>
          <span className="footer-sep">·</span>
          <a href="/terms">Terms</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
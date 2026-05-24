import { Fragment } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import BackgroundSlideshow from './components/BackgroundSlideshow';
import { useReferral } from './hooks/useReferral';

function App() {
  const referral = useReferral();
  const location = useLocation();
  const isRoot = location.pathname === '/';

  return (
    <Fragment>
      <div className="app-container">
        <BackgroundSlideshow />

        <header className="main-header">
          {!isRoot && <Link to="/" className="main-header-back">&larr; Back</Link>}
          <Link to="/" className="site-title-link">
            <h1>{referral ? referral.title : 'Null Comma'}</h1>
            <span>{referral ? referral.subtitle : 'Games, prototypes & dev insights'}</span>
          </Link>
        </header>

        <main className="main-content-area">
          <Outlet />
        </main>
      </div>

      <footer className="main-footer">
        <div className="main-footer-inner">
        <p>
          © {new Date().getFullYear()} Null Comma. All rights reserved.
          <span className="footer-sep">·</span>
          <Link to="/about">About</Link>
          <span className="footer-sep">·</span>
          <Link to="/privacy">Privacy</Link>
          <span className="footer-sep">·</span>
          <Link to="/terms">Terms</Link>
          <span className="footer-sep">·</span>
          <a href="https://status.nullcomma.com" target="_blank" rel="noopener noreferrer">Status</a>
        </p>
        <a rel="me" href="https://mastodon.gamedev.place/@nullcomma" style={{ display: 'none' }}>Mastodon</a>
        </div>
      </footer>
    </Fragment>
  );
}

export default App;

import { Fragment } from 'react';
import { Link, Outlet } from 'react-router-dom';
import BackgroundSlideshow from './components/BackgroundSlideshow';

function App() {
  return (
    <Fragment>
      <div className="app-container">
        <BackgroundSlideshow />

        <header className="main-header">
          <Link to="/" className="site-title-link">
            <h1>Null Comma</h1>
            <span>Games, prototypes & dev insights</span>
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
        </p>
        </div>
      </footer>
    </Fragment>
  );
}

export default App;

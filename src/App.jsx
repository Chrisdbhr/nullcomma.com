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
            © 2025 Null Comma. All rights reserved.
            <span className="footer-sep">·</span>
            <a href="/privacy">Privacy</a>
            <span className="footer-sep">·</span>
            <a href="/terms">Terms</a>
          </p>
        </div>
      </footer>
    </Fragment>
  );
}

export default App;

import { Link, Outlet } from 'react-router-dom';

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

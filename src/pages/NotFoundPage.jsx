import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="page-content fade-in not-found-page">
      <div className="not-found-content">
        <h2 className="not-found-code">404</h2>
        <h3>Page Not Found</h3>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <Link to="/" className="button-primary">Go to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;

import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
  useRouteError,
} from "react-router-dom";

// Componentes
import App from './App.jsx';
import HomePage, { loader as homePageLoader } from './pages/HomePage.jsx';
import './styles.css';

// Páginas carregadas sob demanda (code splitting)
const GameDetailPage = lazy(() => import('./pages/GameDetailPage.jsx'));
const BlogListPage = lazy(() => import('./pages/BlogListPage.jsx').then(m => ({
  default: m.default,
  loader: m.loader,
})));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage.jsx'));
const PressKitPage = lazy(() => import('./pages/PressKitPage.jsx'));
import NotFoundPage from './pages/NotFoundPage.jsx';

function SuspenseFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px',
    }}>
      <div className="spinner" />
    </div>
  );
}

function ErrorBoundary() {
  let error = useRouteError();
  console.error(error);

  const is404 = error.status === 404 || error.statusText === 'Not Found';

  if (is404) {
    return (
      <div className="page-content fade-in not-found-page">
        <div className="not-found-content">
          <h2 className="not-found-code">404</h2>
          <h3>Page Not Found</h3>
          <p>The page you're looking for doesn't exist or has been moved.</p>
          <a href="/" className="button-primary">Go to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Maintenance mode!</h2>
      <p>{error.message}</p>
      <br />
      <p>{"It looks like you're trying to access my page during maintenance, that's rare!"}</p>
      <p>{"Go grab a coffee and come back later."}</p>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <App />
        <ScrollRestoration />
      </>
    ),
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: homePageLoader
      },
      {
        path: "project/:projectId",
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <GameDetailPage />
          </Suspense>
        )
      },
      {
        path: "blog",
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <BlogListPage />
          </Suspense>
        ),
        loader: async (...args) => {
          const { loader } = await import('./pages/BlogListPage.jsx');
          return loader(...args);
        }
      },
      {
        path: "blog/:slug",
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <BlogPostPage />
          </Suspense>
        )
      },
      {
        path: "presskit/:projectId",
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <PressKitPage />
          </Suspense>
        )
      },
      {
        path: "*",
        element: <NotFoundPage />
      },
    ]
  },
]);

const InitialFallback = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      fontSize: '1.5rem',
      backgroundColor: '#141414',
      color: '#FFFFFF'
    }}>
      Loading Portfolio...
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider
      router={router}
      fallbackElement={<InitialFallback />}
    />
  </React.StrictMode>,
);
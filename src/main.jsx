import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
  useRouteError,
} from "react-router-dom";

// Componentes
import App from './App.jsx';
import './styles.css'; 

// Páginas
import HomePage, { loader as homePageLoader } from './pages/HomePage.jsx'; 
import GameDetailPage from './pages/GameDetailPage.jsx';
import BlogListPage, { loader as blogListPageLoader } from './pages/BlogListPage.jsx';
import BlogPostPage from './pages/BlogPostPage.jsx';

function ErrorBoundary() {
  let error = useRouteError();
  console.error(error);
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
        element: <GameDetailPage /> 
      },
      { 
        path: "blog", 
        element: <BlogListPage />, 
        loader: blogListPageLoader 
      },
      { path: "blog/:slug", element: <BlogPostPage /> },
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
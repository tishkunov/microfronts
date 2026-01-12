import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Router } from './core/router/Router';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingFallback } from './components/LoadingFallback';
import { NavBar } from './components/NavBar';
import { NotificationContainer } from './components/NotificationContainer';
import { useCartCount } from './hooks/useCartCount';
import { useHostLifecycle } from './hooks/useHostLifecycle';
import { AppProviders } from './app/providers';
import { routes } from './config/routes';
import { analytics } from './core/telemetry/analytics';
import './App.css';

function App() {
  const cartCount = useCartCount();
  useHostLifecycle();

  // Логирование navigation events
  React.useEffect(() => {
    const handleLocationChange = () => {
      analytics.trackPageView(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange(); // Initial page view

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Проверка импорта NotificationContainer
  console.log('[App] NotificationContainer imported:', typeof NotificationContainer);
  console.log('[App] Rendering App component...');
  console.log('[App] EventBus check:', typeof require !== 'undefined' ? 'require exists' : 'no require');

  return (
    <AppProviders>
      <Router>
        <div className="app">
          <NavBar cartCount={cartCount} />
          
          <main className="main-content" id="main-content">
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {routes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                  ))}
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>

          <ErrorBoundary>
            <NotificationContainer />
          </ErrorBoundary>
        </div>
      </Router>
    </AppProviders>
  );
}

export default App;

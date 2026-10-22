import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if (typeof window !== 'undefined') {
  sessionStorage.removeItem('miceday:dynamic-import-error-reloaded');
}

import { HelmetProvider } from 'react-helmet-async';

type RootErrorBoundaryProps = {
  children: React.ReactNode;
};

type RootErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

class RootErrorBoundary extends React.Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  state: RootErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: unknown): RootErrorBoundaryState {
    const message = error instanceof Error ? error.message : 'Unknown runtime error';
    
    if (message.includes('Failed to fetch dynamically imported module')) {
      const reloadFlag = 'miceday:dynamic-import-error-reloaded';
      if (typeof window !== 'undefined' && !sessionStorage.getItem(reloadFlag)) {
        sessionStorage.setItem(reloadFlag, 'true');
        setTimeout(() => window.location.reload(), 200);
        return {
          hasError: true,
          errorMessage: '새로운 업데이트가 있어 페이지를 새로고침합니다...',
        };
      }
    }

    return {
      hasError: true,
      errorMessage: message,
    };
  }

  componentDidCatch(error: unknown) {
    console.error('Root render failed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
          <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-red-600">Application failed to render</h1>
            <p className="mt-3 text-sm text-slate-600">
              Check the browser console for the full stack trace.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
              {this.state.errorMessage}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <RootErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </RootErrorBoundary>
  </React.StrictMode>
);

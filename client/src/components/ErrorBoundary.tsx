import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
          <div className="pro-glass pro-rounded-lg p-8 text-center max-w-md">
            <h2 className="text-white text-xl font-bold mb-4">Oops! Something went wrong</h2>
            <p className="text-white/70 mb-6">
              A component error occurred. Please refresh the page or try again later.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 pro-button-gradient text-white rounded-lg hover:scale-105 transition-transform"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="text-white/50 text-sm cursor-pointer">Error Details</summary>
                <pre className="text-red-400 text-xs mt-2 overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
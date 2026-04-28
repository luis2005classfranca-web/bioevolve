import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'Desculpe, algo deu errado.';
      
      try {
        const parsed = JSON.parse(this.state.error?.message || '');
        if (parsed.error && parsed.error.includes('Insufficient permissions')) {
          errorMessage = 'Você não tem permissão para realizar esta ação ou ver estes dados.';
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold">!</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Ops!</h2>
            <p className="text-slate-500 text-sm">
              {errorMessage}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold"
            >
              Recarregar App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

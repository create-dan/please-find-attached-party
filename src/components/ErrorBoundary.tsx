import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F17] text-[#F1F5F9] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-xl border border-white/15 bg-[#121824] p-6 sm:p-8">
            <p className="text-xs font-mono text-[#38BDF8]">
              Application Recovery
            </p>
            <h1 className="mt-2 font-display text-3xl tracking-tight text-[#F1F5F9]">
              Something Went Wrong
            </h1>
            <p className="mt-3 text-sm text-[#94A3B8] leading-relaxed">
              The scoreboard hit an unexpected error. Reload the page to reconnect.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#0EA5E9] text-[#0B0F17] hover:bg-[#38BDF8] transition-colors min-h-[40px]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


import React from 'react';
import { Link } from 'react-router-dom';

export default class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Panel caught render exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4 text-[#2e2a26]">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2e2a26] mb-2">
              Something went wrong in the Admin Panel
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mb-6">
              A component encountered an unexpected error while rendering data. The system recovered gracefully to keep your session secure.
            </p>

            {this.state.error && (
              <div className="text-left bg-stone-50 rounded-xl p-3 border border-stone-200 mb-6 max-h-36 overflow-auto font-mono text-[11px] text-stone-700">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#3a4d39] text-white text-xs sm:text-sm font-medium hover:bg-[#2d3d2c] transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-stone-300 text-[#2e2a26] text-xs sm:text-sm font-medium hover:bg-[#FAF6F0] transition-colors"
              >
                Reload Page
              </button>
              <Link
                to="/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-transparent text-[#3a4d39] text-xs sm:text-sm font-medium hover:underline text-center"
              >
                Go to Storefront
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import { Component, type ContextType, type ErrorInfo, type ReactNode } from 'react';
import { LanguageContext } from '../../i18n/LanguageContext';

import { ShieldIcon } from './Icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static contextType = LanguageContext;
  declare context: ContextType<typeof LanguageContext>;
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const t = this.context?.t;
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-[18px] border border-[rgba(255,77,109,0.3)] bg-[rgba(255,77,109,0.06)] p-6 text-center shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <ShieldIcon size={36} className="text-[#ff4d6d]" />
          <span className="font-['Rajdhani'] text-xl font-bold uppercase tracking-wide text-[#ffd5ce]">{t?.('somethingWrong')}</span>
          <span className="max-w-md text-sm text-[#8ea5c6]">
            {this.state.error?.message ?? t?.('unexpectedError')}
          </span>
          <button
            onClick={this.handleRetry}
            className="rounded-[14px] border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.1)] px-5 py-2 font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.14em] text-[#00f0ff] transition-all duration-150 hover:border-[#00f0ff] hover:bg-[rgba(0,240,255,0.2)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff]"
          >
            {t?.('tryAgain')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

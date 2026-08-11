import { Component, type ContextType, type ErrorInfo, type ReactNode } from 'react';
import { LanguageContext } from '../../i18n/LanguageContext';

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
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-[12px] border border-[rgba(255,123,99,0.28)] bg-[rgba(255,123,99,0.06)] p-6 text-center">
          <span className="text-3xl">&#9888;</span>
          <span className="text-base font-medium text-[#ffd5ce]">{t?.('somethingWrong')}</span>
          <span className="max-w-md text-sm text-[#f5f7ff]/58">
            {this.state.error?.message ?? t?.('unexpectedError')}
          </span>
          <button
            onClick={this.handleRetry}
            className="rounded-[22px] border border-[rgba(120,230,255,0.22)] bg-[rgba(120,230,255,0.08)] px-5 py-2.5 text-sm font-medium text-[#a8efff] transition hover:border-[rgba(120,230,255,0.4)]"
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

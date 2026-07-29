interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

function ErrorFallback({ message, onRetry }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-[12px] border border-[rgba(255,123,99,0.28)] bg-[rgba(255,123,99,0.06)] p-6 text-center">
      <span className="text-3xl">&#9888;</span>
      <span className="text-base font-medium text-[#ffd5ce]">
        {message ?? 'Failed to load. Please try again.'}
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-[22px] border border-[rgba(120,230,255,0.22)] bg-[rgba(120,230,255,0.08)] px-5 py-2.5 text-sm font-medium text-[#a8efff] transition hover:border-[rgba(120,230,255,0.4)]"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorFallback;
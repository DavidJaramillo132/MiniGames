import { useI18n } from '../../i18n/LanguageContext';
import { ShieldIcon } from './Icons';

interface ErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
}

function ErrorFallback({ message, onRetry }: ErrorFallbackProps) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-[18px] border border-[#ff3355]/30 bg-[#ff3355]/08 p-6 text-center shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
      <ShieldIcon size={36} className="text-[#ff3355]" />
      <span className="text-base font-semibold text-[#ffd5ce]">
        {message ?? t('failedLoad')}
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-[14px] border border-[#d4ff00]/40 bg-[#d4ff00]/10 px-5 py-2 font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.14em] text-[#d4ff00] transition-all duration-150 hover:bg-[#d4ff00] hover:text-[#08080a] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff00]"
        >
          {t('retry')}
        </button>
      )}
    </div>
  );
}

export default ErrorFallback;

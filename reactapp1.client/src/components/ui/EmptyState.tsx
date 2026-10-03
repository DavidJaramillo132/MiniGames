interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center text-[#8c8c9a]">
      {icon && <span className="text-3xl">{icon}</span>}
      <span className="font-['Rajdhani'] text-lg font-bold uppercase tracking-wider text-[#f4f4f6]">{title}</span>
      {description && <span className="max-w-md text-sm text-[#8c8c9a]">{description}</span>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 rounded-[14px] border border-[#d4ff00]/40 bg-[#d4ff00]/10 px-5 py-2 font-['Rajdhani'] text-sm font-bold uppercase tracking-[0.14em] text-[#d4ff00] transition-all duration-150 hover:bg-[#d4ff00] hover:text-[#08080a] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4ff00]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
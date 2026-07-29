interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center text-[#f5f7ff]/68">
      {icon && <span className="text-3xl">{icon}</span>}
      <span className="text-base font-medium text-[#f5f7ff]/80">{title}</span>
      {description && <span className="text-sm">{description}</span>}
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-[22px] border border-[rgba(120,230,255,0.22)] bg-[rgba(120,230,255,0.08)] px-5 py-2.5 text-sm font-medium text-[#a8efff] transition hover:border-[rgba(120,230,255,0.4)] hover:bg-[rgba(120,230,255,0.14)]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
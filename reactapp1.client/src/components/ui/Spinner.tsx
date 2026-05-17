interface SpinnerProps {
  size?: number;
}

function Spinner({ size = 18 }: SpinnerProps) {
  return (
    <span
      className="inline-block shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-current"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export default Spinner;

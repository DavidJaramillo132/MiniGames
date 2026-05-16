interface SpinnerProps {
  size?: number;
}

function Spinner({ size = 18 }: SpinnerProps) {
  return <span className="spinner" style={{ width: size, height: size }} aria-hidden="true" />;
}

export default Spinner;

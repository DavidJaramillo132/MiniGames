export function formatDate(input: string | Date) {
  const date = typeof input === 'string' ? new Date(input) : input;

  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

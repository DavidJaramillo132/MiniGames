function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return window.atob(padded);
}

export function getTokenExpiration(token: string): number | null {
  const [, payload] = token.split('.');
  if (!payload) { return null; }
  try {
    const decoded = JSON.parse(decodeBase64Url(payload)) as { exp?: number };
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string) {
  const expiresAt = getTokenExpiration(token);
  if (!expiresAt) { return true; }
  return Date.now() >= expiresAt;
}
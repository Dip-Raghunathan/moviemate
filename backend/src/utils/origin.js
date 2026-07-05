function normalizeOrigin(origin) {
  if (!origin) {
    return '';
  }

  const trimmed = origin.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const parsed = new URL(trimmed);
    return `${parsed.protocol}//${parsed.host}`;
  } catch (error) {
    return trimmed.replace(/\/+$/, '');
  }
}

function isAllowedOrigin(origin, clientUrl) {
  const normalizedOrigin = normalizeOrigin(origin);
  const normalizedClientUrl = normalizeOrigin(clientUrl);

  if (!normalizedOrigin) {
    return false;
  }

  if (normalizedClientUrl && normalizedOrigin === normalizedClientUrl) {
    return true;
  }

  if (/^https?:\/\/(localhost|127\.0\.0\.1|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
    return true;
  }

  // Allow all vercel.app and render.com/onrender.com subdomains for easier deployment setup
  if (normalizedOrigin.endsWith('.vercel.app') || normalizedOrigin.endsWith('.render.com') || normalizedOrigin.endsWith('.onrender.com')) {
    return true;
  }

  // Allow custom domain philixmate.in and its subdomains
  if (normalizedOrigin === 'https://philixmate.in' || normalizedOrigin === 'https://www.philixmate.in' || normalizedOrigin.endsWith('.philixmate.in')) {
    return true;
  }

  return false;
}

module.exports = {
  normalizeOrigin,
  isAllowedOrigin,
};

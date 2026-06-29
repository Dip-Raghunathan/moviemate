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

  if (['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'].includes(normalizedOrigin)) {
    return true;
  }

  // Allow all vercel.app and render.com/onrender.com subdomains for easier deployment setup
  if (normalizedOrigin.endsWith('.vercel.app') || normalizedOrigin.endsWith('.render.com') || normalizedOrigin.endsWith('.onrender.com')) {
    return true;
  }

  return false;
}

module.exports = {
  normalizeOrigin,
  isAllowedOrigin,
};

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

  if (!normalizedOrigin || !normalizedClientUrl) {
    return false;
  }

  if (normalizedOrigin === normalizedClientUrl) {
    return true;
  }

  return ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'].includes(normalizedOrigin);
}

module.exports = {
  normalizeOrigin,
  isAllowedOrigin,
};

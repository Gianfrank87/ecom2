import crypto from 'node:crypto';

const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const LOG_LEVEL = String(process.env.LOG_LEVEL || 'info').toLowerCase();
const LOG_FORMAT = String(process.env.LOG_FORMAT || 'json').toLowerCase();
const minimumLevel = LEVELS[LOG_LEVEL] || LEVELS.info;
const sensitiveKeyPattern = /token|secret|password|authorization|cookie|apikey|api_key|service_role|smtp_pass|access_token|email/i;

const redactValue = (value, depth = 0) => {
  if (depth > 5) return '[MaxDepth]';
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      status: value.status,
      code: value.code,
    };
  }
  if (Array.isArray(value)) return value.map((item) => redactValue(item, depth + 1));
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    sensitiveKeyPattern.test(key) ? '[Redacted]' : redactValue(item, depth + 1),
  ]));
};

const normalizeDetails = (details) => {
  if (!details) return {};
  if (details instanceof Error) return { error: redactValue(details) };
  if (typeof details !== 'object') return { detail: details };
  return redactValue(details);
};

const writeLog = (level, message, details) => {
  if ((LEVELS[level] || LEVELS.info) < minimumLevel) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'nigdiz-api',
    message,
    ...normalizeDetails(details),
  };

  if (LOG_FORMAT === 'pretty' && process.env.NODE_ENV !== 'production') {
    const { timestamp, level: entryLevel, message: entryMessage, ...rest } = entry;
    const suffix = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
    const output = `${timestamp} ${entryLevel.toUpperCase()} ${entryMessage}${suffix}`;
    if (level === 'error') console.error(output);
    else if (level === 'warn') console.warn(output);
    else console.log(output);
    return;
  }

  const output = JSON.stringify(entry);
  if (level === 'error') console.error(output);
  else if (level === 'warn') console.warn(output);
  else console.log(output);
};

export const logger = {
  debug: (message, details) => writeLog('debug', message, details),
  info: (message, details) => writeLog('info', message, details),
  warn: (message, details) => writeLog('warn', message, details),
  error: (message, details) => writeLog('error', message, details),
};

export const createRequestLogger = () => (req, res, next) => {
  const startedAt = process.hrtime.bigint();
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = String(requestId);
  res.setHeader('X-Request-Id', req.requestId);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const details = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      userId: req.user?.id,
      userRole: req.user?.role,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };
    if (res.statusCode >= 500) logger.error('HTTP request failed', details);
    else if (res.statusCode >= 400) logger.warn('HTTP request rejected', details);
    else logger.info('HTTP request completed', details);
  });

  next();
};

import https from 'https';
import { URL } from 'url';

interface RequestOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

/**
 * Lightweight, zero-dependency HTTPS JSON request helper.
 * Compatible with Node.js runtimes without native global fetch.
 *
 * @param urlString - Complete HTTPS endpoint URL including query parameters
 * @param options - Request options including HTTP method, headers, JSON body, and timeout
 * @returns Parsed JSON response payload typed as T
 * @throws Error on non-2xx status code, invalid JSON, or connection timeout
 */
export function requestJson<T>(urlString: string, options: RequestOptions = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlString);
    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: `${parsed.pathname}${parsed.search}`,
        method: options.method || 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'AERIS-Environmental-Portal/1.0 (https://aeris.portal)',
          ...(options.body ? { 'Content-Length': Buffer.byteLength(options.body).toString() } : {}),
          ...options.headers,
        },
        timeout: options.timeoutMs ?? 12000,
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          const status = res.statusCode ?? 500;
          if (status < 200 || status >= 300) {
            reject(new Error(`HTTP ${status}: ${raw.slice(0, 300)}`));
            return;
          }
          try {
            resolve(JSON.parse(raw) as T);
          } catch (err) {
            reject(new Error(`Invalid JSON response: ${(err as Error).message}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Request timed out'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

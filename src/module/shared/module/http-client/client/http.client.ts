import { Injectable } from '@nestjs/common';
import {
  HttpClientException,
  HttpClientTimeoutException,
} from '@src/module/shared/module/http-client/exception/http-client.exception';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';

export interface HttpClientRequestOptions extends RequestInit {
  timeoutMs?: number;
}

@Injectable()
export class HttpClient {
  private readonly defaultTimeoutMs = 8000;

  constructor(private readonly logger: AppLogger) {}

  async get<T>(url: string, options: HttpClientRequestOptions = {}): Promise<T> {
    return this.request<T>('GET', url, options);
  }

  async post<T>(
    url: string,
    body: unknown,
    options: HttpClientRequestOptions = {}
  ): Promise<T> {
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return this.request<T>('POST', url, { ...options, headers }, JSON.stringify(body));
  }

  private async request<T>(
    method: string,
    url: string,
    options: HttpClientRequestOptions,
    body?: RequestInit['body']
  ): Promise<T> {
    this.logger.log(`HTTP ${method} Request: ${url}`, { method, url });
    const startTime = Date.now();
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const signal = options.signal
      ? AbortSignal.any([options.signal, controller.signal])
      : controller.signal;

    try {
      const response = await fetch(url, {
        ...options,
        method,
        signal,
        body,
      });
      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        this.logger.error(`HTTP ${method} Failed: ${url} [${response.status}]`, {
          method,
          url,
          status: response.status,
          statusText: response.statusText,
          errorText,
          duration,
        });

        throw new HttpClientException(
          `[${response.status}] ${response.statusText} - ${errorText}`,
          undefined,
          { statusCode: response.status, method, url }
        );
      }

      this.logger.log(`HTTP ${method} Success: ${url}`, {
        method,
        url,
        status: response.status,
        duration,
      });

      if (response.status === 204) {
        return undefined as T;
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }

      return (await response.text()) as T;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`HTTP ${method} Error: ${url}`, { err: error, duration });

      if (error instanceof HttpClientException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new HttpClientTimeoutException(
          `Request timeout after ${timeoutMs}ms`,
          error,
          { statusCode: 408, method, url }
        );
      }

      throw new HttpClientException(`Error fetching data from ${url}: ${String(error)}`, error, {
        method,
        url,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

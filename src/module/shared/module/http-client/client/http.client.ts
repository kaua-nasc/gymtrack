import { Injectable } from '@nestjs/common';
import { HttpClientException } from '@src/module/shared/module/http-client/exception/http-client.exception';
import { AppLogger } from '@src/module/shared/module/logger/service/app-logger.service';

@Injectable()
export class HttpClient {
  constructor(private readonly logger: AppLogger) {}

  async get<T>(url: string, options: RequestInit = {}): Promise<T> {
    this.logger.log(`HTTP GET Request: ${url}`, { method: 'GET', url });
    const startTime = Date.now();

    try {
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        this.logger.error(`HTTP GET Failed: ${url} [${response.status}]`, {
          status: response.status,
          statusText: response.statusText,
          errorText,
          duration,
        });
        throw new Error(`[${response.status}] ${response.statusText} - ${errorText}`);
      }

      this.logger.log(`HTTP GET Success: ${url}`, { status: response.status, duration });
      const data = await response.json();
      return data as T;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`HTTP GET Error: ${url}`, { err: error, duration });
      throw new HttpClientException(`Error fetching data from ${url}: ${error}`, error);
    }
  }

  async post<T>(url: string, body: unknown, options: RequestInit = {}): Promise<T> {
    this.logger.log(`HTTP POST Request: ${url}`, { method: 'POST', url });
    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        ...options,
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        this.logger.error(`HTTP POST Failed: ${url} [${response.status}]`, {
          status: response.status,
          statusText: response.statusText,
          errorText,
          duration,
        });
        throw new Error(`[${response.status}] ${response.statusText} - ${errorText}`);
      }

      this.logger.log(`HTTP POST Success: ${url}`, { status: response.status, duration });
      const data = await response.json();
      return data as T;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`HTTP POST Error: ${url}`, { err: error, duration });
      throw new HttpClientException(`Error fetching data from ${url}: ${error}`, error);
    }
  }
}
